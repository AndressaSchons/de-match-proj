import Link from "next/link";
import { FaPaw, FaTriangleExclamation, FaCircleInfo, FaCircleCheck } from "react-icons/fa6";
import styles from "./NotificationCard.module.css";

const ICONS = {
  animal:  FaPaw,
  alerta:  FaTriangleExclamation,
  info:    FaCircleInfo,
  sucesso: FaCircleCheck,
};

const COLORS = {
  animal:  "var(--color-green)",
  alerta:  "#d97706",
  info:    "var(--color-green-dark)",
  sucesso: "var(--color-green)",
};

// Prefixos visuais amigáveis por tipo
const PREFIX = {
  animal:  "Novo",
  alerta:  "Incompleto",
  info:    "Info",
  sucesso: "OK",
};

export function NotificationCard({ tipo = "info", mensagem, href }) {
  const Icon = ICONS[tipo] ?? ICONS.info;
  const color = COLORS[tipo] ?? COLORS.info;
  const prefix = PREFIX[tipo] ?? "";

  // Extrai só o nome do animal da mensagem (remove prefixos redundantes como "Incompleto: ")
  const cleanMsg = mensagem
    .replace(/^incompleto:\s*/i, "")
    .replace(/^novo animal:\s*/i, "")
    .replace(/^novo:\s*/i, "");

  const inner = (
    <>
      <Icon className={styles.icon} style={{ color }} />
      <span className={styles.text}>
        <span className={styles.prefix} style={{ color }}>{prefix}: </span>
        {cleanMsg}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${styles.card} ${styles.cardLink}`}>
        {inner}
      </Link>
    );
  }

  return <div className={styles.card}>{inner}</div>;
}