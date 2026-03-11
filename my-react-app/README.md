# Chicken Farm NG — Landing Page

## Quick Start

```bash
cd my-react-app
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

## IMPORTANT: After Pulling / Merging

**Always run `npm install`** after pulling or merging to ensure all dependencies are installed. This project uses Tailwind CSS — if dependencies are missing, all styling breaks (buttons invisible, no colors, broken layout).

```bash
cd my-react-app
npm install
npm run dev
```

If styles still look broken, do a clean reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Key Dependencies

| Dependency | Purpose |
|---|---|
| `tailwindcss` (v3) | All styling — utility-first CSS framework |
| `postcss` + `autoprefixer` | CSS processing (required by Tailwind) |
| `@tailwindcss/forms` | Tailwind plugin for styled form inputs |
| `lucide-react` | SVG icon library |
| `react-router-dom` | Client-side routing |

## Config Files (do NOT delete)

- `tailwind.config.js` — Custom colors (`farmGreen`, `farmDark`, `farmLight`) + content paths
- `postcss.config.js` — PostCSS plugins (Tailwind + Autoprefixer)
- `src/index.css` — Tailwind directives + Google Fonts + custom classes

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
my-react-app/
├── public/images/          # All images (hero, products, logos, etc.)
├── src/
│   ├── components/
│   │   ├── layout/         # Header.tsx, Footer.tsx
│   │   ├── sections/       # Hero, Products, AboutUs, WhyChooseUs, etc.
│   │   └── ui/             # ProductCard.tsx
│   ├── pages/
│   │   └── LandingPage.tsx # Main page (assembles all sections)
│   ├── index.css           # Tailwind + fonts + custom CSS
│   ├── App.tsx             # Router setup
│   └── main.tsx            # Entry point
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Fonts (via Google Fonts CDN)

- **Inter** — Body text
- **Covered By Your Grace** — Handwritten labels (`font-handwritten`)
- **Playfair Display** — Serif headings (`font-heading`)

## Custom Tailwind Colors

- `farmGreen` → `#28a745`
- `farmDark` → `#1a1a1a`
- `farmLight` → `#f8f9fa`
