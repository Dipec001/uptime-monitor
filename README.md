# 🩺 Uptime Monitoring Platform

A **production-grade uptime and heartbeat monitoring platform** built with Django REST Framework, designed to help developers and teams track website uptime, monitor background job health, and receive real-time alerts.

[![App CI/CD](https://github.com/Dipec001/uptime-monitor/actions/workflows/app-cicd.yml/badge.svg)](https://github.com/Dipec001/uptime-monitor/actions/workflows/app-cicd.yml)

[![Core CI](https://github.com/Dipec001/uptime-monitor/actions/workflows/ci.yml/badge.svg)](https://github.com/Dipec001/uptime-monitor/actions/workflows/ci.yml)

[![Infra Deployment](https://github.com/Dipec001/uptime-monitor/actions/workflows/infra.yml/badge.svg)](https://github.com/Dipec001/uptime-monitor/actions/workflows/infra.yml)

[![Terraform Destroy](https://github.com/Dipec001/uptime-monitor/actions/workflows/terraform-destroy.yml/badge.svg)](https://github.com/Dipec001/uptime-monitor/actions/workflows/terraform-destroy.yml)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Live Demo

**Coming Soon** - Early demos and beta access launching Q1 2025

---

## 🌟 Key Features

- ✅ **Website & API Uptime Monitoring** – HTTP/HTTPS checks with configurable intervals
- 💓 **Heartbeat Monitoring** – Track cron jobs and scheduled tasks via ping URLs
- 🚨 **Multi-Channel Alerts** – Email (AWS SES), Slack webhooks, WhatsApp, custom webhooks
- 📊 **40+ Prometheus Metrics** – Comprehensive observability with Grafana dashboards
- ⚡ **Real-Time Dashboards** – Uptime percentages, latency trends, incident history
- 🔒 **Secure Authentication** – JWT-based auth with role-based access control
- 📈 **Performance Tracking** – Response time monitoring and historical analytics
- 🌐 **Public Status Pages** *(Coming Soon)* – Branded status pages per project
- 🔁 **Retry Logic & Throttling** – Intelligent alert management to prevent spam

---

## 🏗️ System Architecture

### Simplified Overview

![Simplified System Architecture](docs/simplified_architecture.png)

### Complete Infrastructure

[**View Interactive Detailed Architecture Diagram →**](https://mermaid.live/view#pako:eNqtWN1u68YRfpUFDxIcA7IlkfqjEASgKMlxa-copnMMpC6KFbWSWFNcdbm0rRwdoAV6EaQBkiZB0qYXRS7S3vSiuetVH6Yv0D5CZ3dJihRJHRUoDRjc5Tffzs7MzszqlebSGdH62oLh9RLdDO4CBE8YTdXERcAJCwj_2Z32nz9_9kU6vtN-rpDi-TAkLJSI3_-gBrnPoychg32b0QBQ__r87-kUEnPoJ3QavjNl9Xefv0cw41OCOZp4wSI8SXlIMLsL9nSzbh1B94ff_Psfn4sBsn0azXJLp9iXExuw8B89bzbO5F-92TnJgXMCk2jqe64TTWGzYm9qjOKJmKUJLHqrhuRAl4MipXisy4FQ9btvpKrrNVBh7sHWLymeoQH2ceASFtvg5mbi1MX_EzkxoYyjXqPeahml3O9bN9L2X38mXtE55uQRb0qhxZl0vyPbsf0oBLfowAYjFA_R8zFmCyAt35l4JoyuCF-SSAXBV59mZtSeEordhsyG2ZCjK8KZ54bIcUEPcHrlKucMz3GA1RKfJMMqfqPRUPwvvTDCvvextHcpuYytwkRVXDDvAVbKBIaa2IsMIxsZrQORUeKA5r4DRraOLnEUuHBAN-sDjsiQ6RdByEVUKZ9884OIPEFkRZyCscEkwQKMSKN1JZ14hr_EwYLekmmSAdQEghlkTS6yERobvL5SHq0LO66pF_CDC9jEJ2xzS9k9YfKM_FFoqmaRmpa0A-zeL0DdYJbJF-6SuPe_eCTT0OMkrCEMUjw8OWLBASQZmYx-zCwnJiXxDQ7vwUhLMov85FyuCfPoDHKAXPTAIoV4qpwszlwPHWnob38r1IIRmtCQLxhxPrhUtmbeCoOqQ8zxFIdk54B2y9CVpleRz71T66NyFUc-DrlnY9iGtPf32Rl0TWaeMm5iE0bBBehtJL_vlusYXbPAn9vl3jHK5m2HsAdPxaZI3MmwwOeMlDm--qtM8DCUCoxW2PORJZ1dkJFV4BZzd6lEf5eZkdKXdBHCfq5o4HHKylKOQ1wGZ_kK8stCRiVk1y-SWRRPS67hAEoYmZGAe9gXrD8lm6JKI_ta6fIX8aoEqSvMerECqhKBsdr3l_8Ur7Hjk5Qqfa88bTROZ3iDQC2hAQ3yHq9ywIV1pfb0pXhF19QnQvUJhbLklWgjTsPoibgCGOcmeUDEXCTLmPiiNJpEvo88uasa6AXVLVRmOyml3afcEYGvaxnPnZQYVU-ldZSkuwyDIAU9Ag56LLyQM3y8icDXEfP4RiZIlUL_9L04kskHlTqLtoJK75yLsL4cIOdcKmL5Pn3sxyUczcGP5W2U2pQjxYXu--KNhhIGavlBlNC6qHPIC1Q75RfLPqQQSShSSZ5Q5AtFCIsV5UQeiEXF656wOP3lwmkKKGvZkr5Phd_Xuz5QGGShHJS3qeND3ldn4W9qIErPktL7PM6GWklXySfF_208Wy5xu8Q8hF5Mncwf0zF6_uBhUdsOd5_2hT2Uot_9Gt7r9hBa1jWBqkpyq5x7_L1IFE_1giy3uMcbwqCZoWwFsPRdxfBFMGeQnFnk8ogRhENkQ79eqtlbb8neG43BQWpGtuLo9PTdrewptyJy1JdsSy4BkxfODapDA1YXPVg9AxWBLBDXNIISizjd7nqCzNIXQdLR09UqCuL-Vn1O8ZLogwjKSv0WDhHZivAsw8haU3dIGALJNlugytCj4FcRiYjMIGEJWv3PNhpqEfBDtKoWKwhcQzorKF5AOeATJCsUkEIWOwRTJWyrAvsYYD7Mj5FIwrpoCtHtKHzc6LzBEile2AH8HMy9RWyINAx2RRUKyospBOADnno-JMxSxz2taUhQ2jFuMxcHhc9UPakpcBMUXxm2ojaWwmSIyTK5Te4J2e3nlZhE4RKJnmCbKTcVln0jNrXRAeSesgeQse6HYKnl08L0dtKolG1Wui7-vt3rcw5E_WGRXRKAbsIKQ-p6cSbf1-AM-CArAU9S_MsWrUJlbzVZVNwJFK2bJ0pamD3bVoGKlpUlv2SDMkUKGlibE5eTGZputqoVKDVBHidrfpUdKqH7-6wE5jZaiRL9QQlCtg-x9TO3hDJk3DBkDCfLYqyEqn4ingaR589EuwkBLVS4LiCGZO1TpV5yJT4CoytMWkDVqWH0wVNF5OXEfgMizemViEJmrEbu634EUs_Y7n3CHyEMxO2k5Bi_iPhUXoWhVdmKn30qzm4FLm5l-AZyvrhXzT3f7z8bj02z0ahBtwE3vv4z3dDHxogenj56M77sG-unmkt9yvrP5vN5lkb8tKZoWpbZGOk7mlHb7ll5Gr2SJvezW0zYtQdGa0fYbvcG-vhowtzvNelOO4POIGW0Td3Sj1Yx49mYrm13BvbOcIbZMq3B_06n_z_oMpfrdLNWV--kdON21069_Ea6_D0oZhzZrUbX2plPb_baRysoaoSi0TtWx9zRNBo9s3u82ZKbg-KyBq3uwE65eiO9ZR3tUdHKJ8GrW-1xO-Vpmt3OUD_Eo9W0BfNmWh96dFLTVoRB5wdD7ZVY4U6DDL2CG0EfXmeY3d9pd8FrkFnj4CNKV4kYWHex1Ppz7IcwitYzCNmhh-GmsYNAU0eYDaeZa_1mT5ccWv-V9qT1T5uthnHW0TtNOLTdntkza9oGUK2zTq9rttutbts09Xav-bqmfSyX1c-MVs8wm3q7axpG2zBf_xd-7qEd)

### Architecture Highlights

- **Hybrid ECS Deployment**: EC2 for Django/Celery, Fargate for Prometheus/Grafana
- **Multi-AZ PostgreSQL (RDS)**: High availability with automated backups
- **Private Subnet Architecture**: Enhanced security with NAT gateway for outbound traffic
- **Zero-Downtime Deployments**: Rolling updates via GitHub Actions CI/CD
- **Infrastructure as Code**: 100% Terraform-managed AWS infrastructure
- **Comprehensive Observability**: 40+ Prometheus metrics with Grafana dashboards

*For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md)*

---

## 🗄️ Database Schema

**Entity Relationship Diagram:**

![ER Diagram](docs/uptime_monitor_model_new.png)

### Core Entities

- **User** – Authentication, preferences, and team management
- **Website** – Monitored endpoints with check intervals and retry policies
- **Heartbeat** – Cron job monitoring with unique ping URLs
- **CheckResult** – Historical uptime data with response times
- **PingLog** – Heartbeat ping history and missed beat tracking
- **Alert** – Downtime/recovery notifications with delivery status
- **AlertChannel** – Email, Slack, WhatsApp, webhook configurations

---

## 🔧 Tech Stack

### Backend & APIs
- **Django 5.0** + **Django REST Framework** – API development and business logic
- **Celery 5.3** – Asynchronous task processing and scheduling
- **PostgreSQL 16** – Primary relational database
- **Redis 7.2** – Celery broker, caching, and session storage

### Monitoring & Observability
- **Prometheus** – Metrics collection and time-series storage
- **Grafana** – Real-time dashboards and visualization
- **AWS CloudWatch** – Centralized logging and alerting
- **EFS** – Persistent Prometheus data storage (30-day retention)

### Infrastructure & DevOps
- **Docker** + **Docker Compose** – Container orchestration
- **Terraform** – Infrastructure as Code (IaC)
- **AWS Services**:
  - **ECS (EC2 + Fargate)** – Container orchestration
  - **Application Load Balancer** – Traffic distribution
  - **RDS PostgreSQL** – Managed database (Multi-AZ)
  - **ElastiCache Redis** – Managed Redis cluster
  - **SES** – Transactional email delivery
  - **Secrets Manager** – Secure credential storage
  - **VPC** – Network isolation (public/private subnets)
- **GitHub Actions** – Automated CI/CD pipeline

### Frontend *(Coming Soon)*
- **React 18** – Modern UI framework
- **Tailwind CSS** – Utility-first styling
- **Chart.js / Recharts** – Data visualization

---

## 📊 Monitoring & Observability

### Available Metrics (40+ Custom Metrics)

| Category | Metrics | Purpose |
|----------|---------|---------|
| **Website Monitoring** | `uptime_website_checks_total`<br/>`uptime_website_response_time_seconds`<br/>`uptime_website_uptime_percentage` | Track check success rates, response times, and availability |
| **Heartbeat Monitoring** | `uptime_heartbeat_pings_total`<br/>`uptime_heartbeat_status`<br/>`uptime_heartbeat_time_since_last_ping_seconds` | Monitor cron job health and missed beats |
| **Celery Performance** | `uptime_celery_queue_length`<br/>`uptime_celery_task_duration_seconds`<br/>`uptime_celery_active_tasks` | Track task queue health and worker performance |
| **Alerts** | `uptime_alerts_sent_total`<br/>`uptime_alerts_failed_total`<br/>`uptime_alert_delivery_duration_seconds` | Monitor alert delivery success and latency |
| **Database** | `uptime_db_query_duration_seconds`<br/>`uptime_db_slow_queries_total`<br/>`uptime_db_connection_pool_size` | Track database performance and bottlenecks |
| **Business KPIs** | `uptime_active_monitors_total`<br/>`uptime_active_users_total`<br/>`uptime_api_requests_total` | Platform usage and growth metrics |

### Grafana Dashboard Preview

![Grafana Dashboard](docs/uptime_grafana_dashboard.png)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Docker** & **Docker Compose** installed
- **Python 3.11+** (if running locally without Docker)
- **PostgreSQL 14+** and **Redis 7+** (if running natively)

### Installation

```bash
# Clone the repository
git clone https://github.com/Dipec001/uptime-monitor.git
cd uptime-monitor

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start all services
docker-compose up --build
```

### Services will be available at:
- **Django API**: http://localhost:8000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Flower (Celery Monitor)**: http://localhost:5555

### Running Migrations

```bash
# Apply database migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser
```

---

## 🔒 Security Features

- **JWT Authentication** – Secure token-based API access
- **AWS Secrets Manager** – Encrypted credential storage
- **Private Subnets** – Database and workers isolated from internet
- **Security Groups** – Least-privilege network access control
- **IAM Roles** – Fine-grained AWS service permissions
- **HTTPS/TLS** – Encrypted data in transit
- **Database Encryption** – RDS encryption at rest
- **Rate Limiting** – API endpoint protection
- **CORS Configuration** – Controlled cross-origin access

---

## 🗂️ Project Structure

```
uptime-monitor/
├── .github/
│   └── workflows/                        # GitHub Actions pipelines
│       ├── app-cicd.yml                  # Full app build, test, and deploy
│       ├── ci.yml                        # Django + frontend tests
│       ├── infra.yml                     # Terraform infrastructure apply
│       └── terraform-destroy.yml         # Staging Infrastructure teardown
│
├── monitor/                              # Django app (core uptime logic)
│   ├── admin.py                          # Admin registrations
│   ├── alerts.py                         # Slack/email alerts
│   ├── helpers.py                        # Uptime logic helpers
│   ├── metrics.py                        # Prometheus metrics
│   ├── models.py                         # Core models (Site, Check, Incident)
│   ├── oauth_utils.py                    # OAuth integration helpers
│   ├── redis_utils.py                    # Redis connection utilities
│   ├── serializers.py                    # DRF serializers
│   ├── tasks.py                          # Celery background tasks
│   ├── urls.py                           # App-level URL routing
│   ├── utils.py                          # Shared utility functions
│   ├── views.py                          # REST API endpoints
│   └── whatsapp_utils.py                 # WhatsApp flow logic
│
├── uptimemonitor/                        # Django project configuration
│   ├── settings.py                       # Settings (dev/prod via env)
│   ├── urls.py                           # Root routing
│   └── wsgi.py                           # WSGI entrypoint
│
├── frontend/                             # React (Vite) frontend
│   ├── src/                              # Frontend source code
│   ├── package.json                      # Frontend dependencies
│   └── vite.config.js                    # Build configuration
│
├── tf-infra/                             # Terraform infrastructure as code
│   ├── modules/                          # Reusable Terraform modules
│   │   ├── certificate/                  # ACM + SES
│   │   ├── ecs/                          # ECS, ALB, CloudWatch, Prometheus
│   │   ├── networking/                   # VPC, subnets, gateways
│   │   ├── rds/                          # PostgreSQL RDS
│   │   └── redis/                        # ElastiCache Redis
│   ├── prod/                             # Production environment
│   │   ├── main.tf                       # Prod config
│   │   ├── variables.tf                  # Prod variables
│   │   ├── outputs.tf                    # Prod outputs
│   │   └── prod.tfvars                   # Prod variable values
│   └── staging/                          # Staging environment
│       ├── main.tf                       # Staging config
│       ├── variables.tf                  # Staging variables
│       ├── outputs.tf                    # Staging outputs
│       └── dev.tfvars                    # Staging variable values
│
├── prometheus/                           # Prometheus custom container
│   ├── Dockerfile                        # Dockerfile for Prometheus
│   ├── entrypoint.sh                     # Custom startup script
│   ├── prometheus.yml                    # Scrape config
│   ├── alert.rules.yml                   # Alerting rules
│   └── alertmanager.yml                  # Alertmanager config
│
├── docs/                                 # Documentation and diagrams
│   ├── simplified_architecture.png        # Simplified architecture diagram
│   ├── uptime_grafana_dashboard.png       # Grafana dashboard preview
│   ├── uptime_monitor_model_new.png       # Updated data model
│   ├── uptime_monitor_model.png           # Initial data model
│   └── uptime_monitor_system_architecture.png # Full system architecture
│
├── scripts/                              # Utility scripts for setup/ops
├── docker-compose.yml                    # Local multi-container setup
├── Dockerfile                            # Django production container
├── Dockerfile.dev                        # Dev container (hot reload)
├── requirements.txt                      # Python dependencies
├── Makefile                              # Common tasks (build, deploy, etc.)
├── .env.example                          # Env variable sample
├── .flake8                               # Linting config
├── .gitignore                            # Git ignore rules
├── manage.py                             # Django management entrypoint
└── README.md                             # Project overview

```

---

## 📈 Data Retention Policy

- **Check Results**: 90 days (configurable)
- **Ping Logs**: 90 days (configurable)
- **Minutely Aggregations**: Rolled up to hourly after 24 hours
- **Hourly Aggregations**: Rolled up to daily after 7 days
- **Prometheus Metrics**: 30 days on EFS
- **CloudWatch Logs**: 7 days (cost-optimized)
- **Database Backups**: 7 daily automated snapshots

All retention periods are configurable via environment variables.

---

## 🧪 Testing

```bash
# Run all tests
docker-compose exec web pytest

# Run tests with coverage
docker-compose exec web pytest --cov=monitor --cov-report=html

# Run specific test file
docker-compose exec web pytest monitor/tests/test_models.py

# Run linting
docker-compose exec web flake8 monitor/
```

---

## 🚢 Deployment

### Automated Deployment (GitHub Actions)

Every push to `main` or `dev` triggers:
1. ✅ Run tests and linting
2. 🐳 Build Docker images
3. 📦 Push to Amazon ECR
4. 🚀 Deploy to ECS (rolling update)
5. ✔️ Health check validation

### Manual Deployment (Terraform)

```bash
cd terraform/

# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan -var-file="prod.tfvars"

# Apply changes
terraform apply -var-file="prod.tfvars"
```

For detailed deployment instructions, see [DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 🔮 Roadmap

### Phase 1: MVP ✅
- [x] Django REST API
- [x] Website monitoring with HTTP checks
- [x] Heartbeat monitoring with ping URLs
- [x] Multi-channel alerts (Email, Slack, WhatsApp)
- [x] Prometheus + Grafana observability
- [x] AWS ECS deployment with Terraform

### Phase 2: Enhanced Features
- [ ] React frontend dashboard
- [ ] Public status pages
- [ ] Incident timelines and root cause tracking
- [ ] Team collaboration features
- [ ] Advanced alert routing and escalation
- [ ] SSL certificate monitoring
- [ ] Domain expiration tracking

### Phase 3: Scale & Optimize
- [ ] Multi-region deployment
- [ ] Kubernetes migration
- [ ] Advanced analytics and reporting
- [ ] Custom integrations (PagerDuty, Datadog, etc.)
- [ ] Mobile app (iOS/Android)
- [ ] API rate limiting and usage tiers

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- All tests pass (`pytest`)
- Code follows PEP 8 style guide (`flake8`)
- Commit messages are descriptive
- Documentation is updated if needed

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Divine Ekene-Pascal Chukwu**  
Backend & DevOps Engineer

- 🌐 Website: [buildwithdivine.xyz](https://buildwithdivine.xyz)
- 💼 LinkedIn: [divine-chukwu-63bb04145](https://www.linkedin.com/in/divine-chukwu-63bb04145/)
- 🐙 GitHub: [@Dipec001](https://github.com/Dipec001)
- 📧 Email: dpecchukwu@gmail.com

---

## 🙏 Acknowledgments

- Built with ❤️ using Django, Celery, and AWS
- Inspired by industry-leading monitoring platforms
- Special thanks to the open-source community

---

## 📞 Support

For issues, questions, or feature requests:
- 🐛 [Open an Issue](https://github.com/Dipec001/uptime-monitor/issues)
- 💬 [Discussions](https://github.com/Dipec001/uptime-monitor/discussions)
- 📧 Email: dpecchukwu@gmail.com

---

<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

Built with passion by [Divine Chukwu](https://github.com/Dipec001) 🚀

</div>