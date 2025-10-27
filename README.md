# 🩺 Uptime Monitoring Platform

A production-grade uptime and heartbeat monitoring platform built with **Django**.  
Designed to help developers and teams track website uptime, monitor background job health, and receive real-time alerts — even on the free tier.

---

## 🚧 Status

**In Development (WIP)**  
Features are being added and refined continuously. Early demos and beta access coming soon.

---

## 🌐 Vision

The platform aims to be a **DevOps-focused tool** that:

- Monitors websites, APIs, and background job health
- Detects and alerts on downtime or slow responses
- Tracks Celery/cron job heartbeats
- Provides real-time dashboards, latency metrics, and incident timelines
- Offers optional public status pages for each project or monitor
- Can scale to hundreds of users with minimal operational overhead

---

## 🔧 Tech Stack

- **Backend:** Django + Django REST Framework  
- **Worker Queue:** Celery + Redis  
- **Database:** PostgreSQL  
- **Monitoring:** Prometheus + Grafana  
- **Alerts:** Email + Webhooks (Slack, Discord, etc.)  
- **Infrastructure:** Docker + docker-compose, Terraform (for IaC)  
- **CI/CD:** GitHub Actions (build, test, deploy)  
- **Deployment:** AWS EC2, S3, ALB, Route 53, Auto Scaling Groups  
- **Frontend:** React + Tailwind CSS (MVP)

---

## 📦 Core Features


- 👤 **User** – Stores registered users, authentication info, and preferences.
- 🔁 **Website & API Uptime Checks** – monitors HTTP, TCP/port, ping  
- ⏱️ **Latency & Response Tracking** – collects metrics on response times  
- 💓 **Heartbeat Monitoring** – tracks scheduled jobs and background tasks  
- 🚨 **Alert System** – instant notifications via email, Slack, or whatsapp  
- 📊 **User Dashboards** – uptime %, latency trends, incident history  
- 🌐 **Public Status Pages** – optional, branded status pages per project  
- 📄 **Incident Timelines** – root cause and resolution tracking  
- 🔒 **Authentication & Access Control** – secure multi-user monitor management  

---

## 🗃️ System Architecture

**Architecture Overview:**  

![Simplified System Architecture](docs/simplified_architecture.png)
<img src="https://mermaid.live/view#pako:eNqtWN1u68YRfpUFDxIcA7IlkfqjEASgKMlxa-copnMMpC6KFbWSWFNcdbm0rRwdoAV6EaQBkiZB0qYXRS7S3vSiuetVH6Yv0D5CZ3dJihRJHRUoDRjc5Tffzs7MzszqlebSGdH62oLh9RLdDO4CBE8YTdXERcAJCwj_2Z32nz9_9kU6vtN-rpDi-TAkLJSI3_-gBrnPoychg32b0QBQ__r87-kUEnPoJ3QavjNl9Xefv0cw41OCOZp4wSI8SXlIMLsL9nSzbh1B94ff_Psfn4sBsn0azXJLp9iXExuw8B89bzbO5F-92TnJgXMCk2jqe64TTWGzYm9qjOKJmKUJLHqrhuRAl4MipXisy4FQ9btvpKrrNVBh7sHWLymeoQH2ceASFtvg5mbi1MX_EzkxoYyjXqPeahml3O9bN9L2X38mXtE55uQRb0qhxZl0vyPbsf0oBLfowAYjFA_R8zFmCyAt35l4JoyuCF-SSAXBV59mZtSeEordhsyG2ZCjK8KZ54bIcUEPcHrlKucMz3GA1RKfJMMqfqPRUPwvvTDCvvextHcpuYytwkRVXDDvAVbKBIaa2IsMIxsZrQORUeKA5r4DRraOLnEUuHBAN-sDjsiQ6RdByEVUKZ9884OIPEFkRZyCscEkwQKMSKN1JZ14hr_EwYLekmmSAdQEghlkTS6yERobvL5SHq0LO66pF_CDC9jEJ2xzS9k9YfKM_FFoqmaRmpa0A-zeL0DdYJbJF-6SuPe_eCTT0OMkrCEMUjw8OWLBASQZmYx-zCwnJiXxDQ7vwUhLMov85FyuCfPoDHKAXPTAIoV4qpwszlwPHWnob38r1IIRmtCQLxhxPrhUtmbeCoOqQ8zxFIdk54B2y9CVpleRz71T66NyFUc-DrlnY9iGtPf32Rl0TWaeMm5iE0bBBehtJL_vlusYXbPAn9vl3jHK5m2HsAdPxaZI3MmwwOeMlDm--qtM8DCUCoxW2PORJZ1dkJFV4BZzd6lEf5eZkdKXdBHCfq5o4HHKylKOQ1wGZ_kK8stCRiVk1y-SWRRPS67hAEoYmZGAe9gXrD8lm6JKI_ta6fIX8aoEqSvMerECqhKBsdr3l_8Ur7Hjk5Qqfa88bTROZ3iDQC2hAQ3yHq9ywIV1pfb0pXhF19QnQvUJhbLklWgjTsPoibgCGOcmeUDEXCTLmPiiNJpEvo88uasa6AXVLVRmOyml3afcEYGvaxnPnZQYVU-ldZSkuwyDIAU9Ag56LLyQM3y8icDXEfP4RiZIlUL_9L04kskHlTqLtoJK75yLsL4cIOdcKmL5Pn3sxyUczcGP5W2U2pQjxYXu--KNhhIGavlBlNC6qHPIC1Q75RfLPqQQSShSSZ5Q5AtFCIsV5UQeiEXF656wOP3lwmkKKGvZkr5Phd_Xuz5QGGShHJS3qeND3ldn4W9qIErPktL7PM6GWklXySfF_208Wy5xu8Q8hF5Mncwf0zF6_uBhUdsOd5_2hT2Uot_9Gt7r9hBa1jWBqkpyq5x7_L1IFE_1giy3uMcbwqCZoWwFsPRdxfBFMGeQnFnk8ogRhENkQ79eqtlbb8neG43BQWpGtuLo9PTdrewptyJy1JdsSy4BkxfODapDA1YXPVg9AxWBLBDXNIISizjd7nqCzNIXQdLR09UqCuL-Vn1O8ZLogwjKSv0WDhHZivAsw8haU3dIGALJNlugytCj4FcRiYjMIGEJWv3PNhpqEfBDtKoWKwhcQzorKF5AOeATJCsUkEIWOwRTJWyrAvsYYD7Mj5FIwrpoCtHtKHzc6LzBEile2AH8HMy9RWyINAx2RRUKyospBOADnno-JMxSxz2taUhQ2jFuMxcHhc9UPakpcBMUXxm2ojaWwmSIyTK5Te4J2e3nlZhE4RKJnmCbKTcVln0jNrXRAeSesgeQse6HYKnl08L0dtKolG1Wui7-vt3rcw5E_WGRXRKAbsIKQ-p6cSbf1-AM-CArAU9S_MsWrUJlbzVZVNwJFK2bJ0pamD3bVoGKlpUlv2SDMkUKGlibE5eTGZputqoVKDVBHidrfpUdKqH7-6wE5jZaiRL9QQlCtg-x9TO3hDJk3DBkDCfLYqyEqn4ingaR589EuwkBLVS4LiCGZO1TpV5yJT4CoytMWkDVqWH0wVNF5OXEfgMizemViEJmrEbu634EUs_Y7n3CHyEMxO2k5Bi_iPhUXoWhVdmKn30qzm4FLm5l-AZyvrhXzT3f7z8bj02z0ahBtwE3vv4z3dDHxigenj56M77sG-unmkt9yvrP5vN5lkb8tKZoWpbZGOk7mlHb7ll5Gr2SJvezW0zYtQdGa0fYbvcG-vhowtzvNelOO4POIGW0Td3Sj1Yx49mYrm13BvbOcIbZMq3B_06n_z_oMpfrdLNWV--kdON21069_Ea6_D0oZhzZrUbX2plPb_baRysoaoSi0TtWx9zRNBo9s3u82ZKbg-KyBq3uwE65eiO9ZR3tUdHKJ8GrW-1xO-Vpmt3OUD_Eo9W0BfNmWh96dFLTVoRB5wdD7ZVY4U6DDL2CG0EfXmeY3d9pd8FrkFnj4CNKV4kYWHex1Ppz7IcwitYzCNmhh-GmsYNAU0eYDaeZa_1mT5ccWv-V9qT1T5uthnHW0TtNOLTdntkza9oGUK2zTq9rttutbts09Xav-bqmfSyX1c-MVs8wm3q7axpG2zBf_xd-7qEd">


---

## 🗄️ Database Models

**ER Diagram:**  

![ER Diagram](docs/uptime_monitor_model_new.png)

**Components:**

- **Route 53** – DNS and domain management  
- **VPC** – public subnet for ALB, private subnet for EC2 & database  
- **ALB** – distributes traffic across EC2 instances in an Auto Scaling Group  
- **EC2 Instances** – Django backend, containerized via Docker  
- **PostgreSQL** – relational database in private subnet  
- **Redis** – caching and Celery broker  
- **Prometheus + Grafana** – monitoring and dashboards  
- **S3** – logs storage with Glacier lifecycle policies  
- **Terraform** – infrastructure provisioning and management  

---

## 🛠️ Infrastructure & DevOps

- **Terraform Modules:** VPC, ALB, EC2, Security Groups, RDS, Redis, S3, Route 53  
- **Docker & docker-compose:** encapsulated services, simplified local dev environment  
- **Auto Scaling & Load Balancing:** ensures high availability  
- **CI/CD (GitHub Actions):**  
  - Linting, tests, and Docker builds  
  - Automatic deployments to development and production environments  
  - Django migrations run automatically during deploys  
- **Monitoring & Logging:**  
  - Prometheus metrics collection  
  - Grafana dashboards  
  - Log archival to S3/Glacier with lifecycle policies  
- **Security:**  
  - IAM roles for EC2 instances  
  - Least-privilege access to S3 and other AWS services  
  - Encrypted connections and secure environment management  

---

## 🧪 Installation (Local Dev / MVP)

```bash
git clone https://github.com/Dipec001/uptime-monitor.git
cd uptime-monitor
cp .env.example .env
docker-compose up --build
```

### This will spin up Django, PostgreSQL, Redis, Celery, Prometheus, Grafana, and other required services locally.

## 🔍 Data Retention Policy

- Uptimeand heartbeat logs are stored for 90 days by default.
- Minutely logs are aggregated into daily summaries after 24 hours to reduce storage and improve query performance.
- Old logs are cleaned automatically via scheduled tasks.
- S3/Glacier lifecycle policies store logs for long-term retention, minimizing cost.
- Retention periods are configurable via environment variables or Terraform variables.

## Project Structure

```
UPTIME_MONITOR/
├──.github/
    ├── workflows/
       ├── ci-cd.yml
├── monitor/           # Django app
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── tasks.py
│   └── utils.py
├── uptimemonitor/     # Django project
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── docker-compose.yml
├── Dockerfile
├── Makefile
├── terraform/         # Terraform infrastructure code
│   ├── main.tf
│   ├── networking.tf
│   ├── compute.tf
│   ├── database.tf
│   ├── redis.tf
│   ├── s3.tf
│   └── route53.tf
├── prometheus.yml
├── grafana/
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

## 🧠 Future Improvements

- Full React frontend + interactive dashboards
- Enhanced incident reporting and root cause analysis  
- Role-based access controls for teams and projects  

---

## 👨‍💻 Author

**Divine Chukwu**  
• [LinkedIn](https://www.linkedin.com/in/divine-chukwu-63bb04145/) 
• [GitHub](https://github.com/Dipec001)

---

## 🪄 License

MIT License
