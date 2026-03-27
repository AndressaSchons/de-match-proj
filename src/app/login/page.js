"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const authCall = isSignUp
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({ email, password });

    const { error } = await authCall;

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (isSignUp) {
      setMessage("Conta criada. Verifique seu e-mail para confirmar o acesso.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 420, margin: "4rem auto", padding: "1rem" }}>
      <h1>{isSignUp ? "Criar conta" : "Entrar"}</h1>
      <p style={{ marginTop: "0.5rem", color: "#666" }}>
        Base padrão com Supabase Auth para login e cadastro.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem", display: "grid", gap: "0.7rem" }}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processando..." : isSignUp ? "Criar conta" : "Entrar"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setIsSignUp((current) => !current);
          setMessage("");
        }}
        style={{ marginTop: "0.8rem" }}
      >
        {isSignUp ? "Já tenho conta" : "Quero criar conta"}
      </button>

      {message ? <p style={{ marginTop: "0.8rem" }}>{message}</p> : null}
    </main>
  );
}
