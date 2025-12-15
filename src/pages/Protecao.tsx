// src/pages/Protecao.tsx

import { useEffect, useState } from "react";
import { useActiveClient } from "../context/ActiveClientContext";
import { useSeguros } from "../hooks/useSeguros";
import { useFamily } from "../hooks/useFamily";
import { Button } from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal/Modal";
import { SeguroForm } from "../components/protection/SeguroForm";
import { Shield, ShieldCheck, Plus, Trash2, Users } from "lucide-react";

export function Protecao() {
  const { activeClientId } = useActiveClient();
  // Hooks iniciados apenas se tiver cliente, mas tratados internamente pelo hook
  const { seguros, fetchSeguros, addSeguro, deleteSeguro } = useSeguros(
    activeClientId || ""
  );
  const { familiares, fetchFamily } = useFamily(activeClientId || "");

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (activeClientId) {
      fetchSeguros();
      fetchFamily();
    }
  }, [activeClientId, fetchSeguros, fetchFamily]);

  if (!activeClientId) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        <Users size={48} style={{ opacity: 0.5, marginBottom: "1rem" }} />
        <h2>Selecione um cliente</h2>
        <p>Selecione um cliente na barra superior para gerenciar a proteção.</p>
      </div>
    );
  }

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const totalCobertura = seguros.reduce((acc, s) => acc + s.cobertura, 0);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Cabeçalho */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#1e293b",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <ShieldCheck size={32} color="#0ea5e9" />
            Proteção e Seguros
          </h2>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Gestão de apólices de vida, invalidez e doenças graves.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={18} />}>
          Nova Proteção
        </Button>
      </div>

      {/* Resumo Rápido */}
      <div
        style={{
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "50%",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <Shield size={28} color="#0ea5e9" />
        </div>
        <div>
          <span
            style={{
              display: "block",
              fontSize: "0.9rem",
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            Cobertura Total Contratada
          </span>
          <span
            style={{ fontSize: "1.8rem", fontWeight: "700", color: "#0f172a" }}
          >
            {formatMoney(totalCobertura)}
          </span>
        </div>
      </div>

      {/* Lista de Seguros */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {seguros.length === 0 ? (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: "4rem 2rem",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              border: "2px dashed #cbd5e1",
            }}
          >
            <Shield
              size={48}
              color="#cbd5e1"
              style={{ marginBottom: "1rem" }}
            />
            <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
              Nenhuma proteção cadastrada ainda.
            </p>
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(true)}
              style={{ marginTop: "1rem" }}
            >
              Cadastrar primeira proteção
            </Button>
          </div>
        ) : (
          seguros.map((seguro) => {
            const nomeSegurado =
              seguro.proprietario_tipo === "titular"
                ? "Titular"
                : familiares.find((f) => f.id === seguro.familiar_id)?.nome ||
                  "Familiar";

            return (
              <div
                key={seguro.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  padding: "1.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "#e0f2fe",
                      color: "#0284c7",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {nomeSegurado}
                  </span>
                  <button
                    onClick={() => {
                      if (
                        confirm("Tem certeza que deseja excluir esta proteção?")
                      )
                        deleteSeguro(seguro.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      padding: "4px",
                      borderRadius: "4px",
                    }}
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div>
                  <h4
                    style={{
                      margin: "0 0 0.25rem 0",
                      fontSize: "1.1rem",
                      color: "#1e293b",
                      fontWeight: "600",
                    }}
                  >
                    {seguro.nome}
                  </h4>
                  {seguro.valor_mensal && seguro.valor_mensal > 0 && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#64748b",
                      }}
                    >
                      Custo: {formatMoney(seguro.valor_mensal)}/mês
                    </p>
                  )}
                </div>

                <div
                  style={{ paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.8rem",
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: "600",
                    }}
                  >
                    Cobertura
                  </p>
                  <p
                    style={{
                      margin: "0.25rem 0 0 0",
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#16a34a",
                    }}
                  >
                    {formatMoney(seguro.cobertura)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {isModalOpen && (
          <SeguroForm
            familiares={familiares}
            onClose={() => setIsModalOpen(false)}
            onSubmit={addSeguro}
            profileId={activeClientId || ""}
          />
        )}
      </Modal>
    </div>
  );
}
