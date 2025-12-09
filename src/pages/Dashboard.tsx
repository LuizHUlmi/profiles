import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useFinancialProjection } from "../hooks/useFinancialProjection";

// Componentes

import { MeusProjetos } from "../components/projects/MeusProjetos";
import { SimulacaoControls } from "../components/financial/grafico/SimulationControls";
import { Modal } from "../components/ui/modal/Modal";
import { FormNovoProjeto } from "../components/projects/FormNovoProjeto";

// Tipos e Estilos
import type { Projeto, Simulacao } from "../types/database";
import styles from "./Dashboard.module.css";
import { FinancialChart } from "../components/financial/grafico/FinancialChart";

export function Dashboard() {
  const { profile } = useAuth();

  // --- Estados de Controle de UI ---
  const [modalView, setModalView] = useState<"add" | "edit" | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Projeto | null>(null);
  const [isSavingSim, setIsSavingSim] = useState(false);

  // --- Estados de Dados do Negócio ---
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [currentSim, setCurrentSim] = useState<Simulacao | null>(null);
  const [activeProjectIds, setActiveProjectIds] = useState<number[]>([]);

  // --- Estados da Simulação (Sliders) ---
  const [patrimonioAtual] = useState(50000); // Poderia vir do perfil
  const [idadeAtual] = useState(38); // Poderia vir do perfil

  const [idadeAposentadoria, setIdadeAposentadoria] = useState(65);
  const [rendaDesejada, setRendaDesejada] = useState(15000);
  const [outrasRendas, setOutrasRendas] = useState(2500);
  const [investimentoMensal, setInvestimentoMensal] = useState(2000);

  // --- Hook de Projeção (A Lógica Matemática extraída) ---
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

  // --- Efeitos e Carregamento ---
  useEffect(() => {
    if (profile) loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;

    // 1. Busca Simulação Ativa
    const { data: simData } = await supabase
      .from("simulacoes")
      .select("*")
      .eq("perfil_id", profile.id)
      .eq("ativo", true)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (simData) {
      setCurrentSim(simData);
      // Atualiza sliders com dados do banco
      setIdadeAposentadoria(simData.idade_aposentadoria);
      setRendaDesejada(simData.renda_desejada);
      setOutrasRendas(simData.outras_rendas);
      setInvestimentoMensal(simData.investimento_mensal);
    }

    // 2. Busca Projetos
    const { data: projData } = await supabase
      .from("projetos")
      .select("*")
      .order("id", { ascending: true });
    // Nota: Idealmente filtrar por .eq('perfil_id', profile.id) se a tabela tiver essa coluna

    setProjects(projData || []);

    // 3. Busca Vínculos
    if (simData) {
      const { data: links } = await supabase
        .from("simulacao_projetos")
        .select("projeto_id")
        .eq("simulacao_id", simData.id);

      if (links) {
        setActiveProjectIds(links.map((l) => l.projeto_id));
      }
    }
  };

  // --- Handlers de Ação ---

  const handleToggleProject = async (projectId: number, isActive: boolean) => {
    if (!currentSim) {
      alert("Salve a simulação primeiro para vincular projetos.");
      return;
    }

    // Otimistic Update
    setActiveProjectIds((prev) =>
      isActive ? [...prev, projectId] : prev.filter((id) => id !== projectId)
    );

    // Banco
    if (isActive) {
      await supabase.from("simulacao_projetos").insert({
        simulacao_id: currentSim.id,
        projeto_id: projectId,
      });
    } else {
      await supabase
        .from("simulacao_projetos")
        .delete()
        .eq("simulacao_id", currentSim.id)
        .eq("projeto_id", projectId);
    }
  };

  const handleSaveSimulation = async () => {
    if (!profile) return;
    setIsSavingSim(true);

    try {
      const simPayload = {
        perfil_id: profile.id,
        titulo: "Cenário Principal",
        idade_aposentadoria: idadeAposentadoria,
        renda_desejada: rendaDesejada,
        outras_rendas: outrasRendas,
        investimento_mensal: investimentoMensal,
        patrimonio_atual: patrimonioAtual,
        ativo: true,
      };

      if (currentSim) {
        await supabase
          .from("simulacoes")
          .update(simPayload)
          .eq("id", currentSim.id);
      } else {
        const { data } = await supabase
          .from("simulacoes")
          .insert(simPayload)
          .select()
          .single();
        if (data) setCurrentSim(data);
      }
      alert("Simulação salva com sucesso!");
      if (!currentSim) loadDashboardData(); // Recarrega se for nova
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar simulação.");
    } finally {
      setIsSavingSim(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const { error } = await supabase.from("projetos").delete().eq("id", id);
    if (!error) loadDashboardData();
  };

  // --- Renderização ---
  return (
    <div>
      <div className={styles.dashboardLayout}>
        {/* Gráfico */}
        <div>
          <FinancialChart
            ages={ages}
            years={years}
            dataProjected={dataProjected}
          />
        </div>

        {/* Controles Laterais */}
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

      {/* Seção de Projetos */}
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

      {/* Modal Genérico */}
      <Modal isOpen={!!modalView} onClose={() => setModalView(null)}>
        {modalView === "add" && (
          <FormNovoProjeto
            onClose={() => setModalView(null)}
            onSuccess={loadDashboardData}
            projectToEdit={projectToEdit}
          />
        )}
      </Modal>
    </div>
  );
}
