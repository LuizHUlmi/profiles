// src/pages/Equipe.tsx

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ConsultorForm } from "../components/team/ConsultorForm";
import { Modal } from "../components/ui/modal/Modal";
import { UserPlus, Trash2, Shield, User } from "lucide-react";

// Tipo para a listagem
type Consultor = {
  id: string;
  nome: string;
  email: string;
  nivel: "master" | "consultor";
  ativo: boolean;
};

export function Equipe() {
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar a equipe no banco
  const fetchEquipe = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("consultores")
      .select("*")
      .order("nome");

    if (error) {
      console.error("Erro ao buscar equipe:", error);
    } else {
      setConsultores(data || []);
    }
    setIsLoading(false);
  };

  // Carrega ao abrir a página
  useEffect(() => {
    fetchEquipe();
  }, []);

  // Função para deletar (Opcional, mas útil)
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;

    const { error } = await supabase.from("consultores").delete().eq("id", id);
    if (error) {
      alert("Erro ao deletar.");
    } else {
      fetchEquipe(); // Recarrega a lista
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
            Gestão de Equipe
          </h2>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>
            Gerencie os consultores e acessos do sistema.
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
          Novo Membro
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
                Nível
              </th>
              <th
                style={{ padding: "1rem", color: "#555", fontSize: "0.9rem" }}
              >
                Status
              </th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: "2rem", textAlign: "center" }}
                >
                  Carregando...
                </td>
              </tr>
            ) : consultores.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#888",
                  }}
                >
                  Nenhum membro encontrado.
                </td>
              </tr>
            ) : (
              consultores.map((member) => (
                <tr key={member.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "1rem", fontWeight: 500 }}>
                    {member.nome}
                  </td>
                  <td style={{ padding: "1rem", color: "#666" }}>
                    {member.email}
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
                        backgroundColor:
                          member.nivel === "master" ? "#e0f2fe" : "#f3f4f6",
                        color:
                          member.nivel === "master" ? "#0369a1" : "#374151",
                      }}
                    >
                      {member.nivel === "master" ? (
                        <Shield size={14} />
                      ) : (
                        <User size={14} />
                      )}
                      {member.nivel === "master" ? "Master" : "Consultor"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        color: member.ativo ? "#16a34a" : "#dc2626",
                        fontSize: "0.9rem",
                      }}
                    >
                      {member.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(member.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#999",
                      }}
                      title="Remover acesso"
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

      {/* Modal de Cadastro */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ConsultorForm
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchEquipe} // Recarrega a lista ao salvar
        />
      </Modal>
    </div>
  );
}
