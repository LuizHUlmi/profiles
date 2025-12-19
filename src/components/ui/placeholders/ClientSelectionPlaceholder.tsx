// src/components/ui/placeholders/ClientSelectionPlaceholder.tsx

import { Users } from "lucide-react";
import styles from "./ClientSelectionPlaceholder.module.css";

interface ClientSelectionPlaceholderProps {
  title?: string;
  message?: string;
}

export function ClientSelectionPlaceholder({
  title = "Selecione um cliente",
  message = "Selecione um cliente na barra superior para visualizar e gerenciar os dados desta seção.",
}: ClientSelectionPlaceholderProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrapper}>
        <Users size={48} className={styles.emptyIcon} />
      </div>
      <h2 className={styles.emptyTitle}>{title}</h2>
      <p className={styles.emptyText}>{message}</p>
    </div>
  );
}
