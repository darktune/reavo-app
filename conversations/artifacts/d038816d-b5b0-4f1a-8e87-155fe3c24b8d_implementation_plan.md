# Phase 2: SEO Semantic Structure & Accessibility

Now that the core technical SEO (Metadata, Sitemaps, Schema) and Mobile Viewports are fully implemented, it's time to tackle the **P2 (Medium Priority) items** from our original SEO Dominance checklist. 

## Proposed Changes

### 1. Semantic HTML Refactor
Search engines use HTML tags to understand the structure and importance of your content. Right now, REAVO relies heavily on generic `<div>` tags. We will upgrade these to semantic HTML5 tags:
- **`LandingPage.jsx`**: Change the main wrapper to `<main>`. Ensure the hero section is wrapped in `<header>` or `<section>`, and verify the primary `<h1>` contains high-value keywords (e.g., "Premium Campus Gadgets").
- **`ShopPage.jsx`**: Wrap the main grid in `<main>` and the filter bar in `<nav aria-label="Product Filters">`. Ensure the page has a strong `<h1>` (e.g., "Shop Campus Gadgets").
- **`ProductPage.jsx`**: Ensure the entire product details area is wrapped in an `<article>` tag.
- **`Footer.jsx`**: Ensure it uses the semantic `<footer>` tag rather than a `<div>`.

### 2. Alt Text Audit & Enhancement
Google Image Search is a massive driver of traffic for e-commerce sites. We will audit all image tags:
- Ensure the `ImageGallery` component in `LandingPage.jsx` uses descriptive alt text (e.g., "REAVO Ambassador at Campus Event") instead of the current generic "Gallery item".
- Ensure `ProductCard.jsx` and `ProductPage.jsx` include the product name *and* category in the alt text (e.g., "Reavo X1 Pro Laptop").

## User Review Required
> [!NOTE]
> Please review the plan above. If everything looks good, click **Proceed** and I will implement these final structural optimizations!
