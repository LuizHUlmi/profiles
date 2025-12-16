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
import styles from "./PatrimonioCard.module.css";

interface PatrimonioCardProps {
  item: ItemAtivoPassivo & { saldo_devedor?: number };
  onEdit: (item: ItemAtivoPassivo) => void;
  onDelete: (id: number) => void;
}

export function PatrimonioCard({
  item,
  onEdit,
  onDelete,
}: PatrimonioCardProps) {
  const isPassivo = item.categoria === "passivo";

  const getIcon = (tipo: string) => {
    const t = tipo.toLowerCase();
    // Ícone fino e elegante (outline)
    const props = { size: 24, strokeWidth: 1.5 };

    if (t.includes("imóvel") || t.includes("imovel") || t.includes("casa"))
      return <Home {...props} />;

    if (t.includes("veículo") || t.includes("carro")) return <Car {...props} />;

    if (t.includes("empresa")) return <Briefcase {...props} />;

    if (t.includes("fundo") || t.includes("ação") || t.includes("investimento"))
      return <TrendingUp {...props} />;

    if (t.includes("previdência")) return <Landmark {...props} />;

    if (t.includes("conta")) return <Wallet {...props} />;

    if (t.includes("cartão") || t.includes("financiamento"))
      return <CreditCard {...props} />;

    return <DollarSign {...props} />;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const getProprietarioLabel = () => {
    if (!item.proprietario_tipo) return "Titular";
    const map: Record<string, string> = {
      titular: "Titular",
      casal: "Ambos",
      dependente: "Dependente",
      familia: "Família",
    };
    return map[item.proprietario_tipo] || item.proprietario_tipo;
  };

  return (
    <div className={styles.card}>
      {/* LINHA SUPERIOR: Ícone/Info (Esq) + Botões (Dir) */}
      <div className={styles.topRow}>
        {/* Grupo Esquerda */}
        <div className={styles.infoGroup}>
          <div
            className={`${styles.iconContainer} ${
              isPassivo ? styles.iconPassivo : ""
            }`}
          >
            {getIcon(item.tipo)}
          </div>

          <div className={styles.textInfo}>
            <h3 className={styles.title} title={item.nome}>
              {item.nome}
            </h3>
            <div
              className={styles.subtitle}
              title={`${getProprietarioLabel()} | ${item.tipo}`}
            >
              <span>{getProprietarioLabel()}</span>
              <span> | </span>
              <span>{item.tipo}</span>
            </div>
          </div>
        </div>

        {/* Grupo Direita (Ações) */}
        <div className={styles.actions}>
          <button
            onClick={() => onEdit(item)}
            className={styles.actionBtn}
            title="Editar"
          >
            <Pencil size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            title="Excluir"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* LINHA INFERIOR: Valor */}
      <div className={styles.bottomRow}>
        <span className={styles.valueLabel}>
          {isPassivo ? "Saldo Devedor" : "Valor Estimado"}
        </span>

        <span
          className={`${styles.value} ${isPassivo ? styles.valuePassivo : ""}`}
        >
          {formatCurrency(item.valor)}
        </span>

        {item.saldo_devedor && item.saldo_devedor > 0 && (
          <span className={styles.secondaryValue}>
            Saldo devedor: {formatCurrency(item.saldo_devedor)}
          </span>
        )}
      </div>
    </div>
  );
}
