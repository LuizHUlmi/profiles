// src/components/layout/navbar/Navbar.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./Navbar.module.css";

import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useActiveClient } from "../../../context/ActiveClientContext";
import { useToast } from "../../ui/toast/ToastContext";
import { supabase } from "../../../lib/supabase";
import { Button } from "../../ui/button/Button";
import { Modal } from "../../ui/modal/Modal";
import { NewSimulationModal } from "../../financial/forms/NewSimulationModal";

type Item = { id: string; nome: string | null; titulo?: string };

export function Navbar() {
  const { profile } = useAuth();
  const { activeClientId, setActiveClientId } = useActiveClient();
  const navigate = useNavigate();
  const toast = useToast();

  const [consultores, setConsultores] = useState<Item[]>([]);
  const [clientes, setClientes] = useState<Item[]>([]);
  const [simulacoes, setSimulacoes] = useState<Item[]>([]);

  // 1. ALTERAÇÃO: Inicializa lendo do localStorage para não perder no refresh
  const [selectedConsultor, setSelectedConsultor] = useState<string>(() => {
    return localStorage.getItem("@avere:selectedConsultor") || "";
  });

  const [selectedSimulacao, setSelectedSimulacao] = useState<string>("");

  const [isNewSimModalOpen, setIsNewSimModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMaster = profile?.role === "master";
  const isConsultor = profile?.role === "consultor";
  const isStaff = isMaster || isConsultor;

  // 1. Inicialização de Consultor (se for o próprio logado)
  useEffect(() => {
    if (isConsultor && profile?.id) setSelectedConsultor(profile.id);
  }, [isConsultor, profile]);

  // 2. Carregar Consultores (Apenas Master vê todos)
  useEffect(() => {
    if (isMaster) {
      supabase
        .from("consultores")
        .select("id, nome")
        .order("nome")
        .then(({ data }) => setConsultores(data || []));
    }
  }, [isMaster]);

  // 3. Carregar Clientes (Baseado no Consultor Selecionado)
  useEffect(() => {
    if (!isStaff || !selectedConsultor) return setClientes([]);

    supabase
      .from("perfis")
      .select("id, nome")
      .eq("consultor_id", selectedConsultor)
      .order("nome")
      .then(({ data }) => setClientes(data || []));
  }, [selectedConsultor, isStaff]);

  // 4. Carregar Simulações (Baseado no CLIENTE ATIVO DO CONTEXTO)
  const loadSimulacoes = async () => {
    if (!activeClientId) return setSimulacoes([]);

    const { data } = await supabase
      .from("simulacoes")
      .select("id, titulo")
      .eq("perfil_id", activeClientId)
      .order("created_at", { ascending: false });

    setSimulacoes(
      data?.map((s) => ({ id: s.id, nome: s.titulo || "Sem Título" })) || []
    );
  };

  useEffect(() => {
    loadSimulacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClientId]);

  // --- HANDLERS ---

  // 2. ALTERAÇÃO: Salva no localStorage ao mudar
  const handleConsultorChange = (id: string) => {
    setSelectedConsultor(id);

    if (id) {
      localStorage.setItem("@avere:selectedConsultor", id);
    } else {
      localStorage.removeItem("@avere:selectedConsultor");
    }

    setActiveClientId(null); // Reseta o cliente global se mudar o consultor
    setSelectedSimulacao("");
  };

  const handleClienteChange = (id: string) => {
    setActiveClientId(id);
    setSelectedSimulacao("");
  };

  const handleSimulacaoChange = (id: string) => {
    setSelectedSimulacao(id);
    navigate(`/?simulacaoId=${id}`);
  };

  const handleSuccessNewStudy = (newId: string) => {
    loadSimulacoes();
    setSelectedSimulacao(newId);
    navigate(`/?simulacaoId=${newId}`);
  };

  const confirmDeleteStudy = async () => {
    if (!selectedSimulacao) return;
    setIsDeleting(true);
    try {
      await supabase.from("simulacoes").delete().eq("id", selectedSimulacao);
      toast.success("Cenário excluído.");
      setSelectedSimulacao("");
      navigate(`/?simulacaoId=`);
      loadSimulacoes();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!profile) return null;

  return (
    <>
      <nav className={styles.navbar}>
        <div
          className={styles.badge}
          style={{ backgroundColor: !isStaff ? "var(--primary)" : undefined }}
        >
          {isMaster
            ? "Visão Master"
            : isConsultor
            ? "Visão Consultor"
            : "Meus Cenários"}
        </div>

        {isStaff && (
          <>
            {isMaster && (
              <div className={styles.group}>
                <label className={styles.label}>Consultor</label>
                <select
                  className={styles.select}
                  value={selectedConsultor}
                  onChange={(e) => handleConsultorChange(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {consultores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className={styles.group}>
              <label className={styles.label}>Cliente Ativo</label>
              <select
                className={styles.select}
                value={activeClientId || ""}
                onChange={(e) => handleClienteChange(e.target.value)}
                disabled={!selectedConsultor}
              >
                <option value="">Selecione para editar...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className={styles.group}>
          <label className={styles.label}>Cenário / Estudo</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <select
              className={styles.select}
              style={{ flex: 1 }}
              value={selectedSimulacao}
              onChange={(e) => handleSimulacaoChange(e.target.value)}
              disabled={!activeClientId}
            >
              <option value="">(Último ativo)</option>
              {simulacoes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              disabled={!activeClientId}
              onClick={() => setIsNewSimModalOpen(true)}
            >
              <Plus size={16} />
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={!selectedSimulacao}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </nav>

      <Modal
        isOpen={isNewSimModalOpen}
        onClose={() => setIsNewSimModalOpen(false)}
      >
        {activeClientId && (
          <NewSimulationModal
            clientId={activeClientId}
            onClose={() => setIsNewSimModalOpen(false)}
            onSuccess={handleSuccessNewStudy}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div style={{ padding: "0.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "1rem",
              color: "var(--danger)",
            }}
          >
            <AlertTriangle size={24} />
            <h3
              style={{
                margin: 0,
                fontSize: "1.2rem",
                fontWeight: "700",
                color: "var(--text-primary)",
              }}
            >
              Excluir?
            </h3>
          </div>
          <p>Confirma exclusão permanente?</p>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteStudy}
              loading={isDeleting}
            >
              Sim, excluir
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
