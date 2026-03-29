"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        setMessage("");
        setForgotOpen(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleSetNewPassword(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (newPassword.length < 6) {
      setMessage("A nova senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setRecoveryMode(false);
    setNewPassword("");
    setConfirmNewPassword("");
    setMessage("Senha redefinida. Você já pode entrar com a nova senha.");
    setLoading(false);
    router.refresh();
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const redirectTo = `${window.location.origin}/login`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Se o e-mail existir, enviaremos um link para redefinir a senha.");
    setForgotOpen(false);
    setLoading(false);
  }

  if (recoveryMode) {
    return (
      <main style={{ maxWidth: 420, margin: "4rem auto", padding: "1rem" }}>
        <h1>Nova senha</h1>
        <p style={{ marginTop: "0.5rem", color: "#666" }}>
          Defina uma senha nova para sua conta.
        </p>

        <form
          onSubmit={handleSetNewPassword}
          style={{ marginTop: "1rem", display: "grid", gap: "0.7rem" }}
        >
          <input
            type="password"
            placeholder="Nova senha"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmNewPassword}
            onChange={(event) => setConfirmNewPassword(event.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>

        {message ? <p style={{ marginTop: "0.8rem" }}>{message}</p> : null}
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 420, margin: "4rem auto", padding: "1rem" }}>
      <h1>Entrar</h1>
      <p style={{ marginTop: "0.5rem", color: "#666" }}>
        O acesso é concedido pelo administrador. Use o e-mail e a senha enviados ou definidos para
        você.
      </p>

      {!forgotOpen ? (
        <form onSubmit={handleLogin} style={{ marginTop: "1rem", display: "grid", gap: "0.7rem" }}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Processando…" : "Entrar"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleForgotPassword}
          style={{ marginTop: "1rem", display: "grid", gap: "0.7rem" }}
        >
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
            Informe o e-mail da sua conta. Você receberá um link para redefinir a senha (confira o
            spam).
          </p>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="username"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Enviando…" : "Enviar link"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForgotOpen(false);
              setMessage("");
            }}
            style={{ marginTop: "0.25rem" }}
          >
            Voltar ao login
          </button>
        </form>
      )}

      {!forgotOpen ? (
        <button
          type="button"
          onClick={() => {
            setForgotOpen(true);
            setMessage("");
          }}
          style={{ marginTop: "0.8rem", display: "block", background: "none", border: "none", padding: 0, cursor: "pointer", color: "#2563eb", textDecoration: "underline" }}
        >
          Esqueci minha senha
        </button>
      ) : null}

      {message ? <p style={{ marginTop: "0.8rem" }}>{message}</p> : null}
    </main>
  );
}
