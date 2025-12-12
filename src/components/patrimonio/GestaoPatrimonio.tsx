import { useEffect } from "react";
import styles from "./GestaoPatrimonio.module.css";
import { PatrimonioCard } from "./PatrimonioCard";
import { usePatrimonio } from "../../hooks/usePatrimonio";
import { Button } from "../ui/button/Button";
import {
  TrendingUp,
  Landmark,
  Building2,
  CreditCard,
  Plus,
} from "lucide-react";
import type { CategoriaPatrimonio, ItemPatrimonio } from "../../types/database";

type GestaoPatrimonioProps = {
  perfilId: string;
};

export function GestaoPatrimonio({ perfilId }: GestaoPatrimonioProps) {
  const { itens, fetchPatrimonio, deleteItem } = usePatrimonio();

  // Estado temporário para lidar com edição (passo 2 do seu pedido)
  const handleEdit = (item: ItemPatrimonio) => {
    console.log("Abrir modal de edição para:", item);
    // Aqui abriremos a modal específica depois
  };

  const handleAdd = (categoria: CategoriaPatrimonio) => {
    console.log("Abrir modal de criação para:", categoria);
    // Aqui abriremos a modal específica depois
  };

  useEffect(() => {
    if (perfilId) fetchPatrimonio(perfilId);
  }, [perfilId, fetchPatrimonio]);

  // Função auxiliar para calcular totais
  const getTotal = (categoria: CategoriaPatrimonio) => {
    return itens
      .filter((i) => i.categoria === categoria)
      .reduce((acc, curr) => acc + curr.valor, 0);
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  // Configuração das colunas
  const columns: {
    id: CategoriaPatrimonio;
    title: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: "investimento",
      title: "Investimentos",
      icon: <TrendingUp size={18} />,
      color: "#16a34a",
    },
    {
      id: "previdencia",
      title: "Previdência",
      icon: <Landmark size={18} />,
      color: "#0ea5e9",
    },
    {
      id: "imobilizado",
      title: "Imobilizado",
      icon: <Building2 size={18} />,
      color: "#ca8a04",
    },
    {
      id: "passivo",
      title: "Passivos / Dívidas",
      icon: <CreditCard size={18} />,
      color: "#dc2626",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Ativos e Passivos</h3>
        {/* Futuro: Resumo de Patrimônio Líquido aqui */}
      </div>

      <div className={styles.grid}>
        {columns.map((col) => {
          const total = getTotal(col.id);
          const colItems = itens.filter((i) => i.categoria === col.id);

          return (
            <div key={col.id} className={styles.column}>
              {/* Header da Coluna */}
              <div
                className={styles.columnHeader}
                style={{ borderBottomColor: col.color }}
              >
                <div className={styles.columnTitleRow}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: col.color,
                    }}
                  >
                    {col.icon}
                    <span style={{ fontWeight: 600 }}>{col.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAdd(col.id)}
                    style={{ padding: "4px" }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <div className={styles.totalValue} style={{ color: col.color }}>
                  {formatMoney(total)}
                </div>
              </div>

              {/* Lista de Cards */}
              <div className={styles.cardList}>
                {colItems.length === 0 ? (
                  <div className={styles.emptyState}>Nenhum item</div>
                ) : (
                  colItems.map((item) => (
                    <PatrimonioCard
                      key={item.id}
                      item={item}
                      onEdit={() => handleEdit(item)}
                      onDelete={() => deleteItem(item.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
