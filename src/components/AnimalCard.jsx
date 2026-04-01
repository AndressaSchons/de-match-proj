import { FaPaw } from "react-icons/fa6";
import styles from "./AnimalCard.module.css";

const BADGE = {
  adocao:     { label: "Adoção",     cls: "badgeAdocao"  },
  adotado:    { label: "Adotado",    cls: "badgeAdotado" },
  disponivel: { label: "Disponível", cls: "badgeAdocao"  },
};

const SEXO = {
  macho: "Macho",
  femea: "Fêmea",
};

const PORTE = {
  pequeno: "Pequeno",
  medio:   "Médio",
  grande:  "Grande",
};

function StatusBadge({ status }) {
  const config = BADGE[status] ?? { label: status, cls: "badgeAdocao" };
  return (
    <span className={`${styles.badge} ${styles[config.cls]}`}>
      {config.label}
    </span>
  );
}

/**
 * @param {{ id, nome_animal, disponibilidade, sexo, porte, foto }} animal
 */
export function AnimalCard({ animal }) {
  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        {animal.foto
          ? <img src={animal.foto} alt={animal.nome_animal} className={styles.img} />
          : <FaPaw className={styles.emoji} />
        }
      </div>

      <div className={styles.info}>
        <strong className={styles.name}>{animal.nome_animal}</strong>
        {animal.sexo  && <span>{SEXO[animal.sexo]   ?? animal.sexo}</span>}
        {animal.porte && <span>{PORTE[animal.porte]  ?? animal.porte}</span>}
      </div>

      <div className={styles.badgeWrap}>
        <StatusBadge status={animal.disponibilidade} />
      </div>
    </div>
  );
}