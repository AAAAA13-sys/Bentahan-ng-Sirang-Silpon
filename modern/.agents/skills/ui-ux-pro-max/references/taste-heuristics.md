# UI/UX Taste Heuristics & Design Patterns

## Modern Aesthetics Playbook

AI coding agents often fall back on generic "Bootstrap 3" aesthetics (clunky borders, harsh primary blue buttons, unaligned inputs). These taste heuristics elevate the frontend to a polished, premium standard.

### 1. Modern Dark Mode Architecture
- Avoid `#000000` pitch black for content containers; use rich zinc/neutral charcoal: `#09090b` for canvas, `#18181b` for cards.
- Use semi-transparent borders: `border: 1px solid rgba(255, 255, 255, 0.08)` to achieve subtle definition.
- Elevate interactive elements on hover with `bg-zinc-800/80` or subtle translateY (-1px) transitions.

### 2. Bento Grid Layouts
- Organize complex dashboards or feature showcases into asymmetric Bento cards.
- Each Bento item should have a distinct hierarchy:
  - Header with icon or badge
  - Short, punchy title
  - Rich interactive or visual element (graph, preview, status indicator)
- Keep consistent padding (`24px`) and corner radius (`12px` or `16px`).

### 3. Glassmorphism & Depth
- Use backdrop blur sparingly for floating headers, navigation bars, and modal overlays:
  ```css
  background: rgba(24, 24, 27, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  ```

### 4. Micro-Interactions & Haptics
- Every interactive button or card should have responsive states:
  - `hover`: subtle color shift or elevation
  - `active` / `press`: subtle scale down (e.g. `transform: scale(0.98)`)
  - `focus-visible`: explicit focus ring (`ring-2 ring-indigo-500 ring-offset-2`)
- Never leave an action without immediate tactile feedback (loading spinner or progress bar).
