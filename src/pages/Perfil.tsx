// src/pages/Perfil.tsx

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useActiveClient } from "../context/ActiveClientContext";
import styles from "./perfil.module.css";
import { useToast } from "../components/ui/toast/ToastContext";
import { ClientSelectionPlaceholder } from "../components/ui/placeholders/ClientSelectionPlaceholder";

// Componentes da Página
import { DadosPessoaisCard } from "../components/clients/DadosPessoaisCard";
import { FamiliaSection } from "../components/clients/FamiliaSection";
import { GlobalParametersForm } from "../components/clients/GlobalParametersForm";
import { PageHeader } from "../components/ui/pageHeader/PageHeader";
import { UserCircle } from "lucide-react";

export function Perfil() {
  const { profile } = useAuth();
  const { activeClientId } = useActiveClient();
  const toast = useToast();

  const [loadingData, setLoadingData] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profileData, setProfileData] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Verifica se é Staff sem cliente selecionado
  const isStaffWithoutClient = profile?.userType === "staff" && !activeClientId;
  const targetId = activeClientId || profile?.id;

  useEffect(() => {
    if (isStaffWithoutClient) {
      setLoadingData(false);
      return;
    }

    async function loadData() {
      if (!targetId) return;
      setLoadingData(true);
      try {
        const { data: cliente } = await supabase
          .from("perfis")
          .select("*")
          .eq("id", targetId)
          .maybeSingle();

        if (cliente) {
          setProfileData(cliente);
          setIsClient(true);
        } else {
          const { data: consultor } = await supabase
            .from("consultores")
            .select("*")
            .eq("id", targetId)
            .maybeSingle();

          if (consultor) {
            setProfileData(consultor);
            setIsClient(false);
          }
        }
      } catch (error) {
        console.error("Erro perfil:", error);
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [targetId, toast, isStaffWithoutClient]);

  // MUDANÇA: Texto específico para Perfil
  if (isStaffWithoutClient) {
    return (
      <ClientSelectionPlaceholder
        title="Perfil do Cliente"
        message="Selecione um cliente na barra superior para visualizar e editar seus dados cadastrais."
      />
    );
  }

  if (loadingData)
    return (
      <div className={styles.loadingContainer}>
        <p>Carregando...</p>
      </div>
    );

  if (!targetId || !profileData)
    return (
      <div className={styles.loadingContainer}>
        <p>Perfil não encontrado.</p>
      </div>
    );

  return (
    <div className={styles.container}>
      <PageHeader
        title={"Meu Perfil"}
        subtitle="Gerencie informações pessoais e premissas financeiras."
        icon={<UserCircle size={32} />}
      />
      {/* 1. DADOS PESSOAIS */}
      <div className={styles.rowContainer}>
        <div className={styles.cardWrapper}>
          <DadosPessoaisCard
            title={isClient ? "Meus Dados" : "Dados do Consultor"}
            targetId={targetId}
            initialData={profileData}
            isClient={isClient}
            prefixo=""
          />
        </div>
      </div>

      {/* 2. COMPOSIÇÃO FAMILIAR (Apenas Clientes) */}
      {isClient && (
        <div
          className={styles.fullWidthSection}
          style={{ marginBottom: "2rem" }}
        >
          <FamiliaSection profileId={targetId} />
        </div>
      )}

      {/* 3. PREMISSAS ECONÔMICAS */}
      <div className={styles.fullWidthSection}>
        <GlobalParametersForm profileId={targetId} />
      </div>
    </div>
  );
}
