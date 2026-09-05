# REAVO App & Admin OS

REAVO is a premium e-commerce platform and a specialized Corporate Admin Operating System powered by AI.

## Features

*   **Customer Storefront:** Product discovery, shopping cart, and secure checkout using KoraPay Collections.
*   **Corporate Admin OS:** A powerful internal dashboard for managing products, orders, customers, and partnerships.
*   **AI Operations Copilot:** An autonomous AI assistant that helps the admin manage inventory, detect anomalies, and execute business operations.
*   **Automated Background Jobs (Cron):** A Vercel-hosted daily morning briefing and an hourly low-stock check invoked by GitHub Actions.
*   **Automated Disbursements:** Secure payout integration with KoraPay to disburse funds to ambassadors and partners.

## Environment Variables

Create a `.env.local` or `.env` file at the root of the project with the following required variables:

```env
# Supabase
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# KoraPay Integration
KORAPAY_SECRET_KEY="sk_test_..."

# Email / SMTP Settings
# If not provided, the system falls back to Ethereal (fake SMTP) for testing.
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"

# AI Automations
ADMIN_EMAIL="admin@reavoglobal.com"
CRON_SECRET="your-secure-cron-secret"
```

## Setup & Deployment

1.  **Install dependencies:** `npm install`
2.  **Run locally:** `npm run dev`
3.  **Deploy:** This project is configured for Vercel. Push to your main branch to deploy. The daily Vercel cron is configured in `vercel.json`.
4.  **Configure hourly stock checks:** In the GitHub repository, add `REAVO_APP_URL` (the deployed Vercel URL) and `CRON_SECRET` under **Settings → Secrets and variables → Actions**. The `Hourly stock check` workflow then invokes `/api/cron/hourly-stock` once per hour. GitHub Actions schedules are best-effort and may be delayed.

## Database Schema

The complete database schema, including Row-Level Security (RLS) policies and triggers, is located in `supabase_admin_os_schema.sql`. Run this file in your Supabase SQL Editor to initialize the database.
