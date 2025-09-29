from prometheus_client import Counter, pushadd_to_gateway, CollectorRegistry

registry = CollectorRegistry()

website_success_total = Counter(
    "website_success_total",
    "Website check result (success)",
    ["website"],
    registry=registry,
)

website_failed_total = Counter(
    "website_failed_total",
    "Website check result (failed)",
    ["website"],
    registry=registry,
)


def push_website_metric(website_name: str, success: bool):
    if success:
        website_success_total.labels(website=website_name).inc()
    else:
        website_failed_total.labels(website=website_name).inc()

    pushadd_to_gateway("http://localhost:9091", job="website_check", registry=registry)


# website_status = Gauge(
#     "website_status",
#     "Current status of website (1=up, 0=down)",
#     ["website"]
# )
