FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy codebase
COPY . .

# Collect static files (optional, useful if using templates or Django admin)
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Start the server (for development use, switch to gunicorn in production)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
