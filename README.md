# De Match — Sistema de gestão de canil (ONG)

Aplicação web para apoiar uma ONG no **cadastro e acompanhamento de animais**, **controle de adoções**, **perfis de equipe** e **painéis operacionais** (notificações e métricas). Desenvolvido no contexto acadêmico (IFRS — Colli's group corporation).

## Acesso

| Ambiente | URL |
|----------|-----|
| **Hospedagem oficial (produção)** | [https://de-match-proj.vercel.app/](https://de-match-proj.vercel.app/) |
| **Desenvolvimento local** | [http://localhost:3000](http://localhost:3000) (após `npm run dev`) |

Na produção, rotas privadas exigem login. Usuários da equipe usam conta criada no Supabase Auth.

---

## Para que serve

O sistema centraliza o dia a dia da ONG em um único lugar:

- **Registrar animais** com ficha completa (foto, história, saúde, localização, disponibilidade para adoção).
- **Acompanhar pendências** na home (animais novos e cadastros incompletos).
- **Registrar adoções** com termo anexado e atualização automática do status do animal.
- **Administrar usuários** (apenas administrador): criar contas, alterar perfil, redefinir senha.
- **Consultar métricas de adoção** (administrador e validador): totais por ano e por mês.

---

## Stack utilizada

| Camada | Tecnologia |
|--------|------------|
| Framework front / back (App Router) | [Next.js](https://nextjs.org/) 16 |
| UI | [React](https://react.dev/) 19 + CSS Modules |
| Ícones | [react-icons](https://react-icons.github.io/react-icons/) |
| Banco, autenticação e arquivos | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, RLS) |
| Hospedagem | [Vercel](https://vercel.com/) |
| Testes unitários | [Vitest](https://vitest.dev/) |
| Testes funcionais (E2E) | [Playwright](https://playwright.dev/) |
| Qualidade web | [Google Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) |
| Lint | ESLint (eslint-config-next) |

**Requisito de runtime:** Node.js `>= 20.19.0`

---

## Perfis de acesso

| Perfil | O que pode fazer (resumo) |
|--------|---------------------------|
| **Voluntário** | Cadastrar e editar animais; ver notificações; ver lista e fichas |
| **Validador** | Tudo do voluntário + métricas de adoção na home + ver termo de adoção |
| **Administrador** | Tudo do validador + excluir animal + gerenciar usuários + cadastro de adoção e usuários |

Regras detalhadas estão no banco (RLS) e em `src/lib/permissions.js` / `src/lib/animal-constants.js`.

---

## Funcionalidades principais

### Autenticação e conta

- Login com e-mail e senha (Supabase Auth).
- Recuperação de senha por e-mail.
- Página **Minha conta** (`/conta`): editar nome e alterar senha.

### Home (`/`)

- Lista resumida dos animais mais recentes.
- **Notificações:** animais cadastrados nos últimos 3 dias; alertas de cadastro incompleto (campos obrigatórios para ficha completa).
- **Métricas de adoção** (admin e validador): total geral, por ano e por mês do ano corrente.
- Atalhos laterais conforme o perfil.

### Animais (`/animais`)

- Listagem com filtros visuais de disponibilidade.
- **Cadastro** (`/animais/cadastro`): nome, foto (Storage), sexo, porte, castração, situação, data de nascimento, raça, localização, vacinação, história e observações.
- **Ficha** (`/animais/[id]`): visualização completa; termo de adoção (admin/validador, se adotado).
- **Edição** (`/animais/[id]/editar`): mesmos campos do cadastro.
- **Exclusão:** somente administrador.

### Adoções (admin)

- **Cadastrar adoção** (`/admin/adocoes/cadastro`): vincula adotante, animal e termo (PDF/imagem no bucket `adocao-termos`); marca o animal como adotado.

### Administração de usuários (admin)

- **Criar usuário** (`/admin/usuarios/cadastro`) — exige `SUPABASE_SERVICE_ROLE_KEY` no servidor.
- **Gerenciar usuários** (`/admin/usuarios/gerenciar`): listar, filtrar por perfil, editar perfil e nome.
- **Perfil do usuário** (`/admin/usuarios/[id]`): detalhes e ações administrativas.

---

## Estrutura do repositório (visão geral)

```
src/
  app/              # Rotas Next.js (páginas e Server Actions)
  components/       # UI reutilizável (nav, cards, formulários, métricas)
  lib/              # Regras de negócio (validação, notificações, permissões)
  utils/supabase/   # Clientes Supabase (browser, server, middleware)
supabase/sql bd/    # Schema PostgreSQL, RLS, buckets Storage
e2e/                # Testes Playwright
```

---

## Como configurar (desenvolvimento local)

### 1. Dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Copie `.env.example` para `.env` na raiz e preencha:

| Variável | Obrigatória | Uso |
|----------|-------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anon (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Para admin de usuários | Criar/editar usuários no painel admin |
| `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` | Só para testes E2E | Usuário de teste no Supabase |

No **Vercel**, configure as mesmas variáveis em *Project Settings → Environment Variables* (não commite o `.env`).

### 3. Banco de dados (Supabase)

No **SQL Editor**, na ordem:

1. `supabase/sql bd/limpar banco.sql` — apenas se quiser zerar o banco.
2. `supabase/sql bd/schemaBD.sql` — tabelas, RLS e políticas principais.
3. `supabase/sql bd/storage_animal_fotos.sql` — bucket `animal-fotos`.
4. `supabase/sql bd/storage_adocao_termos.sql` — bucket `adocao-termos`.

Scripts auxiliares (se necessário):

- `corrigir_trigger_primeiro_admin.sql` — erro ao definir primeiro admin.
- `atualizar_rls_animal_voluntario.sql` — banco antigo sem permissão de voluntário em `animal`.

### 4. Primeiro administrador

Crie um usuário no Supabase Auth, faça login uma vez e execute no SQL Editor um `UPDATE` em `perfil` (exemplos nos `.sql` da pasta do banco) para `perfil_acesso = 'administrador'`.

### 5. Subir o app

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Sem sessão, o middleware redireciona para `/login`.

### Build de produção (local)

```bash
npm run build
npm run start
```

---

## Storage (fotos e termos)

### Fotos dos animais — bucket `animal-fotos`

- Público para leitura; upload por usuários autenticados.
- A coluna `animal.foto` guarda a URL pública retornada pelo upload no cadastro/edição.

### Termos de adoção — bucket `adocao-termos`

- Termo anexado no cadastro de adoção; URL gravada em `adocao.termo_adocao`.

Sem login válido e buckets configurados, upload falha — confira RLS e `.env` na mesma origem do app.

---

## Scripts npm

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor após build |
| `npm run lint` | Análise estática (ESLint) |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:watch` | Vitest em modo watch |
| `npm run test:e2e` | Testes funcionais (Playwright) |
| `npm run lighthouse` | Relatório Lighthouse (app rodando em `localhost:3000`) |

---

## Testes automatizados

Pacote mínimo para documentação acadêmica e garantia de qualidade.

| Tipo | O que verifica | Ferramenta | Comando |
|------|----------------|------------|---------|
| **Unitário** | Regras isoladas (notificações, validação de animal, permissões) | Vitest | `npm test` |
| **Funcional / E2E** | Login e cadastro de animal com notificação na home | Playwright | `npm run test:e2e` |
| **Qualidade web** | Performance, acessibilidade e boas práticas | Lighthouse | `npm run lighthouse` |
| **Estático** | Padrões de código | ESLint | `npm run lint` |

### Testes unitários

Arquivos em `src/lib/*.test.js` (12 testes): notificações, `animal-form-parse`, permissões.

Configuração: `vitest.config.mjs`.

### Testes funcionais (E2E)

Cenários em `e2e/`:

1. **login.spec.js** — equipe faz login e vê a home (“Animais”).
2. **cadastro-animal.spec.js** — cadastro mínimo e card “Novo:” na home.

Requer `E2E_USER_EMAIL` e `E2E_USER_PASSWORD` no `.env`. Primeira execução:

```bash
npx playwright install chromium
npm run test:e2e
```

**Problemas comuns (E2E):** credenciais inválidas (HTTP 400 no Supabase); variáveis vazias no `.env`.

### Lighthouse

Com `npm run dev` em outro terminal:

```bash
npm run lighthouse
```

Gera `lighthouse-report.html`. Em ambiente sem login, `/` redireciona para `/login` — mencione isso no relatório se auditar a home.

---

## Dúvidas frequentes

- **App em branco ou erro de env:** confira `.env` e variáveis no Vercel.
- **Upload de foto falha:** bucket `animal-fotos` + scripts SQL de Storage + usuário logado.
- **Voluntário não cadastra animal:** rode `atualizar_rls_animal_voluntario.sql` se o schema for antigo.
- **Painel admin de usuários:** precisa de `SUPABASE_SERVICE_ROLE_KEY` no servidor.

---

## Créditos

Desenvolvido por **IFRS – Colli's group corporation**.
