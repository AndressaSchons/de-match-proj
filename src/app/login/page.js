import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata = {
  title: "Login",
};

function LoginFallback() {
  return (
    <main style={{ minHeight: "50vh", display: "grid", placeItems: "center", padding: "1rem" }}>
      <p style={{ color: "#666" }}>Carregando…</p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}