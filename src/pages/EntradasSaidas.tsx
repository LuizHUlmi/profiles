// src/pages/EntradasSaidas.tsx

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useActiveClient } from "../context/ActiveClientContext";
import { useFluxoCaixa } from "../hooks/useFluxoCaixa";
import { useFamily } from "../hooks/useFamily";
import { useCashFlowProjection } from "../hooks/useCashFlowProjection";
import { CashFlowChart } from "../components/financial/grafico/CashFlowChart";

import { Button } from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal/Modal";
import { FluxoCaixaForm } from "../components/financial/FluxoCaixaForm";
import { Plus, TrendingUp, TrendingDown, Trash2, Pencil } from "lucide-react";
import type { ItemFluxoCaixa } from "../types/database";

export function EntradasSaidas() {
  const { activeClientId } = useActiveClient();

  // --- HOOKS DE DADOS ---
  const { items, fetchItems, addItem, updateItem, deleteItem, loading } =
    useFluxoCaixa(activeClientId || "");
  const { familiares, fetchFamily } = useFamily(activeClientId || "");

  // --- ESTADOS LOCAIS ---
  const [modalType, setModalType] = useState<"receita" | "despesa" | null>(
    null
  );
  const [itemToEdit, setItemToEdit] = useState<ItemFluxoCaixa | null>(null);

  // Estado para armazenar dados vitais do perfil (para o gráfico)
  const [profileData, setProfileData] = useState<{
    birthDate?: string;
    lifeExpectancy?: number;
  }>({});

  // 1. Carrega dados do Perfil (Data Nascimento e Expectativa)
  useEffect(() => {
    async function loadProfile() {
      if (!activeClientId) return;
      const { data } = await supabase
        .from("perfis")
        .select("data_nascimento, expectativa_vida")
        .eq("id", activeClientId)
        .single();

      if (data) {
        setProfileData({
          birthDate: data.data_nascimento,
          lifeExpectancy: data.expectativa_vida,
        });
      }
    }
    loadProfile();
  }, [activeClientId]);

  // 2. Carrega listas ao mudar o cliente
  useEffect(() => {
    if (activeClientId) {
      fetchItems();
      fetchFamily();
    }
  }, [activeClientId, fetchItems, fetchFamily]);

  // 3. Gera os dados da Projeção para o Gráfico (incluindo o Saldo/Balances)
  const { categories, incomes, expenses, balances } = useCashFlowProjection({
    items,
    birthDate: profileData.birthDate,
    lifeExpectancy: profileData.lifeExpectancy,
  });

  // --- HANDLERS ---

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

  // Formata moeda para exibição
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // --- CÁLCULOS DE TOTAIS (PARA O CABEÇALHO) ---
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

  // --- RENDERIZAÇÃO ---

  if (!activeClientId) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--text-secondary)",
        }}
      >
        Selecione um cliente na barra superior para gerenciar o fluxo de caixa.
      </div>
    );
  }

  // Componente interno de Lista para evitar repetição de código
  const ListaItens = ({
    lista,
    corIcone,
  }: {
    lista: ItemFluxoCaixa[];
    corIcone: string;
  }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {lista.length === 0 && (
        <p style={{ color: "#888", fontStyle: "italic", fontSize: "0.9rem" }}>
          Nenhum item cadastrado.
        </p>
      )}

      {lista.map((item) => {
        // Lógica para definir o texto e a cor do Badge de Proprietário
        let labelProprietario = "Desconhecido";
        let badgeColor = "#f3f4f6";
        let badgeTextColor = "#374151";

        if (item.proprietario_tipo === "titular") {
          labelProprietario = "Titular";
          badgeColor = "#dbeafe";
          badgeTextColor = "#1e40af";
        } else if (item.proprietario_tipo === "casal") {
          labelProprietario = "Casal";
          badgeColor = "#fae8ff";
          badgeTextColor = "#86198f";
        } else if (item.proprietario_tipo === "familia") {
          labelProprietario = "Família";
          badgeColor = "#ffedd5";
          badgeTextColor = "#9a3412";
        } else if (item.proprietario_tipo === "dependente") {
          const nome = familiares.find((f) => f.id === item.familiar_id)?.nome;
          labelProprietario = nome || "Familiar";
        }

        return (
          <div
            key={item.id}
            style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            {/* Infos do Item */}
            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                {item.descricao}
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    backgroundColor: badgeColor,
                    color: badgeTextColor,
                    padding: "2px 8px",
                    borderRadius: "12px",
                    textTransform: "capitalize",
                  }}
                >
                  {labelProprietario}
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>
                Início:{" "}
                <strong>
                  {item.inicio_tipo === "ano"
                    ? item.inicio_valor
                    : `${item.inicio_valor} anos`}
                </strong>
                {" • "}
                Duração: <strong>{item.duracao_anos} anos</strong>
                {" • "}
                Correção:{" "}
                {item.correcao_anual ? `${item.correcao_anual}%` : "IPCA"}
              </div>
            </div>

            {/* Valor e Ações */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span
                style={{
                  fontWeight: 700,
                  color: corIcone,
                  fontSize: "1rem",
                  whiteSpace: "nowrap",
                }}
              >
                {formatCurrency(item.valor_mensal)}
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => handleEdit(item)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* TÍTULO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Entradas e Saídas
        </h2>
      </div>

      {/* ÁREA DO GRÁFICO */}
      <div
        style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
          marginBottom: "2rem",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {profileData.birthDate ? (
          <CashFlowChart
            categories={categories}
            incomes={incomes}
            expenses={expenses}
            balances={balances} // <--- Passando a linha de Saldo Líquido
          />
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
            Complete o cadastro do cliente (Data de Nascimento) no menu "Dados
            do Cliente" para ver a projeção gráfica.
          </div>
        )}
      </div>

      {/* COLUNAS LADO A LADO */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        {/* === COLUNA RECEITAS === */}
        <div
          style={{
            backgroundColor: "var(--bg-page)",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            {/* Título com Total */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--success)",
                  fontSize: "1.1rem",
                }}
              >
                <TrendingUp size={20} /> Receitas
              </h3>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  backgroundColor: "#dcfce7",
                  color: "#166534",
                  padding: "2px 10px",
                  borderRadius: "12px",
                }}
              >
                {formatCurrency(totalReceitas)}
              </span>
            </div>

            <Button
              size="sm"
              onClick={() => handleCreate("receita")}
              icon={<Plus size={16} />}
              variant="success"
            >
              Nova
            </Button>
          </div>

          {loading ? (
            <div
              style={{ textAlign: "center", padding: "2rem", color: "#888" }}
            >
              Carregando...
            </div>
          ) : (
            <ListaItens lista={receitas} corIcone="var(--success)" />
          )}
        </div>

        {/* === COLUNA DESPESAS === */}
        <div
          style={{
            backgroundColor: "var(--bg-page)",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            {/* Título com Total */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--danger)",
                  fontSize: "1.1rem",
                }}
              >
                <TrendingDown size={20} /> Despesas
              </h3>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  padding: "2px 10px",
                  borderRadius: "12px",
                }}
              >
                {formatCurrency(totalDespesas)}
              </span>
            </div>

            <Button
              size="sm"
              onClick={() => handleCreate("despesa")}
              icon={<Plus size={16} />}
              variant="danger"
            >
              Nova
            </Button>
          </div>

          {loading ? (
            <div
              style={{ textAlign: "center", padding: "2rem", color: "#888" }}
            >
              Carregando...
            </div>
          ) : (
            <ListaItens lista={despesas} corIcone="var(--danger)" />
          )}
        </div>
      </div>

      {/* MODAL (Criação e Edição) */}
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
