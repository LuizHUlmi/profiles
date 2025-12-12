// src/pages/AtivosPassivos.tsx

import { useState, useEffect } from "react";
import { useActiveClient } from "../context/ActiveClientContext";
import { useAssetsLiabilities } from "../hooks/useAssetsLiabilities";
import { useFamily } from "../hooks/useFamily";
import { Button } from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal/Modal";
import { AssetsLiabilitiesForm } from "../components/financial/AssetsLiabilitiesForm";
import { Plus, Trash2, Pencil, Building2, Wallet } from "lucide-react";
import type { ItemAtivoPassivo } from "../types/database";

export function AtivosPassivos() {
  const { activeClientId } = useActiveClient();
  const { items, fetchItems, addItem, updateItem, deleteItem, loading } =
    useAssetsLiabilities(activeClientId || "");
  const { familiares, fetchFamily } = useFamily(activeClientId || "");

  const [modalCategory, setModalCategory] = useState<
    "ativo" | "passivo" | null
  >(null);
  const [itemToEdit, setItemToEdit] = useState<ItemAtivoPassivo | null>(null);

  useEffect(() => {
    if (activeClientId) {
      fetchItems();
      fetchFamily();
    }
  }, [activeClientId, fetchItems, fetchFamily]);

  // Cálculos de Totais
  const ativos = items.filter((i) => i.categoria === "ativo");
  const passivos = items.filter((i) => i.categoria === "passivo");

  const totalAtivos = ativos.reduce((acc, i) => acc + i.valor, 0);
  const totalPassivos = passivos.reduce((acc, i) => acc + i.valor, 0);
  const patrimonioLiquido = totalAtivos - totalPassivos;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const handleEdit = (item: ItemAtivoPassivo) => {
    setItemToEdit(item);
    setModalCategory(item.categoria);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    if (itemToEdit) return await updateItem(itemToEdit.id, data);
    return await addItem(data);
  };

  const ListaItens = ({
    lista,
    corTexto,
  }: {
    lista: ItemAtivoPassivo[];
    corTexto: string;
  }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {lista.length === 0 && (
        <p style={{ color: "#888", fontStyle: "italic", fontSize: "0.9rem" }}>
          Nenhum item.
        </p>
      )}
      {lista.map((item) => {
        let labelProp = "Titular";
        let bgProp = "#dbeafe";
        let colorProp = "#1e40af";

        if (item.proprietario_tipo === "dependente") {
          const nome = familiares.find((f) => f.id === item.familiar_id)?.nome;
          labelProp = nome || "Familiar";
          bgProp = "#f3f4f6";
          colorProp = "#374151";
        } else if (item.proprietario_tipo === "casal") {
          labelProp = "Casal";
          bgProp = "#fae8ff";
          colorProp = "#86198f";
        } else if (item.proprietario_tipo === "familia") {
          labelProp = "Família";
          bgProp = "#ffedd5";
          colorProp = "#9a3412";
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
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontWeight: 600, color: "#333" }}>
                  {item.nome}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    backgroundColor: bgProp,
                    color: colorProp,
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontWeight: 600,
                  }}
                >
                  {labelProp}
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>
                {item.tipo}{" "}
                {item.inventariar && (
                  <span style={{ color: "#d97706", fontWeight: 500 }}>
                    • Inventariável ({item.percentual_inventario}%)
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span
                style={{ fontWeight: 700, color: corTexto, fontSize: "1rem" }}
              >
                {formatCurrency(item.valor)}
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => handleEdit(item)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
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
                  }}
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

  if (!activeClientId)
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        Selecione um cliente.
      </div>
    );

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Resumo do Patrimônio */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
            Total Ativos
          </p>
          <h2
            style={{ margin: "5px 0 0", color: "#16a34a", fontSize: "1.8rem" }}
          >
            {formatCurrency(totalAtivos)}
          </h2>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
            Total Passivos
          </p>
          <h2
            style={{ margin: "5px 0 0", color: "#dc2626", fontSize: "1.8rem" }}
          >
            {formatCurrency(totalPassivos)}
          </h2>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#333",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            Patrimônio Líquido
          </p>
          <h2
            style={{ margin: "5px 0 0", color: "#007bff", fontSize: "1.8rem" }}
          >
            {formatCurrency(patrimonioLiquido)}
          </h2>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        {/* Coluna Ativos */}
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
            <h3
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#16a34a",
              }}
            >
              <Building2 size={20} /> Ativos
            </h3>
            <Button
              size="sm"
              onClick={() => {
                setItemToEdit(null);
                setModalCategory("ativo");
              }}
              variant="success"
              icon={<Plus size={16} />}
            >
              Novo
            </Button>
          </div>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <ListaItens lista={ativos} corTexto="#16a34a" />
          )}
        </div>

        {/* Coluna Passivos */}
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
            <h3
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#dc2626",
              }}
            >
              <Wallet size={20} /> Passivos
            </h3>
            <Button
              size="sm"
              onClick={() => {
                setItemToEdit(null);
                setModalCategory("passivo");
              }}
              variant="danger"
              icon={<Plus size={16} />}
            >
              Novo
            </Button>
          </div>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <ListaItens lista={passivos} corTexto="#dc2626" />
          )}
        </div>
      </div>

      <Modal isOpen={!!modalCategory} onClose={() => setModalCategory(null)}>
        {modalCategory && (
          <AssetsLiabilitiesForm
            categoria={modalCategory}
            familiares={familiares}
            initialData={itemToEdit}
            onClose={() => setModalCategory(null)}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>
    </div>
  );
}
