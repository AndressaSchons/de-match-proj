# de-match-proj

Projeto de sistema de canil (login, perfis, cadastro de animal). Stack: Next.js + Supabase.

## Passos para rodar o projeto

1. **`npm install`**
2. Criar **`.env`** na raiz (copia do `.env.example`) e **colocar as infos** do Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — só se for usar o painel de **criar usuário** (`/admin/usuarios`); pega em *Project Settings → API → service_role*
3. No Supabase (**SQL Editor**), montar o banco na ordem: **`limpar banco.sql`** e em seguida **`schemaBD.sql`** (ambos em `supabase/sql bd`). Só faz o passo do limpar se você quiser zerar o modelo; se for banco novo, pode ir direto no `schemaBD.sql` se já estiver vazio.
4. **`npm run dev`** e abrir o que o terminal mostrar (geralmente [http://localhost:3000](http://localhost:3000)).

## Fotos dos animais (Supabase Storage)

- No painel Supabase → **Storage**, crie um bucket público **`animal-fotos`** (ou rode o `INSERT` do arquivo abaixo).
- No **SQL Editor**, execute **`supabase/sql bd/storage_animal_fotos.sql`** depois do schema principal. Isso garante o bucket e as políticas RLS para usuários **autenticados** enviarem e lerem objetos nesse bucket.
- O cadastro/edição de animal envia a imagem pelo navegador (arrastar e soltar ou arquivo); a coluna `animal.foto` guarda a **URL pública** retornada pelo Storage. Sem login válido na mesma origem do app, o upload falha.

## Termo de adoção (Armazenamento fica no Supabase Storage)

- No painel Supabase → **Storage**, crie um bucket público **`adocao-termos`** (ou rode o `INSERT` do arquivo abaixo).
- No **SQL Editor**, execute **`supabase/sql bd/storage_adocao_termos.sql`** depois do schema principal. Isso cria o bucket e as policies RLS para usuários **autenticados** enviarem e lerem os termos.
- No cadastro de adoção, o campo `adocao.termo_adocao` armazena a **URL pública** do arquivo anexado.

## Coisas úteis

- Primeiro **admin** da conta: dá pra subir com `UPDATE` na tabela `perfil` (tem exemplo nos `.sql` da pasta do banco).
- Se der erro ao mudar `perfil_acesso` no SQL Editor, roda o script **`corrigir_trigger_primeiro_admin.sql`**.
- Voluntário precisa da policy certa pra cadastrar animal: **`atualizar_rls_animal_voluntario.sql`** se o banco foi criado antes dessa mudança.

Qualquer dúvida, mexe no `.env` e confere se o banco tá igual ao `schemaBD.sql`.

## Testes automatizados

O projeto inclui um pacote mínimo para trabalho acadêmico: **unitários**, **funcionais (E2E)**, **qualidade web (Lighthouse)** e **análise estática (ESLint)**.

### Tipos de teste (visão geral)

| Tipo | O que verifica | Ferramenta | Comando |
|------|----------------|------------|---------|
| **Unitário** | Funções e regras isoladas (notificações, validação de animal, permissões) | Vitest | `npm test` |
| **Funcional / E2E** | Fluxo completo no navegador (login, cadastro, notificação na home) | Playwright | `npm run test:e2e` |
| **Qualidade web** | Performance, acessibilidade e boas práticas da página | Google Lighthouse | `npm run lighthouse` |
| **Estático** | Padrões e erros de código no projeto | ESLint | `npm run lint` |

### Testes unitários (Vitest)

Arquivos em `src/lib/*.test.js`:

- `notificacoes-animais.test.js` — cadastro incompleto, mensagens e links de notificação
- `animal-form-parse.test.js` — validação do formulário de animal
- `permissions.test.js` — perfis (cadastro, exclusão, métricas)

```bash
npm test
```

Modo desenvolvimento (re-executa ao salvar):

```bash
npm run test:watch
```

### Testes funcionais / E2E (Playwright)

Requer usuário real no Supabase (voluntário, validador ou administrador). No `.env`:

```env
E2E_USER_EMAIL=seu@email.com
E2E_USER_PASSWORD=sua_senha
```

Cenários em `e2e/`:

1. **login.spec.js** — login e exibição da home
2. **cadastro-animal.spec.js** — cadastro mínimo e card “Novo:” na home

O Playwright sobe o `npm run dev` automaticamente. Para instalar o navegador na primeira vez:

```bash
npx playwright install chromium
npm run test:e2e
```

**Problemas comuns (E2E):**

- `waiting for getByLabel('Login')` — o `<label>` precisa estar ligado ao `<input>` (`htmlFor` / `id`); já corrigido em `login-form.jsx`.
- `HTTP 400` no login — e-mail ou senha errados em `E2E_USER_EMAIL` / `E2E_USER_PASSWORD`. Use um usuário que **existe no Supabase Auth** (Authentication → Users) e que faça login manualmente em `/login` com a mesma senha.
- Variáveis vazias — confira o `.env` na raiz (mesmos valores que você usa no app).

### Google Lighthouse

Com o app rodando (`npm run dev` em outro terminal):

```bash
npm run lighthouse
```

Gera `lighthouse-report.html` na raiz. Use um print do relatório no trabalho (scores de Performance, Accessibility, Best Practices).

### ESLint (análise estática)

```bash
npm run lint
```

Não executa o sistema; verifica o código-fonte antes de commitar.
