// src/pages/EntradasSaidas.tsx

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useActiveClient } from "../context/ActiveClientContext";
import { useFluxoCaixa } from "../hooks/useFluxoCaixa";
import { useFamily } from "../hooks/useFamily";
import { useCashFlowProjection } from "../hooks/useCashFlowProjection";
import { CashFlowChart } from "../components/financial/grafico/CashFlowChart";
import { Modal } from "../components/ui/modal/Modal";
import { FluxoCaixaForm } from "../components/financial/FluxoCaixaForm";
import { ClientSelectionPlaceholder } from "../components/ui/placeholders/ClientSelectionPlaceholder";
import { FluxoCaixaColuna } from "../components/financial/FluxoCaixaColuna"; // <--- Novo Componente
import styles from "./EntradasSaidas.module.css";
import type { ItemFluxoCaixa } from "../types/database";

export function EntradasSaidas() {
  const { activeClientId } = useActiveClient();

  // Hooks
  const { items, fetchItems, addItem, updateItem, deleteItem, loading } =
    useFluxoCaixa(activeClientId || "");
  const { familiares, fetchFamily } = useFamily(activeClientId || "");

  // Estados Locais
  const [modalType, setModalType] = useState<"receita" | "despesa" | null>(
    null
  );
  const [itemToEdit, setItemToEdit] = useState<ItemFluxoCaixa | null>(null);
  const [profileData, setProfileData] = useState<{
    birthDate?: string;
    lifeExpectancy?: number;
  }>({});

  // Efeitos
  useEffect(() => {
    async function loadProfile() {
      if (!activeClientId) return;
      const { data } = await supabase
        .from("perfis")
        .select("data_nascimento, expectativa_vida")
        .eq("id", activeClientId)
        .single();
      if (data)
        setProfileData({
          birthDate: data.data_nascimento,
          lifeExpectancy: data.expectativa_vida,
        });
    }
    loadProfile();
  }, [activeClientId]);

  useEffect(() => {
    if (activeClientId) {
      fetchItems();
      fetchFamily();
    }
  }, [activeClientId, fetchItems, fetchFamily]);

  // Projeção
  const { categories, incomes, expenses, balances } = useCashFlowProjection({
    items,
    birthDate: profileData.birthDate,
    lifeExpectancy: profileData.lifeExpectancy,
  });

  // Handlers
  const handleEdit = (item: ItemFluxoCaixa) => {
    setItemToEdit(item);
    setModalType(item.tipo);
  };

  const handleCreate = (type: "receita" | "despesa") => {
    setItemToEdit(null);
    setModalType(type);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (data: any) => {
    if (itemToEdit) return await updateItem(itemToEdit.id, data);
    return await addItem(data);
  };

  // Totais e Filtros
  const receitas = items.filter((i) => i.tipo === "receita");
  const despesas = items.filter((i) => i.tipo === "despesa");
  const totalReceitas = receitas.reduce(
    (acc, item) => acc + item.valor_mensal,
    0
  );
  const totalDespesas = despesas.reduce(
    (acc, item) => acc + item.valor_mensal,
    0
  );

  if (!activeClientId) {
    return (
      <ClientSelectionPlaceholder
        title="Fluxo de Caixa"
        message="Selecione um cliente para gerenciar as Receitas e Despesas mensais."
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Entradas e Saídas</h2>
      </div>

      <div className={styles.chartContainer}>
        {profileData.birthDate ? (
          <CashFlowChart
            categories={categories}
            incomes={incomes}
            expenses={expenses}
            balances={balances}
          />
        ) : (
          <div className={styles.chartPlaceholder}>
            Complete o cadastro do cliente (Data de Nascimento) para ver a
            projeção.
          </div>
        )}
      </div>

      <div className={styles.columnsGrid}>
        {/* COLUNA RECEITAS */}
        <FluxoCaixaColuna
          tipo="receita"
          items={receitas}
          total={totalReceitas}
          loading={loading}
          familiares={familiares}
          onAdd={() => handleCreate("receita")}
          onEdit={handleEdit}
          onDelete={deleteItem}
        />

        {/* COLUNA DESPESAS */}
        <FluxoCaixaColuna
          tipo="despesa"
          items={despesas}
          total={totalDespesas}
          loading={loading}
          familiares={familiares}
          onAdd={() => handleCreate("despesa")}
          onEdit={handleEdit}
          onDelete={deleteItem}
        />
      </div>

      <Modal isOpen={!!modalType} onClose={() => setModalType(null)}>
        {modalType && (
          <FluxoCaixaForm
            tipo={modalType}
            familiares={familiares}
            initialData={itemToEdit}
            onClose={() => setModalType(null)}
            onSubmit={handleFormSubmit}
          />
        )}
      </Modal>
    </div>
  );
}
