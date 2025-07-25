up:
	docker-compose up --build

down:
	docker-compose down

restart:
	docker-compose down && docker-compose up --build

logs:
	docker-compose logs -f

ps:
	docker-compose ps

shell:
	docker-compose exec web sh

migrate:
	docker-compose exec web python manage.py migrate

createsuperuser:
	docker-compose exec web python manage.py createsuperuser

celery-worker:
	docker-compose exec web celery -A uptime_monitor worker -l info --pool=solo

celery-beat:
	docker-compose exec web celery -A uptime_monitor beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler

generate-alertmanager-config:
	envsubst < alertmanager/alertmanager.yml.template > alertmanager/alertmanager.yml
