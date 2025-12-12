import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Projeto } from "../types/database";
import { useToast } from "../components/ui/toast/ToastContext";

export function useProjects() {
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Buscar Projetos
  const fetchProjects = useCallback(
    async (userId: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("projetos") // Nome da Tabela
          .select("*")
          .eq("perfil_id", userId) // Filtra pelo dono
          .order("id", { ascending: true });

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar projetos.");
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Deletar Projeto
  const deleteProject = async (id: number) => {
    // A confirmação visual fica na UI, aqui só executa
    try {
      const { error } = await supabase.from("projetos").delete().eq("id", id);
      if (error) throw error;

      // Atualiza a lista localmente sem precisar buscar tudo de novo
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Projeto removido com sucesso.");
      return true; // Retorna sucesso
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar projeto.");
      return false;
    }
  };

  return {
    projects,
    loading,
    fetchProjects,
    deleteProject,
    // No futuro, podemos adicionar createProject e updateProject aqui também
  };
}
