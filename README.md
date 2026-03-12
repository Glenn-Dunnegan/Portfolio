# Portfolio

Personal portfolio starter built with React, TypeScript, Sass, and Vite.

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

## Connect Formspree

1. In Formspree, create a new form and copy your form ID (example: `xqabczde`).
2. In the project root, create a `.env` file.
3. Add your key:

```bash
VITE_FORMSPREE_ID=your_formspree_form_id
```

4. Restart the dev server if it is already running.
5. Submit the contact form once and confirm/verify the destination email in Formspree.

For production (GitHub Pages), set a repository secret named `VITE_FORMSPREE_ID`.
This project already maps that secret into the build step in `.github/workflows/deploy.yml`.

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
