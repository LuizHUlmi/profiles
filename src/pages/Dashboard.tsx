// src/pages/Dashboard.tsx

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useFinancialProjection } from "../hooks/useFinancialProjection";
import { useProjects } from "../hooks/useProjects"; // <--- Hook novo
import { useToast } from "../components/ui/toast/ToastContext";
import { useParams } from "react-router-dom"; // <--- Importante: Para ler a URL

// Componentes UI e Features
import { FinancialChart } from "../components/financial/grafico/FinancialChart";
import { MeusProjetos } from "../components/projects/MeusProjetos";

import { SimulacaoControls } from "../components/financial/grafico/SimulationControls";
import { Modal } from "../components/ui/modal/Modal";
import { FormNovoProjeto } from "../components/projects/FormNovoProjeto";

import type { Projeto, Simulacao } from "../types/database";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const { profile } = useAuth();
  const { userId } = useParams(); // <--- Pega o ID da URL se existir
  const toast = useToast();

  // DECISÃO DO ALVO:
  // Se tem userId na URL, usamos ele. Se não, usamos o ID do perfil logado.
  const targetProfileId = userId || profile?.id;

  // --- Hooks de Dados ---
  const { projects, fetchProjects, deleteProject } = useProjects();

  // --- Estados UI ---
  const [modalView, setModalView] = useState<"add" | "edit" | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Projeto | null>(null);
  const [isSavingSim, setIsSavingSim] = useState(false);

  // --- Estados Negócio ---
  const [currentSim, setCurrentSim] = useState<Simulacao | null>(null);
  const [activeProjectIds, setActiveProjectIds] = useState<number[]>([]);

  // Sliders
  const [idadeAtual] = useState(38);
  const [patrimonioAtual] = useState(50000);

  const [idadeAposentadoria, setIdadeAposentadoria] = useState(65);
  const [rendaDesejada, setRendaDesejada] = useState(15000);
  const [outrasRendas, setOutrasRendas] = useState(2500);
  const [investimentoMensal, setInvestimentoMensal] = useState(2000);

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

  // --- Carregamento ---
  useEffect(() => {
    // Só carrega se tivermos um alvo definido
    if (targetProfileId) {
      loadSimulationData(targetProfileId);
      fetchProjects(targetProfileId);
    }
  }, [targetProfileId, fetchProjects]);

  const loadSimulationData = async (id: string) => {
    // Busca Simulação do ALVO (não necessariamente do logado)
    const { data: simData } = await supabase
      .from("simulacoes")
      .select("*")
      .eq("perfil_id", id)
      .eq("ativo", true)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (simData) {
      setCurrentSim(simData);
      setIdadeAposentadoria(simData.idade_aposentadoria);
      setRendaDesejada(simData.renda_desejada);
      setOutrasRendas(simData.outras_rendas);
      setInvestimentoMensal(simData.investimento_mensal);

      const { data: links } = await supabase
        .from("simulacao_projetos")
        .select("projeto_id")
        .eq("simulacao_id", simData.id);

      if (links) {
        setActiveProjectIds(links.map((l) => l.projeto_id));
      }
    } else {
      // Reseta se não tiver simulação (importante ao trocar de cliente)
      setCurrentSim(null);
      setActiveProjectIds([]);
    }
  };

  // --- Handlers ---

  const handleToggleProject = async (projectId: number, isActive: boolean) => {
    if (!currentSim) {
      toast.info("Salve a simulação primeiro para vincular projetos.");
      return;
    }
    setActiveProjectIds((prev) =>
      isActive ? [...prev, projectId] : prev.filter((id) => id !== projectId)
    );

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
    if (!targetProfileId) return;
    setIsSavingSim(true);

    try {
      const simPayload = {
        perfil_id: targetProfileId, // <--- Salva para o CLIENTE ALVO
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
        toast.success("Simulação atualizada!");
      } else {
        const { data } = await supabase
          .from("simulacoes")
          .insert(simPayload)
          .select()
          .single();
        if (data) setCurrentSim(data);
        toast.success("Simulação criada!");
        loadSimulationData(targetProfileId);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar.");
    } finally {
      setIsSavingSim(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
    await deleteProject(id);
  };

  const handleSuccessForm = () => {
    if (targetProfileId) fetchProjects(targetProfileId);
  };

  // Se não tiver ID nenhum (ex: erro de carregamento), mostra aviso
  if (!targetProfileId)
    return <div style={{ padding: 20 }}>Carregando perfil...</div>;

  return (
    <div>
      {/* Aviso visual se estiver vendo outro cliente */}
      {userId && (
        <div
          style={{
            backgroundColor: "#e0f2fe",
            color: "#0284c7",
            padding: "10px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: "600",
          }}
        >
          👁️ Visualizando Dashboard do Cliente
        </div>
      )}

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
        {modalView === "add" && (
          <FormNovoProjeto
            onClose={() => setModalView(null)}
            onSuccess={handleSuccessForm}
            projectToEdit={projectToEdit}
            ownerId={targetProfileId}
          />
        )}
      </Modal>
    </div>
  );
}
