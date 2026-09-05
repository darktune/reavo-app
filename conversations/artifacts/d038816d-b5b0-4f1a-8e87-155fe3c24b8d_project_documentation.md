# REAVO Web App - Project Documentation

This document serves as a comprehensive record of the architecture, features, and technical implementations completed for the REAVO Campus Gadget Store web application.

> [!TIP]
> This documentation acts as the master reference for future development, handover, and scaling of the REAVO platform.

## 1. UI & Aesthetic Architecture

We engineered a premium, modern user interface heavily inspired by modern Apple and linear design principles.

- **Design Language:** Implementation of a consistent **Dark Mode / Glassmorphism** aesthetic across all components.
- **Micro-interactions:** Integrated smooth hover states, bouncy animations, and `ScrollReveal` components for premium feel.
- **Dynamic Navbar:** A sticky navigation bar that turns opaque (`var(--bg-void)`) on scroll to prevent text overlap, with custom iOS-style rounded hover cards for navigation links.
- **Brand Identity:** Integration of high-fidelity "REAVO Complete" logos and a precisely scaled, custom black favicon.
- **Mobile Responsiveness:** A comprehensive global mobile viewport sweep ensures adaptive typography (`clamp()`), stackable checkout/product layouts, scrollable category pills, and a full-screen mobile menu overlay for smaller devices.

## 2. Core Frontend Features

The frontend is a fast, responsive Single Page Application built with React and Vite.

### Product & Shop System
- **Product Catalog:** Fetches live data from Supabase.
- **Dynamic Routing:** Implemented `ProductPage.jsx` for detailed product views, specs, and image galleries (stacked vertically on mobile).
- **Shop Filters:** Filter products dynamically by category via interactive pill buttons.

### User & Authentication
- **Global Auth Context:** Mock authentication system managing login states.
- **Profile Dashboard:** Built a comprehensive `/profile` page featuring tabs for:
  - **Recent Orders:** View past purchases and statuses.
  - **My Wishlist:** Dedicated section for saved products.
  - **Account Details & Preferences.**

### Cart & Wishlist Ecosystem
- **Global Context Providers:** Independent `CartContext` and `WishlistContext` managing state via React hooks.
- **Persistent Storage:** Wishlist saves to `localStorage`, ensuring favorites remain after page refreshes.
- **Interactive UI:** Heart icons (`<Heart />`) on product cards and pages instantly toggle wishlist status, highlighted in a custom coral accent color.

## 3. Admin OS V2

The REAVO Admin OS provides a powerful, secure workspace for business operations, equipped with modern UI/UX enhancements.

- **Command Palette:** Spotlight-style global navigation triggered via an OS-agnostic `Ctrl+K` shortcut.
- **Theming:** A global theme toggle (`System`, `Dark`, `Light`) persisting via `localStorage`.
- **Data Views:** Glassmorphic tables and grid layouts with intense status badges for Orders, Products, and Partnerships.
- **Responsive Layout:** The sidebar collapses smoothly into a mobile-friendly overlay drawer, ensuring the dashboard remains usable on any device.

## 4. Financial Infrastructure (KoraPay)

We laid the groundwork for processing live payments using KoraPay.

- **Sandbox Integration:** Integrated the KoraPay React SDK with the provided test public key (`pk_test_...`).
- **Checkout Flow:** Built `CheckoutPage.jsx` (fully responsive mobile stacking) to handle secure payment popups without redirecting the user away from the site.
- **State Management:** Orders calculate totals, shipping, and tax dynamically before triggering the Kora payment module.

## 5. AI Shopping Assistant (Token Caveman Architecture)

We built and deployed a production-grade AI system powered by Gemini 1.5 Flash.

> [!IMPORTANT]
> The AI architecture strictly follows the **Token Caveman** philosophy to minimize API costs and prevent hallucinations.

### Token Caveman MeshLLM & Admin OS

The application integrates dual AI systems connected to the Supabase database:
1. **Customer AI (`/api/chat`):** MeshLLM routing (gemini-flash-lite -> gemini-2.5-flash -> gemini-2.0-flash) for product recommendations. Never queries the full DB; uses deterministically minified `CANDIDATES` injected via the user prompt.
2. **Admin OS Copilot (`/api/admin-chat`):** A protected natural language operations center for staff to run complex inventory and sales analytics. Accessible via a persistent, **fully resizable**, floating widget in the bottom right corner of the Admin OS.

## 6. Development Infrastructure

- **Vite Proxy:** Configured `vite.config.js` to proxy `/api` requests to a local Express server.
- **Local API Server:** Created `server.js` (port 3001) to simulate the Vercel Serverless environment locally, ensuring the `api/chat.js` function runs identical to production.
- **Environment Variables:** Secured the Gemini API key and Supabase keys in a `.env` file, accessible safely via the backend.

---

### Next Steps for Production
1. **Kora Pay Disbursements:** Implement API integrations for automated fund transfers, refunds, or ambassador payouts directly from the Admin OS.
2. **Go Live with Payments:** Swap the KoraPay test keys for live production keys once sandbox testing is thoroughly verified.
3. **GitHub Sync:** Complete the initial Git push to `https://github.com/darktune/reavo-app.git` using valid terminal credentials.
