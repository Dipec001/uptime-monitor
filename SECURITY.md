# Security Policy

The security of this platform and its users is a top priority. Please follow these guidelines:

## Reporting Vulnerabilities
- Email security issues to **dpecchukwu@gmail.com**
- Please do **not** create a public issue for vulnerabilities.

## Handling Secrets
- Never commit `.env` files or passwords to Git.
- Use environment variables for sensitive credentials.
- Rotate secrets immediately if accidentally exposed.

## Development Guidelines
- Use HTTPS for any external integrations.
- Validate and sanitize all user input.
- Follow Django and Celery security best practices:
  - `SECURE_*` settings in Django
  - Celery task timeouts and rate limits
  - Proper RBAC for database access

## Dependencies
- Regularly audit dependencies:
```bash
pip list --outdated
pip install --upgrade <package>
```
- Apply patches to critical libraries promptly.

## Infrastructure

- S3 buckets storing logs should use private ACL and lifecycle policies.

- EC2 instances should follow least-privilege IAM policies.

- Use VPC private subnets where possible for sensitive services.