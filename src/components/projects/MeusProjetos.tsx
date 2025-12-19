// src/components/projects/MeusProjetos.tsx

import { Plus } from "lucide-react";
import { Button } from "../ui/button/Button";
import { ProjetoCard } from "./ProjectCard";
import type { Projeto } from "../../types/database";
import styles from "./MeusProjetos.module.css";

interface MeusProjetosProps {
  projects: Projeto[];
  activeProjectIds: number[];
  onAddClick: () => void;
  onEditProject: (p: Projeto) => void;
  onDeleteProject: (id: number) => void;
  onToggleProject: (id: number, isActive: boolean) => void;
  onToggleColumn: (priority: string, isActive: boolean) => void;
}

export function MeusProjetos({
  projects,
  activeProjectIds,
  onAddClick,
  onEditProject,
  onDeleteProject,
  onToggleProject,
  onToggleColumn,
}: MeusProjetosProps) {
  const vital = projects.filter((p) => p.prioridade === "vital");
  const essencial = projects.filter((p) => p.prioridade === "essencial");
  const desejavel = projects.filter((p) => p.prioridade === "desejavel");

  const renderColumn = (
    title: string,
    items: Projeto[],
    priorityKey: string
  ) => {
    const allActive =
      items.length > 0 && items.every((p) => activeProjectIds.includes(p.id));

    // Define a classe da bolinha baseada na prioridade
    const dotClass =
      priorityKey === "vital"
        ? styles.dotVital
        : priorityKey === "essencial"
        ? styles.dotEssencial
        : styles.dotDesejavel;

    return (
      <div className={styles.column}>
        {/* CABEÇALHO CINZA */}
        <div className={styles.columnHeader}>
          <div className={styles.titleGroup}>
            <span className={`${styles.priorityDot} ${dotClass}`}></span>
            <span className={styles.columnTitle}>{title}</span>
          </div>

          <div className={styles.headerActions}>
            <span className={styles.countBadge}>{items.length}</span>
            {items.length > 0 && (
              <button
                onClick={() => onToggleColumn(priorityKey, !allActive)}
                className={styles.toggleBtn}
                title={allActive ? "Desativar Todos" : "Ativar Todos"}
              >
                {allActive ? "Limpar" : "Todos"}
              </button>
            )}
          </div>
        </div>

        {/* LISTA DE PROJETOS (COM PADDING) */}
        <div className={styles.projectsList}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>Nenhum projeto.</div>
          ) : (
            items.map((projeto) => (
              <ProjetoCard
                key={projeto.id}
                projeto={projeto}
                isActive={activeProjectIds.includes(projeto.id)}
                onToggle={(isActive) => onToggleProject(projeto.id, isActive)}
                onEdit={() => onEditProject(projeto)}
                onDelete={() => onDeleteProject(projeto.id)}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3
          style={{
            margin: 0,
            color: "var(--text-primary)",
            fontSize: "1.25rem",
            fontWeight: 600,
          }}
        >
          Meus Projetos
        </h3>
        <Button onClick={onAddClick} icon={<Plus size={16} />}>
          Novo Projeto
        </Button>
      </div>

      <div className={styles.columnsGrid}>
        {renderColumn("Vital", vital, "vital")}
        {renderColumn("Essencial", essencial, "essencial")}
        {renderColumn("Desejável", desejavel, "desejavel")}
      </div>
    </div>
  );
}
