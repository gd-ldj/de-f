# DeTake UI Primitives

Design constants for AI-assisted UI development. When an instruction says “use Active-1” or “use Row-Hover,” apply the corresponding primitive directly. For implementation details, read the source code under `src/components/`.

---

## P1: Color Tokens

Defined in the `@theme` block inside `src/styles/global.css`. **Do not use inline raw color values**. Always reference colors through Tailwind tokens.

| Token          | Hex     | Tailwind                                     | Usage                                         |
| -------------- | ------- | -------------------------------------------- | --------------------------------------------- |
| primary        | #06A17E | `bg-primary` `text-primary` `border-primary` | Primary green for CTA, links, selected states |
| primary-fg     | #FFFFFF | `text-primary-foreground`                    | Text on primary background                    |
| foreground     | #052019 | `text-foreground`                            | Main body text (deep green-black)             |
| muted-fg       | #909399 | `text-muted-foreground`                      | Secondary text, date, author                  |
| background     | #FFFFFF | `bg-background` / `bg-white`                 | Page background                               |
| secondary      | #F1F5F9 | `bg-secondary`                               | Secondary background (light gray)             |
| secondary-fg   | #052019 | `text-secondary-foreground`                  | Text on secondary background                  |
| accent         | #F1F5F9 | `bg-accent`                                  | Hover/selected background (same as secondary) |
| accent-fg      | #052019 | `text-accent-foreground`                     | Hover-state text                              |
| border         | #E2E8F0 | `border-border`                              | Generic borders                               |
| input          | #E2E8F0 | `border-input`                               | Input borders                                 |
| ring           | #06A17E | `ring-ring`                                  | Focus ring (same as primary)                  |
| destructive    | #EF4444 | `bg-destructive` `text-destructive`          | Error/delete actions                          |
| destructive-fg | #FEFEFE | `text-destructive-foreground`                | Text on destructive background                |
| popover        | #FFFFFF | `bg-popover`                                 | Popover background                            |
| popover-fg     | #052019 | `text-popover-foreground`                    | Popover text                                  |

### Supplemental semantic colors (commonly used)

| Purpose                | Value                      | Example                                  |
| ---------------------- | -------------------------- | ---------------------------------------- |
| Positive / Up          | #10B981 (green-500)        | Price up                                 |
| Negative / Down        | #EF4444 (red-500)          | Price down                               |
| Warning                | #F59E0B (amber-500)        | Alerts                                   |
| Info                   | #3B82F6 (blue-500)         | Notifications                            |
| Prose links/quotes     | #0D9488 (teal-600)         | In-article links, blockquote left border |
| Prose body text        | #052019cc (foreground 80%) | Paragraph text                           |
| Image error background | #E8E8E8                    | Image load fallback                      |

---

## P2: Typography

**Font family**: Sequel Sans (custom), with system sans-serif fallback.

```
--font-sans: "Sequel Sans", ui-sans-serif, system-ui, -apple-system, ...
```

### Font weight rules (important)

| Weight             | Font file                           | Applies to                                                         |
| ------------------ | ----------------------------------- | ------------------------------------------------------------------ |
| **400 (Roman)**    | Sequel-Sans-Roman-Disp              | Gray text (muted), placeholders, disabled, `.text-gray-*`          |
| **500 (Medium)**   | Sequel-Sans-Medium-Disp             | Titles, body text, buttons, navigation (default for non-gray text) |
| **600 (Semibold)** | No dedicated file, simulated by CSS | Headings inside `.prose` only (h1-h6)                              |

**Key rule**: Gray text is automatically downgraded to Roman (400) via selectors in `global.css`. No manual override needed.

### Type scale

| Level                | Desktop   | Mobile    | Tailwind                     |
| -------------------- | --------- | --------- | ---------------------------- |
| Page heading (h1)    | 36px/40px | 30px/36px | `text-4xl`                   |
| Article heading (h2) | 30px/36px | 24px/32px | `text-3xl`                   |
| Section heading (h3) | 24px/32px | 20px/—    | `text-2xl`                   |
| Card title           | 16px      | 16px      | `text-[16px]` or `text-base` |
| Body paragraph       | 16px/1.75 | 14px/1.6  | `text-base` / `text-sm`      |
| Supporting text      | 14px      | 14px      | `text-sm`                    |
| Meta/date            | 12px      | 12px      | `text-xs`                    |
| Category tag         | 12px      | 10px      | `text-xs` / `text-[10px]`    |

### Global line-height

- `html, body`: `line-height: 1.4`
- `.prose p`: Desktop `1.75`, Mobile `1.6`
- Letter spacing: **all `tracking-*` is unified to 0px** (already overridden in `@theme`)

---

## P3: Active-1 — Content Highlight

**Use case**: Filter dropdown options and selected list rows in content-dense areas where blue/green-only text highlighting creates visual noise.

| State    | Background               | Text                           | Border  |
| -------- | ------------------------ | ------------------------------ | ------- |
| idle     | `bg-white` / transparent | `text-foreground`              | —       |
| hover    | `bg-accent` (`#F1F5F9`)  | `text-foreground` (unchanged)  | inherit |
| selected | `bg-primary/10`          | `text-primary` + `font-medium` | —       |

**Existing implementation**: FilterDropdown option — `bg-primary/10 text-primary font-medium` with a checkmark icon on selected state.

**Key rule**: Communicate selection with **background color + checkmark icon**, not text color alone.

---

## P4: Active-2 — Navigation Highlight

**Use case**: Top navigation, tabs, and category buttons. Labels are short and unique, so green text is an effective active-state indicator.

| State           | Background                                  | Text                                      | Border |
| --------------- | ------------------------------------------- | ----------------------------------------- | ------ |
| idle            | transparent                                 | `text-gray-600` / `text-muted-foreground` | —      |
| hover           | `hover:bg-gray-100` or `hover:text-primary` | `text-primary`                            | —      |
| active/selected | transparent or `bg-[#F5F6F7]`               | `text-primary` + `font-medium`            | —      |

**Existing implementation**:

- Header navigation: selected = `text-primary`
- Category button: selected = `bg-[#F5F6F7] text-foreground` vs unselected `text-muted-foreground`
- Dropdown submenu: hover = `!bg-primary/80 text-white` (dark inversion)

**Key rule**: `text-primary` is the primary active signal; background is secondary.

---

## P5: Row Hover

**Use case**: Clickable list rows, article cards, and data rows.

```
transition-colors hover:bg-accent
```

- Default: no background
- Hover: light gray background `bg-accent` (`#F1F5F9`)
- Image hover: `hover:scale-105 transition-transform duration-300` (subtle zoom)

---

## P6: Input State Cycle

```
Empty(idle)    bg-transparent + border-border(#E2E8F0)
  -> focus     -> border-primary(#06A17E) + focus:outline-none
Filled(focus)  border-primary
  -> blur      -> border-border (restore)
```

**Existing implementation** (AuthorSearchInput):

- Base: `text-sm text-foreground bg-transparent border border-border p-3`
- Focus: `focus:outline-none focus:border-1 focus:border-primary`
- Mobile: full border `border border-border`
- Desktop: bottom border only `md:border-t-transparent md:border-l-transparent md:border-r-transparent`
- Placeholder: `placeholder:text-muted-foreground/70`

**Newsletter input** (Footer):

- White input background + green SUBSCRIBE button (`bg-primary text-white`)

---

## P7: Disabled State

```
opacity-60 cursor-not-allowed text-[#909399] border-[#D3D3D5]
```

Also: `font-weight: 400` (automatically downgraded to Roman via `global.css`).

---

## P8: Error / Status Indicators

| State             | Color                      | Usage                     |
| ----------------- | -------------------------- | ------------------------- |
| Error/Destructive | `text-destructive` #EF4444 | Error messages, Toast     |
| Success           | #10B981 (green)            | Positive metrics, success |
| Warning           | #F59E0B (amber)            | Warning                   |
| Info              | #3B82F6 (blue)             | Informational message     |

**Toast spec**:

- Position: `fixed top-20 right-4 z-50` (via React Portal)
- Animation: `translate-x-0 opacity-100 scale-100` (visible) / `translate-x-full opacity-0 scale-95` (hidden)
- Style: `border border-l-4 rounded-lg shadow-lg backdrop-blur-sm`
- Interaction: `hover:shadow-xl transition-shadow duration-200`
- Do not use `alert()` / `confirm()`

---

## P9: Spacing & Radius

### Spacing

| Purpose                         | Value      | Tailwind               |
| ------------------------------- | ---------- | ---------------------- |
| Compact intra-component spacing | 4px        | `gap-1`                |
| Regular intra-component spacing | 8px        | `gap-2`                |
| Card content spacing            | 12px       | `gap-3` / `space-y-3`  |
| Section spacing                 | 16px       | `gap-4` / `space-y-4`  |
| Grid column gap                 | 24px       | `gap-6` / `md:gap-6`   |
| Large section spacing           | 32px       | `gap-8` / `mt-8`       |
| Container horizontal padding    | 16/24/32px | `px-4 sm:px-6 lg:px-8` |

### Radius

| Purpose                     | Value | Tailwind                 |
| --------------------------- | ----- | ------------------------ |
| Global default (`--radius`) | 2px   | —                        |
| Regular controls/cards      | 4-6px | `rounded` / `rounded-md` |
| Large containers/images     | 8px   | `rounded-lg`             |
| Tag/Badge                   | 6px   | `rounded-md`             |
| Circle (avatar)             | 50%   | `rounded-full`           |
| Code blocks (prose)         | 8px   | `rounded-lg`             |

### Shadow

- **Default**: No shadow; prefer borders for separation
- **Dropdown/Popover**: `shadow-lg`
- **Toast**: `shadow-lg` + `hover:shadow-xl`
- **Header**: No shadow; use `backdrop-blur` + `bg-white/95` for layering

---

## P10: Layout

### Container

```css
.container {
  @apply mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8;
}
```

Maximum content width: **1440px**, horizontally centered.

### Header

| Property    | Desktop                           | Mobile                                                      |
| ----------- | --------------------------------- | ----------------------------------------------------------- |
| Height      | 96px (`h-[96px]`)                 | 56px (`h-14`)                                               |
| Positioning | `fixed top-0 w-screen z-50`       | `fixed top-0 left-0 right-0 z-40`                           |
| Background  | `bg-white/95 backdrop-blur`       | `bg-white`                                                  |
| Border      | `border-b border-gray-200`        | `border-b border-gray-200`                                  |
| Layout      | Centered logo with left/right nav | Centered logo with left burger menu and right action button |

### Two-column layout (Article detail / Learn pages)

```css
.layout-two-column-fixed-1440 {
  /* Mobile: single column */
  grid-template-columns: minmax(0, 2fr);
  /* lg (1024px): adaptive two-column */
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  /* 1440px: fixed width */
  grid-template-columns: 1000px 440px;
}
```

- Left column: article body / Learn content
- Right column: sidebar (Share To Earn, Token Info, Bonus Distribution, Recent Research)

### Article list grid

- Mobile: vertical stack `space-y-4`, each item in horizontal layout (image left, text right)
- Desktop: `grid md:grid-cols-3 lg:grid-cols-4 md:gap-6`, each item in vertical layout (image top, text bottom)

### Responsive breakpoints

| Breakpoint | Width  | Usage                                                         |
| ---------- | ------ | ------------------------------------------------------------- |
| default    | 0px    | Mobile first                                                  |
| `sm`       | 640px  | Small-screen adjustment                                       |
| `md`       | 768px  | **Primary breakpoint**: navigation switch, list layout switch |
| `lg`       | 1024px | **Two-column layout** takes effect                            |
| `xl`       | 1280px | Wide-screen fine-tuning                                       |
| `1440px`   | Custom | Fixed two-column width                                        |

---

## P11: Border System

| Level                | Token                    | Hex     | Usage                                         |
| -------------------- | ------------------------ | ------- | --------------------------------------------- |
| Generic border       | `border-border`          | #E2E8F0 | Inputs, cards, dividers                       |
| Header bottom border | `border-gray-200`        | #E5E7EB | Bottom border of top navigation               |
| Filter divider       | `border-border`          | #E2E8F0 | FilterBar divider (`h-6 w-px bg-border mx-4`) |
| List divider         | `border-b border-border` | #E2E8F0 | Between horizontal list items                 |

---

## P12: Component Patterns

### Article Card (ArticleCard)

**Vertical layout (Desktop)**:

```
<article class="rounded overflow-hidden">
  <div class="relative w-full h-48 object-cover rounded-lg border border-gray-200">
    <!-- Image, hover:opacity-90 -->
  </div>
  <div class="mt-5 space-y-2">
    <span class="text-xs font-medium text-primary uppercase">CATEGORY</span>
    <h3 class="text-[16px] font-medium text-foreground line-clamp-2">Title</h3>
    <p class="text-xs text-muted-foreground">Date / Author</p>
  </div>
</article>
```

**Horizontal layout (Mobile)**:

```
<article class="flex gap-3 py-6 border-b border-border">
  <div class="flex-1">
    <span class="text-[10px] font-medium text-primary uppercase">CATEGORY</span>
    <h3 class="text-[16px] font-medium text-foreground line-clamp-2">Title</h3>
    <p class="text-xs text-muted-foreground">Date / Author</p>
  </div>
  <div class="flex-shrink-0 w-22 h-22 rounded-lg overflow-hidden">
    <!-- Image -->
  </div>
</article>
```

### Category Tag

```
text-primary text-[10px] md:text-xs font-medium uppercase
```

- Text-only, no background
- Green + uppercase + small font

### Filter Chip / Selected Tag

```
px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs
```

- Includes close button `x`
- Horizontally scrollable on mobile

### Pagination

```
<!-- Current page -->
bg-primary text-primary-foreground rounded px-3 py-2

<!-- Other pages -->
text-foreground hover:bg-accent hover:text-accent-foreground rounded border px-3 py-2

<!-- Disabled -->
text-[#909399] border-[#D3D3D5] cursor-not-allowed
```

### Buttons

| Type             | Style                                                          | Usage                          |
| ---------------- | -------------------------------------------------------------- | ------------------------------ |
| Primary (filled) | `bg-primary text-white rounded`                                | SUBSCRIBE, primary CTA         |
| Outline          | `border border-border text-foreground hover:bg-accent rounded` | Pagination, secondary actions  |
| Ghost            | `bg-transparent hover:bg-gray-100 rounded`                     | Navigation items, icon buttons |
| Follow           | `bg-gray-300 text-black rounded text-sm font-medium`           | Follow button                  |
| Loading          | `opacity-60 cursor-not-allowed` + spinner                      | Loading state                  |

### Skeleton

```
animate-pulse bg-gray-200 rounded
```

- Text: multi-line, last line at 75% width
- Avatar: `rounded-full`
- Button: `h-10 rounded-md`

### Image handling

- All images: `object-cover`
- Lazy loading: `loading="lazy"`
- Error fallback: `bg-[#E8E8E8]` + centered DeTake logo SVG
- Hover: `hover:scale-105 transition-transform duration-300` (when needed)
- Radius: `rounded-lg`

---

## P13: Footer

Two-column layout:

- **Left column**: Newsletter subscription — `"NEWSLETTER"` eyebrow + title + description + input + button
- **Right column**: Disclosure & Policies text

Bottom link bar:

- Left: site navigation links (News, Podcasts, Newsletters, Events, Roundtables, Analytics, Sitemap)
- Right: legal links (About, Manage Cookies, Careers, Terms of Service, Privacy Policy, Contact Us)
- Bottom-most: DeTake logo + copyright + social media icons

---

## P14: Sidebar (Article detail / Learn pages)

Module order from top to bottom:

1. **Share To Earn** — referral link, copy button, X share
2. **Token Info** — MKT Cap, Liquidity, Vol, Holders + mini price chart
3. **Bonus Distribution** — progress bar + Ongoing tag + Realtime Bonus Rate
4. **Bonus Hunters** — ranking list (avatar + address + time + amount)
5. **Token Details** — Pair created, Pooled Token, Pooled $SOL, Liquidity
6. **Recent Research** — recommended article card

---

## P15: Transitions & Animations

| Effect                  | Class                                           | Usage                      |
| ----------------------- | ----------------------------------------------- | -------------------------- |
| Color transition        | `transition-colors`                             | Link/button hover          |
| Transform transition    | `transition-transform duration-300`             | Image zoom, chevron rotate |
| All-property transition | `transition-all duration-300 ease-in-out`       | Complex state switching    |
| Shadow transition       | `transition-shadow duration-200`                | Toast hover                |
| Toast enter/exit        | `translate-x-0/full opacity-0/100 scale-95/100` | Notification slide-in      |
| Chevron rotate          | `rotate-180 transition-transform`               | Dropdown expand/collapse   |

---

## P16: Z-Index Hierarchy

| Level            | z-index | Component                    |
| ---------------- | ------- | ---------------------------- |
| Header (Desktop) | `z-50`  | DesktopHeader                |
| Header (Mobile)  | `z-40`  | MobileHeader                 |
| Dropdown         | `z-50`  | FilterDropdown, nav dropdown |
| Mobile Overlay   | `z-40`  | Black overlay `bg-black/80`  |
| Toast            | `z-50`  | Notification popup           |

---

## Rules (Non-Primitive constraints)

### Component usage

- Icons: prefer Lucide React, use custom SVG only when necessary
- Images: use the project `Image` component consistently (built-in fallback)
- All interactive components must include `transition-*` classes
- Do not use `alert()` / `confirm()`, use the Toast system

### Color discipline

- **No inline raw colors** (e.g. `bg-[#06A17E]`); use tokens (e.g. `bg-primary`)
- New colors must be defined in `@theme` first
- Use `text-muted-foreground` for gray text, avoid mixing with `text-gray-*` (except legacy code)

### Typography discipline

- Do not set `font-weight` manually; rely on automatic rules in `global.css`
- Only pay attention to weight when you need “body text but gray”

### Responsive

- Mobile-first, with **primary breakpoint `md:` (768px)**
- Desktop two-column layout at `lg:` (1024px)
- Header height: Desktop `96px`, Mobile `56px` (main area needs matching top padding)
- Minimum touch target: `h-10` (40px)

### Prose (Article content)

- Link color: `#0D9488` (teal-600), not primary (#06A17E)
- Blockquote: `border-left: 4px solid #0D9488`
- Code: inline `bg-[#f3f4f6] text-[#dc2626] rounded-md`, block `bg-[#1f2937] text-[#f9fafb] rounded-lg`
- Images: `rounded-lg max-w-full h-auto`

---

## Checklist

- [ ] Use semantic color tokens (P1), no inline raw colors
- [ ] Follow Sequel Sans dual-weight rules (P2)
- [ ] Use the correct selected-state pattern: Active-1 (P3) for content areas, Active-2 (P4) for navigation
- [ ] Row Hover is present on list rows (P5): `transition-colors hover:bg-accent`
- [ ] Inputs follow Input State Cycle (P6)
- [ ] Font sizes follow hierarchy (P2), category tags use `uppercase text-primary`
- [ ] Radius: controls `rounded-md`, containers `rounded-lg`, global default 2px
- [ ] All 5 states are covered: idle / hover / focus / active / disabled
- [ ] Loading + Empty + Error states exist (Skeleton / fallback / Toast)
- [ ] Images: `object-cover` + `loading="lazy"` + error fallback
- [ ] Mobile-first, with `md:` as the primary breakpoint, touch target `h-10`
- [ ] Header spacing offset is correct (Desktop 96px / Mobile 56px)
- [ ] z-index follows the hierarchy table (P16)
- [ ] All interactions include transition animations (P15)
