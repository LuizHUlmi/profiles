// src/pages/Perfil.tsx

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useActiveClient } from "../context/ActiveClientContext";
import styles from "./perfil.module.css";
import { useToast } from "../components/ui/toast/ToastContext";

// Componentes da Página
import { DadosPessoaisCard } from "../components/clients/DadosPessoaisCard";
import { EnderecoPessoal } from "../components/clients/EnderecoPessoal";
import { FamiliaSection } from "../components/clients/FamiliaSection";
import { GlobalParametersForm } from "../components/clients/GlobalParametersForm";

export function Perfil() {
  const { profile } = useAuth();
  const { activeClientId } = useActiveClient();
  const toast = useToast();

  const [loadingData, setLoadingData] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profileData, setProfileData] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Define quem é o alvo: o cliente selecionado pelo Consultor OU o próprio usuário logado
  const targetId = activeClientId || profile?.id;

  useEffect(() => {
    async function loadData() {
      if (!targetId) return;
      setLoadingData(true);
      try {
        // 1. Tenta buscar na tabela de Perfis (Clientes)
        const { data: cliente } = await supabase
          .from("perfis")
          .select("*")
          .eq("id", targetId)
          .maybeSingle();

        if (cliente) {
          setProfileData(cliente);
          setIsClient(true);
        } else {
          // 2. Se não achar, tenta buscar na tabela de Consultores (Equipe)
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
  }, [targetId, toast]);

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

      {/* 3. PREMISSAS ECONÔMICAS (Correção Aplicada Aqui) */}
      <div className={styles.fullWidthSection}>
        {/* Passamos o targetId para que o formulário saiba a quem salvar */}
        <GlobalParametersForm profileId={targetId} />
      </div>

      {/* 4. ENDEREÇO (Apenas Clientes) */}
      {isClient && (
        <div className={styles.fullWidthSection}>
          <EnderecoPessoal
            title="Endereço"
            targetId={targetId}
            initialData={profileData}
          />
        </div>
      )}
    </div>
  );
}
