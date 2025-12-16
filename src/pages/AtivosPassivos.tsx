import { useActiveClient } from "../context/ActiveClientContext";
import { GestaoPatrimonio } from "../components/patrimonio/GestaoPatrimonio";
import { Users } from "lucide-react";
import styles from "./AtivosPassivos.module.css";

export function AtivosPassivos() {
  const { activeClientId } = useActiveClient();

  if (!activeClientId) {
    return (
      <div className={styles.emptyState}>
        <Users size={48} className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>Selecione um cliente</h2>
        <p className={styles.emptyText}>
          Selecione um cliente na barra superior para gerenciar seus ativos e
          passivos.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Estrutura Patrimonial</h2>
        <p className={styles.subtitle}>
          Gerencie Investimentos, Previdência, Imóveis e Dívidas.
        </p>
      </header>

      <GestaoPatrimonio perfilId={activeClientId} />
    </div>
  );
}
