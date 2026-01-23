// src/components/patrimonio/PatrimonioCard.tsx

import {
  Home,
  Car,
  TrendingUp,
  Landmark,
  CreditCard,
  DollarSign,
  Wallet,
  Pencil,
  Trash2,
  Briefcase,
} from "lucide-react";
import type { ItemAtivoPassivo } from "../../types/database";
import { BaseCard } from "../ui/card/BaseCard";
import styles from "./PatrimonioCard.module.css";

interface PatrimonioCardProps {
  item: ItemAtivoPassivo;
  onEdit: (item: ItemAtivoPassivo) => void;
  onDelete: (id: number) => void;
}

export function PatrimonioCard({
  item,
  onEdit,
  onDelete,
}: PatrimonioCardProps) {
  const isPassivo = item.categoria === "passivo";
  const isPrevidencia = item.tipo.toLowerCase().includes("previdência");
  const isInvestimento = [
    "renda fixa",
    "renda variável",
    "fundos",
    "investimento",
    "ação",
    "cdi",
  ].some((t) => item.tipo.toLowerCase().includes(t));

  // Identifica se é Imobilizado (Ativos Físicos)
  const isImobilizado = ["imóvel", "veículo", "casa", "carro", "terreno"].some(
    (t) => item.tipo.toLowerCase().includes(t),
  );

  const getIcon = (tipo: string) => {
    const t = tipo.toLowerCase();
    const props = { size: 24, strokeWidth: 1.5 };

    if (t.includes("imóvel") || t.includes("casa")) return <Home {...props} />;
    if (t.includes("veículo") || t.includes("carro")) return <Car {...props} />;
    if (t.includes("empresa")) return <Briefcase {...props} />;
    if (t.includes("previdência")) return <Landmark {...props} />;
    if (
      t.includes("cartão") ||
      t.includes("financiamento") ||
      t.includes("empréstimo")
    )
      return <CreditCard {...props} />;
    if (isInvestimento) return <TrendingUp {...props} />;

    return <DollarSign {...props} />;
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const getProprietarioLabel = () => {
    const map: Record<string, string> = {
      titular: "Titular",
      casal: "Ambos",
      dependente: "Dependente",
      familia: "Família",
    };
    return map[item.proprietario_tipo] || "Titular";
  };

  // Renderização do Subtítulo Dinâmico
  const renderSubtitle = () => (
    <div className={styles.subtitleContent}>
      <span>{getProprietarioLabel()}</span>
      <span> | </span>

      {/* 1. Previdência: Regime e Rentabilidade */}
      {isPrevidencia && (
        <>
          {item.regime_tributario && (
            <span style={{ textTransform: "capitalize" }}>
              {item.regime_tributario} |
            </span>
          )}
          {item.rentabilidade_valor !== null && (
            <span className={styles.highlightText}>
              {" "}
              {item.rentabilidade_valor}% a.a.
            </span>
          )}
        </>
      )}

      {/* 2. Investimento: Apenas Rentabilidade */}
      {!isPrevidencia &&
        isInvestimento &&
        item.rentabilidade_valor !== null && (
          <span className={styles.highlightText}>
            {item.rentabilidade_valor}% a.a.
          </span>
        )}

      {/* 3. NOVO: Imobilizado (Custos de Inventário) */}
      {isImobilizado && (
        <>
          <span>{item.tipo}</span>
          {/* Verifica se existem custos de inventário calculados no item */}
          {(item.itcmd_valor || item.advogado_valor) && (
            <>
              <span> | </span>
              <span className={styles.inventoryLabel}>
                Inventário:{" "}
                {formatCurrency(
                  (item.itcmd_valor || 0) + (item.advogado_valor || 0),
                )}
              </span>
            </>
          )}
        </>
      )}

      {/* 4. Caso Geral (Passivos e outros) */}
      {!isPrevidencia && !isInvestimento && !isImobilizado && (
        <span>{item.tipo}</span>
      )}
    </div>
  );

  return (
    <BaseCard
      variant={isPassivo ? "danger" : "default"}
      icon={getIcon(item.tipo)}
      title={item.nome}
      subtitle={renderSubtitle()}
      footerLabel={isPassivo ? "Saldo Devedor" : "Valor Estimado"}
      footerValue={formatCurrency(item.valor)}
      footerSecondaryValue={
        item.valor_parcela
          ? `Parcela: ${formatCurrency(item.valor_parcela)}`
          : undefined
      }
      actions={
        <div className={styles.actions}>
          <button
            onClick={() => onEdit(item)}
            className={styles.actionBtn}
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      }
    />
  );
}
