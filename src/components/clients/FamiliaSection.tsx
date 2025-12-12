// src/components/clients/FamiliaSection.tsx

import { useEffect, useState } from "react";
import { useFamily } from "../../hooks/useFamily";
import { Button } from "../ui/button/Button";
import { Modal } from "../ui/modal/Modal";
import { FamilyForm } from "./FamilyForm"; // Importando o formulário que criamos/atualizamos
import { UserPlus, Trash2 } from "lucide-react";
import { calculateAge } from "../../utils/date";
import { maskCPF } from "../../utils/masks"; // Para formatar o CPF visualmente

interface FamiliaSectionProps {
  profileId: string;
}

export function FamiliaSection({ profileId }: FamiliaSectionProps) {
  // Hook que gerencia a lógica (buscar, adicionar, deletar)
  const { familiares, loading, fetchFamily, addFamiliar, deleteFamiliar } =
    useFamily(profileId);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  // Função auxiliar para formatar a data (AAAA-MM-DD -> DD/MM/AAAA)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Cabeçalho da Seção */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
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
          Família
        </h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<UserPlus size={16} />}
          size="sm"
        >
          Adicionar Familiar
        </Button>
      </div>

      {/* Tabela */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
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
              backgroundColor: "var(--bg-page)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "1rem",
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                Nome
              </th>
              <th
                style={{
                  padding: "1rem",
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                Parentesco
              </th>
              <th
                style={{
                  padding: "1rem",
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                Nascimento
              </th>
              <th style={{ padding: "1rem" }}></th> {/* Coluna de Ações */}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "1.5rem",
                    textAlign: "center",
                    color: "#888",
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
                    padding: "1.5rem",
                    textAlign: "center",
                    color: "#888",
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
                  {/* Coluna 1: Nome (+ CPF se tiver) */}
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{ fontWeight: 500, color: "var(--text-primary)" }}
                    >
                      {f.nome}
                    </div>
                    {f.cpf && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          marginTop: "2px",
                        }}
                      >
                        CPF: {maskCPF(f.cpf)}
                      </div>
                    )}
                  </td>

                  {/* Coluna 2: Parentesco */}
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          f.parentesco === "Cônjuge" ? "#e0f2fe" : "#f3f4f6", // Destaque azul se for Cônjuge
                        color:
                          f.parentesco === "Cônjuge" ? "#0284c7" : "#374151",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                      }}
                    >
                      {f.parentesco}
                    </span>
                  </td>

                  {/* Coluna 3: Nascimento + Idade */}
                  <td style={{ padding: "1rem", color: "var(--text-primary)" }}>
                    {formatDate(f.data_nascimento)}
                    {f.data_nascimento && (
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          marginLeft: "6px",
                          fontSize: "0.9rem",
                        }}
                      >
                        ({calculateAge(f.data_nascimento)} anos)
                      </span>
                    )}
                  </td>

                  {/* Coluna 4: Ações */}
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <button
                      onClick={() => deleteFamiliar(f.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                        padding: "6px",
                        borderRadius: "4px",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--danger)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--text-secondary)")
                      }
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

      {/* Modal para adicionar novo familiar */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <FamilyForm
          onClose={() => setIsModalOpen(false)}
          onSubmit={addFamiliar}
        />
      </Modal>
    </div>
  );
}
