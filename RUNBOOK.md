# Uptime Monitor Runbook

## 1. Overview
The Uptime Monitor is a Django-based system for monitoring websites and heartbeat services.  

It supports:  
- Periodic website checks (status, response time)  
- Heartbeat monitoring for cronjobs or services  
- Alerts and notification preferences (email, Slack, webhook)  
- Scalable background tasks via Celery  

This document explains how to **set up, run, and test** the system locally or using Docker.

---

## 2. Prerequisites
- Python 3.12+
- pip
- virtualenv
- PostgreSQL (or via Docker)
- Docker & Docker Compose (optional, recommended)
- Redis (for Celery, optional via Docker)

---

## 3. Local Development Setup

### ### Step 1: Activate virtual environment

```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### Step 2: Install dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Apply database migrations

```bash
python manage.py migrate
```
### Step 4: Create superuser

```bash
python manage.py createsuperuser
```
### Step 5: Run development server

```bash
python manage.py runserver
```
- API available at http://127.0.0.1:8000/

- Admin available at http://127.0.0.1:8000/admin/

## 4. Celery Setup (Background Tasks)

### Step 1: Start Celery worker

```bash
celery -A uptimemonitor worker -l info
```
or if you're on windows 👇

```bash
celery -A uptimemonitor worker -l info --pool=solo
```

### Step 2: Start Celery beat (scheduler)

```bash
celery -A uptimemonitor beat -l info
```

Workers handle tasks such as website checks, heartbeats, and sending notifications.

## 5. Docker Setup (Optional)
### Step 1: Build and start containers

```bash
docker-compose up --build
```
**Or you can use the different make commands in the Makefile to get docker environment setup**

### Step 2: Service overview

- db → PostgreSQL
- web → Django app
- celery → Celery worker for tasks
- celery-beat → Periodic scheduler

### Step 3: Access

API: http://localhost:8000/

Admin: http://localhost:8000/admin/

## 6. Running Tests
### Step 1: Run all tests

```bash
pytest -v
```
### Step 2: Run a single test file

```bash
pytest monitor/tests/test_models.py
```
### Step 3: Run a single test function

```bash
pytest monitor/tests/test_views.py::test_register_view_success
```

## 7. Notes & Warnings

- Always activate virtualenv when running Django commands locally.
- Celery workers and beat must run separately unless using Docker.
- For production, ensure Redis is configured for Celery.
- If using pagination in APIs, always order querysets to avoid warnings.
- Keep logs visible for debugging background tasks and alerts.

## 8. Environment Variables

- Fill in the variables in the env.example with your variables.

## 9. Recommended Workflow

- Start database (locally or via Docker).
- Run Django migrations.
- Run development server.
- Start Celery worker & beat.
- Open admin to manage users, websites, and notifications.
- Run tests regularly to catch regressions.