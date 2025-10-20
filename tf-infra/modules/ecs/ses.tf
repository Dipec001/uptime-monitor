# ========================= 
# SES Email Identity
# ========================= 
resource "aws_ses_email_identity" "sender" {
  email = var.ses_sender_email
}

# ========================= 
# SES SMTP User (IAM User for SMTP credentials)
# ========================= 
resource "aws_iam_user" "ses_smtp" {
  name = "${var.env}-uptimemonitor-ses-smtp"
  path = "/system/"
}

resource "aws_iam_access_key" "ses_smtp" {
  user = aws_iam_user.ses_smtp.name
}

resource "aws_iam_user_policy" "ses_smtp" {
  name = "${var.env}-ses-smtp-policy"
  user = aws_iam_user.ses_smtp.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# ========================= 
# SES Configuration Set (Optional but recommended)
# ========================= 
resource "aws_ses_configuration_set" "main" {
  name = "${var.env}-uptimemonitor"

  delivery_options {
    tls_policy = "Require"
  }
}

# Event destination for bounces/complaints (optional)
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "cloudwatch"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true
  matching_types         = ["send", "reject", "bounce", "complaint", "delivery"]

  cloudwatch_destination {
    default_value  = "default"
    dimension_name = "ses:configuration-set"
    value_source   = "messageTag"
  }
}
