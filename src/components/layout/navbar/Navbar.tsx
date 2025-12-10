// src/components/layout/Navbar.tsx

import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import styles from "./Navbar.module.css";

// Tipos auxiliares
type Item = { id: string; nome: string | null; titulo?: string };

export function Navbar() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams(); // ID do cliente na URL (se houver)

  // Estados das Listas
  const [consultores, setConsultores] = useState<Item[]>([]);
  const [clientes, setClientes] = useState<Item[]>([]);
  const [simulacoes, setSimulacoes] = useState<Item[]>([]);

  // Estados das Seleções
  const [selectedConsultor, setSelectedConsultor] = useState<string>("");
  const [selectedCliente, setSelectedCliente] = useState<string>("");
  const [selectedSimulacao, setSelectedSimulacao] = useState<string>("");

  // Permissões
  const isMaster = profile?.role === "master";
  const isConsultor = profile?.role === "consultor";

  // --- EFEITOS DE CARREGAMENTO ---

  // 1. Carregar Consultores (Apenas para Master)
  useEffect(() => {
    if (isMaster) {
      async function loadConsultores() {
        const { data } = await supabase
          .from("consultores")
          .select("id, nome")
          .order("nome");
        setConsultores(data || []);
      }
      loadConsultores();
    } else if (isConsultor && profile?.id) {
      // Se for consultor, ele já é o "selecionado"
      setSelectedConsultor(profile.id);
    }
  }, [isMaster, isConsultor, profile?.id]);

  // 2. Carregar Clientes (Depende do Consultor selecionado)
  useEffect(() => {
    async function loadClientes() {
      if (!selectedConsultor) {
        setClientes([]);
        return;
      }
      const { data } = await supabase
        .from("perfis")
        .select("id, nome")
        .eq("consultor_id", selectedConsultor)
        .order("nome");
      setClientes(data || []);
    }
    loadClientes();
  }, [selectedConsultor]);

  // 3. Sincronizar Cliente Selecionado com a URL
  useEffect(() => {
    if (userId) {
      setSelectedCliente(userId);
    } else {
      // Se não tem ID na URL, verifica se estamos na rota raiz (dashboard do próprio usuário?)
      // Por enquanto, limpamos a seleção se sair da rota de dashboard
      if (!location.pathname.includes("/dashboard/")) {
        setSelectedCliente("");
      }
    }
  }, [userId, location.pathname]);

  // 4. Carregar Simulações (Depende do Cliente selecionado)
  useEffect(() => {
    async function loadSimulacoes() {
      if (!selectedCliente) {
        setSimulacoes([]);
        return;
      }
      const { data } = await supabase
        .from("simulacoes")
        .select("id, titulo")
        .eq("perfil_id", selectedCliente)
        .order("created_at", { ascending: false });

      const formatedData =
        data?.map((s) => ({ id: s.id, nome: s.titulo || "Sem Título" })) || [];
      setSimulacoes(formatedData);

      // Opcional: Selecionar automaticamente a primeira (mais recente)
      // if (formatedData.length > 0) setSelectedSimulacao(formatedData[0].id);
    }
    loadSimulacoes();
  }, [selectedCliente]);

  // --- HANDLERS ---

  const handleConsultorChange = (id: string) => {
    setSelectedConsultor(id);
    setSelectedCliente("");
    setSelectedSimulacao("");
    navigate("/cliente"); // Volta para lista ao trocar consultor
  };

  const handleClienteChange = (id: string) => {
    setSelectedCliente(id);
    setSelectedSimulacao("");
    if (id) {
      navigate(`/dashboard/${id}`);
    }
  };

  const handleSimulacaoChange = (id: string) => {
    setSelectedSimulacao(id);
    // Aqui você poderá passar o ID da simulação para o Dashboard via URL ou Contexto
    // Ex: navigate(`/dashboard/${selectedCliente}?simulacao=${id}`)
  };

  // Se for cliente final, talvez não precise dessa Navbar (ou mostra só simulações)
  // Por enquanto, mostra para Staff (Master/Consultor)
  if (!isMaster && !isConsultor) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.badge}>
        {isMaster ? "Visão Master" : "Visão Consultor"}
      </div>

      {/* NÍVEL 1: CONSULTOR (Apenas Master vê este filtro) */}
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

      {/* NÍVEL 2: CLIENTE */}
      <div className={styles.group}>
        <label className={styles.label}>Cliente</label>
        <select
          className={styles.select}
          value={selectedCliente}
          onChange={(e) => handleClienteChange(e.target.value)}
          disabled={!selectedConsultor}
        >
          <option value="">Selecione um cliente...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      {/* NÍVEL 3: SIMULAÇÃO / ESTUDO */}
      <div className={styles.group}>
        <label className={styles.label}>Cenário / Estudo</label>
        <select
          className={styles.select}
          value={selectedSimulacao}
          onChange={(e) => handleSimulacaoChange(e.target.value)}
          disabled={!selectedCliente}
        >
          <option value="">Atual (Ativo)</option>
          {simulacoes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
