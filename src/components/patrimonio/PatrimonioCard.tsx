import { Trash2, Pencil } from "lucide-react";
import styles from "../projects/ProjectCard.module.css"; // Reaproveitando estilos por enquanto

type PatrimonioCardProps = {
  item: {
    id: number;
    nome: string;
    valor: number;
    categoria: string;
  };
  onEdit: () => void;
  onDelete: () => void;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function PatrimonioCard({
  item,
  onEdit,
  onDelete,
}: PatrimonioCardProps) {
  // Passivos ficam com cor de destaque diferente (ex: avermelhado se quiséssemos, mas manteremos clean)
  const isPassivo = item.categoria === "passivo";
  const valorFormatado = currencyFormatter.format(item.valor);

  return (
    <div
      className={styles.projectCard}
      style={{
        borderLeft: isPassivo
          ? "4px solid var(--danger)"
          : "4px solid var(--success)",
      }}
    >
      <div className={styles.cardHeader}>
        <h5 style={{ fontSize: "0.9rem" }}>{item.nome}</h5>
        <div className={styles.cardControls}>
          <button className={styles.iconButton} onClick={onEdit} title="Editar">
            <Pencil size={14} />
          </button>
          <button
            className={`${styles.iconButton} ${styles.deleteButton}`}
            onClick={onDelete}
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p
        className={styles.cardValue}
        style={{ color: isPassivo ? "var(--danger)" : "var(--text-primary)" }}
      >
        {isPassivo ? "-" : ""}
        {valorFormatado}
      </p>
    </div>
  );
}
