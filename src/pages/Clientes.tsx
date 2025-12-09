// src/pages/Clientes.tsx

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "..//context/AuthContext"; // Importante para saber quem é o consultor
import { FormNovoCliente } from "../components/clients/FormNovoCliente";
import { Modal } from "../components/ui/modal/Modal"; // Ajustei o caminho conforme nossos passos anteriores
import { UserPlus, Trash2, UserCheck, Clock } from "lucide-react";

// Tipo para a listagem de Clientes
type Cliente = {
  id: string;
  nome: string;
  email: string;
  user_id: string | null; // Se tiver ID, já criou conta. Se null, é pendente.
};

export function Clientes() {
  const { profile } = useAuth(); // Pegamos o perfil do Consultor logado
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar os clientes DESTE consultor
  const fetchClientes = async () => {
    // Só busca se tivermos o perfil do consultor carregado
    if (!profile) return;

    setIsLoading(true);

    const { data, error } = await supabase
      .from("perfis")
      .select("id, nome, email, user_id")
      .eq("consultor_id", profile.id) // O FILTRO MÁGICO: Só meus clientes
      .order("nome");

    if (error) {
      console.error("Erro ao buscar clientes:", error);
    } else {
      setClientes(data || []);
    }
    setIsLoading(false);
  };

  // Carrega ao abrir a página ou quando o perfil carregar
  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Função para deletar cliente
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Tem certeza que deseja remover este cliente? Todos os dados dele serão apagados."
      )
    )
      return;

    const { error } = await supabase.from("perfis").delete().eq("id", id);

    if (error) {
      alert("Erro ao deletar cliente.");
      console.error(error);
    } else {
      fetchClientes(); // Recarrega a lista
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* Cabeçalho da Página */}
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
              fontWeight: "600",
              color: "#333",
              margin: 0,
            }}
          >
            Carteira de Clientes
          </h2>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>
            Gerencie seus clientes e acompanhe o status de cadastro.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <UserPlus size={20} />
          Novo Cliente
        </button>
      </div>

      {/* Tabela de Listagem */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
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
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <tr>
              <th
                style={{ padding: "1rem", color: "#555", fontSize: "0.9rem" }}
              >
                Nome
              </th>
              <th
                style={{ padding: "1rem", color: "#555", fontSize: "0.9rem" }}
              >
                E-mail
              </th>
              <th
                style={{ padding: "1rem", color: "#555", fontSize: "0.9rem" }}
              >
                Situação
              </th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ padding: "2rem", textAlign: "center" }}
                >
                  Carregando...
                </td>
              </tr>
            ) : clientes.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#888",
                  }}
                >
                  Você ainda não tem clientes na sua carteira.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => {
                // Lógica visual do status
                const isRegistered = !!cliente.user_id;

                return (
                  <tr
                    key={cliente.id}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ padding: "1rem", fontWeight: 500 }}>
                      {cliente.nome}
                    </td>
                    <td style={{ padding: "1rem", color: "#666" }}>
                      {cliente.email}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                          // Verde se cadastrado, Amarelo se pendente
                          backgroundColor: isRegistered ? "#dcfce7" : "#fef3c7",
                          color: isRegistered ? "#166534" : "#92400e",
                        }}
                      >
                        {isRegistered ? (
                          <UserCheck size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        {isRegistered ? "Cadastrado" : "Pendente"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      {/* Botão de Ver Perfil (Futuro) */}
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#007bff",
                          marginRight: "10px",
                          fontWeight: 500,
                        }}
                        title="Ver dados do cliente"
                      >
                        Ver Perfil
                      </button>

                      <button
                        onClick={() => handleDelete(cliente.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#999",
                        }}
                        title="Remover cliente"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {/* Passamos o ID do consultor atual para vincular o cliente */}
        {profile && (
          <FormNovoCliente
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchClientes}
          />
        )}
      </Modal>
    </div>
  );
}
