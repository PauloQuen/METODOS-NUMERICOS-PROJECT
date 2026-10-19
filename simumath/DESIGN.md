---
name: Academic Computational Modernism
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f88'
  primary: '#002046'
  on-primary: '#ffffff'
  primary-container: '#1b365d'
  on-primary-container: '#87a0cd'
  inverse-primary: '#aec7f7'
  secondary: '#7e5700'
  on-secondary: '#ffffff'
  secondary-container: '#fdbe50'
  on-secondary-container: '#714d00'
  tertiary: '#002625'
  on-tertiary: '#ffffff'
  tertiary-container: '#003d3c'
  on-tertiary-container: '#60aba9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aec7f7'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2e476f'
  secondary-fixed: '#ffdead'
  secondary-fixed-dim: '#fabc4d'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#604100'
  tertiary-fixed: '#a5f0ed'
  tertiary-fixed-dim: '#89d3d1'
  on-tertiary-fixed: '#00201f'
  on-tertiary-fixed-variant: '#00504e'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  display-hero-mobile:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 42px
  headline-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
  code-formula:
    fontFamily: Noto Serif
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is tailored for university-level computational mathematics, systems engineering, and scientific computing portals. The aesthetic bridges the gap between historical academic authority and modern engineering precision. It avoids sterile corporate software tropes in favor of an intellectual, collegiate atmosphere characterized by deep institutional navy, warm amber accents, crisp mathematical notation, and tactile, digestible cards.

The visual style unites **Academic Modernism** with **Calculated Utility**:
- **Dignified & Institutional:** Deep nocturnal blues convey university tradition and rigor.
- **Approachable & Structured:** Warm amber/gold badges break cognitive heaviness and spotlight key metadata (teams, tags, iterations).
- **Engineered Clarity:** Generous white and soft parchment-tinted surfaces balance formula-heavy layouts, interactive numerical input groups, and high-density iteration tables.

## Colors

The palette balances institutional gravitas with actionable warmth:

- **Primary (`#1B365D` / Deep Navy):** Anchors high-hierarchy elements such as hero canopies, major navigation pills, interactive solver trigger buttons, and prominent mathematical headers.
- **Secondary (`#E5A93C` / Warm Goldenrod & Amber):** Applied purposefully to pill badges, active status indicators, and delicate formula frame borders (`#F6E0B5` surface tints).
- **Tertiary (`#2B7A78` / Deep Slate Teal):** Serves analytical states, convergence indicators, and scientific graphics without distracting from primary tasks.
- **Neutrals (`#F8FAFC` to `#0F172A`):** The primary canvas uses `#F8FAFC` to reduce screen glare during sustained problem-solving sessions. Structural borders rely on muted `#E2E8F0` and ghost outlines.

### Semantic & Surface Rules
- **Canvas Base:** `#F8FAFC`
- **Surface Elevation 1 (Cards, Modals):** `#FFFFFF`
- **Formula Containers:** Tinted `#FDF8EE` background with an inset stroke of `#F5D698` to isolate equations naturally from surrounding body text.
- **Text Primary:** `#0F172A` for high-legibility sans-serif copy and deep serif titles.
- **Text Secondary / Muted:** `#475569` for descriptions, guidance notes, and formula variable definitions.

## Typography

This design system pairs an authoritative, literary serif (**Noto Serif**) for page anchors and mathematical concepts with an ergonomic, highly readable sans-serif (**Plus Jakarta Sans**) for operational interfaces, form controls, and body copy.

- **Noto Serif** lends weight and classical stature to chapter headings, theorem names, and centered banner titles. It evokes university textbooks and peer-reviewed journals.
- **Plus Jakarta Sans** provides clarity within parameter input fields, tabular iteration outputs, pill badges, and nested instructions.
- Mathematical inline expressions and variables ($x_k$, $\epsilon$, $f(x)$) rely on italicized **Noto Serif** with generous kerning to maintain legibility alongside monospace inputs.

## Layout & Spacing

The layout is built on a responsive 12-column grid system capped at a maximum width of `1280px`, centered across wide desktop monitors.

- **Hero Canopy:** The primary navigation banner spans full viewport width in institutional navy, incorporating a 2-stage vertical spacing structure: `space-xl` above the module indicator badge, and `space-xl` underneath the descriptive subtitle.
- **Component Flow:** Standard vertical rhythm maintains a distance of `space-xl` (40px) between distinct conceptual sections (e.g., between theoretical formulas and interactive calculators).
- **Mathematical Form & Iteration Grids:** Input fields are arranged in a 2-column or 4-column balanced grid with `space-md` gaps to align parameter pairings (such as interval edges `[a, b]` or iteration tolerances).

## Elevation & Depth

Visual hierarchy uses clean structural surfaces, delicate warm borders, and restrained drop shadows:

- **Level 0 (Base Canvas):** Flat `#F8FAFC`, non-elevated background creating natural separation from pure white components.
- **Level 1 (Cards, Formula Boxes & Inputs):** Pure `#FFFFFF` fill framed by a crisp 1px border in `#E2E8F0` or `#CBD5E1`. Shadow: `0 4px 12px -2px rgba(27, 54, 93, 0.05)`.
- **Level 2 (Interactive Floating Navigation & Modals):** Pill menus and solver parameter cards receive an elevated shadow: `0 10px 24px -4px rgba(27, 54, 93, 0.08)`.
- **Accent Framing:** Hero module cards utilize a deliberate 4px top accent border keyed to distinct thematic colors (amber, cyan, emerald, purple) to delineate distinct engineering workgroups at a glance.

## Shapes

The design system standardizes on a **Rounded (Level 2)** geometry:
- **Default Elements:** Form inputs, computational cards, and iteration result tables use an 8px (`0.5rem`) corner radius.
- **Hero Module Cards & Surface Panels:** Feature a generous 16px (`1rem` / `rounded-lg`) radius to establish distinct, approachable instructional modules.
- **Pill Badges & Segmented Bar Buttons:** Fully curved pill capsules (`rounded-full` / `9999px`) are dedicated exclusively to metadata badges, module step indicators, and secondary navigation tabs.

## Components

### Buttons
- **Primary Pill Action:** Institutional navy (`#1B365D`) background, bold white text, pill-shaped (`border-radius: 9999px`) or `rounded-md`, full-width or inline with `padding: 0.75rem 1.5rem`. Hover state introduces a deeper navy `#132742` with an elevated micro-lift.
- **Secondary & Segmented Nav Pills:** Ghost or solid `#FFFFFF` pills with a soft border (`#E2E8F0`), colored navy text, and an active state flipping to filled navy `#1B365D` with white text.

### Badges & Pill Tags
- **Metadata Badges (e.g., "Equipo 1", "Módulo 1"):** Fully rounded amber capsules (`#FEEBC8` background with `#975A16` text or solid warm gold `#E5A93C` with dark navy text), spaced centrally above section headers.

### Formula Display Blocks
- Dedicated mathematical containers with a delicate cream-gold background (`#FDF8EE`), surrounded by a subtle dashed or solid border (`#F6E0B5`). Content features centered, prominent typographic notation with clear variable legends immediately underneath.

### Input Fields & Numerical Parameter Pickers
- High-contrast form elements built with a subtle cool grey fill (`#F1F5F9`), bordered in `#CBD5E1`, with clean monospaced placeholder helpers (e.g., `Ej: 0.0001`). Active focus switches the stroke to primary navy (`#1B365D`) with an amber focus ring.

### Cards
- **Curricular Module Cards:** White surface with top colored highlight borders, subtle numerical watermark indicators (e.g., large faint "01", "02" in `#E2E8F0`), team badge at the top left, concise description, and an anchor button at the base.
- **Solver Interface Cards:** Structured cards grouping input fields logically on the left with instant real-time computation tables on the right.