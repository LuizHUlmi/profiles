// src/components/meusProjetos/MeusProjetos.tsx

import styles from "./MeusProjetos.module.css";
import { ProjectCard } from "./cards/ProjectCard";
import { ProjectColumn } from "./colunas/ProjectColumn";
import type { Projeto } from "../../types/database";

type MeusProjetosProps = {
  projects: Projeto[];
  activeProjectIds: number[]; // NOVA PROP: Lista de IDs que estão na simulação
  onAddClick: () => void;
  onEditProject: (project: Projeto) => void;
  onDeleteProject: (id: number) => void;
  onToggleProject: (id: number, isActive: boolean) => void; // NOVA PROP
};

export function MeusProjetos({
  projects,
  activeProjectIds, // Recebendo a lista de ativos
  onAddClick,
  onEditProject,
  onDeleteProject,
  onToggleProject,
}: MeusProjetosProps) {
  const getProjectsByPriority = (priority: string) => {
    return projects.filter((p) => p.prioridade === priority);
  };

  // Calcula total APENAS dos ativos
  const getTotalByPriority = (priority: string) => {
    const total = getProjectsByPriority(priority)
      .filter((p) => activeProjectIds.includes(p.id)) // Filtra só os ativos
      .reduce((acc, curr) => acc + curr.valor, 0);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total);
  };

  const renderColumnContent = (priority: string) => {
    return getProjectsByPriority(priority).map((project) => (
      <ProjectCard
        key={project.id}
        title={project.nome}
        value={project.valor}
        details={project.prazo}
        // Verifica se este projeto está na lista de ativos
        isChecked={activeProjectIds.includes(project.id)}
        // Chama a função de toggle
        onToggle={(checked) => onToggleProject(project.id, checked)}
        onEdit={() => onEditProject(project)}
        onDelete={() => onDeleteProject(project.id)}
      />
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Meus projetos (Biblioteca)</h3>
        <button onClick={onAddClick} className={styles.addButton}>
          {" "}
          +{" "}
        </button>
      </div>

      <div className={styles.projectsGrid}>
        <ProjectColumn
          title="Essencial"
          totalValue={getTotalByPriority("essencial")}
        >
          {renderColumnContent("essencial")}
        </ProjectColumn>

        <ProjectColumn title="Desejo" totalValue={getTotalByPriority("desejo")}>
          {renderColumnContent("desejo")}
        </ProjectColumn>

        <ProjectColumn title="Sonho" totalValue={getTotalByPriority("sonho")}>
          {renderColumnContent("sonho")}
        </ProjectColumn>
      </div>
    </div>
  );
}
