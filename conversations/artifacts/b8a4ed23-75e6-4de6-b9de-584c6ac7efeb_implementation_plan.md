# Oriental Times Rebuild

A premium Nigerian digital newsroom that feels like a modern editorial publication, not a generic WordPress news blog.

## User Review Required
> [!IMPORTANT]
> The tech stack proposed is **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase** for backend/database (PostgreSQL) and Auth. This offers the best combination of SEO capabilities, speed, and real-time CMS potential. Does this architecture sound good to you?
> 
> Also, since we are working with your design partner, we will initialize a local git repository. I have prepared the GitHub CLI commands you can run to create the repo and invite them.

## Proposed Changes

### Tech Stack & Architecture
- **Framework**: Next.js 14+ (App Router) for Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR).
- **Styling**: Tailwind CSS for rapid UI development and ensuring optimal performance (utility classes).
- **Database & Backend**: Supabase (PostgreSQL) for a scalable database, user authentication (RBAC for Admin/Editors), and Storage (Media Library).
- **Animation/Motion**: Framer Motion for premium, minimal editorial transitions (dots, lines, smooth scrolling).
- **Icons**: Lucide React for clean, minimalist iconography.

### Phase 1: Project Setup & Repository
1. Initialize the Next.js app in a new `oriental-times` directory.
2. Initialize the Git repository.
3. Provide instructions/commands to create the remote repo on GitHub and add `bloxnfts19-hash` as a collaborator.

### Phase 2: Database Schema & CMS Architecture (Supabase)
We will design tables for:
- `users` (id, role: super_admin, editor, reporter, etc.)
- `categories` (id, name, slug, color, order)
- `articles` (id, title, slug, excerpt, content, status, published_at, category_id, author_id, featured_image, etc.)
- `media` (for custom metadata on uploaded images)
- `breaking_news` (active ticker content)

### Phase 3: Frontend Architecture
- **Design System**: Establish typography (Sans/Serif pairings) and color tokens (white, near-black, subtle grays, brand accents).
- **Components**: Build reusable components like `StoryCard`, `BreakingTicker`, `HeroGrid`, `Navigation`.
- **Pages**:
  - `/(public)/page.tsx` (Dynamic Homepage assembled from CMS)
  - `/(public)/[category]/page.tsx` (Category landing)
  - `/(public)/[year]/[month]/[day]/[slug]/page.tsx` (Preserving SEO URLs)
  - `/admin/...` (Protected CMS routes)

### Phase 4: CMS Development
- A clean, bespoke dashboard to create/edit articles with a rich text editor.
- **Rich Text Editor**: Integrating **Tiptap** for highly customizable editorial experiences.
- Media management and homepage curating.

## Verification Plan
### Hosting & Deployment
- Temporary hosting and testing on **Vercel** to leverage Next.js caching and edge features, before purchasing the official domain from the internet registry.

### Automated Tests
- Playwright for E2E testing of the CMS login and publishing workflows.
- Lighthouse CI for performance budget (targeting <1s LCP, 90+ Score).

### Manual Verification
- Testing the CMS creation flow.
- Verifying the SEO preserving structure for `/[year]/[month]/[day]/[slug]`.
