---
name: "心创云盘 (ShouYuLove Drive)"
description: "Night-sky starlight cloud drive portal and FileBrowser workspace modeled on Benchmarks' Last Exam, uniting 0.5px open hairline directories, #f6f4ee light squircle stamps, warm starlight glow, and progressive-disclosure team sharing."
colors:
  page: "#05060b"
  surface: "#0b0d14"
  surface-soft: "#0e1119"
  surface-raised: "#10131c"
  surface-hover: "#151924"
  selected: "#222838"
  selection-bg: "#3a4468"
  ink: "#f4f1ea"
  ink-soft: "#d8d5cd"
  muted: "#a3a7b3"
  placeholder-ink: "#7d8291"
  disabled-ink: "#5b6070"
  line: "#1c1f2a"
  line-strong: "#2a2e3b"
  line-hover: "#6b7080"
  field-edge: "#3a3f4f"
  solid: "#f4f1ea"
  solid-hover: "#fff3df"
  on-solid: "#07080d"
  accent: "#f4f1ea"
  accent-hover: "#ffffff"
  glow: "#fff3df"
  glow-soft: "#ffd6a0"
  glow-active: "#ffe2b8"
  nebula-indigo: "#222e68"
  nebula-umber: "#62361c"
  brand-tick: "#ff5a3c"
  stamp-light: "#f6f4ee"
  data-hard: "#3ecf8e"
  review-success-bg: "#0f241b"
  review-success-fg: "#5fd39a"
  review-warning-bg: "#2a2010"
  review-warning-fg: "#ecbd55"
  review-error-bg: "#2e1513"
  review-error-fg: "#ff7f70"
  danger-hover: "#ffa296"
  danger-solid: "#ff6b5e"
  shadow-black: "#000000"
typography:
  title:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "2.625rem"
    fontWeight: 400
    lineHeight: 1.18
    letterSpacing: "-0.028em"
  section:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "1.375rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  drawer-title:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  brand:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Display\", \"PingFang SC\", sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  control:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "1rem"
    fontWeight: 550
    lineHeight: 1.5
    letterSpacing: "0em"
  meta:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 550
    lineHeight: 1.4
    letterSpacing: "0em"
  floor:
    fontFamily: "\"Google Sans Flex\", \"HarmonyOS Sans SC\", -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    fontSize: "0.875rem"
    fontWeight: 550
    lineHeight: 1.4
    letterSpacing: "0em"
  mono:
    fontFamily: "\"SF Mono\", \"JetBrains Mono\", Menlo, Monaco, Consolas, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.68
    letterSpacing: "0em"
rounded:
  xs: "6px"
  sm: "8px"
  md: "10px"
  stamp: "13px"
  lg: "14px"
  pill: "999px"
  full: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "22px"
  xl: "32px"
  2xl: "40px"
  3xl: "56px"
components:
  topbar:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    height: "68px"
  button-primary:
    backgroundColor: "{colors.solid}"
    textColor: "{colors.on-solid}"
    typography: "meta"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.solid-hover}"
    textColor: "{colors.on-solid}"
  button-primary-hero:
    backgroundColor: "{colors.solid}"
    textColor: "{colors.on-solid}"
    typography: "control"
    rounded: "{rounded.sm}"
    padding: "12px 22px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "meta"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
    height: "46px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.ink}"
  chip-verified:
    backgroundColor: "{colors.review-success-bg}"
    textColor: "{colors.review-success-fg}"
    typography: "meta"
    rounded: "{rounded.xs}"
    padding: "5px 11px"
  chip-meta:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.muted}"
    typography: "meta"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  chip-preset:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    typography: "meta"
    rounded: "{rounded.sm}"
    padding: "7px 12px"
    height: "42px"
  chip-preset-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.accent-hover}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "control"
    rounded: "{rounded.sm}"
    padding: "9px 13px"
    height: "44px"
  report-stamp:
    backgroundColor: "{colors.stamp-light}"
    textColor: "{colors.on-solid}"
    rounded: "{rounded.stamp}"
    padding: "9px"
    width: "48px"
    height: "48px"
  card-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "28px"
  card-pane:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "22px"
  terminal-console:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink-soft}"
    typography: "mono"
    rounded: "{rounded.lg}"
---

# Design System: 心创云盘 (ShouYuLove Drive)

## Overview

**Creative North Star: "The Star-Track Night-Sky Directory"**

心创云盘 (`shouyulove-drive`) replicates the nocturnal architectural discipline of `Benchmarks' Last Exam` (`/zh/benchmarks/`): a `#05060b` deep-space canvas brushed with subtle starlight dots and indigo/umber nebula washes, `0.5px` structural hairlines (`--line: #1c1f2a`, `--line-strong: #2a2e3b`), warm `#f4f1ea` primary ink paired with `#fff3df` starlight glow, `#ff5a3c` emblem accent ticks, `#f6f4ee` ivory squircle icon stamps, and open hairline directories in place of boxed card walls.

Public copy remains concise, human, and free of filesystem/ops jargon—never displaying `/srv/drive` paths or hash internals. Right beneath the editorial left-right header (`<h1>心创云盘</h1>`, plain-language subtitle, and `48px` `#f4f1ea` login CTA), `#drive-overview.overview` renders a quiet full-width two-column `0.5px` hairline band modeled directly on `Benchmarks' Last Exam`: left column `存储空间` (`7px` `#3ecf8e -> #fff3df` `<progress>` bar plus tabular `已用空间`, `剩余可用`, `总容量`) and right column `云盘概览` (aggregate file/folder counts plus live sync timestamp). All Unified Passport sign-in, auto-registration, and account-switching actions open an in-page floating `<dialog class="syl-auth-modal">` (`ShouyuAuth.openModal`) right over `/drive/` with zero URL redirect. When an authorized member signs in, the guest directory hides immediately so `#view-console` places the open `网盘文件` hairline table right below `#drive-overview`, while administrative controls (`成员名单`, `空间扩展`, `Agent 接入令牌`) remain collapsed by default inside `<details id="admin-settings-drawer">`.

Every asset—including self-hosted `Google Sans Flex` and `HarmonyOS Sans SC` (`400 / 500 / 600–700`) WOFF2 faces, custom cloud-bracket SVG logo (`logo.svg` / `favicon.svg`), and `1.75px` UI icons—ships under a strict `'self'` Content Security Policy, while `branding/custom.css` brings the identical `#05060b`, `#0b0d14`, `#10131c`, `#f4f1ea`, `#d8d5cd`, and `#fff3df` palette into FileBrowser (`/drive/files/`).

**Key Characteristics:**
- Deep-space `#05060b` canvas layered with sparse CSS starlight (`body::before`), stepped obsidian surfaces (`#0b0d14` / `#0e1119` / `#10131c` / `#151924` / `#222838`), and `0.5px` structural hairlines (`#1c1f2a` / `#2a2e3b` / `#3a3f4f`).
- Warm alabaster ink (`#f4f1ea` / `#d8d5cd`) and cool slate muted text (`#a3a7b3`), ignited by `#fff3df` warm starlight hover rims and `#ff5a3c` cinnabar-orange brand ticks.
- Signature `#f6f4ee` warm-ivory squircle stamps (`48x48`, `13px` radius for guest feature rows; `40x40`, `10px` radius for root folder tiles) casting high-contrast dark icons (`#07080d` + `#ff5a3c`) off the night canvas.
- Variable typography combining self-hosted `Google Sans Flex` + `HarmonyOS Sans SC` (`--font` and `--font-brand`) and `SF Mono` / `JetBrains Mono` (`--font-mono`), preserving a strict `>= 15px` (`0.9375rem`) desktop floor and `>= 14px` (`0.875rem`) floor at `<= 380px`.
- Sticky translucent frosted glass `.topbar` (`backdrop-filter: blur(18px) saturate(1.5)` over `color-mix(in srgb, #05060b 82%, transparent)`) with a `1px` starlight beam under active/hovered navigation links.

## Colors

A dark-polarity obsidian system anchored on `#05060b` deep space, warm `#f4f1ea` ink, cool slate `#a3a7b3` metadata, `#f6f4ee` tactile light icon stamps, `#fff3df` starlight glow accents, and dark-tinted semantic status badges.

### Primary
- **Warm Alabaster Solid** (`#f4f1ea`): Primary CTA fills (`.primary-button`), primary headings, primary ink (`--ink`, `--solid`, `--accent`), FileBrowser primary `.button` fill, and active outline rings.
- **Starlight Warm Glow** (`#fff3df` `--glow`, `#ffd6a0` `--glow-soft` / `--glow-faint` alpha base): Hover fill for primary buttons (`--solid-hover`), focus border and `2px` `:focus-visible` outlines (`--glow`), active preset borders, `.page-nav` active underline beam, crisp `1px` hover rims, and FileBrowser focus/selection highlights (`#ffe2b8` on `:active`).
- **On-Solid Ink** (`#07080d`): High-contrast dark ink on `#f4f1ea` / `#fff3df` solid buttons and icon fills/strokes inside `#f6f4ee` squircle stamps.
- **Brand Cinnabar Tick** (`#ff5a3c`): Heart emblem and center bracket tick in `logo.svg` / `favicon.svg`, plus active dual-tone calibration ticks inside the three `#f6f4ee` capability stamps.

### Neutral
- **Deep Space Canvas** (`#05060b`): Root page ground (`--page`), `.agent-terminal` code backdrop, `.token-value` container, FileBrowser `header` and dialog input fills (`#000000` gradient fade mask / shadow base).
- **Obsidian Surface** (`#0b0d14`): Primary panel base (`--surface`), secondary button fill, text inputs, `.denied-panel` / `.admin-drawer` base, FileBrowser sidebar (`nav`), list rows, and `.card` modal surfaces.
- **Soft & Raised Obsidian** (`#0e1119` `--surface-soft` / `#10131c` `--surface-raised`): Hover wash gradient stop on open directory rows, notice banner, and document file tiles (`.file-row__tile--file`).
- **Hover & Selected States** (`#151924` `--surface-hover` / `#222838` `--selected` / `#3a4468` text `::selection`): Interactive hover surface for secondary controls/pills and selected capacity preset/FileBrowser items.
- **Ink Hierarchy** (`#f4f1ea` `--ink`, `#d8d5cd` `--ink-soft`, `#a3a7b3` `--muted`, `#7d8291` `--placeholder-ink`, `#5b6070` `--disabled-ink`): Tuned for high contrast and zero harsh glare against `#05060b`–`#10131c`.
- **Structural Hairlines** (`#1c1f2a` `--line`, `#2a2e3b` `--line-strong`, `#3a3f4f` `--field-edge`, `#6b7080` `--line-hover`): `0.5px` (`--hairline`) row separators, panel strokes, and input/button borders.
- **Ivory Stamp Light** (`#f6f4ee`): High-contrast warm-ivory squircle surface exclusive to `.report-project-icon` and `.file-row__tile--dir`.

### Semantic
- **Verified Mint Success** (`#3ecf8e` `--data-hard` / `#5fd39a` `--review-success-fg` / `#0f241b` `--review-success-bg`): Online status dot (`.status-dot.is-ok`), quota meter start stop, `.verified-pill`, `.token-secret-banner`, inline accepted emphasis, and FileBrowser upload progress bar.
- **Amber Nebula Warning** (`#ecbd55` `--review-warning-fg` / `#2a2010` `--review-warning-bg`): Non-whitelisted status dot (`.status-dot.is-warn`), `.review-outcome.doubtful`, and inline sync highlight.
- **Coral Danger / Error** (`#ff7f70` `--review-error-fg`, hover `#ffa296`, `#2e1513` `--review-error-bg`, `#ff6b5e` FileBrowser `.button--red`): Destructive removal links (`.action-link--danger`) and `.studio-notice[data-tone="error"]`.

### Named Rules
**The Starlight-Over-Obsidian Rule.** Deep-space `#05060b` and obsidian `#0b0d14`–`#10131c` layers frame warm `#f4f1ea` alabaster prose, leaving `#fff3df` glow exclusively for interactive focus/hover/beams and `#ff5a3c` strictly for emblem and stamp ticks.
**The Tactile Ivory Stamp Rule.** Directory tiles (`.file-row__tile--dir`) and visitor capability badges (`.report-project-icon`) flip polarity onto `#f6f4ee` warm ivory with `#07080d` strokes, anchoring visual hierarchy without boxing the surrounding `0.5px` open hairline rows.

## Typography

**Brand Lockup Font:** `"Google Sans Flex", "HarmonyOS Sans SC", -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif`
**Body & UI Font:** `"Google Sans Flex", "HarmonyOS Sans SC", -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif`
**Mono Font:** `"SF Mono", "JetBrains Mono", Menlo, Monaco, Consolas, monospace`

**Character:** Matches `Benchmarks' Last Exam` by self-hosting `Google Sans Flex` (variable UI/display sans) and `HarmonyOS Sans SC` (`400 / 500 / 600–700`) with Apple `SF Pro` / `PingFang SC` fallbacks, `font-variant-numeric: tabular-nums`, and `font-optical-sizing: auto` across the body and FileBrowser (`branding/custom.css`).

### Hierarchy
- **Display Title** (`400`, `--type-title: clamp(1.875rem, 3.4vw, 2.625rem)` / `30px`–`42px`, line-height `1.18`, tracking `-0.028em`): Editorial `<h1>心创云盘</h1>` rendered in solid warm alabaster `#f4f1ea` (`--ink`).
- **Section Heading** (`650`, `--type-section: clamp(1.25rem, 1.8vw, 1.375rem)` / `20px`–`22px`, line-height `1.3`, tracking `-0.02em`): Workspace `网盘文件`, denied panel heading, and drawer sub-pane `<h2>` titles.
- **Entry Heading** (`650`, `--type-heading: 1.25rem` / `20px` desktop, `1.125rem` / `18px` at `<= 720px`, line-height `1.4`, tracking `-0.02em`): Guest open directory row `<h2>` titles.
- **Drawer Summary Title** (`650`, `1.125rem` / `18px`): Collapsible `<summary>` label `.admin-drawer__title`.
- **Brand & Body** (`650` at `1.0625rem` / `17px` on `.brand-name`; `400` / `550` at `--type-body: 1.0625rem` / `17px` desktop stepping to `1rem` / `16px` at `<= 720px`, line-height `1.65`–`1.7`): Hero lead (`max-width: 48ch`), directory descriptions, file names, masked console phone, and empty states.
- **Control & Mobile Body** (`400` / `550` / `650`, `1rem` / `16px`): Hero primary CTA (`.primary-button--hero`), `<input>` fields, `.record-row__title`, and `branding/custom.css` FileBrowser base font.
- **Meta, Nav & Buttons** (`550` / `650`, `--type-meta: 0.9375rem` / `15px` desktop, `0.875rem` / `14px` absolute floor at `<= 380px`): `.page-nav` links, `.account-pill`, `.nav-tool-btn`, standard `.primary-button` / `.secondary-button`, `.preset-chip`, `.meta-pill`, `.file-kind-pill`, `.site-footer`, FileBrowser `.item` / `.button` (`15px`).
- **Monospace Code** (`400`, `0.9375rem` / `15px`, line-height `1.68`): `.token-value`, `.record-row__code`, and `.agent-terminal__pre`.

### Named Rules
**The 14px Minimum Legibility Floor.** Auxiliary labels, navigation items, chips, buttons, and FileBrowser rows hold `0.9375rem` (`15px`) on desktop and never drop below `--type-meta: 0.875rem` (`14px`) inside `@media (max-width: 380px)`—zero sub-`14px` text anywhere.
**The Variable Font & Tabular Discipline.** `Google Sans Flex` and `HarmonyOS Sans SC` drive headings (`450` / `650`) and body prose (`400` / `550`) with `font-variant-numeric: tabular-nums`.

## Layout

Centered single-column editorial container (`.page`) capped at `max-width: 1280px` with responsive horizontal padding (`--side: clamp(20px, 4vw, 56px)`, tightening to `14px` at `<= 380px`) and `padding: 40px var(--side) 56px` (`28px var(--side) 44px` at `<= 720px`). Sticky `.topbar-inner` matches `max-width: 1280px` and `min-height: 68px` (wrapping to `98px` two-row layout at `<= 960px` where `.page-nav` shifts onto its own full-width row with `100%` `0.5px` divider).

The page header (`.home-heading`) arranges copy (`flex: 1 1 420px`) on the left and visitor CTA or logged-in `.home-heading__console` (`verified-strip` + `action-cluster`) on the right (`align-items: flex-end`, `gap: 24px 32px`). Below, unauthenticated visitors see `#guest-bento.reports`—an open hairline list bordered only at the top (`0.5px solid #2a2e3b`) with `0.5px solid #1c1f2a` row separators. Authorized members instead mount `#view-console.workbench-stack` (`gap: 36px`), placing `.results` (`网盘文件`, three-column `.workbench-toolbar`, and `.results-table`) first, followed by collapsed `<details id="admin-settings-drawer">` (expanding into `.split-workbench` `repeat(2, minmax(0, 1fr))` at `gap: 20px` plus full-width `.workbench-pane`).

Key breakpoints sit at `960px` (wrapped two-row header, single-column `.workbench-toolbar` and `.split-workbench`), `736px` (FileBrowser mobile drawer background), `720px` (stacked `.home-heading`, `44px` report stamps, `1rem` body / `1.125rem` entry heading, full-width toolbars, stacked `.file-row` and `.record-row`), and `380px` (`14px` gutters, `0.875rem` `--type-meta` floor, single-column `.preset-group`).

## Elevation & Depth

Spatial hierarchy merges subtle ambient night-sky light, translucent frosted navigation, warm specular top edges, and deep ambient shadows under high-contrast stamps:

- **Sticky Frosted Topbar (`.topbar`):** Explicitly uses translucent glassmorphism—`background: color-mix(in srgb, var(--page) 82%, transparent)` paired with `-webkit-backdrop-filter: blur(18px) saturate(1.5)` and `backdrop-filter: blur(18px) saturate(1.5)` plus `border-bottom: 0.5px solid #1c1f2a`—so scrolling directory rows diffuse cleanly beneath the sticky `68px` header.
- **Nocturnal Starlight Field (`body::before`):** Layered multi-scale `1px`–`1.5px` radial star points (`rgba(255,255,255,0.28–0.55)`, `rgba(255,240,214,0.42)`, `rgba(190,210,255,0.36–0.5)`) and dual upper nebula washes (`rgba(34, 46, 104, 0.42)` top-right indigo, `rgba(98, 54, 28, 0.2)` top-left umber) masked smoothly downward over `#05060b`.
- **Warm Specular Hairlines & Crisp Rim Elevation:** `.denied-panel::before` and `.admin-drawer::before` draw centered `1px` warm specular top glints (`color-mix(in srgb, var(--glow) 80% / 65%, transparent)`); `.page-nav a::after` draws a `1px` `#fff3df` horizontal gradient beam; `.primary-button:hover` combines a crisp `1px` warm rim (`0 0 0 1px color-mix(in srgb, var(--glow) 45%, transparent)`) with neutral offset elevation (`0 8px 24px rgba(0, 0, 0, 0.45)`); `input:focus` adds `0 0 0 3px var(--glow-faint)`; `.status-dot.is-ok` / `.is-warn` add crisp `2px` status rings.
- **Elevated Stamps & FileBrowser Modals:** `.report-project-icon` rests at `0 0 0 0.5px rgba(255, 255, 255, 0.22), 0 8px 28px rgba(0, 0, 0, 0.5)` and lifts on hover to `0 0 0 1px color-mix(in srgb, var(--glow) 72%, transparent), 0 10px 28px rgba(0, 0, 0, 0.56)`; `.file-row__tile--dir` casts `0 0 0 0.5px rgba(255, 255, 255, 0.2), 0 6px 18px rgba(0, 0, 0, 0.45)`; FileBrowser modal `.card` (`branding/custom.css`) floats with `0 30px 90px rgba(0, 0, 0, 0.62)`.

### Named Rules
**The Frosted Topbar & Specular-Line Rule.** Only `.topbar` uses `backdrop-filter: blur(18px) saturate(1.5)` over `82%` `#05060b`; secondary panels (`.denied-panel`, `.admin-drawer`, `.workbench-pane`) use flat obsidian fills, `0.5px` `#2a2e3b` borders, and subtle warm top-edge specular glints instead of frosted glass.

## Shapes

Sharp-yet-tactile architectural radii scaled strictly by control role:
- `6px` (`xs`): Status and micro-reference pills (`.verified-pill`, `.review-outcome`, `.file-kind-pill`, `.record-row__code`).
- `8px` (`sm`, `--control-radius`): Buttons (`.primary-button`, `.secondary-button`, `.terminal-copy-btn`), inputs, `.preset-chip`, `.nav-tool-btn`, `.page-nav a`, `.account-pill`, `.file-row`, `.studio-notice`, `.token-value`, and FileBrowser `#search #input` / `.button` / `.card input`.
- `10px` (`md`): Root workspace file/folder tiles (`.file-row__tile`) and FileBrowser `#listing .item`.
- `13px` (`stamp`): Warm ivory capability stamps (`.report-project-icon`).
- `14px` (`lg`, `--panel-radius`): Architectural containers (`.denied-panel`, `.report-item` hover bleed, `.admin-drawer`, `.workbench-pane`, `.agent-terminal`, and FileBrowser `.card`).
- `999px` (`pill`) / `50%` (`full`): `.meta-pill`, `.quota-meter`, and circular `.status-dot` indicators.

UI iconography relies on inline `1.75px` round-cap/round-join stroke SVGs (`20x20` controls and file tiles, `18x18` record/verified icons, `17x17` search icon; `2.0px`/`2.2px` dual-tone strokes inside `32x32` guest stamps), paired with the `46x32` custom `logo.svg` / `favicon.svg` fixed-color cloud-bracket mark (`#f4f1ea` + `#ff5a3c`).

## Components

### Buttons
- **Shape & Sizing:** `--control-radius` (`8px`), `white-space: nowrap`; `.primary-button` / `.secondary-button` hold `46px` min-height (`10px 18px` padding, `0.9375rem`, `650`), while `.primary-button--hero` steps up to `48px` (`12px 22px`, `1rem`, `650`).
- **Primary:** Solid warm alabaster `#f4f1ea` with `#07080d` ink; hovers (`160ms`/`200ms ease-out`) to `#fff3df` with `0 0 0 1px color-mix(in srgb, var(--glow) 45%, transparent), 0 8px 24px rgba(0, 0, 0, 0.45)`, presses active to `#ffe2b8`, and shifts button arrow icons `3px` right on `.btn-icon--shift`.
- **Secondary & Links:** `.secondary-button` uses `#0b0d14` fill, `0.5px solid #3a3f4f`, and `#f4f1ea` ink, shifting on hover to `#151924` / `#6b7080`. Inline `.action-link` (`40px` min-height, `6px 10px`, `0.9375rem`) uses `#d8d5cd` (`#fff3df` hover on `#151924`; danger variant `#ff7f70` -> `#ffa296` on `#2e1513`).

### Chips
- **Status & Metadata:** `.verified-pill` pairs `#0f241b` with `#5fd39a` (`6px` radius, `5px 11px`); `.review-outcome.doubtful` pairs `#2a2010` with `#ecbd55` (`6px` radius, `3px 9px`); `.meta-pill` uses `#151924` fill, `0.5px solid #2a2e3b`, `#a3a7b3` ink (`999px` pill); `.file-kind-pill` uses `#10131c` + `#2a2e3b` (`6px` radius).
- **Preset Chips:** `.preset-chip` (`42px` min-height, `7px 12px`, `8px` radius) pairs `#0b0d14` fill and `0.5px solid #3a3f4f` with `#d8d5cd` ink, switching to `#222838` fill, `#fff3df` border, and `#ffffff` text when `.is-selected`.

### Cards / Containers
- **Open Hairline Lists:** `.reports` and `.results` never wrap items in card boxes; rows sit directly on `#05060b` beneath a `0.5px solid #2a2e3b` top border with straight container-aligned `0.5px solid #1c1f2a` dividers (`.report-entry`, `.file-entry`) and subtle horizontal hover wash (`linear-gradient(90deg, #0e1119, transparent 85%)`).
- **Architectural Panels & Hairline Drawer:** `.denied-panel` (`28px` padding) and `<details id="admin-settings-drawer">` use `14px` radius, `0.5px solid #2a2e3b` border, `linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.008) 70%), #0b0d14`, and top specular glint; inside `.admin-drawer__body`, `.workbench-pane` sections stay unboxed and separated purely by `0.5px` hairlines (`cubic-bezier(0.16, 1, 0.3, 1)` reveal). FileBrowser `.card` overlays match `#0b0d14` + `0.5px solid #2a2e3b` + `14px` radius.

### Inputs / Fields
- **Style & Focus:** `44px` min-height, `9px 13px` padding (`38px` left padding in `.search-field`, `44px` right padding in `.unit-input`), `8px` radius, `#0b0d14` fill, `0.5px solid #3a3f4f` stroke, `1rem` (`16px`) `#f4f1ea` text, and `#7d8291` placeholders. Hover shifts border to `#6b7080`; focus lights border to `#fff3df` with `0 0 0 3px var(--glow-faint)`; `:focus-visible` uses `2px solid #fff3df` (`outline-offset: 3px`).
- **Error & Quota:** `.studio-notice[data-tone="error"]` renders `#2e1513` fill, `0.5px solid rgba(255, 127, 112, 0.4)`, and `#ff7f70` ink; `<progress class="quota-meter">` fills a `#0b0d14` pill track with `linear-gradient(90deg, #3ecf8e, #fff3df)`.

### Navigation
- **Sticky Translucent Topbar:** `68px` min-height `.topbar` with frosted `color-mix(in srgb, #05060b 82%, transparent)` + `blur(18px) saturate(1.5)` backdrop. Left `.nav-brand` pairs `46x32` `logo.svg` with `1.0625rem` (`650`) wordmark `心创云盘`; `.page-nav` aligns `0.9375rem` links (`44px` touch height, `#a3a7b3` -> `#ffffff`) underscored by a `1px` `#fff3df` starlight beam (`opacity: 1` on `aria-current="page"`); right `.nav-tools` joins behind a `0.5px solid #2a2e3b` divider with `.account-pill` (`7px` status dot) and `.nav-tool-btn` (`#d8d5cd` -> `#fff3df`).

### Open Hairline Directory & Collapsible Settings Drawer
- **Guest Capability Directory (`.reports`):** Three open hairline entries (`网页随时存取`, `全组实时共享`, `Agent 协同读写`) led by `48x48` `#f6f4ee` warm ivory squircle stamps (`13px` radius, `6px` padding) with bold `#07080d` / `#ff5a3c` solid-and-tick instrument emblems and inline `.review-status` semantic accents. Hidden immediately on member sign-in.
- **File Workbench & Collapsible Drawer (`#view-console`):** `.results` leads with `#05060b`-native `.file-entry` + `.file-row` items (`40x40` `10px`-radius `#f6f4ee` folder tiles vs. `#10131c` document tiles). `<details id="admin-settings-drawer">` stays collapsed until clicked, revealing unboxed hairline-divided `.workbench-pane` sections for whitelist management, `60–500 GB` quota resizing, and the `#05060b` `.agent-terminal` `curl` block.

## Do's and Don'ts

### Do:
- **Do** anchor every view on `#05060b` deep-space canvas, `#0b0d14`–`#10131c` obsidian panels, `0.5px` `#1c1f2a` / `#2a2e3b` hairlines, `#f4f1ea` ink, and `#fff3df` warm starlight focus/hover rims.
- **Do** keep `.topbar` sticky translucent glass (`backdrop-filter: blur(18px) saturate(1.5)`) with `1px` warm underline beams, while keeping secondary panels flat obsidian with `0.5px` strokes.
- **Do** spotlight folders and visitor capability entries using `#f6f4ee` warm-ivory squircle stamps (`13px` and `10px` radius) with `#07080d` and `#ff5a3c` accents, keeping directory rows borderless with open hairlines.
- **Do** enforce `Google Sans Flex` + self-hosted `HarmonyOS Sans SC`, `1.0625rem` (`17px`) desktop body copy, `0.9375rem` (`15px`) buttons/nav/metadata, and the `0.875rem` (`14px`) absolute mobile floor (`<= 380px`).
- **Do** keep `branding/custom.css` synchronized pixel-for-token with `#05060b`, `#0b0d14`, `#f4f1ea`, `#d8d5cd`, `#fff3df`, `#3ecf8e`, and `#ff6b5e`, and collapse transitions to `0.01ms` under `prefers-reduced-motion: reduce`.

### Don't:
- **Don't** box directory rows (`.report-entry`, `.file-row`, `.record-row`) inside full card borders or drop shadows—preserve open `0.5px` hairline rows on `#05060b`.
- **Don't** render any text smaller than `0.875rem` (`14px`) or place eyebrow/kicker labels above `<h1>心创云盘</h1>`.
- **Don't** expose server filesystem paths (`/srv/drive`), ports, or cryptographic internals (`SHA-256`) in the public UI, and **never** navigate away from `/drive/` to `/auth/` for login or account switching—always open `dialog.syl-auth-modal` in-page.
- **Don't** apply `backdrop-filter` blur to `.denied-panel`, `.admin-drawer`, `.workbench-pane`, or `.file-row`—reserve glassmorphism strictly for `.topbar`.
- **Don't** reference external CDN fonts, icon libraries, or inline `<script>`/`<style>` blocks that break the strict `'self'` Content Security Policy.
