// src/components/protection/SeguroCard.tsx

import { Trash2, Pencil } from "lucide-react";
import styles from "./SeguroCard.module.css";
import type { ItemSeguro } from "../../types/database";

interface SeguroCardProps {
  seguro: ItemSeguro;
  nomeSegurado: string;
  onDelete: (id: number) => void;
  onEdit: (item: ItemSeguro) => void; // <--- Nova Prop
}

export function SeguroCard({
  seguro,
  nomeSegurado,
  onDelete,
  onEdit,
}: SeguroCardProps) {
  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.badge}>{nomeSegurado}</span>
        <div style={{ display: "flex", gap: "4px" }}>
          {/* Botão EDITAR */}
          <button
            onClick={() => onEdit(seguro)}
            className={styles.deleteButton} // Reusando estilo do botão (podemos criar classe actionButton se preferir)
            title="Editar"
            style={{ color: "#64748b" }} // Cor neutra para edição
          >
            <Pencil size={18} />
          </button>

          {/* Botão EXCLUIR */}
          <button
            onClick={() => {
              if (confirm("Tem certeza que deseja excluir esta proteção?")) {
                onDelete(seguro.id);
              }
            }}
            className={styles.deleteButton}
            title="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className={styles.cardContent}>
        <h4 className={styles.cardTitle}>{seguro.nome}</h4>

        {seguro.valor_mensal && seguro.valor_mensal > 0 && (
          <p className={styles.cardSubtitle}>
            Custo: {formatMoney(seguro.valor_mensal)}/mês
          </p>
        )}

        {seguro.tipo_vigencia === "termo" && seguro.prazo_anos && (
          <p
            className={styles.cardSubtitle}
            style={{ fontSize: "0.8rem", marginTop: 2 }}
          >
            Vigência: {seguro.prazo_anos} anos
          </p>
        )}
      </div>

      <div className={styles.cardFooter}>
        <p className={styles.footerLabel}>Cobertura</p>
        <p className={styles.footerValue}>{formatMoney(seguro.cobertura)}</p>
      </div>
    </div>
  );
}
