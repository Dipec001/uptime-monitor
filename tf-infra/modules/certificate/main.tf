terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# =========================
# ACM Certificate (covers root + subdomains)
# =========================
resource "aws_acm_certificate" "alivechecks" {
  count             = var.env == "prod" ? 1 : 0
  domain_name       = "alivechecks.com"
  validation_method = "DNS"
  
  # Add subdomains
  subject_alternative_names = [
    "*.alivechecks.com",  # Covers api.alivechecks.com, www.alivechecks.com, etc.
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "alivechecks-cert"
    Env  = var.env
  }
}

# =========================
# DNS Validation Records
# =========================

# For root domain validation
resource "cloudflare_record" "alivechecks_acm_validation_root" {
  count   = var.env == "prod" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  
  # ACM gives you the record name/value
  name    = replace(
    tolist(aws_acm_certificate.alivechecks[0].domain_validation_options)[0].resource_record_name,
    ".alivechecks.com.",
    ""
  )
  type    = tolist(aws_acm_certificate.alivechecks[0].domain_validation_options)[0].resource_record_type
  value   = trimsuffix(
    tolist(aws_acm_certificate.alivechecks[0].domain_validation_options)[0].resource_record_value,
    "."
  )
  ttl     = 60
  proxied = false  # Important: DNS Only
}

# Wait for validation
resource "aws_acm_certificate_validation" "alivechecks" {
  count           = var.env == "prod" ? 1 : 0
  certificate_arn = aws_acm_certificate.alivechecks[0].arn
  
  validation_record_fqdns = [
    cloudflare_record.alivechecks_acm_validation_root[0].hostname
  ]
  
  timeouts {
    create = "10m"
  }
}
