# 🏗️ System Architecture — Uptime Monitor

This document provides a comprehensive overview of the Uptime Monitor architecture, including core components, AWS infrastructure layout, networking setup, background processing, observability stack, and deployment strategy.

## Table of Contents
1. [Overview](#1-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Core Components](#3-core-components)
4. [AWS Infrastructure Layout](#4-aws-infrastructure-layout)
5. [Networking and Security](#5-networking-and-security)
6. [Data Flow](#6-data-flow)
7. [Background Jobs (Celery)](#7-background-jobs-celery)
8. [Monitoring & Observability](#8-monitoring--observability)
9. [Deployment Strategy](#9-deployment-strategy)
10. [Scalability & Performance](#10-scalability--performance)
11. [Security Best Practices](#11-security-best-practices)
12. [Cost Optimization](#12-cost-optimization)
13. [Disaster Recovery](#13-disaster-recovery)
14. [Future Improvements](#14-future-improvements)

---

## 1. Overview

The **Uptime Monitor** is a production-grade distributed monitoring platform that tracks:

- 🌐 **Website uptime** through periodic HTTP/HTTPS checks  
- 💓 **Heartbeat signals** from cron jobs and background services  

It automatically detects downtime, triggers multi-channel alerts (Email, Slack, WhatsApp, webhooks), and provides comprehensive observability through Prometheus and Grafana.

### Key Architectural Decisions

- **Hybrid ECS Deployment**: EC2 launch type for core application services, Fargate for monitoring infrastructure
- **Private Subnet Architecture**: All application services isolated from direct internet access
- **Service Discovery**: AWS Cloud Map for internal service communication
- **Infrastructure as Code**: 100% Terraform-managed infrastructure
- **Zero-Downtime Deployments**: Rolling updates with health checks
- **Comprehensive Observability**: 40+ Prometheus metrics with Grafana dashboards

---

## 2. High-Level Architecture

### Architecture Diagram

![Simplified System Architecture](docs/simplified_architecture.png)

[**View Detailed Interactive Architecture Diagram →**](https://mermaid.live/view#pako:eNqtWN1u68YRfpUFDxIcA7IlkfqjEASgKMlxa-copnMMpC6KFbWSWFNcdbm0rRwdoAV6EaQBkiZB0qYXRS7S3vSiuetVH6Yv0D5CZ3dJihRJHRUoDRjc5Tffzs7MzszqlebSGdH62oLh9RLdDO4CBE8YTdXERcAJCwj_2Z32nz9_9kU6vtN-rpDi-TAkLJSI3_-gBrnPoychg32b0QBQ__r87-kUEnPoJ3QavjNl9Xefv0cw41OCOZp4wSI8SXlIMLsL9nSzbh1B94ff_Psfn4sBsn0azXJLp9iXExuw8B89bzbO5F-92TnJgXMCk2jqe64TTWGzYm9qjOKJmKUJLHqrhuRAl4MipXisy4FQ9btvpKrrNVBh7sHWLymeoQH2ceASFtvg5mbi1MX_EzkxoYyjXqPeahml3O9bN9L2X38mXtE55uQRb0qhxZl0vyPbsf0oBLfowAYjFA_R8zFmCyAt35l4JoyuCF-SSAXBV59mZtSeEordhsyG2ZCjK8KZ54bIcUEPcHrlKucMz3GA1RKfJMMqfqPRUPwvvTDCvvextHcpuYytwkRVXDDvAVbKBIaa2IsMIxsZrQORUeKA5r4DRraOLnEUuHBAN-sDjsiQ6RdByEVUKZ9884OIPEFkRZyCscEkwQKMSKN1JZ14hr_EwYLekmmSAdQEghlkTS6yERobvL5SHq0LO66pF_CDC9jEJ2xzS9k9YfKM_FFoqmaRmpa0A-zeL0DdYJbJF-6SuPe_eCTT0OMkrCEMUjw8OWLBASQZmYx-zCwnJiXxDQ7vwUhLMov85FyuCfPoDHKAXPTAIoV4qpwszlwPHWnob38r1IIRmtCQLxhxPrhUtmbeCoOqQ8zxFIdk54B2y9CVpleRz71T66NyFUc-DrlnY9iGtPf32Rl0TWaeMm5iE0bBBehtJL_vlusYXbPAn9vl3jHK5m2HsAdPxaZI3MmwwOeMlDm--qtM8DCUCoxW2PORJZ1dkJFV4BZzd6lEf5eZkdKXdBHCfq5o4HHKylKOQ1wGZ_kK8stCRiVk1y-SWRRPS67hAEoYmZGAe9gXrD8lm6JKI_ta6fIX8aoEqSvMerECqhKBsdr3l_8Ur7Hjk5Qqfa88bTROZ3iDQC2hAQ3yHq9ywIV1pfb0pXhF19QnQvUJhbLklWgjTsPoibgCGOcmeUDEXCTLmPiiNJpEvo88uasa6AXVLVRmOyml3afcEYGvaxnPnZQYVU-ldZSkuwyDIAU9Ag56LLyQM3y8icDXEfP4RiZIlUL_9L04kskHlTqLtoJK75yLsL4cIOdcKmL5Pn3sxyUczcGP5W2U2pQjxYXu--KNhhIGavlBlNC6qHPIC1Q75RfLPqQQSShSSZ5Q5AtFCIsV5UQeiEXF656wOP3lwmkKKGvZkr5Phd_Xuz5QGGShHJS3qeND3ldn4W9qIErPktL7PM6GWklXySfF_208Wy5xu8Q8hF5Mncwf0zF6_uBhUdsOd5_2hT2Uot_9Gt7r9hBa1jWBqkpyq5x7_L1IFE_1giy3uMcbwqCZoWwFsPRdxfBFMGeQnFnk8ogRhENkQ79eqtlbb8neG43BQWpGtuLo9PTdrewptyJy1JdsSy4BkxfODapDA1YXPVg9AxWBLBDXNIISizjd7nqCzNIXQdLR09UqCuL-Vn1O8ZLogwjKSv0WDhHZivAsw8haU3dIGALJNlugytCj4FcRiYjMIGEJWv3PNhpqEfBDtKoWKwhcQzorKF5AOeATJCsUkEIWOwRTJWyrAvsYYD7Mj5FIwrpoCtHtKHzc6LzBEile2AH8HMy9RWyINAx2RRUKyospBOADnno-JMxSxz2taUhQ2jFuMxcHhc9UPakpcBMUXxm2ojaWwmSIyTK5Te4J2e3nlZhE4RKJnmCbKTcVln0jNrXRAeSesgeQse6HYKnl08L0dtKolG1Wui7-vt3rcw5E_WGRXRKAbsIKQ-p6cSbf1-AM-CArAU9S_MsWrUJlbzVZVNwJFK2bJ0pamD3bVoGKlpUlv2SDMkUKGlibE5eTGZputqoVKDVBHidrfpUdKqH7-6wE5jZaiRL9QQlCtg-x9TO3hDJk3DBkDCfLYqyEqn4ingaR589EuwkBLVS4LiCGZO1TpV5yJT4CoytMWkDVqWH0wVNF5OXEfgMizemViEJmrEbu634EUs_Y7n3CHyEMxO2k5Bi_iPhUXoWhVdmKn30qzm4FLm5l-AZyvrhXzT3f7z8bj02z0ahBtwE3vv4z3dDHxogenj56M77sG-unmkt9yvrP5vN5lkb8tKZoWpbZGOk7mlHb7ll5Gr2SJvezW0zYtQdGa0fYbvcG-vhowtzvNelOO4POIGW0Td3Sj1Yx49mYrm13BvbOcIbZMq3B_06n_z_oMpfrdLNWV--kdON21069_Ea6_D0oZhzZrUbX2plPb_baRysoaoSi0TtWx9zRNBo9s3u82ZKbg-KyBq3uwE65eiO9ZR3tUdHKJ8GrW-1xO-Vpmt3OUD_Eo9W0BfNmWh96dFLTVoRB5wdD7ZVY4U6DDL2CG0EfXmeY3d9pd8FrkFnj4CNKV4kYWHex1Ppz7IcwitYzCNmhh-GmsYNAU0eYDaeZa_1mT5ccWv-V9qT1T5uthnHW0TtNOLTdntkza9oGUK2zTq9rttutbts09Xav-bqmfSyX1c-MVs8wm3q7axpG2zBf_xd-7qEd)

### Infrastructure Overview

```
Internet → ALB → NAT Gateway → Private Subnets
                                    ↓
                          ┌─────────┴─────────┐
                          │                   │
                    Application Stack   Monitoring Stack
                    (ECS on EC2)        (ECS Fargate)
                          │                   │
                    ┌─────┴─────┐       ┌────┴────┐
                    │           │       │         │
                Django      Celery   Prometheus Grafana
                  Web       Worker      (EFS)
                            Beat
                    │
                    ├── RDS PostgreSQL (Multi-AZ)
                    └── ElastiCache Redis
```

---

## 3. Core Components

| Component | Technology | Deployment | Purpose |
|-----------|-----------|------------|---------|
| **Django Web API** | Django 5.0 + DRF | ECS on EC2 (awsvpc mode) | REST API, user management, monitor configuration |
| **Celery Worker** | Celery 5.3 + Python | ECS on EC2 (awsvpc mode) | Asynchronous task execution (checks, alerts) |
| **Celery Beat** | Celery 5.3 + Python | ECS on EC2 (awsvpc mode) | Task scheduling (periodic checks) |
| **PostgreSQL** | RDS PostgreSQL 16 | Multi-AZ RDS | Primary database (users, monitors, logs) |
| **Redis** | ElastiCache Redis 7.2 | ElastiCache cluster | Celery broker, caching, session storage |
| **Prometheus** | Prometheus 2.45 | ECS Fargate | Metrics collection and time-series storage |
| **Grafana** | Grafana 10.0 | ECS Fargate | Metrics visualization and dashboards |
| **Application Load Balancer** | AWS ALB | - | Traffic distribution and SSL termination |
| **NAT Gateway** | AWS NAT Gateway | Public subnet | Outbound internet for private subnets |
| **EFS** | AWS EFS | - | Persistent Prometheus data storage |

---

## 4. AWS Infrastructure Layout

### ECS Cluster Configuration

#### Application Cluster (EC2 Launch Type)
- **Cluster Name**: `${env}-uptimemonitor-cluster`
- **Launch Type**: EC2 (for cost optimization and persistent connections)
- **Network Mode**: `awsvpc` (each task gets its own ENI)
- **Auto Scaling**: 
  - Min: 1 instances
  - Desired: 2 instances
- **Instance Type**: t3.medium (2 vCPU, 4 GB RAM), 3 ENI
- **Services**:
  - `web` → Django API (port 8000)
  - `celery-worker` → Background task processor
  - `celery-beat` → Task scheduler

#### Monitoring Cluster (Fargate)
- **Cluster Name**: `${env}-uptimemonitor-cluster`
- **Launch Type**: Fargate (serverless, auto-scaling)
- **Services**:
  - `prometheus` → Metrics scraper (port 9090)
  - `grafana` → Visualization (port 3000)

### Network Mode: awsvpc

**Why awsvpc over bridge mode?**

- ✅ **Security Group per Task**: Each task gets its own security group
- ✅ **Service Discovery**: Native AWS Cloud Map integration
- ✅ **VPC Flow Logs**: Better network observability
- ✅ **ENI per Task**: Dedicated network interface for isolation
- ✅ **No Port Conflicts**: Tasks can use same ports without collision

---

## 5. Networking and Security

### VPC Architecture

```
VPC: 10.0.0.0/16
├── 2 Public Subnets (10.0.1.0/24, 10.0.2.0/24) - Multi-AZ
│   ├── Application Load Balancer
│   └── NAT Gateway

│
└── 2 Private Subnets (10.0.3.0/24, 10.0.4.0/24) - Multi-AZ
    ├── ECS EC2 Instances (Django, Celery Worker, Celery Beat)
    ├── RDS PostgreSQL (Multi-AZ)
    ├── ElastiCache Redis
    └── Monitoring Stack (Prometheus, Grafana - Fargate)
```

### Security Groups

#### ALB Security Group (`alb_sg`)
```hcl
Inbound:
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0

Outbound:
  - All traffic to ECS tasks
```

#### ECS Application Security Group (`ecs_app_sg`)
```hcl
Inbound:
  - Port 8000 from ALB Security Group (Django)
  - All traffic from same security group (inter-task communication)

Outbound:
  - Port 5432 to RDS Security Group
  - Port 6379 to Redis Security Group
  - Port 443 to 0.0.0.0/0 (HTTPS for external API calls, SES)
  - Port 9090 to Monitoring Security Group (Prometheus metrics)
```

#### ECS Monitoring Security Group (`ecs_monitoring_sg`)
```hcl
Inbound:
  - Port 9090 from ECS App Security Group (Prometheus)
  - Port 3000 from ALB Security Group (Grafana)
  - All traffic from same security group (Prometheus ↔ Grafana)

Outbound:
  - All traffic to ECS App Security Group (scraping metrics)
  - Port 443 to 0.0.0.0/0 (plugin downloads)
```

#### RDS Security Group (`rds_sg`)
```hcl
Inbound:
  - Port 5432 from ECS App Security Group only

Outbound:
  - None (database doesn't initiate connections)
```

#### Redis Security Group (`redis_sg`)
```hcl
Inbound:
  - Port 6379 from ECS App Security Group only

Outbound:
  - None
```

### Service Discovery (AWS Cloud Map)

Enables internal service-to-service communication without hardcoding IPs:

- **Namespace**: `uptimemonitor.local` (private DNS)
- **Services**:
  - `web.uptimemonitor.local` → Django API
  - `prometheus.uptimemonitor.local` → Prometheus
  - `grafana.uptimemonitor.local` → Grafana

**Example Usage:**
```python
# Django scrapes metrics from Prometheus
PROMETHEUS_URL = "http://prometheus.uptimemonitor.local:9090"

# Grafana queries Prometheus
datasource_url = "http://prometheus.uptimemonitor.local:9090"
```

### Secrets Management

- **AWS Secrets Manager** stores:
  - Database credentials (PostgreSQL username/password)
  - Redis connection string
  - Django secret key
  - Email service API keys (SES, WhatsApp)
  - Slack webhook URLs
  
- Secrets are **injected at runtime** via ECS task definitions
- **IAM roles** control access (least privilege principle)

### IAM Roles

#### ECS Task Execution Role
**Purpose**: Pull container images, write logs, read secrets

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
```

#### ECS Task Role
**Purpose**: Application-level AWS service access

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*"
    }
  ]
}
```

#### EC2 Instance Role
**Purpose**: Register EC2 instances to ECS cluster

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:RegisterContainerInstance",
        "ecs:DeregisterContainerInstance",
        "ecs:Submit*",
        "ecr:GetAuthorizationToken"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 6. Data Flow

### Website Monitoring Flow

```
1. Celery Beat (scheduler)
   ↓ Schedules task every N minutes
2. check_due_websites task → Redis queue
   ↓
3. Celery Worker picks up task
   ↓ Fans out to check_single_website tasks
4. check_single_website
   ↓ Makes HTTP request to monitored URL
5. Response received (status code, response time)
   ↓
6. Save CheckResult to PostgreSQL
   ↓
7. Update Prometheus metrics:
   - uptime_website_checks_total++
   - uptime_website_response_time_seconds
   - uptime_website_status (1=up, 0=down)
   ↓
8. If consecutive failures >= threshold:
   ↓
9. Create Alert record → handle_alert task
   ↓
10. Send notification via Email/Slack/WhatsApp/Webhook
    ↓
11. Log alert delivery status
    ↓
12. Update Prometheus metrics:
    - uptime_alerts_sent_total++
    - uptime_downtime_events_total++
```

### Heartbeat Monitoring Flow

```
1. User creates Heartbeat
   ↓
2. System generates unique ping URL:
   POST /api/ping/{uuid}/
   ↓
3. External cron job calls ping URL on success
   ↓
4. Django receives ping → process_ping task
   ↓
5. Update last_ping_at in PostgreSQL
   ↓
6. Update Prometheus metrics:
   - uptime_heartbeat_pings_total++
   - uptime_heartbeat_last_ping_timestamp
   - uptime_heartbeat_status (1=healthy)
   ↓
7. Celery Beat checks for missed heartbeats
   ↓
8. If last_ping_at > grace_period:
   ↓
9. Mark as missed → Create Alert
   ↓
10. Send notification
    ↓
11. Update Prometheus metrics:
    - uptime_heartbeat_missed_total++
    - uptime_heartbeat_status (0=missed)
```

---

## 7. Background Jobs (Celery)

### Task Queue Architecture

```
Celery Beat (Scheduler)
    ↓ Schedules periodic tasks
Redis (Broker)
    ↓ Stores task queue
Celery Workers (Processors)
    ↓ Execute tasks
PostgreSQL (Result Backend)
    ↓ Store task results
```

### Task Definitions

| Task Name | Trigger | Frequency | Purpose |
|-----------|---------|-----------|---------|
| `check_due_websites` | Celery Beat | Every 1 minute | Fan-out task to check all due websites |
| `check_single_website` | Fanout from above | On-demand | Perform HTTP check for one website |
| `check_due_heartbeats` | Celery Beat | Every 1 minute | Check for missed heartbeats |
| `check_single_heartbeat` | Fanout from above | On-demand | Check if heartbeat is missed |
| `process_ping` | Heartbeat ping received | Real-time | Update heartbeat status |
| `handle_alert` | Downtime/recovery detected | Real-time | Dispatch alert with retry logic |
| `cleanup_old_logs` | Celery Beat | Daily at 2 AM | Remove logs older than retention period |
| `aggregate_metrics` | Celery Beat | Every 15 minutes | Roll up minutely metrics to hourly |
| `update_prometheus_metrics` | Celery Beat | Every 30 seconds | Push business metrics to Prometheus |

### Retry Logic

```python
@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,  # 1 minute
    autoretry_for=(RequestException, TimeoutError),
    retry_backoff=True,
    retry_jitter=True
)
def check_single_website(self, website_id):
    # Task implementation
    pass
```

**Benefits:**
- ✅ Automatic retry on transient failures
- ✅ Exponential backoff prevents thundering herd
- ✅ Jitter prevents retry storms
- ✅ Max retries prevent infinite loops

---

## 8. Monitoring & Observability

### Architecture

```
Django App (/metrics/ endpoint)
    ↓ Exposes Prometheus metrics
Prometheus (ECS Fargate)
    ↓ Scrapes every 15 seconds
    ↓ Stores in EFS (30-day retention)
Grafana (ECS Fargate)
    ↓ Queries Prometheus
    ↓ Visualizes dashboards
```

### Service Discovery for Monitoring

Prometheus uses AWS Cloud Map service discovery to find Django tasks:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'django'
    ec2_sd_configs:
      - region: us-east-1
        port: 8000
    relabel_configs:
      - source_labels: [__meta_ec2_tag_Service]
        regex: 'django-web'
        action: keep
      - source_labels: [__meta_ec2_private_ip]
        target_label: instance
```

### EFS for Prometheus Data

- **Mount Point**: `/prometheus`
- **Retention**: 30 days (configurable)
- **Throughput Mode**: Bursting
- **Performance Mode**: General Purpose
- **Encryption**: At rest and in transit

**Why EFS over EBS?**
- ✅ Fargate tasks can mount EFS
- ✅ Shared storage across Prometheus replicas
- ✅ Automatic backups
- ✅ No capacity planning

### Metrics Categories

#### 1. Website Monitoring (10 metrics)
```
uptime_website_checks_total{monitor_id, monitor_name, status}
uptime_website_check_duration_seconds{monitor_id, monitor_name}
uptime_website_response_time_seconds{monitor_id, monitor_name, status_code}
uptime_website_status{monitor_id, monitor_name, url}
uptime_website_consecutive_failures{monitor_id, monitor_name}
uptime_website_uptime_percentage{monitor_id, monitor_name}
uptime_website_ssl_expiry_days{monitor_id, monitor_name}
uptime_website_last_check_timestamp{monitor_id, monitor_name}
uptime_website_dns_resolution_time{monitor_id, monitor_name}
uptime_website_tcp_connection_time{monitor_id, monitor_name}
```

#### 2. Heartbeat Monitoring (6 metrics)
```
uptime_heartbeat_pings_total{heartbeat_id, heartbeat_name, status}
uptime_heartbeat_missed_total{heartbeat_id, heartbeat_name}
uptime_heartbeat_status{heartbeat_id, heartbeat_name}
uptime_heartbeat_last_ping_timestamp{heartbeat_id, heartbeat_name}
uptime_heartbeat_time_since_last_ping_seconds{heartbeat_id, heartbeat_name}
uptime_heartbeat_grace_period_seconds{heartbeat_id, heartbeat_name}
```

#### 3. Alerts (8 metrics)
```
uptime_alerts_sent_total{alert_type, channel, status}
uptime_alerts_failed_total{alert_type, channel, error_type}
uptime_alert_delivery_duration_seconds{alert_type, channel}
uptime_alert_retry_attempts_total{alert_type, channel}
uptime_downtime_events_total{monitor_id, monitor_name, monitor_type, reason}
uptime_recovery_events_total{monitor_id, monitor_name, monitor_type}
uptime_downtime_duration_seconds{monitor_id, monitor_name}
uptime_alert_throttle_hits_total{monitor_id, alert_type}
```

#### 4. Celery Performance (8 metrics)
```
uptime_celery_task_duration_seconds{task_name, status}
uptime_celery_task_total{task_name, status}
uptime_celery_queue_length{queue_name}
uptime_celery_active_tasks{queue_name}
uptime_celery_worker_pool_size{worker_name}
uptime_celery_task_retries_total{task_name}
uptime_celery_task_failures_total{task_name, exception_type}
uptime_celery_beat_schedule_drift_seconds{task_name}
```

#### 5. Business Metrics (8 metrics)
```
uptime_active_monitors_total{monitor_type}
uptime_active_users_total
uptime_monitors_per_user{user_id, username}
uptime_user_registrations_total
uptime_api_requests_total{endpoint, method, status_code}
uptime_api_auth_attempts_total{status}
uptime_subscription_tier{user_id, tier}
uptime_storage_usage_bytes{data_type}
```

### CloudWatch Logs

- **Log Groups**:
  - `/ecs/django-web`
  - `/ecs/celery-worker`
  - `/ecs/celery-beat`
  - `/ecs/prometheus`
  - `/ecs/grafana`
  
- **Retention**: 7 days (cost-optimized)
- **Log Format**: JSON structured logging

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "INFO",
  "service": "django-web",
  "request_id": "abc123",
  "user_id": 456,
  "message": "Website check completed",
  "duration_ms": 250,
  "status_code": 200
}
```

---

## 9. Deployment Strategy

### CI/CD Pipeline (GitHub Actions)

```
git push → main/staging
    ↓
1. Checkout code
    ↓
2. Run tests (pytest)
    ↓
3. Run linting (flake8, black)
    ↓
4. Build Docker images (multi-stage)
    ↓
5. Tag images (git SHA + latest)
    ↓
6. Push to Amazon ECR
    ↓
7. Update ECS task definitions
    ↓
8. Deploy to ECS (rolling update)
    ↓
9. Health check validation
    ↓
10. Slack notification (success/failure)
```

### Zero-Downtime Deployments

**Rolling Update Strategy:**

1. **New tasks started** (50% capacity maintained)
2. **Health checks pass** (ALB verifies `/health/` endpoint)
3. **Traffic shifted** to new tasks gradually
4. **Old tasks drained** (wait for active connections to complete)
5. **Old tasks stopped** after drain timeout (30 seconds)

**Health Check Configuration:**
```hcl
health_check {
  path                = "/health/"
  protocol            = "HTTP"
  port                = 8000
  healthy_threshold   = 2
  unhealthy_threshold = 3
  timeout             = 5
  interval            = 30
  matcher             = "200"
}
```

### Multi-Environment Strategy

| Environment | Branch | ECS Cluster | Database | Purpose |
|-------------|--------|-------------|----------|---------|
| **Production** | `main` | `prod-uptime-cluster` | RDS Multi-AZ | Live user traffic |
| **Staging** | `staging` | `staging-uptime-cluster` | RDS Single-AZ | Pre-production testing |
| **Development** | `develop` | Docker Compose | Local PostgreSQL | Local development |

### Infrastructure Teardown

**Terraform Destroy Workflow** (GitHub Actions):
- Manual trigger for non-production environments
- Prevents accidental deletion of production
- Cost management: destroy staging when not in use
- Recreate in minutes via Terraform apply

```yaml
# .github/workflows/terraform-destroy.yml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to destroy'
        required: true
        type: choice
        options:
          - staging
          - development
```

---

## 10. Scalability & Performance

### Horizontal Scaling

#### ECS Auto Scaling (Application Tasks)

**Target Tracking Policy:**
```hcl
resource "aws_appautoscaling_policy" "ecs_target_tracking" {
  policy_type = "TargetTrackingScaling"
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

**Scaling Thresholds:**
- **CPU > 70%**: Scale up (add 1 task, max 10)
- **CPU < 30%**: Scale down (remove 1 task, min 2)
- **Cooldown**: 300 seconds (prevent flapping)

#### EC2 Auto Scaling Group

**Scaling Triggers:**
- **CPU > 75%**: Add 1 instance
- **ECS Cluster Capacity < 20%**: Add 1 instance
- **CPU < 25%** for 10 minutes: Remove 1 instance

**Configuration:**
```hcl
min_size         = 2
desired_capacity = 3
max_size         = 10
```

### Database Optimization

#### RDS Performance

**Multi-AZ Deployment:**
- Primary: `us-east-1a`
- Standby: `us-east-1b`
- Automatic failover < 60 seconds

**Read Replica Strategy (Future):**
```
Primary (Write) → Read Replica 1 (Analytics)
               → Read Replica 2 (Dashboard queries)
```

**Connection Pooling:**
```python
# Django settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'CONN_MAX_AGE': 600,  # 10 minutes
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000'  # 30 seconds
        }
    }
}
```

**Query Optimization:**
- Composite indexes on `(user_id, created_at)`
- Partial indexes for active monitors only
- EXPLAIN ANALYZE for slow queries (tracked via Prometheus)

#### Redis Performance

**ElastiCache Configuration:**
- **Node Type**: cache.t3.medium (2 vCPU, 3.09 GB)
- **Cluster Mode**: Disabled (single shard)
- **Replication**: 1 read replica
- **Snapshot**: Daily at 3 AM UTC

**Usage Patterns:**
- **Celery Broker**: Task queue (ephemeral)
- **Session Storage**: 30-minute TTL
- **API Caching**: 5-minute TTL for dashboard data

### Celery Worker Scaling

**Current Configuration:**
- **Workers per Container**: 4 (1 per vCPU)
- **Task Concurrency**: 16 (4 workers × 4 threads)
- **Prefetch Multiplier**: 4 (prevents worker starvation)

**Scaling Strategy:**
```python
# celery.py
app.conf.update(
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,  # Restart after 1000 tasks (memory leaks)
    task_acks_late=True,  # Acknowledge after completion
    task_reject_on_worker_lost=True,  # Re-queue on worker crash
)
```

**Queue-Based Scaling (Future):**
- Monitor `uptime_celery_queue_length`
- If queue > 100 for 5 minutes → Scale up workers
- If queue < 10 for 10 minutes → Scale down workers

---

## 11. Security Best Practices

### Network Security

✅ **All application services in private subnets** (no direct internet access)  
✅ **NAT Gateway** for outbound internet (SES, Slack, external APIs)  
✅ **Security groups follow least privilege** (only necessary ports)  
✅ **No SSH access to EC2 instances** (managed via SSM Session Manager)  
✅ **VPC Flow Logs** enabled for network monitoring  

### Application Security

✅ **JWT Authentication** with short-lived tokens (1 hour)  
✅ **Refresh tokens** stored securely (HttpOnly cookies)  
✅ **Rate limiting** on API endpoints (django-ratelimit)  
✅ **CORS configuration** (only allowed origins)  
✅ **Django Security Middleware** (XSS, CSRF, clickjacking protection)  
✅ **Input validation** via DRF serializers  

### Data Security

✅ **RDS encryption at rest** (AES-256)  
✅ **EFS encryption** at rest and in transit  
✅ **Secrets in AWS Secrets Manager** (not environment variables)  
✅ **TLS 1.2+ enforced** on ALB  
✅ **Database backups encrypted**  
✅ **CloudWatch logs encrypted**  

### IAM Security

✅ **Task-level IAM roles** (not instance roles)  
✅ **Least privilege policies** (no wildcards)  
✅ **MFA required** for Terraform apply  
✅ **CloudTrail enabled** (audit all API calls)  
✅ **Regular IAM access reviews**  

### Compliance

✅ **GDPR-ready**: Data deletion on request  
✅ **SOC 2 considerations**: Audit logs, access controls  
✅ **PCI DSS**: No credit card data stored (use Stripe)  

---

## 12. Cost Optimization

### Current Monthly Costs (Estimate)

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| **EC2 (ECS Cluster)** | 3 × t3.medium (reserved) | ~$45 |
| **Fargate (Monitoring)** | 2 tasks × 0.5 vCPU, 1GB | ~$15 |
| **RDS PostgreSQL** | db.t3.medium (Multi-AZ) | ~$100 |
| **ElastiCache Redis** | cache.t3.medium | ~$50 |
| **Application Load Balancer** | 1 ALB | ~$25 |
| **NAT Gateway** | 1 NAT (data transfer) | ~$35 |
| **EFS** | 20 GB (Prometheus data) | ~$6 |
| **CloudWatch Logs** | 10 GB/month | ~$5 |
| **Data Transfer** | 100 GB/month | ~$9 |
| **Route 53** | 1 hosted zone | ~$0.50 |
| **Secrets Manager** | 5 secrets | ~$2 |
| **ECR** | 10 GB storage | ~$1 |
| **Total** | | **~$293/month** |

### Cost Optimization Strategies

#### 1. Reserved Instances
- **EC2 Reserved Instances** (1-year, no upfront): 40% savings
- **RDS Reserved Instances** (1-year, partial upfront): 35% savings
- **Estimated Savings**: ~$60/month

#### 2. Spot Instances
- Use Spot for non-critical Celery workers
- 70% cost reduction
- Configure Spot Fleet with fallback to On-Demand

#### 3. Auto-Shutdown (Non-Production)
```yaml
# GitHub Actions scheduled workflow
- cron: '0 20 * * 1-5'  # 8 PM Mon-Fri
  run: terraform destroy -auto-approve -target=module.staging
  
- cron: '0 8 * * 1-5'   # 8 AM Mon-Fri
  run: terraform apply -auto-approve
```
**Savings**: ~$100/month for staging environment

#### 4. S3 Lifecycle Policies
- Move CloudWatch logs to Glacier after 30 days
- Delete logs after 90 days
- **Savings**: ~$3/month

#### 5. Right-Sizing
- Monitor CPU/Memory utilization via CloudWatch
- Downgrade instance types if <50% utilization
- Potential savings: 20-30%

---

## 13. Disaster Recovery

### Backup Strategy

#### Database Backups
- **Automated Snapshots**: Daily at 3 AM UTC
- **Retention**: 7 days
- **Manual Snapshots**: Before major deployments
- **Cross-Region Replication**: Enabled for production

#### Application Backups
- **Docker Images**: Stored in ECR (90-day retention)
- **Terraform State**: S3 with versioning enabled
- **Secrets**: AWS Secrets Manager (automatic rotation)

### Recovery Procedures

#### RTO/RPO Targets
- **RTO (Recovery Time Objective)**: < 30 minutes
- **RPO (Recovery Point Objective)**: < 1 hour

#### Disaster Scenarios

**Scenario 1: Database Failure**
```
1. RDS Multi-AZ automatic failover (~60 seconds)
2. If complete failure: Restore from latest snapshot (~10 minutes)
3. Update connection strings if manual failover needed
```

**Scenario 2: ECS Cluster Failure**
```
1. Auto Scaling Group replaces failed instances (~5 minutes)
2. ECS re-schedules tasks on healthy instances (~2 minutes)
3. ALB routes traffic away from unhealthy targets (~30 seconds)
```

**Scenario 3: Region Failure**
```
1. Restore RDS snapshot in secondary region (~15 minutes)
2. Deploy infrastructure via Terraform in secondary region (~10 minutes)
3. Update DNS to point to new region (~5 minutes)
Total: ~30 minutes
```

**Scenario 4: Accidental Data Deletion**
```
1. Stop all write operations
2. Restore from snapshot to new instance
3. Export affected data
4. Import to production database
5. Resume operations
```

### Monitoring for Failures

**CloudWatch Alarms:**
- RDS CPU > 90% for 5 minutes
- ECS Service healthy task count < 1
- ALB unhealthy target count > 0
- Celery queue length > 1000 for 10 minutes
- Disk space > 85% used

**PagerDuty Integration** (Future):
- Critical alerts → Immediate page
- Warning alerts → Slack notification
- Info alerts → Email

---

## 14. Future Improvements

### Short-Term (1-3 Months)

#### 1. SQS Integration
**Problem**: Redis as broker is single point of failure  
**Solution**: Replace Redis queue with Amazon SQS

```python
# celery.py
broker_url = 'sqs://'
broker_transport_options = {
    'region': 'us-east-1',
    'visibility_timeout': 3600,
    'polling_interval': 1,
}
```

**Benefits:**
- ✅ Fully managed (no operational overhead)
- ✅ At-least-once delivery guarantee
- ✅ Dead Letter Queue for failed tasks
- ✅ Automatic scaling

#### 2. AWS X-Ray / OpenTelemetry
**Problem**: Difficult to debug performance issues across services  
**Solution**: Distributed tracing

**Implementation:**
```python
from opentelemetry import trace
from opentelemetry.instrumentation.django import DjangoInstrumentor

DjangoInstrumentor().instrument()

tracer = trace.get_tracer(__name__)

@tracer.start_as_current_span("check_website")
def check_single_website(website_id):
    # Automatic span creation for HTTP requests, DB queries
    pass
```

**Benefits:**
- ✅ End-to-end request tracing
- ✅ Identify bottlenecks (database, external APIs)
- ✅ Visualize service dependencies

#### 3. CloudFront CDN
**Problem**: Static assets served from ECS (inefficient)  
**Solution**: CloudFront for static files and API caching

**Benefits:**
- ✅ Lower latency for global users
- ✅ Reduced load on ECS tasks
- ✅ DDoS protection via AWS Shield

#### 4. Alertmanager
**Problem**: Grafana alerts are basic  
**Solution**: Prometheus Alertmanager for advanced routing

**Features:**
- Alert grouping (group similar alerts)
- Deduplication (prevent alert spam)
- Silencing (maintenance windows)
- Routing (route to PagerDuty, Slack, email based on severity)

---

### Medium-Term (3-6 Months)

#### 5. Kubernetes Migration (EKS)
**Why Migrate?**
- ✅ More control over scheduling
- ✅ Better multi-tenancy support
- ✅ Advanced deployment strategies (canary, blue-green)
- ✅ Ecosystem tooling (Helm, Istio, ArgoCD)

**Architecture Changes:**
```
ECS EC2 → EKS Node Group (Spot + On-Demand)
ECS Fargate → EKS Fargate
Service Discovery → Kubernetes Service + CoreDNS
ALB → AWS Load Balancer Controller
```

#### 6. Read Replicas
**Problem**: Analytics queries slow down write operations  
**Solution**: PostgreSQL read replicas for reporting

**Usage:**
```python
# Django multi-database routing
class ReportingRouter:
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'reporting':
            return 'replica'
        return 'default'
```

#### 7. Elasticsearch
**Use Cases:**
- Full-text search on alerts and logs
- Advanced log analysis
- Real-time alerting on log patterns

**Architecture:**
```
Django → Logstash → Elasticsearch → Kibana
```

#### 8. Public Status Page
**Features:**
- Public-facing uptime dashboard
- Incident history
- Maintenance windows
- Subscription to status updates

**Tech Stack:**
- Next.js static site
- S3 + CloudFront hosting
- API: Django read-only endpoints

---

### Long-Term (6+ Months)

#### 9. Multi-Region Deployment
**Architecture:**
```
Primary Region: us-east-1
    ↓ Active-Active
Secondary Region: eu-west-1
    ↓
Route 53 Geolocation Routing
```

**Challenges:**
- Database replication lag
- Data consistency (eventual consistency)
- Cross-region latency

**Solution:**
- Aurora Global Database (< 1 second replication)
- DynamoDB Global Tables (for session data)
- Redis replication (Lua scripts for consistency)

#### 10. Event-Driven Architecture
**Problem**: Tight coupling between services  
**Solution**: Amazon EventBridge for event-driven decoupling

**Example:**
```
Website Check Failed → EventBridge Event
    ↓
    ├→ Lambda: Send Notification
    ├→ Lambda: Update Dashboard
    └→ Lambda: Create Incident Ticket
```

#### 11. Serverless Functions
**Use Case**: Alert dispatch (bursty workload)  
**Solution**: AWS Lambda for high-scale alert delivery

**Benefits:**
- ✅ Pay per invocation (cost savings)
- ✅ Automatic scaling to 1000s of concurrent executions
- ✅ No idle capacity costs

#### 12. Data Lake
**Problem**: Limited historical analysis (30-day Prometheus retention)  
**Solution**: S3 + Athena for long-term metrics storage

**Architecture:**
```
Prometheus → Thanos → S3 (Parquet format)
                ↓
            Athena (SQL queries)
                ↓
        QuickSight (BI dashboards)
```

**Use Cases:**
- Yearly uptime reports
- Cost analysis by customer
- Capacity planning
- Compliance reporting

---

## Conclusion

This architecture demonstrates **production-grade infrastructure design** with:

✅ **High Availability**: Multi-AZ deployment, auto-scaling, load balancing  
✅ **Security**: Private subnets, security groups, IAM roles, encryption  
✅ **Observability**: 40+ Prometheus metrics, structured logging, distributed tracing (future)  
✅ **Scalability**: Auto-scaling ECS tasks and EC2 instances, read replicas (future)  
✅ **Cost Optimization**: Reserved instances, spot instances, right-sizing  
✅ **Disaster Recovery**: Automated backups, RTO < 30 minutes, RPO < 1 hour  
✅ **Infrastructure as Code**: 100% Terraform-managed, version-controlled  
✅ **CI/CD**: Automated testing, building, and deployment with zero downtime  

The system is designed to scale from a few users to thousands while maintaining reliability, security, and operational excellence.

---

**Document Version**: 2.0  
**Last Updated**: January 2025  
**Author**: Divine Ekene-Pascal Chukwu  
**Contact**: dpecchukwu@gmail.com