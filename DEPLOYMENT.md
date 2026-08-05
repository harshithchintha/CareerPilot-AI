# Deployment Guide: Vercel & Render

This codebase is configured out-of-the-box for production deployment on **Vercel** and **Render**.

---

## Option 1: Deploy Frontend on Vercel + Backend on Render (Recommended Best Practice)

### Step 1: Deploy Backend API on Render
1. Push your repository to GitHub / GitLab.
2. Log into [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Blueprint**.
3. Connect your repository. Render will automatically detect `render.yaml` and configure the web service `career-copilot-api`.
4. In Render Environment Settings, set your secret keys:
   - `SUPABASE_URL`: `https://vdubgwfkbxxpsaybmnhw.supabase.co`
   - `SUPABASE_ANON_KEY`: `sb_publishable_ppIs-B6S5ZcpKiDUGbJzqQ_ZSonT6hW`
   - `SUPABASE_SERVICE_ROLE_KEY`: `<YOUR_SUPABASE_SERVICE_ROLE_KEY>`
   - `GEMINI_API_KEY`: `<YOUR_GEMINI_API_KEY>`
   - `GEMINI_MODEL`: `gemini-2.5-flash`
5. Note down your backend URL (e.g. `https://career-copilot-api.onrender.com`).

### Step 2: Deploy Frontend on Vercel
1. Log into [Vercel Dashboard](https://vercel.com/) and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. Vercel will automatically read `vercel.json`:
   - Framework: **Vite**
   - Build Command: `pnpm --filter @workspace/career-copilot run build`
   - Output Directory: `artifacts/career-copilot/dist/public`
4. Set Environment Variables on Vercel:
   - `VITE_SUPABASE_URL`: `https://vdubgwfkbxxpsaybmnhw.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_ppIs-B6S5ZcpKiDUGbJzqQ_ZSonT6hW`
5. If proxying API calls to Render, update `vercel.json` rewrite target to `https://career-copilot-api.onrender.com/api/:path*`.
6. Click **Deploy**!

---

## Option 2: Full-Stack Vercel Deployment (Vercel Serverless)

1. Import your repository into Vercel.
2. Vercel automatically deploys:
   - Frontend static SPA from `artifacts/career-copilot/dist/public`.
   - Backend API from `api/index.ts` (Express Serverless Function).
3. Set all environment variables on Vercel dashboard:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`.

---

## Option 3: Full-Stack Render Deployment (Single Web Service)

1. Create a **New Web Service** on Render.
2. Set Build Command:
   ```bash
   pnpm install --frozen-lockfile && pnpm --filter @workspace/career-copilot run build && pnpm --filter @workspace/api-server run build
   ```
3. Set Start Command:
   ```bash
   pnpm --filter @workspace/api-server run start
   ```
4. Set `PORT=5000` (or leave default). Express will automatically serve both the API endpoints (`/api/*`) and the built React SPA (`/*`).
