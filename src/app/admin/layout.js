import { getAdminUserOrRedirect } from "@/lib/auth/require-admin";

export default async function AdminLayout({ children }) {
  await getAdminUserOrRedirect();

  return <>{children}</>;
}