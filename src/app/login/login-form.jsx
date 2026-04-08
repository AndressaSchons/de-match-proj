"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import styles from "./login-form.module.css";

/** Evita open redirect: só caminhos relativos na mesma origem. */
function safeRedirectPath(next) {
  if (!next || typeof next !== "string") return "/";
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  return trimmed;
}

/* ─── Logo ─────────────────────────────────────────────── */
function Logo() {
  return (
    <div className={styles.logoWrap}>
      <img src="/logo.png" alt="De Match Logo" className={styles.logoImg} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail]                           = useState("");
  const [password, setPassword]                     = useState("");
  const [newPassword, setNewPassword]               = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading]                       = useState(false);
  const [message, setMessage]                       = useState("");
  const [recoveryMode, setRecoveryMode]             = useState(false);
  const [forgotOpen, setForgotOpen]                 = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
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

    if (error) { setMessage(error.message); setLoading(false); return; }

    router.push(safeRedirectPath(searchParams.get("next")));
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

    if (error) { setMessage(error.message); setLoading(false); return; }

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

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) { setMessage(error.message); setLoading(false); return; }

    setMessage("Se o e-mail existir, enviaremos um link para redefinir a senha.");
    setForgotOpen(false);
    setLoading(false);
  }

  /* ── Recovery ─────────────────────────────────────────── */
  if (recoveryMode) {
    return (
      <div className={styles.page}>
        <form onSubmit={handleSetNewPassword} className={styles.card}>
          <Logo />

          <div className={styles.field}>
            <label className={styles.label}>Nova senha</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirmar nova senha</label>
            <input
              type="password"
              placeholder="Repita a senha"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.btnPrimary}
            style={{ opacity: loading ? 0.75 : 1 }}
          >
            {loading ? "Salvando…" : "SALVAR"}
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>

        <p className={styles.footer}>Desenvolvido por IFRS – Colli's group corporation</p>
      </div>
    );
  }

  /* ── Login / Forgot ───────────────────────────────────── */
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo />

        {!forgotOpen ? (
          /* ── Login form ── */
          <form onSubmit={handleLogin} className={styles.innerForm}>
            <div className={styles.field}>
              <label className={styles.label}>Login</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.btnPrimary}
              style={{ opacity: loading ? 0.75 : 1 }}
            >
              {loading ? "Processando…" : "ENTRAR"}
            </button>

            <button
              type="button"
              onClick={() => { setForgotOpen(true); setMessage(""); }}
              className={styles.btnLink}
            >
              Esqueci a senha
            </button>
          </form>
        ) : (
          /* ── Forgot form ── */
          <form onSubmit={handleForgotPassword} className={styles.innerForm}>
            <p className={styles.hint}>
              Informe o e-mail da sua conta. Você receberá um link para redefinir a senha (confira o spam).
            </p>

            <div className={styles.field}>
              <label className={styles.label}>Login</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.btnPrimary}
              style={{ opacity: loading ? 0.75 : 1 }}
            >
              {loading ? "Enviando…" : "ENVIAR"}
            </button>

            <button
              type="button"
              onClick={() => { setForgotOpen(false); setMessage(""); }}
              className={styles.btnLink}
            >
              Voltar ao login
            </button>
          </form>
        )}

        {message && <p className={styles.message}>{message}</p>}
      </div>

      <p className={styles.footer}>Desenvolvido por IFRS – Colli's group corporation</p>
    </div>
  );
}