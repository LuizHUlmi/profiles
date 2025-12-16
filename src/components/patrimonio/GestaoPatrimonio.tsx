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
  CreditCard,
  Plus,
  Home, // Adicionei o Home para manter consistência com o exemplo anterior se preferir
} from "lucide-react";
import type { ItemAtivoPassivo } from "../../types/database";

type GestaoPatrimonioProps = {
  perfilId: string;
};

// --- DEFINIÇÃO DOS TIPOS (Mantido do seu original) ---
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
  // --- HOOKS E ESTADOS (Mantido do seu original) ---
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

  // --- HANDLERS (Mantido do seu original) ---
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

  const handleFormSubmit = async (
    data: Omit<ItemAtivoPassivo, "id" | "perfil_id">
  ) => {
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

  // --- FILTROS E CÁLCULOS (Mantido do seu original) ---
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

  // --- CONFIGURAÇÃO DAS COLUNAS (ATUALIZADO COM CORES NOVAS) ---
  const columns = [
    {
      id: "investimento",
      title: "Investimentos",
      icon: <TrendingUp size={20} />,
      // Slate 800: Escuro, sólido, transmite segurança máxima
      color: "#1e293b",
      btnCategory: "ativo" as const,
      defaultType: "Renda Fixa",
      allowedTypes: TYPES_INVESTIMENTOS,
    },
    {
      id: "previdencia",
      title: "Previdência",
      icon: <Landmark size={20} />,
      // Slate 600: Um tom médio, mantendo a família do cinza-azulado
      color: "#475569",
      btnCategory: "ativo" as const,
      defaultType: "Previdência",
      allowedTypes: TYPES_PREVIDENCIA,
    },
    {
      id: "imobilizado",
      title: "Imobilizado",
      icon: <Home size={20} />,
      // Slate 400: Mais leve, diferencia visualmente sem sair do tom
      color: "#94a3b8",
      btnCategory: "ativo" as const,
      defaultType: "Imóvel",
      allowedTypes: TYPES_IMOBILIZADO,
    },
    {
      id: "passivo",
      title: "Passivos / Dívidas",
      icon: <CreditCard size={20} />,
      // Rose 700: Um tom "Vinho/Rosé". É negativo, mas elegante e suave.
      color: "#be123c",
      btnCategory: "passivo" as const,
      defaultType: "Financiamento Imobiliário",
      allowedTypes: TYPES_PASSIVOS,
    },
  ];

  return (
    <div className={styles.container}>
      {/* 1. GRÁFICO (Recebe os totais calculados do banco) */}
      <PatrimonioChart totals={chartTotals} />

      <div className={styles.header}></div>

      {/* 2. GRID INTELIGENTE (Usa a classe .grid do CSS atualizado) */}
      <div className={styles.grid}>
        {columns.map((col) => {
          const colItems = filterItemsByColumn(col.id);
          const total = chartTotals[col.id as keyof typeof chartTotals];

          return (
            <div key={col.id} className={styles.column}>
              {/* Cabeçalho da Coluna com Cores Novas */}
              <div className={styles.columnHeader}>
                <div className={styles.columnTitleRow}>
                  <div
                    className={styles.columnTitle} // Adicionei a classe para facilitar
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: col.color, // Aplica a cor corporativa definida acima
                    }}
                  >
                    {col.icon}
                    <span style={{ fontWeight: 600 }}>{col.title}</span>
                  </div>

                  {/* Botão de Adicionar (+) */}
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
                    style={{
                      padding: "4px",
                      height: "auto",
                      // Deixei o ícone sutil, usando a mesma cor da coluna mas com transparência se quisesse
                      color: col.color,
                      opacity: 0.6,
                    }}
                    title={`Adicionar ${col.title}`}
                  >
                    <Plus size={18} />
                  </Button>
                </div>

                {/* Valor Total da Coluna */}
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

      {/* 3. MODAL DE CADASTRO/EDIÇÃO (Mantido do seu original) */}
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
            profileId={perfilId}
          />
        )}
      </Modal>
    </div>
  );
}
