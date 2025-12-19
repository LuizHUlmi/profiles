// src/components/financial/FluxoCaixaCard.tsx

import { TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
import type { ItemFluxoCaixa, Familiar } from "../../types/database";
import styles from "./FluxoCaixaCard.module.css";

interface FluxoCaixaCardProps {
  item: ItemFluxoCaixa;
  familiares: Familiar[];
  onEdit: (item: ItemFluxoCaixa) => void;
  onDelete: (id: number) => void;
}

export function FluxoCaixaCard({
  item,
  familiares,
  onEdit,
  onDelete,
}: FluxoCaixaCardProps) {
  const isReceita = item.tipo === "receita";

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  // Helper para nome do proprietário
  const getProprietarioLabel = () => {
    if (item.proprietario_tipo === "titular") return "Titular";
    if (item.proprietario_tipo === "casal") return "Casal";
    if (item.proprietario_tipo === "familia") return "Família";
    if (item.proprietario_tipo === "dependente") {
      return (
        familiares.find((f) => f.id === item.familiar_id)?.nome || "Familiar"
      );
    }
    return "Outros";
  };

  const detalhesTempo =
    item.inicio_tipo === "ano"
      ? `${item.inicio_valor} (${item.duracao_anos} anos)`
      : `${item.inicio_valor} anos (${item.duracao_anos} anos)`;

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.infoGroup}>
          <div
            className={`${styles.iconContainer} ${
              isReceita ? styles.iconReceita : styles.iconDespesa
            }`}
          >
            {isReceita ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>

          <div className={styles.textInfo}>
            <h3 className={styles.title} title={item.descricao}>
              {item.descricao}
            </h3>
            <span
              className={styles.subtitle}
              title={`${getProprietarioLabel()} | ${detalhesTempo}`}
            >
              {getProprietarioLabel()} | {detalhesTempo}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => onEdit(item)}
            className={styles.actionBtn}
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => {
              if (confirm("Tem certeza que deseja excluir?")) onDelete(item.id);
            }}
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <span className={styles.valueLabel}>Valor Mensal</span>
        <span
          className={`${styles.value} ${
            isReceita ? styles.valReceita : styles.valDespesa
          }`}
        >
          {formatCurrency(item.valor_mensal)}
        </span>
      </div>
    </div>
  );
}
