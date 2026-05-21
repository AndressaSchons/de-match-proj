import styles from "./MetricsCard.module.css";

/**
 * @param {{
 *   totalGeral: number,
 *   anoReferencia: number,
 *   porAno: Array<{ ano: number, total: number }>,
 *   porMesAnoAtual: Array<{ mes: number, label: string, total: number }>,
 * }} props
 */
export function MetricsCard({ totalGeral, anoReferencia, porAno, porMesAnoAtual }) {
  if (totalGeral === 0) {
    return <p className={styles.empty}>Nenhuma adoção registrada.</p>;
  }

  return (
    <div className={styles.content}>
      <p className={styles.total}>
        <span className={styles.totalNum}>{totalGeral}</span>
        <span className={styles.totalLabel}>
          {totalGeral === 1 ? "adoção" : "adoções"}
        </span>
      </p>

      {porAno.length > 0 ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Por ano</h3>
          <ul className={styles.list}>
            {porAno.map(({ ano, total }) => (
              <li key={ano} className={styles.row}>
                <span>{ano}</span>
                <span className={styles.count}>{total}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {porMesAnoAtual.length > 0 ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Em {anoReferencia}</h3>
          <ul className={styles.list}>
            {porMesAnoAtual.map(({ mes, label, total }) => (
              <li key={mes} className={styles.row}>
                <span>{label}</span>
                <span className={styles.count}>{total}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
