// src/components/projects/ProjetoCard.tsx

import { Pencil, Trash2, Target, Calendar } from "lucide-react";
import type { Projeto } from "../../types/database";
import styles from "./ProjectCard.module.css";

interface ProjetoCardProps {
  projeto: Projeto;
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjetoCard({
  projeto,
  isActive,
  onToggle,
  onEdit,
  onDelete,
}: ProjetoCardProps) {
  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className={styles.card}>
      {/* LINHA SUPERIOR */}
      <div className={styles.topRow}>
        <div className={styles.infoGroup}>
          {/* Ícone Padrão do Sistema */}
          <div className={styles.iconContainer}>
            <Target size={20} />
          </div>

          <div className={styles.textInfo}>
            <h4 className={styles.title}>{projeto.nome}</h4>
            <div className={styles.subtitle}>
              <Calendar size={12} />
              <span>{projeto.ano_realizacao}</span>
              <span style={{ margin: "0 4px" }}>•</span>
              <span style={{ textTransform: "capitalize" }}>
                {projeto.prioridade}
              </span>
            </div>
          </div>
        </div>

        {/* SWITCH */}
        <label
          className={styles.switchLabel}
          title={isActive ? "Remover da Simulação" : "Incluir na Simulação"}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className={styles.switchInput}
            checked={isActive}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      {/* LINHA INFERIOR */}
      <div className={styles.bottomRow}>
        <div className={styles.valueGroup}>
          <span className={styles.valueLabel}>Custo Total</span>
          <span className={styles.value}>
            {formatMoney(projeto.valor_total)}
          </span>
        </div>

        <div className={styles.actions}>
          <button onClick={onEdit} className={styles.actionBtn} title="Editar">
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Excluir projeto?")) onDelete();
            }}
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
