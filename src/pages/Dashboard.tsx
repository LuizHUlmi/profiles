// src/pages/Dashboard.tsx

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useFinancialProjection } from "../hooks/useFinancialProjection";
import { useProjects } from "../hooks/useProjects"; // <--- Hook novo
import { useToast } from "../components/ui/toast/ToastContext";
import { useSearchParams } from "react-router-dom";
import { calculateAge } from "../utils/date";

// Componentes UI e Features
import { FinancialChart } from "../components/financial/grafico/FinancialChart";
import { MeusProjetos } from "../components/projects/MeusProjetos";

import { SimulacaoControls } from "../components/financial/grafico/SimulationControls";
import { Modal } from "../components/ui/modal/Modal";
import { FormNovoProjeto } from "../components/projects/FormNovoProjeto";

import type { Projeto, Simulacao } from "../types/database";
import styles from "./Dashboard.module.css";
import { useActiveClient } from "../context/ActiveClientContext";
import { AlertCircle, Users } from "lucide-react";

export function Dashboard() {
  const { activeClientId } = useActiveClient();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const simulacaoIdUrl = searchParams.get("simulacaoId");

  // --- Hooks de Dados ---
  const { projects, fetchProjects, deleteProject } = useProjects();

  // --- Estados UI ---
  const [modalView, setModalView] = useState<"add" | "edit" | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Projeto | null>(null);
  const [isSavingSim, setIsSavingSim] = useState(false);

  // --- Estados Negócio ---
  const [currentSim, setCurrentSim] = useState<Simulacao | null>(null);
  const [activeProjectIds, setActiveProjectIds] = useState<number[]>([]);

  // --- SLIDERS & DADOS VITAIS ---
  // Idade padrão temporária (caso não tenha data de nascimento)
  const [idadeAtual, setIdadeAtual] = useState(30);
  const [idadeCalculada, setIdadeCalculada] = useState(false); // Para saber se veio do banco

  const [patrimonioAtual, setPatrimonioAtual] = useState(0);
  const [idadeAposentadoria, setIdadeAposentadoria] = useState(65);
  const [rendaDesejada, setRendaDesejada] = useState(15000);
  const [outrasRendas, setOutrasRendas] = useState(0);
  const [investimentoMensal, setInvestimentoMensal] = useState(0);

  // --- Projeção ---
  const { ages, years, dataProjected } = useFinancialProjection({
    idadeAtual,
    patrimonioAtual,
    idadeAposentadoria,
    rendaDesejada,
    outrasRendas,
    investimentoMensal,
    projects,
    activeProjectIds,
  });

  // --- 1. CARREGAMENTO GERAL ---
  useEffect(() => {
    if (!activeClientId) return;

    // A. Carrega Projetos
    fetchProjects(activeClientId);

    // B. Carrega Dados do Cliente (Idade) e Simulação
    loadClientAndSimulation(activeClientId, simulacaoIdUrl);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClientId, simulacaoIdUrl, fetchProjects]);

  const loadClientAndSimulation = async (
    clientId: string,
    simId: string | null
  ) => {
    try {
      // 1. BUSCAR DATA DE NASCIMENTO (PERFIL)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: perfil, error: perfilError } = await supabase
        .from("perfis")
        .select("data_nascimento")
        .eq("id", clientId)
        .single();

      if (perfil?.data_nascimento) {
        const idadeReal = calculateAge(perfil.data_nascimento);
        setIdadeAtual(idadeReal);
        setIdadeCalculada(true);

        // Ajuste defensivo: Se a aposentadoria estava menor que a idade real, empurra pra frente
        if (idadeAposentadoria <= idadeReal) {
          setIdadeAposentadoria(idadeReal + 10);
        }
      } else {
        // Se não tiver data, avisamos ou usamos padrão
        setIdadeCalculada(false);
      }

      // 2. BUSCAR SIMULAÇÃO
      let query = supabase
        .from("simulacoes")
        .select("*")
        .eq("perfil_id", clientId);

      if (simId) {
        query = query.eq("id", simId);
      } else {
        query = query
          .eq("ativo", true)
          .order("created_at", { ascending: false });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: simData, error: simError } = await query.maybeSingle();

      if (simData) {
        setCurrentSim(simData);
        // Só sobrescrevemos sliders se a simulação existir
        setIdadeAposentadoria(simData.idade_aposentadoria);
        setRendaDesejada(simData.renda_desejada);
        setOutrasRendas(simData.outras_rendas);
        setInvestimentoMensal(simData.investimento_mensal);
        setPatrimonioAtual(simData.patrimonio_atual);

        // Projetos ativos
        const { data: links } = await supabase
          .from("simulacao_projetos")
          .select("projeto_id")
          .eq("simulacao_id", simData.id);
        setActiveProjectIds(links ? links.map((l) => l.projeto_id) : []);
      } else {
        // Reset se não houver simulação
        setCurrentSim(null);
        setActiveProjectIds([]);
        setPatrimonioAtual(0);
        setInvestimentoMensal(0);
        // Mantemos a idade que calculamos no passo 1!
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  // --- AÇÕES (Salvar, Projetos...) permanecem iguais ---
  const handleSaveSimulation = async () => {
    if (!activeClientId) return;
    setIsSavingSim(true);
    try {
      const simPayload = {
        perfil_id: activeClientId,
        titulo: currentSim?.titulo || "Cenário Principal",
        idade_aposentadoria: idadeAposentadoria,
        renda_desejada: rendaDesejada,
        outras_rendas: outrasRendas,
        investimento_mensal: investimentoMensal,
        patrimonio_atual: patrimonioAtual,
        ativo: true,
      };

      if (currentSim) {
        const { error, data } = await supabase
          .from("simulacoes")
          .update(simPayload)
          .eq("id", currentSim.id)
          .select();
        if (error) throw error;
        toast.success("Cenário atualizado!");
        if (data) setCurrentSim(data[0]);
      } else {
        const { data, error } = await supabase
          .from("simulacoes")
          .insert(simPayload)
          .select()
          .single();
        if (error) throw error;
        toast.success("Cenário criado!");
        if (data) setCurrentSim(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar.");
    } finally {
      setIsSavingSim(false);
    }
  };

  const handleToggleProject = async (projectId: number, isActive: boolean) => {
    if (!currentSim) return toast.info("Crie um cenário primeiro.");
    setActiveProjectIds((prev) =>
      isActive ? [...prev, projectId] : prev.filter((id) => id !== projectId)
    );
    if (isActive)
      await supabase.from("simulacao_projetos").insert({
        simulacao_id: currentSim.id,
        projeto_id: projectId,
        ativo: true,
      });
    else
      await supabase
        .from("simulacao_projetos")
        .delete()
        .eq("simulacao_id", currentSim.id)
        .eq("projeto_id", projectId);
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Tem certeza?")) return;
    await deleteProject(id);
    setActiveProjectIds((prev) => prev.filter((pId) => pId !== id));
  };

  const handleSuccessForm = () => {
    if (activeClientId) fetchProjects(activeClientId);
  };

  // --- RENDERIZAÇÃO ---
  if (!activeClientId) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          color: "var(--text-secondary)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "#e2e8f0",
            padding: "20px",
            borderRadius: "50%",
            marginBottom: "20px",
          }}
        >
          <Users size={48} color="#64748b" />
        </div>
        <h2 style={{ color: "var(--text-primary)" }}>
          Nenhum cliente selecionado
        </h2>
        <p>Selecione um cliente na barra superior.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
            Planejamento Financeiro
          </h2>
          <div
            style={{
              display: "flex",
              gap: "15px",
              alignItems: "center",
              marginTop: "5px",
            }}
          >
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Cenário: <strong>{currentSim?.titulo || "Novo Cenário"}</strong>
            </p>

            {/* Feedback de Idade */}
            {idadeCalculada ? (
              <span
                style={{
                  fontSize: "0.85rem",
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "2px 8px",
                  borderRadius: "12px",
                }}
              >
                Idade Real: {idadeAtual} anos
              </span>
            ) : (
              <span
                style={{
                  fontSize: "0.85rem",
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <AlertCircle size={12} /> Idade Padrão (Complete o Perfil)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.dashboardLayout}>
        <div>
          <FinancialChart
            ages={ages}
            years={years}
            dataProjected={dataProjected}
          />
        </div>
        <div>
          <SimulacaoControls
            idade={idadeAposentadoria}
            setIdade={setIdadeAposentadoria}
            renda={rendaDesejada}
            setRenda={setRendaDesejada}
            outrasRendas={outrasRendas}
            setOutrasRendas={setOutrasRendas}
            investimento={investimentoMensal}
            setInvestimento={setInvestimentoMensal}
            onSave={handleSaveSimulation}
            isSaving={isSavingSim}
          />
        </div>
      </div>

      <div className={styles.projectsSection}>
        <MeusProjetos
          projects={projects}
          activeProjectIds={activeProjectIds}
          onAddClick={() => {
            setProjectToEdit(null);
            setModalView("add");
          }}
          onEditProject={(p) => {
            setProjectToEdit(p);
            setModalView("add");
          }}
          onDeleteProject={handleDeleteProject}
          onToggleProject={handleToggleProject}
        />
      </div>

      <Modal isOpen={!!modalView} onClose={() => setModalView(null)}>
        {modalView === "add" && activeClientId && (
          <FormNovoProjeto
            onClose={() => setModalView(null)}
            onSuccess={handleSuccessForm}
            projectToEdit={projectToEdit}
            ownerId={activeClientId}
          />
        )}
      </Modal>
    </div>
  );
}
