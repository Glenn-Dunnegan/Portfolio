# Portfolio

Personal portfolio starter built with React, TypeScript, Sass, and Vite.

## Quick Start (Contact Form)

1. Copy env template:

```powershell
Copy-Item .env.example .env
```

2. Put your deployed worker URL and Turnstile site key into `.env`.
3. Copy worker local secret template:

```powershell
Copy-Item worker/.dev.vars.example worker/.dev.vars
```

4. Fill `worker/.dev.vars` with your Formspree ID and Turnstile secret.
5. Run the app:

```bash
npm install
npm run dev
```

6. In another terminal, run the worker locally from `worker`:

```bash
wrangler dev
```

## Features

- React + TypeScript setup
- Sass styling with a modern responsive layout
- Ready for free GitHub Pages deployment
- GitHub Actions workflow included

## Local development

```bash
npm install
npm run dev
```

## Contact Form With Anti-Spam

This project submits contact requests through a Cloudflare Worker proxy.
The worker validates Cloudflare Turnstile first, then forwards valid requests to Formspree.

### 1) Create service keys

1. In Formspree, create a new form and copy the form ID (example: `xqabczde`).
2. In Cloudflare Turnstile, create a widget for your local/dev and GitHub Pages domains.
3. Keep these values:
- Turnstile site key (public)
- Turnstile secret key (private)
- Formspree form ID (private once moved behind worker)

### 2) Configure frontend env vars

Copy and edit the template in project root:

```bash
cp .env.example .env
```

If you are using PowerShell on Windows:

```powershell
Copy-Item .env.example .env
```

Restart the dev server after changing env vars.

### 3) Deploy the worker

Worker source is in `worker/index.js`.
Wrangler config is in `worker/wrangler.toml`.

For local worker testing, copy `worker/.dev.vars.example` to `worker/.dev.vars` and set real values.

From the `worker` folder:

```bash
npm install -g wrangler
wrangler login
wrangler dev
wrangler secret put FORMSPREE_ID
wrangler secret put TURNSTILE_SECRET
wrangler deploy
```

Set `ALLOWED_ORIGIN` in `worker/wrangler.toml` to your exact site origin.

### 4) GitHub Actions secrets (production)

Set these repository secrets:

- `VITE_CONTACT_API_URL`
- `VITE_TURNSTILE_SITE_KEY`

They are consumed by `.github/workflows/deploy.yml` during build.

## Production build

```bash
npm run build
```

## GitHub Pages deployment

This project is configured for a GitHub repository named `Portfolio`.

1. Create a GitHub repository named `Portfolio`.
2. Push this project to the `main` branch.
3. In GitHub, open **Settings → Pages**.
4. Set **Build and deployment** to **GitHub Actions**.
5. The included workflow in `.github/workflows/deploy.yml` will publish the site.

If you use a different repository name, update the `base` value in `vite.config.ts`.

## Security notes

- Never commit `.env` or `worker/.dev.vars` (already ignored in `.gitignore`).
- Keep `FORMSPREE_ID` and `TURNSTILE_SECRET` only in Worker secrets.
- Keep only public values in Vite env vars (`VITE_...`).

## Worker health check

Use this endpoint to verify worker availability:

- `GET /health`

Example:

```bash
curl https://your-worker-subdomain.workers.dev/health
```

Expected response:

```json
{
	"ok": true,
	"service": "portfolio-contact-proxy",
	"timestamp": "2026-03-13T00:00:00.000Z"
}
```
