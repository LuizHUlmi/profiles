// src/pages/Perfil.tsx

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useActiveClient } from "../context/ActiveClientContext";

// Remover UserPlus pois o botão antigo "Adicionar Cônjuge" vai sair
// import { UserPlus } from "lucide-react";

import styles from "./perfil.module.css";
import { useToast } from "../components/ui/toast/ToastContext";
import { DadosPessoaisCard } from "../components/clients/DadosPessoaisCard";
// import { Button } from "../components/ui/button/Button"; // Pode remover se não for usar em outro lugar
import { EnderecoPessoal } from "../components/clients/EnderecoPessoal";
import { FamiliaSection } from "../components/clients/FamiliaSection"; // Nossa nova seção

export function Perfil() {
  const { profile } = useAuth();
  const { activeClientId } = useActiveClient();
  const toast = useToast();

  const [loadingData, setLoadingData] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profileData, setProfileData] = useState<any>(null);

  const [isClient, setIsClient] = useState(false);

  // REMOVIDO: const [mostrarConjuge, setMostrarConjuge] = useState(false); <--- Não precisamos mais disso

  const targetId = activeClientId || profile?.id;

  useEffect(() => {
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
          // REMOVIDO: Lógica de checar conjuge_nome
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
      {/* 1. DADOS DO TITULAR (Unica coluna agora, ou full width) */}
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

        {/* REMOVIDO: Card do Cônjuge antigo */}
      </div>

      {/* REMOVIDO: Botão Adicionar Cônjuge antigo */}

      {/* 2. NOVA SEÇÃO FAMÍLIA (Onde o Cônjuge vai aparecer agora) */}
      {isClient && (
        <div
          className={styles.fullWidthSection}
          style={{ marginBottom: "2rem" }}
        >
          <FamiliaSection profileId={targetId} />
        </div>
      )}

      {/* 3. ENDEREÇO */}
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
