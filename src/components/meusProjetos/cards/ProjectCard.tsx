// src/components/meusProjetos/ProjectCard.tsx

import { Trash2, Pencil } from "lucide-react";
import styles from "./ProjectCard.module.css";

type ProjectCardProps = {
  title: string;
  value: number;
  details?: string;

  // MUDANÇA: Recebe o estado de fora
  isChecked: boolean;
  onToggle: (checked: boolean) => void;

  onEdit: () => void;
  onDelete: () => void;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ProjectCard({
  title,
  value,
  details,
  isChecked, // Agora vem via prop
  onToggle, // Agora vem via prop
  onEdit,
  onDelete,
}: ProjectCardProps) {
  return (
    <div
      className={`${styles.projectCard} ${
        isChecked ? "" : styles.inactiveCard
      }`}
    >
      <div className={styles.cardHeader}>
        <h5>{title}</h5>

        <div className={styles.cardControls}>
          {/* Toggle Controlado */}
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onToggle(e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>

          <button
            className={styles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Editar"
          >
            <Pencil size={16} />
          </button>

          <button
            className={`${styles.iconButton} ${styles.deleteButton}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className={styles.cardValue}>{currencyFormatter.format(value)}</p>

      {details && (
        <div className={styles.cardDetail}>
          <span>{details}</span>
        </div>
      )}
    </div>
  );
}
