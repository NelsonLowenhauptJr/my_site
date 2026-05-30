# Nelson Lowenhaupt Junior — Personal Site

A static personal website about technology, DevOps, infrastructure, cloud, automation, IoT, Linux, and more. The site is served with **nginx** inside **Docker** and published under the `/jr/` path.

**Live site:** [https://nelson.lowenhau.pt/jr/](https://nelson.lowenhau.pt/jr/)

## Features

- Clean, dark-themed responsive layout
- Separated HTML, CSS, and JavaScript
- Terminal-inspired hero and stack sections
- Contact links with email, LinkedIn, and GitHub icons
- Dockerized nginx with security headers and gzip
- Automated deployment via GitHub Actions

## Tech stack

- HTML5, CSS3, vanilla JavaScript
- [Inter](https://fonts.google.com/specimen/Inter) and [JetBrains Mono](https://www.jetbrains.com/lp/mono/) fonts
- nginx 1.27 (Alpine)
- Docker & Docker Compose

## Project structure

```text
.
├── src/
│   ├── index.html          # Main page
│   ├── css/styles.css      # Styles
│   ├── js/main.js          # Footer year script
│   ├── favicon.svg
│   └── assets/             # Images (e.g. profile photo)
├── docker/
│   └── nginx.conf          # nginx configuration
├── scripts/
│   └── deploy.sh           # Server-side deploy script (git pull + rebuild)
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions workflow
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/) plugin

## Run locally

1. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

2. Start the container:

   ```bash
   docker compose up -d --build
   ```

3. Open in your browser:

   ```text
   http://localhost:8091/jr/
   ```

   The port is controlled by `APP_PORT` in `.env` (default: `8091`).

### Useful commands

```bash
# View logs
docker compose logs -f

# Stop the site
docker compose down

# Rebuild after changes
docker compose up -d --build
```

## Configuration

| Variable   | Default | Description              |
|------------|---------|--------------------------|
| `APP_PORT` | `8091`  | Host port mapped to nginx |

The `.env` file is git-ignored. Each environment (local machine, server) keeps its own copy.

## Automated deployment

Every push to `main`, `master`, or `dev` triggers a GitHub Actions workflow that deploys the latest version to the server.

### Flow

```text
git push  →  GitHub Actions (self-hosted runner)  →  rsync to /opt/site-pessoal  →  docker compose up -d --build
```

The workflow:

1. Validates required project files
2. Syncs the repository to `/opt/site-pessoal/` via `rsync`
3. Rebuilds and restarts containers with Docker Compose
4. Verifies the deployment with a health check on `http://127.0.0.1:8091/jr/`

You can also trigger a deploy manually from the **Actions** tab using **workflow_dispatch**.

### Server setup (one-time)

On the server:

```bash
sudo mkdir -p /opt/site-pessoal
sudo chown "$USER":"$USER" /opt/site-pessoal
cp .env.example /opt/site-pessoal/.env
```

Install and register a [GitHub self-hosted runner](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners) with these labels:

- `self-hosted`
- `site-pessoal`

Then push to the repository — the workflow handles the rest.

### Alternative: SSH-based deploy

If you prefer a cloud-hosted runner that connects to your server over SSH (instead of a self-hosted runner), see [docs/DEPLOY.md](docs/DEPLOY.md) for setup with `scripts/deploy.sh` and GitHub repository secrets.

## Development workflow

```bash
# Edit files in src/
git add .
git commit -m "Update contact section"
git push
```

After the workflow completes, the server runs the latest version automatically.

## Troubleshooting

**Site did not update in the browser**

- Hard-refresh the page (Ctrl+F5 / Cmd+Shift+R).
- Static assets (CSS/JS) are cached for 30 days by nginx; HTML changes appear immediately.

**Deploy failed**

- Check the **Actions** tab in GitHub for logs.
- On the server, run `docker compose ps` inside `/opt/site-pessoal`.
- Confirm the self-hosted runner is online and has the correct labels.

**Port already in use**

- Change `APP_PORT` in `.env` and restart: `docker compose up -d --build`.

## Author

**Nelson Lowenhaupt Junior**

- Email: [nelson@lowenhau.pt](mailto:nelson@lowenhau.pt)
- LinkedIn: [linkedin.com/in/nelsonlowenhauptjr](https://www.linkedin.com/in/nelsonlowenhauptjr)
- GitHub: [github.com/NelsonLowenhauptJr](https://github.com/NelsonLowenhauptJr)

## License

This project is for personal use. All rights reserved unless otherwise noted.
