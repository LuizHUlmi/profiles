// src/pages/AtivosPassivos.tsx

import { useActiveClient } from "../context/ActiveClientContext";
import { GestaoPatrimonio } from "../components/patrimonio/GestaoPatrimonio";
import styles from "./AtivosPassivos.module.css";
import { ClientSelectionPlaceholder } from "../components/ui/placeholders/ClientSelectionPlaceholder";
import { PageHeader } from "../components/ui/pageHeader/PageHeader";
import { Scale } from "lucide-react";

export function AtivosPassivos() {
  const { activeClientId } = useActiveClient();

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
      <PageHeader
        title="Estrutura Patrimonial"
        subtitle="Gerencie Investimentos, Previdência, Imóveis e Dívidas."
        icon={<Scale size={32} />}
      />
      <GestaoPatrimonio perfilId={activeClientId} />
    </div>
  );
}
