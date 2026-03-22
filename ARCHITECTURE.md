# Architecture

Key design and technology decisions for Spikeboard.

---

## Build tool: Vite

Vite was chosen over Create React App (unmaintained) and webpack-based toolchains for its near-instant dev server (native ESM, no bundling on startup) and fast production builds via Rollup. It also has first-class TypeScript support without extra configuration.

---

## PWA: vite-plugin-pwa

`vite-plugin-pwa` generates the Web App Manifest and registers a Workbox-powered service worker at build time. It integrates directly into the Vite pipeline so there is no separate build step or manual service worker authoring. The `autoUpdate` register type silently installs new versions in the background and activates them on the next page load.

---

## Styling: Tailwind CSS v4

Tailwind's utility-first approach keeps styles co-located with markup and eliminates dead CSS at build time. v4 is configured via a Vite plugin (`@tailwindcss/vite`) rather than a `tailwind.config.js` file, which simplifies setup. Dark mode is handled via the `dark:` variant tied to the system preference media query.

---

## State management: Zustand

Zustand was chosen over React Context + `useReducer` and Redux Toolkit. Match state (scores, sets, serving) is a single, relatively flat object that doesn't benefit from React's rendering model — it needs to be read and mutated by several unrelated components. Zustand provides a plain JavaScript store with React hooks, no boilerplate, and a `persist` middleware for `localStorage`. Bundle size is ~1 kB.

Two stores are in use:
- **`matchStore`** — in-memory only; holds the live match state and all scoring actions. Intentionally not persisted: a page reload always starts fresh.
- **`settingsStore`** — persisted to `localStorage` under the key `spikeboard-settings` via the `persist` middleware; holds `MatchConfig` (team names, format, points, leads). Changes are written immediately on every update, so settings survive page reloads and app reinstalls.

Language preference is handled separately by i18next (see below) and is not stored in either Zustand store.

---

## Internationalization: i18next + react-i18next

i18next supports offline-capable, synchronous initialization with bundled locale files (no network fetch needed). The `i18next-browser-languagedetector` plugin reads `navigator.language` and a `localStorage` key so the correct language is applied before the first render — no flash of wrong language. Only English and Spanish are supported; all UI strings live in `src/i18n/locales/`.

Calling `i18n.changeLanguage()` at runtime (from the language toggle in the config sheet) immediately re-renders all components that use `useTranslation()`, and the detector plugin persists the choice to `localStorage` under `spikeboard-language` automatically. No manual persistence code is needed.

---

## Gestures: @use-gesture/react

`@use-gesture/react` provides composable gesture hooks that normalize pointer, touch, and mouse events. The `useSwipeScore` hook uses `useDrag` with `axis: 'lock'`, which locks each gesture to the dominant axis — a swipe that starts horizontally never accidentally registers as a point. A secondary guard rejects drags where horizontal displacement exceeds half the vertical, catching diagonal touches. A 50 px vertical threshold must be crossed before a point is committed. `touch-action: none` is applied to each panel so the browser does not intercept the gesture for scrolling.

---

## Animations: Framer Motion

Framer Motion was preferred over pure CSS animations because it supports spring physics, layout animations, and unmount animations (`AnimatePresence`) without manual class toggling.

Currently used in two places:
- **Score number** — `motion.div` keyed on the score value; every change triggers a spring pop (scale 1.25 → 1).
- **Config sheet and reset dialog** — `AnimatePresence` drives mount/unmount; the sheet slides up from the bottom (`y: 100% → 0`) and the dialog scales in (`scale: 0.92 → 1`), both using spring transitions.

Set-win overlay transitions are planned for a later milestone.

---

## Deployment: GitHub Actions → GitHub Pages

The app is a fully static SPA with no server component, so GitHub Pages is a natural fit: free, reliable, and deploys directly from the repository. The workflow (`push` to `main`) uses the official `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages` actions with the built-in `GITHUB_TOKEN` — no third-party deploy action or personal access token is required. `base: '/spikeboard/'` in `vite.config.ts` ensures all asset paths are correct under the subdirectory.

---

## No backend / no accounts

Match state is kept entirely in browser memory (Zustand) and optionally persisted to `localStorage`. There is no server, database, or authentication. This eliminates latency, privacy concerns, and infrastructure cost. The target use case — someone tracking scores courtside — has no need for data to leave the device.

---

## Portrait orientation lock

The PWA manifest sets `orientation: "portrait"`. A scoreboard split into two vertical halves works well in portrait; landscape would make each panel very short and the score hard to read. The layout uses `h-screen` and `flex-1` so it fills the display regardless of device height.
