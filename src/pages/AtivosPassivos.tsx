// src/pages/AtivosPassivos.tsx

import { useActiveClient } from "../context/ActiveClientContext";
import { GestaoPatrimonio } from "../components/patrimonio/GestaoPatrimonio";
import styles from "./AtivosPassivos.module.css";
import { ClientSelectionPlaceholder } from "../components/ui/placeholders/ClientSelectionPlaceholder";

export function AtivosPassivos() {
  const { activeClientId } = useActiveClient();

  // MUDANÇA: Substituímos o HTML manual pelo componente padrão
  if (!activeClientId) {
    return (
      <ClientSelectionPlaceholder
        title="Estrutura Patrimonial"
        message="Selecione um cliente na barra superior para gerenciar Investimentos, Imóveis e Dívidas."
      />
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
