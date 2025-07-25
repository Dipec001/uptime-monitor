FROM prom/alertmanager

RUN apk add --no-cache gettext

COPY alertmanager.yml.template /etc/alertmanager/alertmanager.yml.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
