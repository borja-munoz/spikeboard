# Spikeboard — Volleyball Scoreboard PWA: Implementation Plan

## Context

**Spikeboard** is a mobile-first Progressive Web App for tracking volleyball match scores in real time. The primary use case is a referee or player tracking scores courtside on a phone — so the UI must be fast (minimal taps to start), intuitive (swipe gestures), and work offline.

---

## Tech Stack Decision

**Recommended: React 18 + Vite + TypeScript**

Rationale:
- **Vite** offers the best-in-class DX and build performance for SPAs.
- **`vite-plugin-pwa`** provides first-class PWA support (service worker, manifest, offline caching) with minimal config.
- **React** has the richest ecosystem for gesture libs, state management, and UI components.
- **TypeScript** for type-safe match state and configuration.

Supporting libraries:
| Concern | Library | Reason |
|---|---|---|
| Styling | **Tailwind CSS v4** | Utility-first, easy dark mode, no runtime overhead |
| Gestures | **@use-gesture/react** | Handles swipe up/down, drag, tap — composable hooks |
| Animation | **Framer Motion** | Smooth score transitions, set win celebrations |
| State | **Zustand** | Simple global store for match state; persists to localStorage |
| PWA | **vite-plugin-pwa** | Service worker + Web App Manifest auto-generation |
| i18n | **i18next + react-i18next** | Mature, offline-capable, supports lazy-loaded locale files |
| Icons | **Lucide React** | Clean, consistent icon set |

Alternative considered: **SvelteKit** — leaner bundle, but smaller gesture/animation ecosystem. Not worth the trade-off here.

---

## Application Structure

```
src/
  components/
    ScorePanel/       # Per-team score display + gesture zone
    SetTracker/       # Set score dots/numbers
    MatchHeader/      # Match timer, set indicator, menu
    ConfigSheet/      # Bottom sheet for match settings
    SetWinOverlay/    # Animated overlay on set/match win
  store/
    matchStore.ts     # Zustand store: match state + actions
    settingsStore.ts  # Persisted user preferences (includes language)
  hooks/
    useSwipeScore.ts  # @use-gesture hook for swipe-to-score
  types/
    match.ts          # Match, Set, Team, Config types
  i18n/
    index.ts          # i18next init, language detection
    locales/
      en.json         # English strings
      es.json         # Spanish strings
  App.tsx
  main.tsx
```

---

## Configuration Options (in-app)

- Match format: Best of 1, Best of 3, or Best of 5 sets
- Points to win a regular set (default: 25)
- Minimum lead to win a set (default: 2)
- Points to win a tie-break set (default: 15)
- Minimum lead to win a tie-break (default: 2)
- Team names (optional, quick to set or skip)
- Sound effects toggle
- Language (English / Spanish; defaults to browser locale)

---

## Milestones

### Milestone 1 — Project Bootstrap
**Goal:** A running Vite + React + TypeScript app with PWA baseline, installable on Android/iOS.

- Init Vite project with React + TypeScript template
- Add Tailwind CSS v4
- Configure `vite-plugin-pwa` with manifest (name, icons, theme color, display: `standalone`)
- Set up basic service worker for offline shell caching
- Set up `i18next` + `react-i18next` with `en.json` and `es.json` locale files
- Configure automatic language detection from browser locale (`navigator.language`), falling back to English
- Add `.gitignore`, `README.md`
- Verify installability on a mobile device

**Done when:** App installs to home screen, loads offline, and renders in the correct language based on browser locale.

---

### Milestone 2 — CI/CD: GitHub Actions → GitHub Pages
**Goal:** Every push to `main` automatically builds and deploys the app to `https://borja-munoz.github.io/spikeboard`.

- Set `base: '/spikeboard/'` in `vite.config.ts` so all asset paths are correct under the subdirectory
- Create `.github/workflows/deploy.yml` with:
  - Trigger: `push` to `main`
  - Steps: checkout → setup Node (22) + pnpm → `pnpm install` → `pnpm build` → deploy `dist/` to GitHub Pages using `actions/deploy-pages`
- Use the official `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages` actions (no third-party deploy action needed)
- Set `permissions: pages: write, id-token: write` so the workflow can publish

**GitHub account setup required (one-time):**
1. Go to the repo **Settings → Pages**
2. Under *Build and deployment*, set Source to **GitHub Actions**
3. No token configuration needed — the built-in `GITHUB_TOKEN` is sufficient

**Done when:** Pushing to `main` triggers the workflow and the live URL is accessible and installable as a PWA.

---

### Milestone 3 — Core Score Tracking UI
**Goal:** Two-panel layout showing live score, with tap/button controls to increment/decrement.

- Design the main scoreboard layout (two large score panels side by side, landscape-friendly)
- Score panels show: current set points (large), sets won (small indicators)
- Buttons: `+1`, `-1` per team (as fallback for non-gesture users)
- Zustand store with actions: `addPoint(team)`, `removePoint(team)`, `resetMatch()`
- Automatic set-end detection: when a team reaches win condition (with lead check)
- Automatic match-end detection: when a team wins required number of sets
- Visual indicator for which team is serving (tap to switch)

**Done when:** A full match can be tracked manually with buttons.

---

### Milestone 4 — Gesture Controls
**Goal:** Swipe up anywhere in a team's panel to add a point; swipe down to remove one.

- Implement `useSwipeScore` hook using `@use-gesture/react`
- Vertical swipe threshold: ~50px to register a point change
- Visual feedback: brief scale/flash animation on score change (Framer Motion)
- Haptic feedback via `navigator.vibrate()` on point registration
- Prevent accidental swipes: require intentional vertical direction, ignore horizontal

**Done when:** Score can be updated entirely by swiping — no buttons needed.

---

### Milestone 5 — Match Configuration & Quick Start
**Goal:** New match flow that takes ≤3 taps to start with default settings.

- Home screen: "Start Match" button launches immediately with last-used settings
- Optional bottom sheet (slide up) for configuration before starting:
  - Team names
  - Sets to win
  - Points per set / tie-break rules
- "Use defaults" skips config entirely
- Language selector in the config sheet (English / Español)
- Settings persisted in `localStorage` via Zustand middleware (including chosen language)
- "Reset Match" confirmation dialog

**Done when:** A match can be started in one tap and configured in one sheet, with all text in the selected language.

---

### Milestone 6 — Set/Match Win Feedback & Polish
**Goal:** Satisfying feedback on set and match completion; polished UI.

- `SetWinOverlay`: full-screen animated overlay on set win (team name, confetti or similar)
- Match win screen: final score summary, option to start a new match
- Score number uses large, bold font — readable from a few meters
- Dark mode support (respects system preference via Tailwind `dark:`)
- Smooth score change animations (Framer Motion number flip or scale)
- PWA update prompt when a new version is deployed
- Test on iOS Safari and Android Chrome

**Done when:** App feels complete and polished end-to-end.

---

### Milestone 7 — Match History (Optional / Stretch)
**Goal:** Persist and review completed match records.

- Store completed match results in `localStorage`
- History screen: list of past matches with date, teams, final score
- Clear history option

**Done when:** Past matches are visible and browsable.

---

## Key UX Decisions

| Decision | Choice | Reason |
|---|---|---|
| Gesture model | Swipe up = +1, swipe down = -1 | Natural, mirrors "raising" a score |
| Panel layout | Side-by-side halves | Each player "owns" their side |
| Start speed | One-tap start with defaults | Courtside use requires no friction |
| Offline | Full offline via service worker | No connectivity guarantee in gyms |
| No accounts | Pure local state | No auth complexity, privacy-friendly |
| i18n default | Auto-detect from browser locale | Zero friction for Spanish/English users; falls back to English |
| Translation scope | All UI strings (labels, overlays, config, confirmations) | Score numbers are universal — no translation needed there |

---

## Verification Checklist

- [ ] App installs to home screen (Android Chrome + iOS Safari)
- [ ] App loads and is fully functional with no network connection
- [ ] Swipe up/down reliably registers ±1 point with haptic feedback
- [ ] Set win detection triggers correctly including deuce (lead check)
- [ ] Tie-break set uses configured points threshold
- [ ] Match ends correctly when sets-to-win threshold is reached
- [ ] Configuration persists across app restarts
- [ ] Dark mode matches system preference
- [ ] Score is readable at arm's length (minimum 80px font size)
- [ ] No accidental point changes from horizontal scrolling gestures
- [ ] App defaults to Spanish when browser locale is `es` or `es-*`
- [ ] App defaults to English for all other locales
- [ ] Language can be manually overridden in the config sheet
- [ ] Language choice persists across app restarts
- [ ] All UI strings (labels, overlays, dialogs) are translated in both locales
- [ ] No hardcoded English strings outside locale files
- [ ] Push to `main` triggers the GitHub Actions workflow
- [ ] Build succeeds in CI and `dist/` is deployed to GitHub Pages
- [ ] `https://borja-munoz.github.io/spikeboard` loads correctly
- [ ] PWA is installable from the GitHub Pages URL
- [ ] All assets (JS, CSS, icons) load without 404 under the `/spikeboard/` base path
