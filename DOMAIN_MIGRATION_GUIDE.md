# REAVO: Custom Domain Migration & Live Production Guide

> **Target Deployment**: Vercel Global Edge & Cloud Infrastructure  
> **Prepared For**: Transitioning from `https://reavo-app.vercel.app` to a custom domain (e.g., `https://reavo.ng`, `https://reavotech.com`, or `https://reavo.com.ng`)  
> **Status**: Codebase is **100% Prepared & Hardened** for instant custom domain connection.

---

## 1. Architecture Clarification: How Custom Domains Work with Vercel

A common misconception is that buying a domain requires "transferring away" from Vercel. In modern web architecture:

* **Vercel remains your host, CDN, and serverless runtime.**
* You simply point your custom domain (purchased from any registrar like Namecheap, Whogohost, or Cloudflare) to your Vercel project via DNS records.
* **Benefits of keeping Vercel with your custom domain:**
  * **Free Automatic SSL/TLS**: Vercel automatically provisions and auto-renews Let's Encrypt SSL certificates (HTTPS green padlock).
  * **Global Edge Network**: Low latency routing for Nigerian students across mobile networks (MTN, Airtel, Glo, Starlink).
  * **Zero Server Maintenance**: No Linux patching, no Nginx crash recovery, and instant atomic deployments whenever you `git push`.

*(If you ever wish to migrate off Vercel entirely to a self-hosted private VPS like DigitalOcean or AWS, instructions are also provided in Section 6).*

---

## 2. Step 1: Purchasing Your Domain

For a Nigerian student tech brand like REAVO, here are the recommended domain extensions (TLDs) and top registrars:

### Recommended Domain Names
1. **`reavo.ng`** or **`reavo.com.ng`** *(Top Recommendation for Nigeria)*:
   - Signals local trust to Nigerian university students.
   - Ideal registrars: **Whogohost**, **QServers**, **DomainKing**, or **MainOne**.
2. **`reavotech.com`**, **`getreavo.com`**, or **`reavoglobal.com`**:
   - Universal global commercial appeal.
   - Ideal registrars: **Cloudflare Registrar** (at-cost, no markup), **Namecheap**, **Porkbun**, or **GoDaddy**.

---

## 3. Step 2: Connecting Your Domain to Vercel (2-Minute Setup)

Once you have purchased your domain:

1. Log into your [Vercel Project Dashboard](https://vercel.com/darktune/reavo-app).
2. Go to **Settings** -> **Domains**.
3. In the input box, type your domain (e.g. `reavo.ng` or `reavotech.com`) and click **Add**.
4. Vercel will recommend adding both:
   - Root / Apex: `reavo.ng`
   - Subdomain: `www.reavo.ng` (automatically redirects to the root domain).

### DNS Records to Add at Your Domain Registrar
Log into your domain registrar's DNS Management panel (e.g., Whogohost cPanel, Namecheap Advanced DNS, or Cloudflare DNS) and add these two records:

| Record Type | Name / Host | Target / Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A Record** | `@` (or leave blank) | `76.76.21.21` | Automatic / 300 | Routes root domain to Vercel's Anycast IP |
| **CNAME** | `www` | `cname.vercel-dns.com` | Automatic / 300 | Routes www subdomain to Vercel |

*(Alternative: You can also choose to delegate Nameservers directly to Vercel: `ns1.vercel-dns.com` and `ns2.vercel-dns.com`).*

Once added, Vercel will display a green checkmark: **"Valid Configuration"** and issue your SSL certificate in 2 to 10 minutes.

---

## 4. Step 3: Codebase Readiness (Already Completed!)

The REAVO codebase has already been updated to dynamically support your new domain without code changes:

1. **Dynamic SEO Sitemaps & Robots (`server.js`)**:
   - `https://yourdomain.com/robots.txt` and `https://yourdomain.com/sitemap.xml` now automatically resolve from `process.env.VITE_SITE_URL || process.env.SITE_URL` instead of hardcoded Vercel URLs.
2. **Dynamic KoraPay Webhook Notifications (`useKorapay.js`)**:
   - The payment gateway SDK dynamically sends payment notification webhooks to `https://yourdomain.com/api/korapay/webhook`.
3. **Dynamic Staff Onboarding Tokens (`AdminStaff.jsx`)**:
   - Staff invitation links generate dynamically using `window.location.origin`, automatically producing links like `https://yourdomain.com/staff-onboarding?token=...`.

---

## 5. Step 4: External Services Update Checklist (CRITICAL)

After your domain is active on Vercel, complete these 4 quick configuration steps:

### A. Vercel Environment Variables
1. Go to **Vercel Dashboard** -> **reavo-app** -> **Settings** -> **Environment Variables**.
2. Add or update:
   - `VITE_SITE_URL`: `https://yourdomain.com` (e.g. `https://reavo.ng`)
   - `SITE_URL`: `https://yourdomain.com`
3. Click **Save** and trigger a **Redeploy** on Vercel so the frontend picks up the new site URL.

### B. Supabase Cloud Dashboard (Authentication & Redirects)
1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard) -> **Authentication** -> **URL Configuration**.
2. **Site URL**: Update to `https://yourdomain.com`.
3. **Redirect URLs**: Add the following entries to the whitelist:
   - `https://yourdomain.com/**`
   - `https://www.yourdomain.com/**`
   - `http://localhost:5173/**` *(keep this so local development continues to work)*
4. Click **Save**.

### C. KoraPay Merchant Dashboard (Payments & Webhooks)
1. Log into your [KoraPay Dashboard](https://dashboard.korapay.com/) -> **Settings** -> **API & Webhooks**.
2. **Webhook URL**: Update from `https://reavo-app.vercel.app/api/korapay/webhook` to:
   ```
   https://yourdomain.com/api/korapay/webhook
   ```
3. **Callback / Redirect URL**: Update to:
   ```
   https://yourdomain.com/success
   ```
4. **Live Mode Transition**: When ready to accept real student payments, copy your `pk_live_...` and `sk_live_...` keys from KoraPay into your Vercel environment variables (`VITE_KORA_PUBLIC_KEY` and `KORAPAY_SECRET_KEY`).

### D. Branded Email Configuration (Nodemailer SMTP)
To send professional order receipts and dispatch notifications from `orders@yourdomain.com`:
1. Set up email hosting via Google Workspace, Zoho Mail (Free plan up to 5 mailboxes), or your domain registrar.
2. Add the required SPF and DKIM TXT records at your registrar for 100% email deliverability.
3. Update Vercel environment variables:
   - `SMTP_USER`: `orders@yourdomain.com`
   - `SMTP_PASS`: Your email app password
   - `ADMIN_EMAIL`: `admin@yourdomain.com`

---

## 6. Alternative: Migrating to a Self-Hosted Cloud VPS (Non-Vercel)

If you ever wish to host REAVO on your own private cloud server (e.g., Ubuntu VPS on DigitalOcean, Linode, Hetzner, or AWS EC2):

### Architecture on a VPS
* **Reverse Proxy**: Nginx handling SSL termination via Certbot (Let's Encrypt).
* **Process Manager**: PM2 running `node server.js`.
* **Frontend Assets**: Nginx serving the compiled `dist/` directory directly.

### VPS Deployment Commands
```bash
# 1. On your VPS (Ubuntu 22.04 / 24.04 LTS)
sudo apt update && sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx
sudo npm install -g pm2

# 2. Clone REAVO repository
git clone https://github.com/darktune/reavo-app.git /var/www/reavo
cd /var/www/reavo
npm install
npm run build

# 3. Start Backend Server with PM2
pm2 start server.js --name "reavo-api"
pm2 startup && pm2 save

# 4. Configure Nginx (/etc/nginx/sites-available/reavo)
# Proxy /api to http://localhost:3001 and serve static files from /var/www/reavo/dist

# 5. Issue Free SSL Certificate with Certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 7. Pre-Launch Verification Checklist

| Item | Action Required | Status |
| :--- | :--- | :--- |
| **Domain Purchase** | Buy `.ng` or `.com` from registrar | Pending User Purchase |
| **DNS Setup** | Add A record (`76.76.21.21`) & CNAME (`cname.vercel-dns.com`) | Pending Domain Purchase |
| **Codebase Readiness** | Dynamic SEO sitemaps, KoraPay webhook URL, origin links | **Ready & Built (Code 0)** |
| **Vercel Env Vars** | Set `VITE_SITE_URL` and `SITE_URL` to new domain | Step 4A |
| **Supabase Whitelist** | Add `https://yourdomain.com/**` to Auth Redirect URLs | Step 4B |
| **KoraPay Webhook** | Point webhook to `https://yourdomain.com/api/korapay/webhook` | Step 4C |
| **E2E Playwright Run** | Verify checkout and login on live domain | Final Gate |

*Once you purchase your domain name, share it here and we will immediately walk through the 2-minute DNS and external connection sequence.*
