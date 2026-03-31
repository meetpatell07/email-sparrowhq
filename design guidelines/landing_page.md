# landing.md — Startup Landing Page Design System
> **Claude Code Instructions:** This file is your single source of truth whenever
> you are asked to build a landing page, marketing site, or product homepage.
> Read every section before writing a single line of code. Follow all rules exactly.

---

## 0. STACK REQUIREMENTS

```
Framework:     Next.js 14+ (App Router)
Styling:       Tailwind CSS v3+
Components:    shadcn/ui (use cn() utility for all class merging)
Icons:         @hugeicons/react  →  https://hugeicons.com/react-icons
               Always import named icons: import { IconName } from "@hugeicons/react"
3D / WebGL:    Three.js + @react-three/fiber + @react-three/drei
Scroll:        GSAP + @gsap/react (ScrollTrigger plugin)
               Lenis  (smooth scroll inertia, replaces locomotive-scroll)
               CSS scroll-driven animations (native, no JS) where possible
Animation:     Framer Motion (layout animations, presence, React transitions)
Fonts:         next/font/google  —  see Typography section for pairing rules
```

**Install command to include at the top of every project:**
```bash
npm install gsap @gsap/react lenis framer-motion three @react-three/fiber @react-three/drei @hugeicons/react
npx shadcn@latest init
```

---

## 1. THEME SYSTEM — DARK & LIGHT VARIANTS

Every landing page ships with **both** a dark and light theme. Use CSS custom
properties on `:root` and `[data-theme="dark"]`. Tailwind darkMode should be set
to `"class"` in `tailwind.config.ts`.

### Color Tokens

```css
/* globals.css */
:root {
  /* Light theme (default) */
  --bg-primary:       #ffffff;
  --bg-secondary:     #f7f7f5;
  --bg-tertiary:      #f0efe9;
  --surface:          #ffffff;
  --surface-raised:   #fafaf8;
  --border:           #e5e4df;
  --border-subtle:    #efefec;

  --text-primary:     #0d0d0d;
  --text-secondary:   #4a4a4a;
  --text-muted:       #9a9a9a;
  --text-inverse:     #ffffff;

  --accent:           #0d0d0d;        /* override per brand */
  --accent-hover:     #2a2a2a;
  --accent-fg:        #ffffff;

  --glow:             rgba(0, 0, 0, 0.06);
  --gradient-hero:    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(120,119,198,0.15), transparent);
}

[data-theme="dark"] {
  /* Dark theme */
  --bg-primary:       #0a0a0a;
  --bg-secondary:     #111111;
  --bg-tertiary:      #161616;
  --surface:          #141414;
  --surface-raised:   #1c1c1c;
  --border:           #262626;
  --border-subtle:    #1e1e1e;

  --text-primary:     #f0efe9;
  --text-secondary:   #a0a0a0;
  --text-muted:       #4a4a4a;
  --text-inverse:     #0a0a0a;

  --accent:           #f0efe9;
  --accent-hover:     #ffffff;
  --accent-fg:        #0a0a0a;

  --glow:             rgba(255, 255, 255, 0.04);
  --gradient-hero:    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(120,119,198,0.25), transparent);
}
```

### Tailwind Config additions
```js
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      bg: {
        primary:   "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        tertiary:  "var(--bg-tertiary)",
      },
      surface:   "var(--surface)",
      border:    "var(--border)",
      accent:    "var(--accent)",
    },
    textColor: {
      primary:   "var(--text-primary)",
      secondary: "var(--text-secondary)",
      muted:     "var(--text-muted)",
    },
  }
}
```

### Theme Toggle
Always include a theme toggle button in the Navbar using shadcn's `<Button variant="ghost">` 
with the `Sun01Icon` / `Moon01Icon` from `@hugeicons/react`.
Persist preference in `localStorage` and apply on `<html data-theme="">`.

---

## 2. TYPOGRAPHY SYSTEM

Claude Code must **choose one pairing** based on the brand personality described
in the brief. If no personality is given, default to **Figtree + DM Sans**.

| Mood | Heading Font | Body Font | When to use |
|------|-------------|-----------|-------------|
| Editorial / Luxury | EB Garamond | DM Sans | High-end, slow brand, agency, finance |
| Modern SaaS / Clean | Figtree | DM Sans | B2B, developer tools, productivity |
| Friendly / Consumer | Poppins | Poppins | Consumer apps, health, education |
| Minimal / Swiss | DM Sans | DM Sans | Utility tools, open source, infra |

### Font Loading (next/font/google)
```tsx
// app/fonts.ts  — import whichever pair is chosen
import { Figtree, DM_Sans } from "next/font/google"

export const heading = Figtree({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
})
```

Apply to `<html>` tag: `className={cn(heading.variable, body.variable)}`

### Type Scale
```
Display:  clamp(3rem, 7vw, 6.5rem)  font-heading font-black tracking-tight leading-[0.95]
H1:       clamp(2.25rem, 5vw, 4rem)  font-heading font-bold  tracking-tight leading-[1.05]
H2:       clamp(1.75rem, 3.5vw, 2.75rem) font-heading font-semibold leading-[1.1]
H3:       clamp(1.25rem, 2vw, 1.75rem)   font-heading font-semibold
Body LG:  1.125rem  font-body font-normal leading-relaxed
Body:     1rem      font-body font-normal leading-relaxed
Small:    0.875rem  font-body text-muted
Label:    0.75rem   font-body font-medium tracking-widest uppercase text-muted
```

### Heading Style Rules
- Always wrap **one key word** in the main headline with `<em>` styled as italic
  (use `font-style: italic` with the heading font or swap to EB Garamond for
  the italic word even if the heading font is different — this creates visual tension)
- Max 6–8 words per hero headline
- Subheadlines: 1–2 sentences, text-secondary, font-body, max-w-xl centered

---

## 3. ICONS — @hugeicons/react

**Always use HugeIcons.** Never use lucide-react, heroicons, or inline SVGs
unless hugeicons doesn't have the specific icon.

```tsx
// Correct import pattern
import { 
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  StarIcon,
  ZapIcon,
  ShieldCheckIcon,
} from "@hugeicons/react"

// Usage — always pass size and color via className or props
<ArrowRight01Icon size={20} className="text-primary" />
```

**Icon sizing rules:**
| Context | Size |
|---------|------|
| Inline with text | 16px |
| Feature card | 24px |
| Hero / large feature | 32–40px |
| Nav / button | 18px |

**Icon style:** Default to `strokeWidth={1.5}` for a refined look. Use `strokeWidth={2}` 
for emphasis or CTAs.

---

## 4. ANIMATION SYSTEM

### 4a. Lenis — Smooth Scroll Setup

Create `components/providers/LenisProvider.tsx` and wrap the entire app.

```tsx
"use client"
import Lenis from "lenis"
import { useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenis.on("scroll", ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf)
    }
  }, [])

  return <>{children}</>
}
```

---

### 4b. GSAP ScrollTrigger — Rules Per Section

**RULE: Each section has its own defined animation personality.**

#### HERO — Smooth & Cinematic
```
- Timeline plays on mount (not scroll)
- Headline: y: 60 → 0, opacity 0 → 1, duration 1.0, ease "power3.out"
- Subtext: same, delay 0.15
- CTAs: same, delay 0.3
- Hero 3D canvas: scale 0.92 → 1, opacity 0 → 1, delay 0.1
- After mount: subtle parallax on scroll — canvas moves at 0.3x scroll speed
```

#### LOGO TICKER — CSS only (no GSAP)
```css
/* Pure CSS infinite scroll — no JavaScript */
@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.ticker-track {
  display: flex;
  width: max-content;
  animation: ticker 30s linear infinite;
}
.ticker-track:hover { animation-play-state: paused; }
```
Duplicate the logos array twice inside `.ticker-track` for seamless looping.

#### STATS / NUMBERS BAR — Snappy & Energetic
```
- Numbers count up from 0 when scrolled into view
- Use GSAP { value: targetNumber } tween with snap: 1
- Duration: 1.8s, ease: "power2.out"
- Trigger: "top 80%" — fires quickly as user scrolls down
- Stagger the 3–4 stat items by 0.12s
```

#### FEATURES GRID — Staggered Reveal
```
- Cards: y: 40 → 0, opacity 0 → 1
- scrub: false (fire once, no scrub)
- stagger: 0.08
- trigger: "top 75%"
- ease: "power2.out", duration: 0.6
- On hover: Framer Motion whileHover scale 1.02, border color shift 200ms
```

#### TESTIMONIALS — Editorial & Typographic
```
- Section heading: clip-path reveal top-to-bottom
  from: clipPath "inset(0 0 100% 0)" → "inset(0 0 0% 0)"
  duration: 0.9, ease: "power3.inOut"
- Cards: horizontal stagger, x: 30 → 0, opacity 0 → 1
- scrub: false, trigger: "top 70%"
```

#### FINAL CTA — Cinematic Zoom
```
- Background gradient expands from center: scale 0.8 → 1
- Text fades and rises: y: 30 → 0, opacity 0 → 1
- Entire section has subtle pin for 0.5s before scroll continues (ScrollTrigger pin)
- Duration: 1.0s, ease: "expo.out"
```

---

### 4c. Framer Motion — Usage Rules

Use Framer Motion **only** for:
1. Page transitions (AnimatePresence on route change)
2. Interactive hover/tap states on cards and buttons
3. Modal / drawer / dialog open-close animations
4. Tab panel crossfades

```tsx
// Standard card hover — use on every Feature card and Testimonial card
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>

// CTA button
<motion.button
  whileHover={{ scale: 1.04 }}
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.15 }}
>
```

---

### 4d. CSS Scroll-Driven Animations (Native — no JS)

Use for **decorative** elements only (not primary content reveals).

```css
/* Fade-in as element enters viewport — zero JS */
@keyframes fade-up {
  from { opacity: 0; translate: 0 40px; }
  to   { opacity: 1; translate: 0 0; }
}

.animate-on-scroll {
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 25%;
}

/* Parallax background blob */
@keyframes parallax-drift {
  from { transform: translateY(0px) rotate(0deg); }
  to   { transform: translateY(-80px) rotate(12deg); }
}
.bg-blob {
  animation: parallax-drift linear both;
  animation-timeline: scroll(root);
  animation-range: 0% 60%;
}
```

---

## 5. THREE.JS / WEBGL — FULL APPLE-LEVEL SCENE

### Architecture
Create a dedicated `components/hero/HeroScene.tsx` with `@react-three/fiber`.
The scene must respond to scroll position — not just sit idle.

### Setup Pattern

```tsx
"use client"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, MeshDistortMaterial, Float } from "@react-three/drei"
import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Scroll-driven camera + mesh animation
function SceneContent() {
  const meshRef = useRef()
  const { camera } = useThree()

  useEffect(() => {
    // GSAP drives the 3D scene based on scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.5,
      }
    })

    tl.to(camera.position, { z: 3, y: 1.5, ease: "none" })
      .to(meshRef.current.rotation, { y: Math.PI * 0.5, ease: "none" }, "<")
      .to(meshRef.current.scale, { x: 0.6, y: 0.6, z: 0.6, ease: "none" }, "<")
  }, [])

  useFrame(({ clock }) => {
    // Ambient idle animation (breathing effect)
    meshRef.current.rotation.y += 0.002
    meshRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.05
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.4, 4]} />
      <MeshDistortMaterial
        color={isDark ? "#6366f1" : "#818cf8"}
        distort={0.35}
        speed={2}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  )
}

export function HeroScene() {
  return (
    <Canvas
      className="absolute inset-0 w-full h-full"
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Environment preset="city" />
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <SceneContent />
      </Float>
    </Canvas>
  )
}
```

### Scene Scroll Phases (Apple-style)

Define 3 acts for any hero 3D scene:

| Scroll % | Camera / Mesh Action |
|----------|----------------------|
| 0–30% | Idle float, slow Y rotation, camera stationary |
| 30–60% | Camera pulls back, mesh rotates 90°, scale shrinks |
| 60–100% | Mesh fades and drifts off-screen, section content takes focus |

---

## 6. SECTION BLUEPRINTS

### 6a. NAVBAR

```
- Sticky top-0, backdrop-blur-md, border-b border-subtle
- bg-bg-primary/80 (semi-transparent)
- Left: Logo (SVG or text mark)
- Center: Nav links with HugeIcons inline, optional dropdown
- Right: Theme toggle + Ghost CTA + Primary CTA
- Mobile: Hamburger → full-screen overlay menu with Framer Motion AnimatePresence
- Height: 64px desktop / 56px mobile
```

### 6b. HERO

```
Structure (centered layout):
  [Announcement pill badge — optional]
  [Display headline — 2 lines max, one word in <em>]
  [Subtext — 1–2 sentences, text-secondary, max-w-lg]
  [CTA row — Primary button + Ghost button + optional platform badges]
  [Hero visual — 3D Canvas fills below, OR full-bleed product screenshot]

Background:
  - var(--gradient-hero) radial gradient from top center
  - Optional: floating blurred blobs (CSS, not WebGL) for depth
  - Dark mode: subtle noise texture overlay at 3% opacity

Height: min-h-[100svh]
Padding top: navbar height + 40px
```

### 6c. LOGO TICKER

```
- Label: "Trusted by teams at" — text-muted label uppercase tracking-widest
- Two rows on mobile, one row on desktop
- Logos: grayscale(1) opacity-40, hover → grayscale(0) opacity-100 transition
- Speed: 30s per cycle (slow = premium feel)
- No autoplay pause on mobile
```

### 6d. STATS / NUMBERS BAR

```
- 3–4 stats in a horizontal row (stack 2x2 on mobile)
- Each stat: large display number + unit + short label
- Dividers between stats: 1px border-subtle (hide on mobile)
- Background: bg-secondary, full-bleed
- Number animation: GSAP countUp on ScrollTrigger (see section 4b)
```

### 6e. FEATURES GRID

```
Layout options (Claude Code picks based on feature count):
  3 features → 3-column equal grid
  4 features → 2x2 grid
  5–6 features → 3-col first row, 2–3-col second row
  7+ features → alternating full-width + 2-col rows

Each card:
  - HugeIcon (32px) in accent color
  - H3 heading
  - Body text (2–3 sentences)
  - Optional: subtle top border in accent color on hover
  - Border: 1px var(--border), rounded-2xl
  - Padding: 32px
  - Background: var(--surface)
  - Hover: Framer Motion scale 1.02, y -4
```

### 6f. TESTIMONIALS

```
Layout: 3-column masonry grid (CSS columns: 3, gap 16px)
Mobile: single column

Each card:
  - Quote text (no quotation marks — use left border accent instead)
  - Avatar (rounded-full, 40px) + Name + Title in a row
  - Star rating (optional) using StarIcon from HugeIcons
  - Background: var(--surface-raised)
  - Border: 1px var(--border)
  - Rounded-2xl, padding 24px

Section heading animation: clip-path reveal (see section 4b)
```

### 6g. FAQ

```
- Use shadcn Accordion component
- Max-w-2xl, centered
- Each item: question in font-heading font-semibold, answer in text-secondary
- Animated chevron: ChevronDown01Icon from HugeIcons, rotates 180° on open
- Framer Motion AnimatePresence for smooth height transition
- Add FAQ schema markup (JSON-LD) in a <script type="application/ld+json">
```

### 6h. FINAL CTA

```
- Full-bleed section, centered
- Large display headline (same rules as hero)
- 2 CTA buttons
- Optional: "No credit card required" or trust micro-copy below buttons
- Background: dark mode → near-black with glowing radial gradient center
             light mode → bg-tertiary
- GSAP: cinematic zoom-in of background + text rise (see section 4b)
- Bottom: thin divider → Footer
```

### 6i. FOOTER

```
- 4–5 column grid: Logo/tagline col + 3–4 link columns
- Bottom bar: copyright + legal links + social icons (HugeIcons)
- Social icons: GithubIcon, TwitterIcon, LinkedinIcon from @hugeicons/react
- Mobile: stacked, logo on top
- No heavy decoration — keep it minimal
```

---

## 7. COMPONENT RULES

### Buttons

```tsx
// Primary CTA — always use this pattern
<Button 
  className="bg-accent text-accent-fg rounded-full px-6 py-2.5 
             font-body font-medium text-sm
             hover:bg-accent-hover transition-all duration-200
             shadow-sm hover:shadow-md"
>
  Get started free
  <ArrowRight01Icon size={16} className="ml-2" />
</Button>

// Ghost / Secondary
<Button variant="outline"
  className="rounded-full border-border text-primary
             hover:bg-surface-raised transition-all duration-200"
>
  Learn more
</Button>
```

**Rules:**
- All buttons: `rounded-full` (pill shape)
- Primary buttons always have a HugeIcon on the right
- Never use square buttons on landing pages
- Button text: sentence case, never ALL CAPS

### Cards

```
- Always: rounded-2xl, border border-[var(--border)], bg-[var(--surface)]
- Padding: 24px (sm card) / 32px (feature card) / 40px (hero card)
- Never use box-shadow alone — combine with border
- Hover state required on all interactive cards
```

### Announcement Pill / Badge

```tsx
<div className="inline-flex items-center gap-2 
                rounded-full border border-border bg-surface
                px-4 py-1.5 text-sm text-secondary">
  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
  New · Just launched v2.0
  <ArrowRight01Icon size={14} />
</div>
```

---

## 8. RESPONSIVE RULES

| Breakpoint | Rules |
|------------|-------|
| `sm` (640px) | Single column layouts, hide decorative 3D |
| `md` (768px) | 2-col grids, show abbreviated nav |
| `lg` (1024px) | Full desktop layout, 3D scene active |
| `xl` (1280px) | Max content width 1200px, centered |
| `2xl` (1536px) | Same as xl — do not stretch further |

**Always set `max-w-screen-xl mx-auto px-4 md:px-8` on content wrappers.**

3D Canvas: disable on `sm` breakpoint using a `useMediaQuery` hook.
Reduce GSAP animations to simple fade-up on mobile (no scrub, no pinning).

---

## 9. PERFORMANCE RULES

- Lazy-load HeroScene: `const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false })`
- All images: `next/image` with explicit `width` + `height`, `priority` on hero image only
- GSAP: `gsap.context()` cleanup in every `useEffect` return
- Lenis: destroy on unmount
- Font: `display: "swap"` on all next/font declarations
- Never import all of Three.js — import only what's used
- ScrollTrigger: `ScrollTrigger.refresh()` after all dynamic content loads

---

## 10. HOW TO USE THIS FILE

When a user asks you to build a landing page, follow these steps **in order**:

1. **Read the brief** — extract: product name, one-liner, target audience, brand mood
2. **Choose typography pairing** — match mood to the table in section 2
3. **Choose default theme** — dark or light based on industry (dark: dev tools, AI, infra / light: consumer, health, education). Always ship both.
4. **Scaffold the stack** — Next.js App Router, Tailwind, shadcn init, install all deps
5. **Set up providers** — LenisProvider wrapping layout, GSAP registered globally
6. **Build sections in order** — Navbar → Hero → Ticker → Stats → Features → Testimonials → FAQ → CTA → Footer
7. **Apply animations** — follow section 4b rules, one section at a time
8. **3D Scene last** — add HeroScene after all 2D content works
9. **Responsive pass** — verify each breakpoint
10. **Performance pass** — lazy loads, cleanup, image optimization

**One rule above all:**
> The page must feel alive when scrolling. If the scroll experience is not 
> smooth, cinematic, and intentional — it is not done.