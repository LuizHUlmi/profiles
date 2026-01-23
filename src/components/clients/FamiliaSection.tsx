// src/components/clients/FamiliaSection.tsx

import { useEffect, useState } from "react";
import { useFamily } from "../../hooks/useFamily";
import { Button } from "../ui/button/Button";
import { Modal } from "../ui/modal/Modal";
import { FamilyForm } from "./FamilyForm";
import { UserPlus, Trash2 } from "lucide-react";
import { calculateAge } from "../../utils/date";

interface FamiliaSectionProps {
  profileId: string;
}

export function FamiliaSection({ profileId }: FamiliaSectionProps) {
  const { familiares, loading, fetchFamily, addFamiliar, deleteFamiliar } =
    useFamily(profileId);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (profileId) {
      fetchFamily();
    }
  }, [profileId, fetchFamily]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Cabeçalho da Seção Padronizado */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem", // Padronizado com os outros cards
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem", // Mesmo tamanho de Dados Pessoais
            fontWeight: "700",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Composição Familiar
        </h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<UserPlus size={16} />}
          size="sm"
        >
          Adicionar Familiar
        </Button>
      </div>

      {/* Tabela dentro de um Card Padronizado */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead
            style={{
              backgroundColor: "var(--bg-page)", // Fundo leve para o topo da tabela
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "1rem 1.5rem",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Nome
              </th>
              <th
                style={{
                  padding: "1rem 1.5rem",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Parentesco
              </th>
              <th
                style={{
                  padding: "1rem 1.5rem",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Nascimento / Idade
              </th>
              <th style={{ padding: "1rem 1.5rem", width: "50px" }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  Carregando família...
                </td>
              </tr>
            ) : familiares.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  Nenhum familiar cadastrado.
                </td>
              </tr>
            ) : (
              familiares.map((f) => (
                <tr
                  key={f.id}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div
                      style={{ fontWeight: 600, color: "var(--text-primary)" }}
                    >
                      {f.nome}
                    </div>
                  </td>

                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        backgroundColor:
                          f.parentesco === "Cônjuge"
                            ? "var(--primary-light)"
                            : "#f3f4f6",
                        color:
                          f.parentesco === "Cônjuge"
                            ? "var(--primary)"
                            : "var(--text-secondary)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {f.parentesco}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: "1rem 1.5rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div style={{ fontSize: "0.95rem" }}>
                      {formatDate(f.data_nascimento)}
                    </div>
                    {f.data_nascimento && (
                      <div
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.85rem",
                          marginTop: "2px",
                        }}
                      >
                        {calculateAge(f.data_nascimento)} anos
                      </div>
                    )}
                  </td>

                  <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                    <button
                      onClick={() => {
                        if (window.confirm(`Remover ${f.nome} da família?`)) {
                          deleteFamiliar(f.id);
                        }
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                        padding: "8px",
                        borderRadius: "var(--radius-sm)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--danger)";
                        e.currentTarget.style.backgroundColor = "#fee2e2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-secondary)";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                      title="Remover familiar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <FamilyForm
          onClose={() => setIsModalOpen(false)}
          onSubmit={addFamiliar}
        />
      </Modal>
    </div>
  );
}
