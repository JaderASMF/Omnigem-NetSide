# Plantoes Monorepo

Estrutura inicial: frontend (Next.js + React) e backend (NestJS) com Prisma + PostgreSQL.

Passos iniciais:

1. Ajustar `DATABASE_URL` em `.env`.
2. Rodar no root:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

3. Em terminais separados:

```bash
npm run dev:backend
npm run dev:frontend
```

Backend: `http://localhost:3001`
Frontend: `http://localhost:3000`
