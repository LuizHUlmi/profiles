// src/pages/Dashboard.tsx

import { useState, useMemo, useEffect } from "react";
import { GraficoFinanceiro } from "../components/grafico/GraficoFinanceiro";
import { MeusProjetos } from "../components/meusProjetos/MeusProjetos";
import type { Projeto, Simulacao } from "../types/database";
import { Modal } from "../components/modal/Modal";
import { FormNovoProjeto } from "../components/form/FormNovoProjeto";
import { SimulacaoControls } from "../components/grafico/ControleGrafico";
import styles from "./Dashboard.module.css";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, profile } = useAuth();

  // --- Estados ---
  const [modalView, setModalView] = useState<"add" | "edit" | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Projeto | null>(null);
  const [isSavingSim, setIsSavingSim] = useState(false);

  // Estados de Dados
  const [projects, setProjects] = useState<Projeto[]>([]); // Todos os projetos (Biblioteca)
  const [currentSim, setCurrentSim] = useState<Simulacao | null>(null); // A Simulação Ativa
  const [activeProjectIds, setActiveProjectIds] = useState<number[]>([]); // IDs dos projetos ligados

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    if (!profile) return;
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;

    // 1. Buscar a Simulação Ativa (ou criar se não existir)
    let simulacaoId = null;

    // Tenta buscar a última simulação ativa
    const { data: simData } = await supabase
      .from("simulacoes")
      .select("*")
      .eq("perfil_id", profile.id)
      .eq("ativo", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (simData) {
      setCurrentSim(simData);
      simulacaoId = simData.id;

      // Atualiza sliders com dados do banco
      setIdadeAposentadoria(simData.idade_aposentadoria);
      setRendaDesejada(simData.renda_desejada);
      setOutrasRendas(simData.outras_rendas);
      setInvestimentoMensal(simData.investimento_mensal);
      // setPatrimonioAtual(simData.patrimonio_atual);
    } else {
      // Se não existir, criaremos na hora de salvar (ou pode criar um default aqui)
      console.log("Nenhuma simulação encontrada. Usando valores padrão.");
    }

    // 2. Buscar Biblioteca de Projetos
    const { data: projData } = await supabase
      .from("projetos")
      .select("*")
      .eq("perfil_id", profile.id) // Garante que busca pelo perfil
      .order("id", { ascending: true });

    setProjects((projData as Projeto[]) || []);

    // 3. Buscar Vínculos (Projetos Ativos nesta simulação)
    if (simulacaoId) {
      const { data: links } = await supabase
        .from("simulacao_projetos")
        .select("projeto_id")
        .eq("simulacao_id", simulacaoId);

      if (links) {
        setActiveProjectIds(links.map((l) => l.projeto_id));
      }
    }
  };

  // --- INPUTS (Sliders) ---
  const [idadeAtual] = useState(38);
  const [patrimonioAtual] = useState(50000);
  const [idadeAposentadoria, setIdadeAposentadoria] = useState(65);
  const [rendaDesejada, setRendaDesejada] = useState(15000);
  const [outrasRendas, setOutrasRendas] = useState(2500);
  const [investimentoMensal, setInvestimentoMensal] = useState(2000);

  // --- AÇÃO: LIGAR/DESLIGAR PROJETO ---
  const handleToggleProject = async (projectId: number, isActive: boolean) => {
    if (!currentSim) {
      alert("Salve a simulação primeiro para vincular projetos.");
      return;
    }

    // 1. Atualização Otimista (Visual instantâneo)
    if (isActive) {
      setActiveProjectIds((prev) => [...prev, projectId]);
    } else {
      setActiveProjectIds((prev) => prev.filter((id) => id !== projectId));
    }

    // 2. Atualização no Banco
    if (isActive) {
      // Criar vínculo
      const { error } = await supabase.from("simulacao_projetos").insert({
        simulacao_id: currentSim.id,
        projeto_id: projectId,
      });
      if (error) console.error("Erro ao vincular:", error);
    } else {
      // Remover vínculo
      const { error } = await supabase
        .from("simulacao_projetos")
        .delete()
        .eq("simulacao_id", currentSim.id)
        .eq("projeto_id", projectId);
      if (error) console.error("Erro ao desvincular:", error);
    }
  };

  // --- AÇÃO: SALVAR SIMULAÇÃO ---
  const handleSaveSimulation = async () => {
    if (!profile) return;
    setIsSavingSim(true);

    try {
      const simData = {
        perfil_id: profile.id,
        titulo: "Cenário Principal",
        idade_aposentadoria: idadeAposentadoria,
        renda_desejada: rendaDesejada,
        outras_rendas: outrasRendas,
        investimento_mensal: investimentoMensal,
        patrimonio_atual: patrimonioAtual,
        ativo: true,
      };

      let newSimId = currentSim?.id;

      if (currentSim) {
        // UPDATE
        const { error } = await supabase
          .from("simulacoes")
          .update(simData)
          .eq("id", currentSim.id);
        if (error) throw error;
      } else {
        // INSERT (Cria a primeira simulação)
        const { data, error } = await supabase
          .from("simulacoes")
          .insert(simData)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setCurrentSim(data);
          newSimId = data.id;
        }
      }

      alert("Simulação salva com sucesso!");

      // Se acabamos de criar a simulação, recarregamos para habilitar os toggles
      if (!currentSim && newSimId) loadDashboardData();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar simulação.");
    } finally {
      setIsSavingSim(false);
    }
  };

  // --- CRUD PROJETOS (Mantido) ---
  const handleOpenAddModal = () => {
    setProjectToEdit(null);
    setModalView("add");
  };
  const handleOpenEditModal = (project: Projeto) => {
    setProjectToEdit(project);
    setModalView("add");
  };
  const handleCloseModal = () => {
    setModalView(null);
    setProjectToEdit(null);
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Tem certeza? Isso apagará o projeto da biblioteca.")) return;
    const { error } = await supabase.from("projetos").delete().eq("id", id);
    if (!error) loadDashboardData();
  };

  // --- CÁLCULO DA PROJEÇÃO ---
  const { ages, years, dataProjected } = useMemo(() => {
    const idadeFinal = 100;
    const anosParaSimular = idadeFinal - idadeAtual;
    const taxaJurosMensal = Math.pow(1 + 0.06, 1 / 12) - 1;

    // Calcular custo dos projetos ATIVOS
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const activeProjects = projects.filter((p) =>
      activeProjectIds.includes(p.id)
    );

    // Simplificação: Somando todos os projetos como se fossem à vista hoje
    // (Numa versão avançada, você descontaria no ano específico do projeto)
    // const custoProjetos = activeProjects.reduce((acc, curr) => acc + curr.valor, 0);

    const labelsAge: number[] = [];
    const labelsYear: string[] = [];
    const saldoProjetado: number[] = [];
    let saldo = patrimonioAtual;

    for (let ano = 0; ano <= anosParaSimular; ano++) {
      const idadeNoAno = idadeAtual + ano;
      const anoCalendario = 2025 + ano;

      for (let mes = 0; mes < 12; mes++) {
        saldo = saldo * (1 + taxaJurosMensal);

        if (idadeNoAno < idadeAposentadoria) {
          saldo += investimentoMensal;
        } else {
          saldo -= Math.max(0, rendaDesejada - outrasRendas);
        }
        if (saldo < 0) saldo = 0;

        labelsAge.push(idadeNoAno);
        labelsYear.push(`Jan/${anoCalendario}`); // Simplificado labels
        saldoProjetado.push(Math.round(saldo));
      }
    }

    return {
      ages: labelsAge,
      years: labelsYear,
      dataProjected: saldoProjetado,
    };
  }, [
    idadeAtual,
    patrimonioAtual,
    idadeAposentadoria,
    rendaDesejada,
    outrasRendas,
    investimentoMensal,
    activeProjectIds,
    projects,
  ]);

  return (
    <div>
      <div className={styles.dashboardLayout}>
        <div>
          <GraficoFinanceiro
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
          activeProjectIds={activeProjectIds} // Passamos quem está ligado
          onAddClick={handleOpenAddModal}
          onEditProject={handleOpenEditModal}
          onDeleteProject={handleDeleteProject}
          onToggleProject={handleToggleProject} // Passamos a função de ligar/desligar
        />
      </div>

      <Modal isOpen={modalView !== null} onClose={handleCloseModal}>
        {modalView === "add" && (
          <FormNovoProjeto
            onClose={handleCloseModal}
            onSuccess={loadDashboardData}
            projectToEdit={projectToEdit}
            // Precisamos passar o perfil_id para o form saber a quem pertence o projeto
            // Você pode precisar ajustar o FormNovoProjeto para aceitar essa prop ou pegar do contexto lá dentro
          />
        )}
      </Modal>
    </div>
  );
}
