# Spikeboard

A mobile-first Progressive Web App for tracking volleyball match scores in real time.

## Features

- Swipe up/down on each team's panel to add or remove a point
- Automatic set and match win detection (with configurable lead rules)
- Match formats: Best of 1, Best of 3, Best of 5
- Configurable points per set and tiebreak rules
- Full offline support (PWA)
- Available in English and Spanish (auto-detected from browser locale)
- Dark mode (follows system preference)

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [@use-gesture/react](https://use-gesture.netlify.app/) for swipe gestures
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
- [i18next](https://www.i18next.com/) for internationalisation

## Requirements

- Node 22.12+
- pnpm

## Development

```bash
# Use the correct Node version
nvm use

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```
