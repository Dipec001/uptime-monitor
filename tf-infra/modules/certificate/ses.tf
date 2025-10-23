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

# Note: DNS records already added manually to Cloudflare
# - TXT: _amazonses.alivechecks.com
# - CNAME: <token1>._domainkey.alivechecks.com
# - CNAME: <token2>._domainkey.alivechecks.com
# - CNAME: <token3>._domainkey.alivechecks.com
# Terraform will detect domain is already verified and just track it

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
