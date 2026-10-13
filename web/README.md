# CekOngkirAI: Web

React 19 + Vite + TypeScript single-page app.

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm install
npm run dev            # http://localhost:5173
```

Scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`.

Structure: `src/api` (typed client + endpoints) · `context` (auth, language) · `hooks` (state/side effects) · `components` (by feature, CSS modules) · `pages` · `layouts` · `i18n` · `utils`. See [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).
