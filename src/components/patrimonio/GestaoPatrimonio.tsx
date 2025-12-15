// src/components/patrimonio/GestaoPatrimonio.tsx

import { useEffect, useState, useMemo } from "react";
import styles from "./GestaoPatrimonio.module.css";
import { PatrimonioCard } from "./PatrimonioCard";
import { PatrimonioChart } from "./PatrimonioChart";
import { useAssetsLiabilities } from "../../hooks/useAssetsLiabilities";
import { useFamily } from "../../hooks/useFamily";
import { Button } from "../ui/button/Button";
import { Modal } from "../ui/modal/Modal";
import { AssetsLiabilitiesForm } from "../financial/AssetsLiabilitiesForm";
import {
  TrendingUp,
  Landmark,
  Building2,
  CreditCard,
  Plus,
} from "lucide-react";
import type { ItemAtivoPassivo } from "../../types/database";

type GestaoPatrimonioProps = {
  perfilId: string;
};

const TYPES_INVESTIMENTOS = [
  "Renda Fixa",
  "Renda Variável",
  "Fundos de Investimento",
  "Saldo em Conta",
  "Empresa",
  "Outros",
];
const TYPES_PREVIDENCIA = ["Previdência"];
const TYPES_IMOBILIZADO = ["Imóvel", "Veículo"];
const TYPES_PASSIVOS = [
  "Financiamento Imobiliário",
  "Financiamento Veicular",
  "Empréstimo Pessoal",
  "Cartão de Crédito",
  "Outros",
];

export function GestaoPatrimonio({ perfilId }: GestaoPatrimonioProps) {
  const { items, fetchItems, deleteItem, addItem, updateItem } =
    useAssetsLiabilities(perfilId);
  const { familiares, fetchFamily } = useFamily(perfilId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<"ativo" | "passivo">(
    "ativo"
  );
  const [itemToEdit, setItemToEdit] = useState<ItemAtivoPassivo | null>(null);
  const [modalDefaultType, setModalDefaultType] = useState<string | undefined>(
    undefined
  );
  const [modalAllowedTypes, setModalAllowedTypes] = useState<
    string[] | undefined
  >(undefined);

  useEffect(() => {
    if (perfilId) {
      fetchItems();
      fetchFamily();
    }
  }, [perfilId, fetchItems, fetchFamily]);

  const handleOpenNew = (
    categoria: "ativo" | "passivo",
    defaultType?: string,
    allowedTypes?: string[]
  ) => {
    setItemToEdit(null);
    setModalCategory(categoria);
    setModalDefaultType(defaultType);
    setModalAllowedTypes(allowedTypes);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ItemAtivoPassivo) => {
    setItemToEdit(item);
    setModalCategory(item.categoria);
    setModalDefaultType(undefined);
    setModalAllowedTypes(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      await deleteItem(id);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (data: any) => {
    if (itemToEdit) {
      return await updateItem(itemToEdit.id, data);
    } else {
      return await addItem(data);
    }
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const filterItemsByColumn = (colId: string) => {
    return items.filter((item) => {
      if (colId === "passivo" && item.categoria !== "passivo") return false;
      if (colId !== "passivo" && item.categoria === "passivo") return false;

      switch (colId) {
        case "investimento":
          return (
            TYPES_INVESTIMENTOS.includes(item.tipo) ||
            item.tipo === "Aplicação Financeira"
          );
        case "previdencia":
          return TYPES_PREVIDENCIA.includes(item.tipo);
        case "imobilizado":
          return TYPES_IMOBILIZADO.includes(item.tipo);
        case "passivo":
          return TYPES_PASSIVOS.includes(item.tipo);
        default:
          return false;
      }
    });
  };

  const chartTotals = useMemo(() => {
    const calcTotal = (colId: string) =>
      filterItemsByColumn(colId).reduce((acc, curr) => acc + curr.valor, 0);

    return {
      investimento: calcTotal("investimento"),
      previdencia: calcTotal("previdencia"),
      imobilizado: calcTotal("imobilizado"),
      passivo: calcTotal("passivo"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const columns = [
    {
      id: "investimento",
      title: "Investimentos",
      icon: <TrendingUp size={18} />,
      color: "#16a34a",
      btnCategory: "ativo" as const,
      defaultType: "Renda Fixa",
      allowedTypes: TYPES_INVESTIMENTOS,
    },
    {
      id: "previdencia",
      title: "Previdência",
      icon: <Landmark size={18} />,
      color: "#0ea5e9",
      btnCategory: "ativo" as const,
      defaultType: "Previdência",
      allowedTypes: TYPES_PREVIDENCIA,
    },
    {
      id: "imobilizado",
      title: "Imobilizado",
      icon: <Building2 size={18} />,
      color: "#ca8a04",
      btnCategory: "ativo" as const,
      defaultType: "Imóvel",
      allowedTypes: TYPES_IMOBILIZADO,
    },
    {
      id: "passivo",
      title: "Passivos / Dívidas",
      icon: <CreditCard size={18} />,
      color: "#dc2626",
      btnCategory: "passivo" as const,
      defaultType: "Financiamento Imobiliário",
      allowedTypes: TYPES_PASSIVOS,
    },
  ];

  return (
    <div className={styles.container}>
      <PatrimonioChart totals={chartTotals} />

      <div className={styles.header}></div>

      <div className={styles.grid}>
        {columns.map((col) => {
          const colItems = filterItemsByColumn(col.id);
          const total = chartTotals[col.id as keyof typeof chartTotals];

          return (
            <div key={col.id} className={styles.column}>
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
                    onClick={() =>
                      handleOpenNew(
                        col.btnCategory,
                        col.defaultType,
                        col.allowedTypes
                      )
                    }
                    style={{ padding: "4px" }}
                    title={`Adicionar ${col.title}`}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <div className={styles.totalValue} style={{ color: col.color }}>
                  {formatMoney(total)}
                </div>
              </div>

              <div className={styles.cardList}>
                {colItems.length === 0 ? (
                  <div className={styles.emptyState}>Nenhum item</div>
                ) : (
                  colItems.map((item) => (
                    <PatrimonioCard
                      key={item.id}
                      item={item}
                      onEdit={() => handleOpenEdit(item)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {isModalOpen && (
          <AssetsLiabilitiesForm
            categoria={modalCategory}
            familiares={familiares}
            onClose={() => setIsModalOpen(false)}
            initialData={itemToEdit}
            defaultType={modalDefaultType}
            allowedTypes={modalAllowedTypes}
            onSubmit={handleFormSubmit}
            // AQUI ESTÁ A CORREÇÃO:
            profileId={perfilId}
          />
        )}
      </Modal>
    </div>
  );
}
