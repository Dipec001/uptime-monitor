# ses.tf

# =========================
# SES Domain Identity (not email!)
# =========================
resource "aws_ses_domain_identity" "main" {
  domain = "alivechecks.com"
}

# DKIM for domain
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# Verification (you'll add these to Cloudflare manually)
resource "aws_route53_record" "ses_verification" {
  count   = 0  # Set to 0 since you're using Cloudflare DNS
  # If you move DNS to Route53 later, change to 1
}

# =========================
# SES Configuration Set
# =========================
resource "aws_ses_configuration_set" "main" {
  name = "${var.env}-alivechecks"

  delivery_options {
    tls_policy = "Require"
  }

  reputation_metrics_enabled = true
}

# Track email events
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "cloudwatch-events"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true
  matching_types         = ["send", "bounce", "complaint", "delivery", "reject"]

  cloudwatch_destination {
    default_value  = "default"
    dimension_name = "ses:configuration-set"
    value_source   = "messageTag"
  }
}

# =========================
# NO SMTP USER NEEDED!
# Using IAM role instead (already configured)
# =========================
