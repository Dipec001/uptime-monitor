# Contributing to Uptime Monitor

First off, thank you for considering contributing! Your efforts help improve the reliability and features of this uptime monitoring platform.

## How to Contribute

### 1. Fork the Repository
- Click the **Fork** button at the top-right of the repo.
- Clone your forked repository locally:

```bash
git clone https://github.com/dipec001/uptime-monitor.git
cd uptime-monitor
```

### 2. Create a Feature Branch

We use dev as the main development branch. Create a branch for your feature or bugfix:

```bash
git checkout -b feature/my-feature
```
### 3. Make Changes

- Follow the existing code style and structure.
- Add unit tests where applicable.
- Update documentation if you add new features.

### 4. Run Tests

- Ensure all tests pass before pushing:
```bash
docker-compose exec web pytest
```
      
### 5. Commit & Push

```bash
git add .
git commit -m "Add: my new feature"
git push origin feature/my-feature
```

### 6. Open a Pull Request

- Navigate to the repo on GitHub.
- Open a PR from your branch into dev.
- Provide a clear description and link any relevant issues.

## Code Style & Guidelines

- Python: PEP8

## Django best practices

- Docker and containerized service conventions
- Follow DRY principles

## Reporting Issues

- Use the GitHub Issues tab.
- Provide steps to reproduce, expected behavior, and screenshots/logs if possible.