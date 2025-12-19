// src/pages/Futuro.tsx

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { calculateAge } from "../utils/date";

// Hooks
import { useFinancialProjection } from "../hooks/useFinancialProjection";
import { useProjects } from "../hooks/useProjects";
import { useActiveClient } from "../context/ActiveClientContext";
import { useToast } from "../components/ui/toast/ToastContext";

// Componentes
import { FinancialChart } from "../components/financial/grafico/FinancialChart";
import { SimulacaoControls } from "../components/financial/grafico/SimulationControls";
import { MeusProjetos } from "../components/projects/MeusProjetos";
import { Modal } from "../components/ui/modal/Modal";
import { FormNovoProjeto } from "../components/projects/FormNovoProjeto";
import { ClientSelectionPlaceholder } from "../components/ui/placeholders/ClientSelectionPlaceholder";
import { MetricCard } from "../components/financial/MetricCard"; // <--- Certifique-se de criar este arquivo ou copie o código acima para cá

// Ícones e Tipos
import { AlertCircle, Wallet, TrendingUp, Target } from "lucide-react";
import type { Projeto, Simulacao } from "../types/database";
import styles from "./Futuro.module.css";

export function Futuro() {
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
  const [expectativaVida, setExpectativaVida] = useState(100);
  const [idadeAtual, setIdadeAtual] = useState(30);
  const [idadeCalculada, setIdadeCalculada] = useState(false);

  const [patrimonioAtual, setPatrimonioAtual] = useState(0);
  const [idadeAposentadoria, setIdadeAposentadoria] = useState(65);
  const [rendaDesejada, setRendaDesejada] = useState(15000);
  const [outrasRendas, setOutrasRendas] = useState(0);
  const [investimentoMensal, setInvestimentoMensal] = useState(0);

  // --- Projeção ---
  const { ages, years, dataProjected, dataWithProjects } =
    useFinancialProjection({
      idadeAtual,
      expectativaVida,
      patrimonioAtual,
      idadeAposentadoria,
      rendaDesejada,
      outrasRendas,
      investimentoMensal,
      projects,
      activeProjectIds,
    });

  // --- CÁLCULO DE KPIs ---
  // Encontrar o valor projetado na idade de aposentadoria
  const indexAposentadoria = idadeAposentadoria - idadeAtual;
  const patrimonioNaAposentadoria =
    indexAposentadoria >= 0 && indexAposentadoria < dataWithProjects.length
      ? dataWithProjects[indexAposentadoria]
      : 0;

  // --- CARREGAMENTO GERAL ---
  useEffect(() => {
    if (!activeClientId) return;
    fetchProjects(activeClientId);
    loadClientAndSimulation(activeClientId, simulacaoIdUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClientId, simulacaoIdUrl, fetchProjects]);

  const loadClientAndSimulation = async (
    clientId: string,
    simId: string | null
  ) => {
    try {
      // 1. BUSCAR DADOS DO PERFIL
      const { data: perfil } = await supabase
        .from("perfis")
        .select("data_nascimento, expectativa_vida")
        .eq("id", clientId)
        .single();

      if (perfil?.data_nascimento) {
        const idadeReal = calculateAge(perfil.data_nascimento);
        setIdadeAtual(idadeReal);
        setIdadeCalculada(true);
        if (idadeAposentadoria <= idadeReal)
          setIdadeAposentadoria(idadeReal + 10);
      } else {
        setIdadeCalculada(false);
      }

      setExpectativaVida(perfil?.expectativa_vida || 100);

      // 2. BUSCAR SIMULAÇÃO
      let query = supabase
        .from("simulacoes")
        .select("*")
        .eq("perfil_id", clientId);
      if (simId) query = query.eq("id", simId);
      else
        query = query
          .eq("ativo", true)
          .order("created_at", { ascending: false });

      const { data: simData } = await query.maybeSingle();

      if (simData) {
        setCurrentSim(simData);
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
        setCurrentSim(null);
        setActiveProjectIds([]);
        setPatrimonioAtual(0);
        setInvestimentoMensal(0);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  // --- ACTIONS ---
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
    if (!currentSim) return toast.info("Salve o cenário primeiro.");

    // Optimistic UI
    setActiveProjectIds((prev) =>
      isActive ? [...prev, projectId] : prev.filter((id) => id !== projectId)
    );

    if (isActive) {
      await supabase.from("simulacao_projetos").insert({
        simulacao_id: currentSim.id,
        projeto_id: projectId,
        ativo: true,
      });
    } else {
      await supabase
        .from("simulacao_projetos")
        .delete()
        .eq("simulacao_id", currentSim.id)
        .eq("projeto_id", projectId);
    }
  };

  const handleToggleColumn = async (priority: string, isActive: boolean) => {
    if (!currentSim) return toast.info("Salve o cenário primeiro.");

    const projectsInColumn = projects.filter((p) => p.prioridade === priority);
    const idsInColumn = projectsInColumn.map((p) => p.id);
    if (idsInColumn.length === 0) return;

    setActiveProjectIds((prev) => {
      if (isActive) return Array.from(new Set([...prev, ...idsInColumn]));
      return prev.filter((id) => !idsInColumn.includes(id));
    });

    try {
      if (isActive) {
        await supabase
          .from("simulacao_projetos")
          .delete()
          .eq("simulacao_id", currentSim.id)
          .in("projeto_id", idsInColumn);
        const links = idsInColumn.map((id) => ({
          simulacao_id: currentSim!.id,
          projeto_id: id,
          ativo: true,
        }));
        await supabase.from("simulacao_projetos").insert(links);
      } else {
        await supabase
          .from("simulacao_projetos")
          .delete()
          .eq("simulacao_id", currentSim.id)
          .in("projeto_id", idsInColumn);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao sincronizar.");
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Tem certeza?")) return;
    await deleteProject(id);
    setActiveProjectIds((prev) => prev.filter((pId) => pId !== id));
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);

  if (!activeClientId) return <ClientSelectionPlaceholder />;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Planejamento Futuro</h2>
          <div className={styles.scenarioBadge}>
            Cenário:{" "}
            <span className={styles.scenarioName}>
              {currentSim?.titulo || "Não salvo"}
            </span>
          </div>
        </div>

        {idadeCalculada ? (
          <div className={`${styles.ageBadge} ${styles.ageReal}`}>
            Idade Real: {idadeAtual} anos
          </div>
        ) : (
          <div className={`${styles.ageBadge} ${styles.ageEstimated}`}>
            <AlertCircle size={14} /> Idade Estimada
          </div>
        )}
      </div>

      {/* KPI CARDS (Resumo de Topo) */}
      <div className={styles.kpiGrid}>
        <MetricCard
          title="Patrimônio Inicial"
          value={formatMoney(patrimonioAtual)}
          icon={Wallet}
          colorTheme="blue"
        />
        <MetricCard
          title="Aporte Mensal"
          value={formatMoney(investimentoMensal)}
          icon={TrendingUp}
          colorTheme="green"
        />
        <MetricCard
          title={`Projeção aos ${idadeAposentadoria} anos`}
          value={formatMoney(patrimonioNaAposentadoria)}
          subtitle="Considerando rentabilidade e projetos"
          icon={Target}
          colorTheme="purple"
        />
      </div>

      {/* DASHBOARD GRID */}
      <div className={styles.dashboardGrid}>
        {/* Lado Esquerdo: Gráfico */}
        <div className={styles.chartCard}>
          <FinancialChart
            ages={ages}
            years={years}
            dataProjected={dataProjected}
            dataWithProjects={dataWithProjects}
          />
        </div>

        {/* Lado Direito: Controles */}
        <div className={styles.controlsCard}>
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

      {/* SEÇÃO DE PROJETOS */}
      <div className={styles.projectsSection}>
        <h3 className={styles.sectionTitle}>Projetos de Vida</h3>
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
          onToggleColumn={handleToggleColumn}
        />
      </div>

      {/* MODAL */}
      <Modal isOpen={!!modalView} onClose={() => setModalView(null)}>
        {modalView === "add" && activeClientId && (
          <FormNovoProjeto
            onClose={() => setModalView(null)}
            onSuccess={() => fetchProjects(activeClientId)}
            projectToEdit={projectToEdit}
            ownerId={activeClientId}
          />
        )}
      </Modal>
    </div>
  );
}
