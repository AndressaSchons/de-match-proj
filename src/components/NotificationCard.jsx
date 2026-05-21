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
  alerta:  "var(--color-gold)",
  info:    "var(--color-green-dark)",
  sucesso: "var(--color-green)",
};

/**
 * @param {{
 *   tipo?: "animal"|"alerta"|"info"|"sucesso",
 *   mensagem: string,
 *   href?: string,
 * }} props
 */
export function NotificationCard({ tipo = "info", mensagem, href }) {
  const Icon = ICONS[tipo] ?? ICONS.info;
  const color = COLORS[tipo] ?? COLORS.info;

  const inner = (
    <>
      <Icon className={styles.icon} style={{ color }} />
      <span className={styles.text}>{mensagem}</span>
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
