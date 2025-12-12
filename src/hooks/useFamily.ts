// src/hooks/useFamily.ts
import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/toast/ToastContext";
import type { Familiar } from "../types/database";

export function useFamily(profileId: string) {
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchFamily = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("familiares")
        .select("*")
        .eq("perfil_id", profileId)
        .order("nome");

      if (error) throw error;
      setFamiliares(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar familiares.");
    } finally {
      setLoading(false);
    }
  }, [profileId, toast]);

  const addFamiliar = async (dados: Omit<Familiar, "id" | "perfil_id">) => {
    try {
      const { error } = await supabase.from("familiares").insert({
        perfil_id: profileId,
        ...dados,
      });

      if (error) throw error;
      toast.success("Familiar adicionado!");
      fetchFamily(); // Recarrega a lista
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar familiar.");
      return false;
    }
  };

  const deleteFamiliar = async (id: number) => {
    try {
      const { error } = await supabase.from("familiares").delete().eq("id", id);
      if (error) throw error;

      setFamiliares((prev) => prev.filter((f) => f.id !== id));
      toast.success("Removido com sucesso.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover.");
    }
  };

  return { familiares, loading, fetchFamily, addFamiliar, deleteFamiliar };
}
