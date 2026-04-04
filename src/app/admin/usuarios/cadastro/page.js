import { CriarContaForm } from "./criar-conta-form";

export const metadata = {
  title: "Cadastro Usuário",
};

export default async function AdminUsuariosPage() {
  return <CriarContaForm />;
}