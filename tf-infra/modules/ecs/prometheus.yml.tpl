global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: '${environment}'
    region: '${region}'

scrape_configs:
  - job_name: 'django-uptime-monitor'
    scrape_interval: 15s
    dns_sd_configs:
      - names:
          - 'django.${environment}.local'
        type: 'A'
        port: 8000
    
    metrics_path: '/metrics'
    
    relabel_configs:
      - source_labels: [__meta_dns_name]
        target_label: instance
      - source_labels: [__address__]
        target_label: __address__
        regex: '([^:]+)(?::\d+)?'
        replacement: '$${1}:8000'