import styles from "./MeusProjetos.module.css";
import { ProjectCard } from "./ProjectCard";
import { ProjectColumn } from "./ProjectColumn";
import type { Projeto } from "../../types/database";

type MeusProjetosProps = {
  projects: Projeto[];
  activeProjectIds: number[];
  onAddClick: () => void;
  onEditProject: (project: Projeto) => void;
  onDeleteProject: (id: number) => void;
  onToggleProject: (id: number, isActive: boolean) => void;
  // NOVA PROP
  onToggleColumn: (priority: string, isActive: boolean) => void;
};

export function MeusProjetos({
  projects,
  activeProjectIds,
  onAddClick,
  onEditProject,
  onDeleteProject,
  onToggleProject,
  onToggleColumn, // <--- Recebendo a função
}: MeusProjetosProps) {
  const getProjectsByPriority = (priority: string) => {
    return projects.filter((p) => p.prioridade === priority);
  };

  const getTotalByPriority = (priority: string) => {
    const total = getProjectsByPriority(priority)
      .filter((p) => activeProjectIds.includes(p.id))
      .reduce((acc, curr) => acc + curr.valor, 0);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total);
  };

  // Verifica se TODOS os projetos desta prioridade estão ativos
  const isColumnActive = (priority: string) => {
    const columnProjects = getProjectsByPriority(priority);
    if (columnProjects.length === 0) return false;
    // Retorna true se TODOS os IDs da coluna estiverem na lista activeProjectIds
    return columnProjects.every((p) => activeProjectIds.includes(p.id));
  };

  const renderColumn = (priority: string, label: string) => {
    const columnProjects = getProjectsByPriority(priority);

    return (
      <ProjectColumn
        title={label}
        totalValue={getTotalByPriority(priority)}
        // O Switch Mestre fica ligado se todos os itens estiverem ligados
        isChecked={isColumnActive(priority)}
        // Ao clicar no mestre, chama a função em lote
        onToggle={(checked) => onToggleColumn(priority, checked)}
      >
        {columnProjects.map((project) => (
          <ProjectCard
            key={project.id}
            title={project.nome}
            value={project.valor}
            details={project.prazo}
            isChecked={activeProjectIds.includes(project.id)}
            onToggle={(checked) => onToggleProject(project.id, checked)}
            onEdit={() => onEditProject(project)}
            onDelete={() => onDeleteProject(project.id)}
          />
        ))}
      </ProjectColumn>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Meus projetos (Biblioteca)</h3>
        <button onClick={onAddClick} className={styles.addButton}>
          +
        </button>
      </div>

      <div className={styles.projectsGrid}>
        {renderColumn("essencial", "Essencial")}
        {renderColumn("desejo", "Desejo")}
        {renderColumn("sonho", "Sonho")}
      </div>
    </div>
  );
}
