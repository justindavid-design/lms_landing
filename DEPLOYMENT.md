Deployment — Vercel (GitHub) — Full steps
=========================================

This guide shows how to deploy `lms-landing` to Vercel from GitHub, configure DNS for a custom domain, and verify the site. It also explains the GitHub Actions workflow added to this repo.

Prerequisites
-------------
- A GitHub repository containing this project and the `main` (or `master`) branch.
- A Vercel account (https://vercel.com) and permissions to create projects.
- Access to your DNS provider to update records for your domain.

Quick (recommended) — Import the repo on Vercel
------------------------------------------------
1. Push your code to GitHub (if not already):

```bash
cd lms-landing
git init  # if needed
git add .
git commit -m "Initial"
git remote add origin <your-git-remote>
git push -u origin main
```

2. In Vercel:
 - Click "New Project" → Import Git Repository → pick your GitHub repo.
 - Set the Root Directory to the repository root (default).
 - Build Command: `npm run build`
 - Output Directory: `dist`
 - Environment Variables: add any needed (none required for this static app).
 - Import and deploy.

Vercel will build and provide a deployment URL (e.g. `https://project-name.vercel.app`).

Using the GitHub Actions workflow (already added)
-----------------------------------------------
This repo includes `.github/workflows/vercel-deploy.yml`. It:
- Checks out the repo
- Installs dependencies with `npm ci`
- Runs `npm run build`
- Uses a Vercel action to deploy

Before the workflow can deploy, set the following GitHub repo secrets:
- `VERCEL_TOKEN` — your personal Vercel token (Account Settings → Tokens → Create Token)
- `VERCEL_ORG_ID` — found in Vercel dashboard under Account → Teams/Organizations or in URL when viewing your org
- `VERCEL_PROJECT_ID` — found in Project Settings → General (or from the project URL)

After adding secrets, push to `main` and GitHub Actions will run and deploy automatically.

Manual CI: Build & preview locally
---------------------------------
Build and test locally before pushing:

```bash
cd lms-landing
npm install
npm run build
npm run preview -- --port 5173
```
Open `http://localhost:5173` to preview the production build.

DNS / Custom Domain
--------------------
To use your own domain (example.com):

1. In Vercel, open the Project → Settings → Domains → Add.
2. Enter the domain (e.g. `www.example.com` or `example.com`). Vercel will show required DNS records.
3. Common DNS options:
 - For `www.example.com` (subdomain): add a CNAME record pointing to `cname.vercel-dns.com` (value given by Vercel).
 - For apex domain `example.com`: use ALIAS/ANAME if supported by your DNS provider, or add the A records Vercel suggests. Alternatively, change your nameservers to Vercel's nameservers (Vercel will display them).
4. Wait for DNS propagation (minutes to hours). Vercel will provision an SSL certificate automatically.

Obtaining required Vercel IDs
-----------------------------
- `VERCEL_TOKEN`: Vercel → Account Settings → Tokens → Create Token → copy value.
- `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`: open Vercel project in the dashboard; the URL contains IDs, or inspect Project Settings → General for the Project ID and the Organization selector for the Org ID.

Notes & Troubleshooting
-----------------------
- The included GitHub Actions workflow uses repository secrets. Don't commit tokens.
- If the site returns a blank page after deploy, open the browser console on the deployed URL and share errors.
- If you prefer automatic deploys from Vercel (simpler), you can skip the GitHub Actions workflow; Vercel can be connected directly to GitHub and will deploy on each push.

Next steps I can take for you
----------------------------
- (A) Create the GitHub repository from this local project and push it for you (requires authentication).
- (B) Walk you through adding the three Vercel secrets and connecting the repo to Vercel step-by-step.
- (C) Configure DNS records if you share which DNS provider you use and the domain.
