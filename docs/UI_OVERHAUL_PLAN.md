# UI/UX Pro Max Overhaul Plan: Silicon Trading / Bentahan ng Sirang Silpon

## 1. Design System & Tokens
- **Font Stack**: Inter + Plus Jakarta Sans + JetBrains Mono (for IC codes)
- **Palette**:
  - Ink: `#0c1514` (Deep obsidian slate)
  - Surface: `#ffffff`
  - Canvas: `#f7f9f7` (Fresh airy off-white)
  - Subtle Surface: `#eff4f0`
  - Emerald Primary: `#059669` (Rich, confident emerald)
  - Emerald Accent: `#10b981`
  - Amber / Warning: `#d97706`
  - Blue / Repair: `#2563eb`
  - Border: `#e1e8e2`
  - Focus Ring: `0 0 0 3px rgba(16, 185, 129, 0.25)`
- **Elevation**:
  - Card Rest: `0 2px 8px -1px rgba(12,21,20,0.04), 0 1px 3px 0 rgba(12,21,20,0.02)`
  - Card Hover: `0 14px 34px -4px rgba(12,21,20,0.1), 0 4px 12px -2px rgba(12,21,20,0.05)`
  - Transition: `all 0.25s cubic-bezier(0.16, 1, 0.3, 1)`

## 2. Layout & Spacing Upgrades
1. **Utility & Header**:
   - Glassmorphic sticky header (`backdrop-filter: blur(16px); background: rgba(247, 249, 247, 0.88)`).
   - Modern pill navigation with smooth pill hover indicators.
   - Refined logo with glowing microchip badge.
2. **Hero Showcase**:
   - Modern high-tech hero with dynamic split layout.
   - Left: Crisp typographic hierarchy, glowing search input with inline category tags.
   - Right: Interactive 3D/glass card stack with real photo showcase, live diagnostic badges, and circular tech stats.
3. **Marketplace & Filters**:
   - Left Sidebar: Clean card container (`padding: 24px; border-radius: 16px; background: white`).
   - Custom styled selects with custom SVG arrows, rounded-xl inputs, and interactive check pills.
   - Active filter chips bar with quick reset buttons.
4. **Product Grid & Cards**:
   - Clean 3-column / 4-column responsive grid with `gap: 24px`.
   - Card: `border-radius: 16px; overflow: hidden; background: white; border: 1px solid var(--border)`.
   - Card Image: `aspect-ratio: 16/10; overflow: hidden; position: relative`.
   - Modern floating glass status pills with pulsing status dot.
   - Clear typography with `line-clamp: 2`.
   - Spec tags: `128GB ROM` / `6GB RAM` pill badges.
   - Monospace laser-etched IC badge.
   - Big bold price + clean arrow action button.
   - Verified seller row with seller avatar icon.
5. **Product Detail Page**:
   - Two-column engineering specification sheet layout.
   - Big hero photography with thumbnail strip.
   - Micro-soldering spec grid with Grade A/B/C colored callouts.
   - High-contrast reservation panel with 8% platform fee breakdown.
6. **Workspace (Admin / Seller / Buyer)**:
   - Modern SaaS metrics cards with glowing trend pills and clean typography.
   - Sleek responsive tables with rounded headers and colored status badges.
