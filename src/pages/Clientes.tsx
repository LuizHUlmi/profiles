// src/pages/Clientes.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useClients } from "../hooks/useClients";

// Componentes UI
import { FormNovoCliente } from "../components/clients/FormNovoCliente";
import { Modal } from "../components/ui/modal/Modal";
import { Button } from "../components/ui/button/Button";

// Ícones e Estilos
import {
  UserPlus,
  Trash2,
  UserCheck,
  Clock,
  LayoutDashboard,
} from "lucide-react";

export function Clientes() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Lógica extraída para o Hook
  const { clientes, loading, fetchClientes, deleteCliente } = useClients();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carrega lista ao entrar
  useEffect(() => {
    if (profile) fetchClientes(profile.id);
  }, [profile, fetchClientes]);

  // Handlers simplificados
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza? Isso apagará todos os dados deste cliente."))
      return;
    await deleteCliente(id);
  };

  const handleSuccess = () => {
    if (profile) fetchClientes(profile.id);
  };

  return (
    <div style={{ padding: "2rem" }}>
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
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Carteira de Clientes
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Gerencie seus clientes e acesse as simulações.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          icon={<UserPlus size={18} />}
        >
          Novo Cliente
        </Button>
      </div>

      {/* Tabela de Clientes */}
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
              backgroundColor: "var(--bg-page)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "1rem",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                Nome
              </th>
              <th
                style={{
                  padding: "1rem",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                E-mail
              </th>
              <th
                style={{
                  padding: "1rem",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                Status
              </th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  Carregando carteira...
                </td>
              </tr>
            ) : clientes.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  Nenhum cliente encontrado. Adicione o primeiro!
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => {
                const isRegistered = !!cliente.user_id;

                return (
                  <tr
                    key={cliente.id}
                    style={{ borderBottom: "1px solid var(--border-color)" }}
                  >
                    <td
                      style={{
                        padding: "1rem",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                      }}
                    >
                      {cliente.nome}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {cliente.email}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          backgroundColor: isRegistered
                            ? "var(--success)"
                            : "#fef3c7",
                          color: isRegistered ? "#fff" : "#92400e",
                        }}
                      >
                        {isRegistered ? (
                          <UserCheck size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        {isRegistered ? "Ativo" : "Pendente"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "10px",
                        }}
                      >
                        {/* Botão VER DASHBOARD (Aquele que criamos antes) */}
                        <button
                          onClick={() => navigate(`/dashboard/${cliente.id}`)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                          title="Acessar Dashboard Financeiro"
                        >
                          <LayoutDashboard size={18} />
                          Dashboard
                        </button>

                        <button
                          onClick={() => handleDelete(cliente.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-secondary)",
                            transition: "color 0.2s",
                          }}
                          title="Remover cliente"
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--danger)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                              "var(--text-secondary)")
                          }
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {profile && (
          <FormNovoCliente
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleSuccess}
          />
        )}
      </Modal>
    </div>
  );
}
