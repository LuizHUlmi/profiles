// src/components/layout/navbar/Navbar.tsx

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";

// UI Components & Icons
import { Button } from "../../ui/button/Button";
import { Modal } from "../../ui/modal/Modal";
import { NewSimulationModal } from "../../financial/forms/NewSimulationModal";
import { Plus, Trash2, AlertTriangle, Loader2 } from "lucide-react";

// Contexts & Libs
import { useAuth } from "../../../context/AuthContext";
import { useActiveClient } from "../../../context/ActiveClientContext";
import { useToast } from "../../ui/toast/ToastContext";
import { supabase } from "../../../lib/supabase";

type Item = { id: string; nome: string | null };

export function Navbar() {
  const { profile } = useAuth();
  const { activeClientId, setActiveClientId } = useActiveClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  // --- Estados de Dados ---
  const [consultores, setConsultores] = useState<Item[]>([]);
  const [clientes, setClientes] = useState<Item[]>([]);
  const [simulacoes, setSimulacoes] = useState<Item[]>([]);

  // --- Estados de Seleção Local ---
  const [selectedConsultor, setSelectedConsultor] = useState<string>("");
  const [selectedSimulacao, setSelectedSimulacao] = useState<string>("");

  // --- Estados de Loading ---
  const [isLoadingConsultores, setIsLoadingConsultores] = useState(false);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  const [isLoadingSimulacoes, setIsLoadingSimulacoes] = useState(false);

  // --- Estados de Modais ---
  const [isNewSimModalOpen, setIsNewSimModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Helpers de Permissão ---
  const isMaster = profile?.role === "master";
  const isConsultor = profile?.role === "consultor";
  const isStaff = isMaster || isConsultor;

  // Sincroniza a simulação selecionada com a URL
  useEffect(() => {
    const simIdUrl = searchParams.get("simulacaoId");
    if (simIdUrl) setSelectedSimulacao(simIdUrl);
    else if (!activeClientId) setSelectedSimulacao("");
  }, [searchParams, activeClientId]);

  // 1. CARREGAR CONSULTORES (Apenas Master)
  useEffect(() => {
    if (isConsultor && profile?.id) {
      setSelectedConsultor(profile.id);
      return;
    }

    if (isMaster) {
      const fetchConsultores = async () => {
        setIsLoadingConsultores(true);
        const { data, error } = await supabase
          .from("consultores")
          .select("id, nome")
          .order("nome");

        if (!error && data) setConsultores(data);
        setIsLoadingConsultores(false);
      };
      fetchConsultores();
    }
  }, [isMaster, isConsultor, profile]);

  // 2. CARREGAR CLIENTES (Quando muda Consultor)
  useEffect(() => {
    if (!isStaff || !selectedConsultor) {
      setClientes([]);
      return;
    }

    const fetchClientes = async () => {
      setIsLoadingClientes(true);
      const { data, error } = await supabase
        .from("perfis")
        .select("id, nome")
        .eq("consultor_id", selectedConsultor)
        .order("nome");

      if (!error && data) setClientes(data);
      else setClientes([]);

      setIsLoadingClientes(false);
    };

    fetchClientes();
  }, [selectedConsultor, isStaff]);

  // 3. CARREGAR SIMULAÇÕES (Quando muda Cliente Ativo)
  const loadSimulacoes = async () => {
    if (!activeClientId) {
      setSimulacoes([]);
      setSelectedSimulacao("");
      return;
    }

    setIsLoadingSimulacoes(true);
    const { data } = await supabase
      .from("simulacoes")
      .select("id, titulo")
      .eq("perfil_id", activeClientId)
      .eq("ativo", true)
      .order("created_at", { ascending: false });

    setSimulacoes(
      data?.map((s) => ({ id: s.id, nome: s.titulo || "Sem Título" })) || []
    );
    setIsLoadingSimulacoes(false);
  };

  useEffect(() => {
    loadSimulacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClientId]);

  // HANDLERS
  const handleConsultorChange = (id: string) => {
    setSelectedConsultor(id);
    setActiveClientId(null);
    navigate("/");
  };

  const handleClienteChange = (id: string) => {
    setActiveClientId(id);
    if (location.search.includes("simulacaoId")) {
      navigate(location.pathname);
    }
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
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.select}
                    value={selectedConsultor}
                    onChange={(e) => handleConsultorChange(e.target.value)}
                    disabled={isLoadingConsultores}
                  >
                    <option value="">
                      {isLoadingConsultores ? "Carregando..." : "Selecione..."}
                    </option>
                    {consultores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className={styles.group}>
              <label className={styles.label}>Cliente Ativo</label>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.select}
                  value={activeClientId || ""}
                  onChange={(e) => handleClienteChange(e.target.value)}
                  disabled={!selectedConsultor || isLoadingClientes}
                >
                  <option value="">
                    {isLoadingClientes
                      ? "Buscando clientes..."
                      : clientes.length === 0 && selectedConsultor
                      ? "(Nenhum cliente encontrado)"
                      : "Selecione o cliente..."}
                  </option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
                {/* Ícone de loading absoluto dentro do wrapper */}
                {isLoadingClientes && (
                  <Loader2
                    size={14}
                    className="animate-spin"
                    style={{
                      position: "absolute",
                      right: "10px",
                      color: "#9ca3af",
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}

        <div
          className={styles.group}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <label
            className={styles.label}
            style={{ width: "100%", maxWidth: "400px", textAlign: "left" }}
          >
            Cenário / Estudo
          </label>
          <div
            style={{
              display: "flex",
              gap: "8px",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <div className={styles.selectWrapper} style={{ flex: 1 }}>
              <select
                className={styles.select}
                value={selectedSimulacao}
                onChange={(e) => handleSimulacaoChange(e.target.value)}
                disabled={!activeClientId || isLoadingSimulacoes}
              >
                <option value="">
                  {isLoadingSimulacoes
                    ? "Carregando..."
                    : "(Cenário Padrão / Último)"}
                </option>
                {simulacoes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>

            <Button
              size="sm"
              disabled={!activeClientId}
              onClick={() => setIsNewSimModalOpen(true)}
              title="Criar novo cenário"
            >
              <Plus size={16} />
            </Button>

            <Button
              size="sm"
              variant="danger"
              disabled={!selectedSimulacao}
              onClick={() => setIsDeleteModalOpen(true)}
              title="Excluir cenário atual"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </nav>

      {/* MODAIS (Inalterados) */}
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
                color: "var(--text-primary)",
              }}
            >
              Excluir Cenário?
            </h3>
          </div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Esta ação removerá permanentemente este cenário de simulação.
          </p>
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
