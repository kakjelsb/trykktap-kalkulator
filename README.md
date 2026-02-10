# Trykktap Kalkulator

A mobile-first web application for calculating pressure loss in firefighting water supply systems.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Development Workflow

The development server features **hot module replacement (HMR)**, meaning changes to your code are reflected instantly in the browser without a full page reload.

1. **Edit source files** in `src/` — changes appear immediately
2. **TypeScript errors** show in terminal and browser overlay
3. **Save a file** — browser updates automatically
4. **Add npm packages** — restart dev server after `npm install`

Useful commands during development:

```bash
npm run dev      # Start dev server with HMR
npm run lint     # Check for code issues
npm run build    # Type-check and create production build
```

### Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

The app automatically deploys to GitHub Pages when pushing to the `main` branch.

**Live site:** https://kakjelsb.github.io/trykktap-kalkulator/

### Manual Deployment

To deploy manually, go to the GitHub repository **Actions** tab and run the "Deploy to GitHub Pages" workflow.

### First-time Setup

If GitHub Pages is not yet configured for your repository:

1. Go to repository **Settings** → **Pages**
2. Under "Build and deployment", select **GitHub Actions** as the source

## Tech Stack

- React + TypeScript
- Vite
- React Flow (visual editor)
- Zustand (state management)
