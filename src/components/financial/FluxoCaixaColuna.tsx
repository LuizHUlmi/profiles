// src/components/financial/FluxoCaixaColuna.tsx

import { Button } from "../ui/button/Button";

import { Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import type { ItemFluxoCaixa, Familiar } from "../../types/database";
import styles from "./FluxoCaixaColuna.module.css";
import { FluxoCaixaCard } from "./FluxoCaixaCard";

interface FluxoCaixaColunaProps {
  tipo: "receita" | "despesa";
  items: ItemFluxoCaixa[];
  total: number;
  loading: boolean;
  familiares: Familiar[];
  onAdd: () => void;
  onEdit: (item: ItemFluxoCaixa) => void;
  onDelete: (id: number) => void;
}

export function FluxoCaixaColuna({
  tipo,
  items,
  total,
  loading,
  familiares,
  onAdd,
  onEdit,
  onDelete,
}: FluxoCaixaColunaProps) {
  const isReceita = tipo === "receita";

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  return (
    <div className={styles.column}>
      {/* CABEÇALHO */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3
            className={`${styles.title} ${
              isReceita ? styles.titleReceita : styles.titleDespesa
            }`}
          >
            {isReceita ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {isReceita ? "Receitas" : "Despesas"}
          </h3>
          <span
            className={`${styles.totalBadge} ${
              isReceita ? styles.badgeReceita : styles.badgeDespesa
            }`}
          >
            {formatCurrency(total)}
          </span>
        </div>

        <Button
          size="sm"
          onClick={onAdd}
          icon={<Plus size={16} />}
          variant={isReceita ? "success" : "danger"}
        >
          Nova
        </Button>
      </div>

      {/* LISTA */}
      <div className={styles.listContainer}>
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}
          >
            <Loader2 className="animate-spin" style={{ margin: "0 auto" }} />
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyMessage}>
            Nenhuma {isReceita ? "receita" : "despesa"} cadastrada.
          </div>
        ) : (
          items.map((item) => (
            <FluxoCaixaCard
              key={item.id}
              item={item}
              familiares={familiares}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
