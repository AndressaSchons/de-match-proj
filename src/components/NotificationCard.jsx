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
  alerta:  "var(--color-gold)",
  info:    "var(--color-green-dark)",
  sucesso: "var(--color-green)",
};

/**
 * @param {"animal"|"alerta"|"info"|"sucesso"} tipo
 * @param {string} mensagem
 */
export function NotificationCard({ tipo = "info", mensagem }) {
  const Icon = ICONS[tipo] ?? ICONS.info;
  const color = COLORS[tipo] ?? COLORS.info;

  return (
    <div className={styles.card}>
      <Icon className={styles.icon} style={{ color }} />
      <span className={styles.text}>{mensagem}</span>
    </div>
  );
}