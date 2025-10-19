# 🏗️ System Architecture — Uptime Monitor

This document provides a detailed overview of its architecture, including core components, AWS infrastructure layout, networking setup, background processing, and deployment strategy to help understand how the system operates as a whole.

## Table of Contents
1. [Overview](#1-overview)
2. [High-Level Diagram](#2-high-level-diagram)
3. [Core Workflow](#3-core-workflow)
4. [AWS Infrastructure Layout](#4-aws-infrastructure-layout)
5. [Networking and Security](#5-networking-and-security)
6. [Data Flow (Request → Alert)](#6-data-flow-request--alert)
7. [Background Jobs (Celery)](#7-background-jobs-celery)
8. [Monitoring & Logging](#8-monitoring--logging)
9. [Future Improvements](#9-future-improvements)

---

## 1. Overview

The **Uptime Monitor** system is a distributed platform for tracking:

- 🌐 **Website uptime** through periodic HTTP checks  
- 💓 **Heartbeat signals** from cron jobs or background services  

It automatically detects downtime, triggers alerts (email, Slack, whatsapp, webhook), and logs uptime history for users.

The project is fully containerized with **Docker**, orchestrated on **AWS ECS (EC2 launch type)**, and provisioned with **Terraform**.  
Asynchronous processing and scheduling are powered by **Celery** and **Redis**, while persistent data is stored in **PostgreSQL (RDS)**.

---

## 2. High-Level Diagram

> *(Diagram will be added here — `/docs/architecture-diagram.png`)*

### Core Workflow

1. Users register and add websites or cron jobs to monitor.  
2. Periodic checks are triggered by **Celery Beat**.  
3. **Celery Workers** perform actual uptime checks and process results.  
4. The **Django API** exposes endpoints for both website and heartbeat data.  
5. Notification preferences are chosen and alerts are dispatched through **Celery tasks** whenever downtime is detected.  
6. All components are deployed as **Docker containers** running on **ECS EC2 instances**.

---

## 3. Core Workflow

| Component | Description |
|------------|-------------|
| **Django API** | Manages websites, heartbeats, alerts, and users. Exposes REST endpoints for clients and services. |
| **Celery Worker** | Executes background jobs — website checks, ping processing, and alert dispatching. |
| **Celery Beat** | Periodically schedules tasks such as uptime checks and cleanup jobs. |
| **PostgreSQL (RDS)** | Stores users, websites, heartbeats, alerts, and related logs. |
| **Redis (ElastiCache)** | Acts as the Celery broker and result backend. |
| **ALB (Application Load Balancer)** | Routes incoming HTTP traffic to the Django containers on ECS. |
| **GitHub Actions** | CI/CD pipeline for build, test, and deploy automation. |
| **Terraform** | Manages all AWS infrastructure — ECS, RDS, Redis, ALB, IAM, and networking. |

---

## 4. AWS Infrastructure Layout

- **Cluster:** `${env}-uptimemonitor-cluster`  
- **Launch Type:** `EC2`  
- **Network Mode:** `bridge`  
- **Service Containers:**
  - `web` → Django API (port 8000)  
  - `celery` → Background worker  
  - `beat` → Task scheduler  
- **Scaling:** EC2 instances are managed by an Auto Scaling Group.  
- **Logging:** Container logs are pushed to just CloudWatch for now.  
- **Email Sending:** Uses AWS SES via IAM permissions.

---

## 5. Networking and Security

- **Security Groups**
  - `alb_sg`: allows inbound HTTP/HTTPS from the internet  
  - `ecs_sg`: allows inbound traffic **only from ALB**  
  - `rds_sg`: allows inbound traffic **only from ECS tasks**
- **Subnets**
  - Public subnets → ALB + ECS instances  
  - Private subnets → RDS + Redis
- **Secrets**
  - Managed via **AWS Secrets Manager**, injected into containers at runtime.  
- **IAM Roles**
  - `ecs_task_execution_role`: pulls ECR images, pushes logs, reads secrets.  
  - `ecs_task_role`: handles application-level actions (e.g., SES emails).  
  - `ec2_instance_role`: registers EC2 instances to the ECS cluster.

---

## 6. Data Flow (Request → Alert)

### Website Monitoring

Each website defines a URL that is periodically checked via **Celery Beat**.  
Downtime or recovery events generate alerts and trigger user notifications.

**Flow:**
1. Celery Beat schedules a `check_due_websites` task which fans out to a `check_single_website` task.  
2. Worker performs an HTTP request.  
3. Result saved to database.  
4. Consecutive failures trigger downtime alerts.  
5. Recovery triggers a recovery alert.

### Heartbeat Monitoring

Each heartbeat represents an external cron job or service expected to “ping” the system periodically.

**Flow:**
1. User creates a heartbeat (e.g., *Daily backup script*).  
2. System generates a unique ping URL:  
```
POST /api/ping/<key>/
```
3. The external process calls this lightweight endpoint on success.  
4. Missed pings mark the heartbeat as **missed** → alert triggered.  
5. Next valid ping marks it **healthy** again.

---

## 7. Background Jobs (Celery)

| Task | Description |
|------|--------------|
| `check_due_websites` | Periodic check for due websites. |
| `check_due_heartbeats` | Periodic uptime check for missed cron jobs. |
| `check_single_website` | Periodic check for single website. |
| `check_single_heartbeat` | Periodic uptime check for single missed cron job. |
| `process_ping` | Updates Heartbeat records upon receiving a ping. |
| `handle_alert` | Handles retry logic and dispatches email/whatsapp alerts. |
| `cleanup_old_logs` | Periodically removes stale ping logs and check results. |

---

## 8. Monitoring & Logging

- **CloudWatch Logs:** Aggregates logs for `web`, `celery`, and `beat` containers.
- **Prometheus & Grafana:** Other application and system logs.
- **RDS Performance Insights:** Tracks DB metrics and query load.  
- **ALB Target Health Checks:** Verifies ECS container health.  
- **Application Logging:** Structured logs include timestamps, log levels, and component names.  

---

## 9. Future Improvements

- Introduce **SQS** queue between Beat and Workers for resilience.  
- Add **Prometheus + Grafana** dashboards for metrics, already done locally with compose.  
- Implement **autoscaling** based on CPU or queue length.  
- Add **OpenTelemetry / AWS X-Ray** for distributed tracing.  
- Build a **public status dashboard** for uptime transparency.

---
