import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useActiveClient } from "../context/ActiveClientContext";

import { UserPlus } from "lucide-react";

// Estilos
import styles from "./perfil.module.css";
import { useToast } from "../components/ui/toast/ToastContext";
import { DadosPessoaisCard } from "../components/clients/DadosPessoaisCard";
import { Button } from "../components/ui/button/Button";
import { EnderecoPessoal } from "../components/clients/EnderecoPessoal";

export function Perfil() {
  const { profile } = useAuth(); // Usuário logado
  const { activeClientId } = useActiveClient(); // Cliente selecionado na Navbar
  const toast = useToast();

  const [loadingData, setLoadingData] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profileData, setProfileData] = useState<any>(null);

  // Controles de Visualização
  const [isClient, setIsClient] = useState(false); // É cliente ou consultor?
  const [mostrarConjuge, setMostrarConjuge] = useState(false);

  // Define quem será editado (Prioridade: Cliente Selecionado > Usuário Logado)
  const targetId = activeClientId || profile?.id;

  // --- CARREGAMENTO DE DADOS ---
  useEffect(() => {
    async function loadData() {
      if (!targetId) return;
      setLoadingData(true);

      try {
        // 1. Tenta buscar na tabela de CLIENTES (perfis)
        const { data: cliente } = await supabase
          .from("perfis")
          .select("*")
          .eq("id", targetId)
          .maybeSingle();

        if (cliente) {
          setProfileData(cliente);
          setIsClient(true);

          // Verifica se já existem dados de cônjuge salvos para abrir o card automaticamente
          // Checamos se tem nome ou CPF do cônjuge preenchido
          if (cliente.conjuge_nome || cliente.conjuge_cpf) {
            setMostrarConjuge(true);
          }
        } else {
          // 2. Se não achou, busca na tabela de CONSULTORES
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
        console.error("Erro ao carregar perfil:", error);
        toast.error("Erro ao carregar dados do perfil.");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [targetId, toast]);

  // --- RENDERIZAÇÃO ---

  if (loadingData) {
    return (
      <div className={styles.loadingContainer}>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (!targetId || !profileData) {
    return (
      <div className={styles.loadingContainer}>
        <p>Perfil não encontrado.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* --- ÁREA FLEXÍVEL: DADOS PESSOAIS --- */}
      {/* Esta div agrupa Titular e Cônjuge para ficarem lado a lado se couber */}
      <div className={styles.rowContainer}>
        {/* 1. Card do Titular (Sempre Visível) */}
        <div className={styles.cardWrapper}>
          <DadosPessoaisCard
            title={isClient ? "Meus Dados" : "Dados do Consultor"}
            targetId={targetId}
            initialData={profileData}
            isClient={isClient}
            prefixo="" // Salva em: nome, cpf, data_nascimento...
          />
        </div>

        {/* 2. Card do Cônjuge (Condicional) */}
        {isClient && mostrarConjuge && (
          <div className={styles.cardWrapper}>
            <DadosPessoaisCard
              title="Dados do Cônjuge"
              targetId={targetId}
              initialData={profileData}
              isClient={true}
              prefixo="conjuge_"
              // AQUI ESTÁ A MÁGICA:
              onRemove={() => setMostrarConjuge(false)}
            />
          </div>
        )}
      </div>

      {/* --- BOTÃO ADICIONAR CÔNJUGE --- */}
      {isClient && !mostrarConjuge && (
        <div className={styles.addButtonContainer}>
          <Button
            variant="outline"
            onClick={() => setMostrarConjuge(true)}
            icon={<UserPlus size={18} />}
          >
            Adicionar Cônjuge
          </Button>
        </div>
      )}

      {/* --- ENDEREÇO (Ocupa largura total) --- */}
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
