# Skuy Ongkir: Backend

Express 5 + TypeScript REST API. Contract: [../docs/API.md](../docs/API.md). Design notes: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

```bash
cp .env.example .env   # fill in the keys
npm install
npm run dev            # http://localhost:3000/api/health
```

Scripts: `dev` (watch mode), `build`, `start`, `typecheck`, `lint`, `test`.

Run `../supabase/schema.sql` in your Supabase project first. Tests need no network or database: they use in-memory fakes.
