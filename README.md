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

## Coisas úteis

- Primeiro **admin** da conta: dá pra subir com `UPDATE` na tabela `perfil` (tem exemplo nos `.sql` da pasta do banco).
- Se der erro ao mudar `perfil_acesso` no SQL Editor, roda o script **`corrigir_trigger_primeiro_admin.sql`**.
- Voluntário precisa da policy certa pra cadastrar animal: **`atualizar_rls_animal_voluntario.sql`** se o banco foi criado antes dessa mudança.

Qualquer dúvida, mexe no `.env` e confere se o banco tá igual ao `schemaBD.sql`.
