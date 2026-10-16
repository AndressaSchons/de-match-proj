import { createClient } from "@/utils/supabase/server";
import { carregarConfiguracaoSistema } from "@/lib/configuracao-sistema";
import { ConfiguracoesForm } from "./configuracoes-form";

export const metadata = {
  title: "Configurações do sistema",
};

// Acesso restrito pelo `admin/layout.js` (somente administrador).
export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const configuracao = await carregarConfiguracaoSistema(supabase);

  return <ConfiguracoesForm configuracao={configuracao} />;
}
