# LunaINF.com

Public website for **LUNA — Longitudinal Unified Narrative Architecture**.

## Public posture

Open research. Protected implementation.

This repository is intentionally separate from the private LUNA implementation repository. Do not place private source code, prompts, schemas, internal architecture parameters, credentials, raw logs, or proprietary simulator details here.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The site is configured for `https://lunainf.com` and deploys to GitHub Pages using `.github/workflows/deploy.yml`.

## Before first public launch

- Confirm the public contact email in `src/pages/about.astro`.
- Enable GitHub Pages with **GitHub Actions** as the deployment source.
- Configure the `lunainf.com` DNS records for GitHub Pages.
- Keep Google Workspace MX/TXT records unchanged.
- Verify the custom domain in GitHub Pages and enable HTTPS.
