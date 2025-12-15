// src/pages/Educacao.tsx

import { useEffect, useState } from "react";
import { useActiveClient } from "../context/ActiveClientContext";
import { useEducacao } from "../hooks/useEducacao";
import { useFamily } from "../hooks/useFamily";
import { Button } from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal/Modal";
import { EducacaoForm } from "../components/education/EducacaoForm";
import {
  GraduationCap,
  Plus,
  Calendar,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

export function Educacao() {
  const { activeClientId } = useActiveClient();
  const { itens, fetchEducacao, addEducacao, deleteEducacao } = useEducacao(
    activeClientId || ""
  );
  const { familiares, fetchFamily } = useFamily(activeClientId || "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (activeClientId) {
      fetchEducacao();
      fetchFamily();
    }
  }, [activeClientId, fetchEducacao, fetchFamily]);

  if (!activeClientId) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        <Users size={48} style={{ opacity: 0.5, marginBottom: "1rem" }} />
        <h2>Selecione um cliente</h2>
      </div>
    );
  }

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
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
            <GraduationCap size={32} color="#0ea5e9" />
            Educação
          </h2>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            Planejamento escolar e universitário da família.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={18} />}>
          Novo Planejamento
        </Button>
      </div>

      {/* Grid de Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {itens.length === 0 ? (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: "4rem",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              border: "2px dashed #cbd5e1",
            }}
          >
            <p style={{ color: "#94a3b8" }}>
              Nenhum planejamento educacional cadastrado.
            </p>
          </div>
        ) : (
          itens.map((item) => {
            const nomeBeneficiario =
              item.beneficiario_tipo === "titular"
                ? "Titular"
                : familiares.find((f) => f.id === item.familiar_id)?.nome ||
                  "Dependente";

            const anoFim = item.ano_inicio + item.duracao_anos;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  padding: "1.5rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  position: "relative",
                }}
              >
                {/* Header Card */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "#f0f9ff",
                      color: "#0369a1",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    {nomeBeneficiario}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm("Excluir?")) deleteEducacao(item.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    color: "#333",
                    fontSize: "1.2rem",
                  }}
                >
                  {item.nome}
                </h3>

                {/* Detalhes */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#475569",
                    }}
                  >
                    <TrendingUp size={18} color="#16a34a" />
                    <div>
                      <span style={{ fontSize: "0.85rem", display: "block" }}>
                        Custo Mensal
                      </span>
                      <span style={{ fontWeight: "600", color: "#16a34a" }}>
                        {formatMoney(item.custo_mensal)}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#475569",
                    }}
                  >
                    <Calendar size={18} color="#0ea5e9" />
                    <div>
                      <span style={{ fontSize: "0.85rem", display: "block" }}>
                        Período ({item.duracao_anos} anos)
                      </span>
                      <span style={{ fontWeight: "600", color: "#0f172a" }}>
                        {item.ano_inicio} até {anoFim}
                      </span>
                    </div>
                  </div>
                </div>

                {item.correcao_anual && item.correcao_anual > 0 && (
                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "0.5rem",
                      borderTop: "1px solid #f1f5f9",
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                    }}
                  >
                    Correção Anual: {item.correcao_anual}%
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {isModalOpen && (
          <EducacaoForm
            familiares={familiares}
            onClose={() => setIsModalOpen(false)}
            onSubmit={addEducacao}
          />
        )}
      </Modal>
    </div>
  );
}
