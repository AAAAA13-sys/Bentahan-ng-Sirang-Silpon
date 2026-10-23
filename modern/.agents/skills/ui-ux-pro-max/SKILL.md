---
name: ui-ux-pro-max
description: >-
  Frontend design system, taste heuristics, and aesthetic standards. Enforces modern UI styling,
  60-30-10 color harmony, WCAG accessibility, design tokens, and eliminates generic AI interfaces.
---

# UI/UX Pro Max: Frontend Taste & Design System

Inspired by `nextlevelbuilder/ui-ux-pro-max-skill`, this skill stops coding agents from generating generic, amateurish, or low-effort user interfaces. It enforces production-grade visual polish, modern layout systems, accessible contrast, and cohesive typography.

```text
┌───────────────────────────────────────────────────────────────┐
│                    THE TASTE HEURISTICS                       │
├─────────────────┬────────────────────┬────────────────────────┤
│ 1. 60-30-10     │ 2. MODERN TOKENS   │ 3. MICRO-INTERACTIONS  │
│    COLOR RULE   │    & TYPOGRAPHY    │    & POLISH            │
│                 │                    │                        │
│ 60% Canvas/Base │ Fluid typography,  │ Smooth transitions,    │
│ 30% Structural  │ 4px/8px rhythm,    │ subtle shadows, tactile│
│ 10% Accent pop  │ curated fonts.     │ state feedback.        │
└─────────────────┴────────────────────┴────────────────────────┘
```

---

## 1. The 60-30-10 Color Composition Rule
- **60% Dominant Surface**: Clean background canvas (`#09090b` dark or `#ffffff` light).
- **30% Secondary Structure**: Cards, sidebars, borders, muted text (`#18181b`, `#27272a`).
- **10% Accent Energy**: Primary interactive elements, active states, key CTAs (e.g., Electric Indigo `#6366f1` or Emerald `#10b981`).
- Never mix more than two contrasting brand hues without clear semantic purpose.

---

## 2. Typography & Spatial Rhythm
- **Curated Typefaces**: Default to modern geometric sans (Inter, Outfit, Geist, Roboto) rather than browser generic fonts.
- **Strict Hierarchy**:
  - Hero Header: 32-40px bold
  - Section Header: 20-24px semi-bold
  - Body: 14-16px regular
  - Caption/Meta: 12px muted
- **8-Point Grid**: All spacing (margins, paddings, gaps) must follow increments of 4px/8px (e.g., 4, 8, 12, 16, 24, 32, 48).

---

## 3. WCAG Accessibility
- Body text must meet **WCAG AA** minimum contrast (4.5:1 for normal text, 3:1 for large text).
- Interactive controls must have visible focus rings and accessible touch targets ($\ge 44 \times 44\text{px}$ on mobile).

---

## Resources & Utilities

- Consult pre-configured design tokens in [resources/design_tokens.json](./resources/design_tokens.json).
- Run the WCAG contrast calculator:

```bash
# Check contrast between two hex colors:
python .agents/skills/ui-ux-pro-max/scripts/check_contrast.py "#09090b" "#ffffff"
```

See [references/taste-heuristics.md](./references/taste-heuristics.md) for Bento grid, Glassmorphism, and Dark Mode design patterns.
