---
name: Rental Management Platform
description: A high-trust, automated rent collection system for professional managers.
colors:
  primary: "oklch(0.7619 0.2087 149.6403)"
  neutral-bg: "oklch(0.987 0.0046 134.8496)"
  foreground: "oklch(0.1997 0.033 263.4108)"
  secondary: "oklch(0.9586 0.0092 134.8743)"
  muted: "oklch(0.9596 0.012 160.7158)"
  destructive: "oklch(0.6356 0.2082 25.3782)"
typography:
  display:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "12px"
  md: "14px"
  lg: "16px"
spacing:
  sm: "4px"
  md: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-outline:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
---

# Design System: Rental Management Platform

## Overview

**Creative North Star: "The Portfolio Precision Engine"**

The visual system is designed to evoke absolute trust, precision, and effortless scale. It avoids the sterile feel of traditional enterprise software by embracing a "Structured Softness"—pairing a rigid, highly scanable layout with confident, generous radii and a palette rooted in growth and stability.

The system focuses on the elimination of cognitive load. Every element is positioned to guide the professional manager through complex financial data without friction, turning a high-stress administrative task into a calm, passive oversight process.

**Key Characteristics:**
- **Growth-Centric Palette**: Using a vibrant spring green to signal prosperity and modernity.
- **Soft Precision**: High-radius corners (1rem) combined with strict grid alignment.
- **Diffused Depth**: Soft, layered shadows that create a light, breathable interface.
- **Enterprise-Lite**: Professional-grade reliability without the visual weight of legacy ERPs.

## Colors

The palette is designed to feel fresh and growth-oriented while maintaining the stability required for financial management.

### Primary
- **Vibrant Growth Green** (oklch(0.7619 0.2087 149.6403)): Used for primary actions, success states, and the core brand identity. It signals growth and positive financial movement.

### Neutral
- **Soft Sage Paper** (oklch(0.987 0.0046 134.8496)): The primary background color. A warm, near-white neutral that reduces eye strain compared to pure white.
- **Deep Estate Navy** (oklch(0.1997 0.033 263.4108)): The primary text and foreground color. Provides maximum contrast and a sense of institutional stability.
- **Muted Sage** (oklch(0.9596 0.012 160.7158)): Used for secondary backgrounds, disabled states, and subtle dividers.

### Named Rules
**The Growth-Signal Rule.** The primary green is used strategically to highlight "positive" outcomes (payments received, vacancy filled) and primary conversion points. It is never used for purely decorative elements.

## Typography

**Display Font:** Inter (with sans-serif fallback)
**Body Font:** Inter (with sans-serif fallback)
**Label/Mono Font:** JetBrains Mono

**Character:** Utilitarian, neutral, and highly legible. The use of Inter provides a modern, "tech-forward" feel that complements the "Precision Engine" metaphor.

### Hierarchy
- **Display** (600, clamp(2rem, 5vw, 3rem), 1.2): Used for page headers and high-level KPI summaries.
- **Headline** (500, 1.25rem, 1.3): Used for section titles and modal headers.
- **Title** (500, 1rem, 1.4): Used for card titles and list item headings.
- **Body** (400, 14px, 1.5): The workhorse font for all data tables and descriptions. Max line length is capped at 70ch for readability.
- **Label** (500, 12px, 1.2, uppercase): Used for table headers and form labels.

## Layout

The layout follows a strict 4px baseline rhythm. Containers are centered with generous padding to create a sense of "room to breathe," preventing the dashboard from feeling cluttered even when displaying dense financial tables.

**Responsive Behavior:**
- **Desktop**: Side-navigation with a fluid main content area.
- **Tablet**: Collapsed sidebar with a focus on high-level KPI cards.
- **Mobile**: Single-column stack with bottom-sheet navigation for primary actions.

## Elevation & Depth

The system uses a "Lifted" philosophy. Surfaces are not flat; they exist in a layered space where depth is conveyed through extremely soft, diffuse shadows rather than harsh borders.

### Shadow Vocabulary
- **Ambient Soft** (`box-shadow: 0px 10px 40px 0px hsl(220 45% 10% / 0.08)`): The default shadow for cards and modals. It creates a gentle lift from the background.
- **Focus Lift** (`box-shadow: 0px 10px 40px 0px hsl(220 45% 10% / 0.3)`): Used for active elements and modals to signal a higher z-index.

## Shapes

The form language is defined by "Structured Softness." The use of large radii removes the aggression of sharp corners, making the professional tool feel more approachable.

- **Corner Strategy**: A consistent 1rem (16px) radius is applied to primary containers (cards, modals).
- **Refinement**: Smaller elements (buttons, inputs) use a scaled-down radius (12px) to maintain proportional harmony.

## Components

### Buttons
- **Shape:** Confident rounded corners (12px)
- **Primary:** Vibrant Growth Green background, white text, generous horizontal padding.
- **Hover / Focus:** Subtle brightness shift and a 1px translate-y lift.
- **Secondary / Ghost:** Muted sage background or transparent with a soft border.

### Cards / Containers
- **Corner Style:** Large radius (16px)
- **Background:** Soft Sage Paper / White
- **Shadow Strategy:** Ambient Soft shadow by default.
- **Border:** Subtle 1px border in Muted Sage to define edges on light backgrounds.
- **Internal Padding:** Consistent 1rem (16px) spacing.

### Inputs / Fields
- **Style:** Subtle border in Muted Sage, 12px radius, clean internal padding.
- **Focus:** Border shifts to Vibrant Growth Green with a soft outer ring.

## Do's and Don'ts

### Do:
- **Do** use the Ambient Soft shadow to create depth instead of heavy borders.
- **Do** maintain a strict 4px spacing rhythm for all margins and paddings.
- **Do** use the primary green exclusively for actions that drive the "Passive Collection" goal.

### Don't:
- **Don't** use sharp corners (0-4px radius) on any primary container.
- **Don't** use pure black (#000) for text; always use Deep Estate Navy.
- **Don't** clutter the viewport with competing primary-colored elements.
