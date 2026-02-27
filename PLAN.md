# Plano de Trabalho — Plantoes

Objetivo: implementar uma aplicação para gerenciar escalas de plantão com backend em NestJS + Prisma (Postgres) e frontend em Next.js (React). Começaremos pelo backend e depois pelo frontend.

1) Backend (prioridade)
- Definir o esquema do banco (Prisma): `User` (roles), `Worker`, `Holiday`, `RecurringPattern`, `Assignment` — já criado no `prisma/schema.prisma`.
- Implementar serviço Prisma (`PrismaService`) e rodar `prisma generate`.
- Autenticação simples: apenas uma conta `admin` (email+senha). Usuários não autenticados -> `guest` (apenas leitura).

- Autenticação simples: apenas uma conta `admin` (email+senha). Na tela de login haverá um botão **Acessar como guest** que permite a qualquer pessoa entrar sem senha como `guest` (apenas leitura, sem permissões de alteração).
- Endpoints REST:
  - `POST /auth/login` — retorna token simples (JWT) para o admin.
  - `GET/POST/PUT/DELETE /workers` — CRUD de trabalhadores (admin).
  - `GET/POST/PUT/DELETE /holidays` — CRUD de feriados (admin).
  - `GET/POST/PUT/DELETE /recurring-patterns` — CRUD de padrões de recorrência (admin).
  - `GET/POST/DELETE /assignments` — ver/atribuir dias manualmente.
- Serviço de geração de escala:
  - Função que expande `RecurringPattern` em `Assignment` para um intervalo de datas.
  - Deve pular `Holiday` quando aplicável e permitir `override` manual (Assignment manual tem precedência).

2) Frontend (após backend mínimo)
- Páginas/Funcionalidades:
  - Login (apenas admin faz login).
  - Visualização de calendário mensal com as atribuições por dia.
  - Página de administração: gerenciar `Workers`, `Holidays`, `Recurring Patterns` e gerar escala para um mês.
  - Modo `guest`: leitura do calendário, sem botões de edição.

3) Banco de dados / regras de negócio importantes
- `RecurringPattern.weekdays` armazena dias da semana (0..6) e o gerador repete conforme o intervalo.
- `Assignment.date` é único — um dia tem, no máximo, uma atribuição.
- Feriados podem ser recorrentes todo ano (`recurring = true`).

4) Próximos passos imediatos (o que vou executar agora se você confirmar)
- Atualizar `DATABASE_URL` em `.env`.
- Rodar `npm install` no root e nas pastas `backend` e `frontend` se preferir instalar por workspace.
- Gerar client Prisma e criar a primeira migração:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5) Observações e perguntas rápidas
- Deseja que eu crie um script de seed que já insere uma conta `admin` (email e senha) padrão? Isso facilita testes.
- Quer que o gerador de escalas trate turnos (ex.: manhã/tarde/noite) agora, ou só nomear a pessoa por dia inicialmente?

---
Feito por: equipe inicial — iremos iterar conforme os requisitos e ajustes.
