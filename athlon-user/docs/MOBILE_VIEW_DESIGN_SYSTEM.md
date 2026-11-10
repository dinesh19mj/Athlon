# Athlon Mobile View Design System Specification

> **Source of Truth Reference:** Mobile Landing Hub (`src/components/marketing/MarketingPageClient.tsx`)  
> **Target Viewport:** Mobile devices only (`block md:hidden`, max width `512px` / `max-w-lg`).  
> **Design Principle:** Ultra-crisp, athletic arena aesthetic, compact typography, balanced safe-area padding, and high-density tactile controls.

---

## 1. Screen Architecture & Safe Area Spacing

All mobile views must strictly adhere to the following outer container metrics:

### 1.1 Outer Screen Wrapper
```tsx
<div
  className="block md:hidden h-full overflow-y-auto overscroll-none touch-pan-y max-w-full pb-28 safe-area-top"
  style={{
    paddingTop: 'max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
  }}
>
```

| Spacing Property | Value | Class / Inline Style | Description |
| :--- | :--- | :--- | :--- |
| **Top Screen Gap** | `max(20px, env(safe-area-inset-top) + 12px)` | `paddingTop: 'max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))'` | Dynamic safe-area padding for notch/Dynamic Island clearance |
| **Horizontal Page Margin** | `14px` (sm: `16px`) | `px-3.5 sm:px-4` | Symmetric edge breathing room |
| **Content Max Width** | `512px` | `max-w-lg mx-auto` | Keeps tablets & wide phones centered without distortion |
| **Section Gap Rhythm** | `14px` | `gap-3.5` or `space-y-3.5` | Consistent vertical interval between cards & widgets |
| **Sub-Header Gap** | `6px` | `pt-1.5` | Spacing directly under top header / switcher |
| **Bottom Navigation Clearance** | `112px` | `pb-28` (or `pb-24`) | Clears the 64px floating bottom navigation bar + elevated center umpire button |

---

## 2. Typography Scale

All text in mobile views must use the following font sizes, weights, and letter-spacing:

| Element | Font Size | Font Weight | Tailwind Classes | Sample Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Main Headline** | `19px` (sm: `21px`) | Black (`900`) | `text-[19px] sm:text-[21px] font-black leading-[1.14] tracking-tight uppercase text-foreground` | "COMPETE TODAY. CHAMPION TOMORROW." |
| **Hero Neon Accent** | `19px` (sm: `21px`) | Black (`900`) | `text-primary drop-shadow-[0_2px_12px_var(--athlon-primary-glow)]` | Glowing highlight text |
| **Section Header Title** | `12px` | ExtraBold (`800`) | `text-[12px] font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5` | "COMMUNITY SESSIONS (2)" |
| **Section Counter Badge** | `9.5px` | Bold (`700`) | `text-[9.5px] font-mono text-primary font-bold bg-primary/10 px-1.5 py-0.2 rounded-full` | `(2)` or count pill |
| **Section "Explore >" Link**| `11px` | SemiBold (`600`) | `text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5` | "Explore >" |
| **Card Headline / Title** | `12px` | Bold (`700`) | `text-xs font-bold text-foreground tracking-tight line-clamp-1` | Tournament or session title |
| **Body / Description** | `11px` | Medium (`500`) | `text-[11px] text-text-secondary leading-relaxed font-medium` | Card subtitles, descriptions |
| **Action Button Text** | `9.5px` | Bold (`700`) | `text-[9.5px] font-bold uppercase tracking-wider` | "TOURNAMENTS", "BOOK VENUES" |
| **Telemetry / Stat Number** | `12px` | Black (`900`) | `text-xs font-black text-foreground font-mono leading-none` | `3`, `1`, `0 Live` |
| **Telemetry / Stat Label** | `8.5px` | Bold (`700`) | `text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1` | "EVENTS", "VENUES", "SCORING" |
| **Quick Nav Pod Label** | `10px` | Bold (`700`) | `text-[10px] font-bold text-center tracking-tight text-[var(--athlon-text-secondary)]` | "Tournaments", "Academies" |
| **Input / Search Query** | `12px` | Medium (`500`) | `text-xs font-medium placeholder:text-foreground/40 text-foreground` | "Search sport, turf, event..." |
| **Filter Chip Label** | `11px` | Bold / Black | `text-[11px] font-bold` (Active: `font-black text-primary-foreground`) | "All", "Badminton", "Cricket" |
| **Live Indicator Text** | `10px` | Black (`900`) | `text-[10px] font-black uppercase tracking-wider text-primary` | "LIVE SPORTS" |

---

## 3. Card & Surface Tokens

### 3.1 Hero Arena Card (`rounded-[26px]`)
```tsx
<section
  className="relative w-full rounded-[26px] overflow-hidden border p-5 shadow-xl transition-all"
  style={{
    backgroundColor: 'var(--athlon-card)',
    borderColor: 'var(--athlon-border)',
    boxShadow: '0 12px 32px -6px var(--athlon-shadow, rgba(0, 0, 0, 0.15)), 0 0 0 1px var(--athlon-border), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
  }}
>
  {/* Specular Glare Arc */}
  <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/[0.12] dark:from-white/[0.04] via-transparent to-transparent pointer-events-none z-0" />
```

### 3.2 Standard Content / Feed Card (`rounded-2xl`)
```tsx
<div
  className="rounded-2xl border p-3.5 sm:p-4 shadow-sm relative overflow-hidden transition-all"
  style={{
    backgroundColor: 'var(--athlon-card)',
    borderColor: 'var(--athlon-border)',
  }}
>
```

### 3.3 Telemetry / Stats Strip (`rounded-2xl`)
```tsx
<div
  className="grid grid-cols-3 divide-x rounded-2xl p-2.5 mt-1 border backdrop-blur-md"
  style={{
    backgroundColor: 'var(--athlon-surface)',
    borderColor: 'var(--athlon-border)',
  }}
>
```

### 3.4 3D Category Quick Nav Pods (`rounded-[18px]`)
```tsx
<div
  className="relative w-[68px] h-[68px] rounded-[18px] flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border overflow-hidden"
  style={{
    backgroundColor: 'var(--athlon-surface)',
    borderColor: 'var(--athlon-border)',
    boxShadow: '0 6px 20px -2px var(--athlon-primary-soft), 0 2px 6px var(--athlon-shadow)',
  }}
>
  <Athlon3DIcon type={cat.id} size={40} />
</div>
```

---

## 4. Interactive Elements & Controls

### 4.1 Buttons
- **Primary Athletic Button:**
  ```tsx
  className="flex items-center justify-center gap-1.5 text-[9.5px] font-bold px-3 py-2.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md tracking-wider uppercase"
  style={{
    backgroundColor: 'var(--athlon-primary)',
    color: 'var(--athlon-primary-foreground)',
    boxShadow: '0 4px 16px var(--athlon-primary-glow)',
  }}
  ```
- **Secondary / Surface Button:**
  ```tsx
  className="flex items-center justify-center gap-1.5 border text-[9.5px] font-bold px-3 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm tracking-wider uppercase backdrop-blur-md"
  style={{
    backgroundColor: 'var(--athlon-surface)',
    borderColor: 'var(--athlon-border)',
    color: 'var(--athlon-text)',
  }}
  ```

### 4.2 Search Bar & Location Selector
```tsx
<div className="flex items-center gap-2 w-full">
  {/* Search input field */}
  <div
    className="flex items-center flex-1 min-w-0 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl border transition-all backdrop-blur-md focus-within:ring-1 focus-within:ring-primary shadow-inner"
    style={{
      backgroundColor: 'var(--athlon-input, var(--athlon-card))',
      borderColor: 'var(--athlon-border)',
    }}
  >
    <Search className="w-3.5 h-3.5 text-foreground/40 mr-2 shrink-0" />
    <input className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none placeholder:text-foreground/40 text-foreground font-medium truncate" />
  </div>

  {/* City dropdown */}
  <div
    className="flex items-center w-[125px] shrink-0 px-2.5 py-2 sm:py-2.5 rounded-2xl border transition-all backdrop-blur-md shadow-inner relative"
    style={{
      backgroundColor: 'var(--athlon-input, var(--athlon-card))',
      borderColor: 'var(--athlon-border)',
    }}
  >
    <MapPin className="w-3.5 h-3.5 mr-1.5 text-foreground/40 shrink-0" />
    <select className="w-full bg-transparent text-xs font-semibold focus:outline-none text-foreground cursor-pointer pr-4 truncate">
      ...
    </select>
  </div>
</div>
```

### 4.3 Filter Chips (Sports & Categories)
```tsx
<button
  className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer active:scale-95 ${
    isSelected
      ? 'border-primary shadow-[0_2px_12px_var(--athlon-primary-glow)] font-black'
      : 'text-foreground/70 border-border bg-card/60'
  }`}
  style={{
    backgroundColor: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-card)',
    borderColor: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-border)',
    color: isSelected ? 'var(--athlon-primary-foreground)' : undefined,
  }}
>
  {sport}
</button>
```

---

## 5. Horizontal Carousel Lists
When displaying horizontal cards (e.g., Community Sessions, Live Tournaments, Featured Venues):
```tsx
<div className="flex items-stretch gap-3 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4">
  <div className="snap-start shrink-0 w-[calc(100vw-3.2rem)] sm:w-[320px] max-w-[360px] flex">
    {/* Card */}
  </div>
</div>
```
- **Overflow Margin Bleed:** `-mx-4 px-4` allows cards to slide smoothly to screen edges.
- **Card Width:** `w-[calc(100vw-3.2rem)] sm:w-[320px] max-w-[360px]` guarantees a sneak peek of the next card on mobile screens.

---

## 6. Page Redesign Audit Checklist

When auditing and redesigning any Athlon page for mobile view:

1. [ ] **Screen Container:** Has `block md:hidden`, `h-full`, `overflow-y-auto`, and `pb-28`?
2. [ ] **Safe Area Top:** Uses `paddingTop: 'max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))'`?
3. [ ] **Content Bounds:** Contained in `w-full max-w-lg mx-auto px-3.5 sm:px-4 flex flex-col gap-3.5`?
4. [ ] **Headers:** Top hero / page title uses `text-[19px] sm:text-[21px] font-black uppercase`?
5. [ ] **Section Headings:** Section titles use `text-[12px] font-extrabold uppercase tracking-wider` with a `w-3.5 h-3.5 text-primary` icon?
6. [ ] **Buttons:** Touch buttons use `text-[9.5px] font-bold uppercase tracking-wider px-3 py-2.5 rounded-xl`?
7. [ ] **Card Radius:** Hero cards use `rounded-[26px]`, regular cards use `rounded-2xl`?
8. [ ] **Colors & Theming:** Uses Athlon CSS variables (`var(--athlon-card)`, `var(--athlon-surface)`, `var(--athlon-border)`, `var(--athlon-primary)`) rather than hardcoded hex?
9. [ ] **No Desktop Contamination:** Are all mobile changes isolated behind `block md:hidden` or mobile responsive breakpoints?
