# de-match-proj

Base **Next.js (App Router) + Supabase Auth**: login em `/login`, área protegida em `/`.

## Requisitos

- **Node.js** `>= 20.19.0` (evita aviso de engine do ESLint e mantém alinhado com o ecossistema Next 16). Há um `.nvmrc` com `20.19.0` para quem usa nvm.

## Configuração

1. Copie as variáveis do seu projeto Supabase para `.env.local` (veja `.env.example`):

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. No painel do Supabase, configure e-mail/senha conforme o fluxo que você quer (confirmação de e-mail, etc.).

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

Abra [http://localhost:3000](http://localhost:3000) (ou a porta indicada no terminal).

## Estrutura útil

- `src/app/login/page.js` — entrar / criar conta
- `src/app/page.js` — home protegida (redireciona se não houver sessão)
- `src/proxy.js` + `src/utils/supabase/*` — sessão Supabase (convenção **Proxy** do Next 16)

`next.config.mjs` define `turbopack.root` na pasta do projeto para evitar confusão quando existir outro `package-lock.json` acima (ex.: na pasta do usuário).
