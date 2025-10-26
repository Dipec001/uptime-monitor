# ============================
# Build AWS CLI layer
# ============================
FROM alpine:3.19 AS awscli-builder

RUN apk add --no-cache unzip curl \
    && mkdir -p /tmp/awscli \
    && cd /tmp/awscli \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install --bin-dir /aws-cli-bin \
    && rm -rf /tmp/awscli


# ============================
# Prometheus Runtime
# ============================
FROM alpine:3.19

# Install only runtime essentials
RUN apk add --no-cache \
    ca-certificates \
    bash \
    wget \
    tar

# Install Prometheus
RUN wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz && \
    tar xvfz prometheus-2.45.0.linux-amd64.tar.gz && \
    cd prometheus-2.45.0.linux-amd64 && \
    mv prometheus promtool /bin/ && \
    mkdir -p /usr/share/prometheus && \
    mv console_libraries consoles /usr/share/prometheus/ && \
    cd / && \
    rm -rf /prometheus-* && \
    mkdir -p /prometheus /etc/prometheus && \
    chown -R nobody:nobody /prometheus /etc/prometheus && \
    apk del wget tar


# Copy AWS CLI from builder stage
COPY --from=awscli-builder /aws-cli-bin/aws /usr/local/bin/aws
COPY --from=awscli-builder /aws-cli-bin/aws_completer /usr/local/bin/aws_completer

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nobody

ENTRYPOINT ["/entrypoint.sh"]
