import Link from "next/link";
import { getAdminUserOrRedirect } from "@/lib/auth/require-admin";

export default async function AdminLayout({ children }) {
  await getAdminUserOrRedirect();

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "1rem 1rem 2rem" }}>
      <p style={{ margin: "0 0 1rem", fontSize: "0.9rem" }}>
        <Link href="/" style={{ color: "#2563eb" }}>
          ← Início
        </Link>
        {" · "}
        <strong>Administração</strong>
      </p>
      {children}
    </div>
  );
}
