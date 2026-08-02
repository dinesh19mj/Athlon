# Athlon Marketing Site

This is the public marketing landing page for the Athlon tournament management platform. It is built as a single-page Next.js application using Server-Side Generation (SSG) for high SEO performance.

## Section Structure

The landing page is broken down into several modular sections located in `src/components/marketing/`:

1. **NavBar** (`NavBar.tsx`): The sticky navigation bar that transitions from transparent to solid on scroll. Includes a mobile hamburger menu.
2. **Hero** (`Hero.tsx`): The dark, high-impact intro section with primary CTAs and a mock live scoreboard widget.
3. **Sections** (`Sections.tsx`):
   - **StatsBand**: Quick numerical statistics to build trust.
   - **Features**: A grid displaying how Athlon works for Organizers, Players, Umpires, and Spectators.
   - **HowItWorks**: A horizontal (desktop) / vertical (mobile) timeline of the tournament lifecycle.
4. **PricingFooter** (`PricingFooter.tsx`):
   - **Pricing**: Three-tier pricing table (Free, Club, Association).
   - **Testimonials**: Quote cards from organizers.
   - **CTAAndFooter**: The dark-themed closing call-to-action band and standard footer links.

## Customizing Content

The content in this marketing site is currently mocked. To swap in real data:

### Updating Pricing
Open `src/components/marketing/PricingFooter.tsx` and locate the `tiers` array inside the `Pricing` component. You can modify the `name`, `price`, `period`, `desc`, and `features` of each tier. The `highlighted` boolean property determines which tier is visually emphasized as the "Most Popular" option.

### Updating Testimonials
Open `src/components/marketing/PricingFooter.tsx` and locate the `Testimonials` component. Simply replace the hardcoded strings inside the quote cards with dynamic data or updated static copy.

### Updating Features & Stats
Open `src/components/marketing/Sections.tsx` to modify the `stats` array in `StatsBand` or the `features` array in the `Features` component.

## Performance and SEO
This page utilizes `next/font` for optimized loading of the Inter font, and Framer Motion for scroll-reveal animations. All animations use `whileInView` and `viewport={{ once: true }}` to trigger only when the user scrolls to them without causing layout shift. Global SEO tags and Open Graph metadata are configured in `src/app/page.tsx` and `src/app/layout.tsx`.
