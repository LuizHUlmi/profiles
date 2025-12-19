// src/hooks/useProjects.ts

import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/toast/ToastContext";
import type { Projeto } from "../types/database";

export function useProjects() {
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchProjects = useCallback(
    async (profileId: string) => {
      setLoading(true);
      // CORREÇÃO AQUI: Mudamos de 'projetos' para 'projetos_vida'
      const { data, error } = await supabase
        .from("projetos_vida")
        .select("*")
        .eq("perfil_id", profileId)
        .order("id", { ascending: true });

      if (error) {
        console.error("Erro ao buscar projetos:", error);
        toast.error("Erro ao carregar projetos.");
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    },
    [toast]
  );

  const addProject = async (dados: Omit<Projeto, "id" | "created_at">) => {
    // CORREÇÃO AQUI TAMBÉM
    const { error } = await supabase.from("projetos_vida").insert(dados);
    if (error) {
      console.error(error);
      toast.error("Erro ao criar projeto.");
      return false;
    }
    toast.success("Projeto criado!");
    return true;
  };

  const deleteProject = async (id: number) => {
    // CORREÇÃO AQUI TAMBÉM
    const { error } = await supabase
      .from("projetos_vida")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Erro ao excluir.");
    } else {
      toast.success("Projeto removido.");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return {
    projects,
    loading,
    fetchProjects,
    addProject,
    deleteProject,
  };
}
