FROM alpine:3.19

RUN apk add --no-cache \
    aws-cli \
    bash \
    ca-certificates && \
    # Install wget and tar temporarily
    apk add --no-cache --virtual .build-deps wget tar && \
    # Download and install Prometheus
    wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz && \
    tar xvfz prometheus-2.45.0.linux-amd64.tar.gz && \
    cd prometheus-2.45.0.linux-amd64 && \
    mv prometheus promtool /bin/ && \
    mkdir -p /usr/share/prometheus && \
    mv console_libraries consoles /usr/share/prometheus/ && \
    cd / && \
    rm -rf prometheus-* && \
    # Remove build dependencies
    apk del .build-deps && \
    # Create directories
    mkdir -p /prometheus /etc/prometheus && \
    chown -R nobody:nobody /prometheus /etc/prometheus

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nobody

ENTRYPOINT ["/entrypoint.sh"]