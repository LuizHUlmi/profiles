// src/hooks/useSeguros.ts

import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/toast/ToastContext";
import type { ItemSeguro } from "../types/database";

export function useSeguros(profileId: string) {
  const [seguros, setSeguros] = useState<ItemSeguro[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchSeguros = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("seguros") // Verifique se o nome da tabela é 'seguros' ou 'patrimonio_seguros' no seu banco
      .select("*")
      .eq("perfil_id", profileId)
      .order("id", { ascending: true });

    if (error) {
      console.error("Erro ao buscar seguros:", error);
      toast.error("Erro ao carregar proteções.");
    } else {
      setSeguros(data || []);
    }
    setLoading(false);
  }, [profileId, toast]);

  const addSeguro = async (dados: Partial<ItemSeguro>) => {
    try {
      const { error } = await supabase.from("seguros").insert({
        perfil_id: profileId,
        ...dados,
      });

      if (error) throw error;
      toast.success("Proteção adicionada com sucesso!");
      fetchSeguros();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      toast.error("Erro ao salvar proteção.");
      return false;
    }
  };

  // --- NOVA FUNÇÃO DE UPDATE ---
  const updateSeguro = async (id: number, dados: Partial<ItemSeguro>) => {
    try {
      const { error } = await supabase
        .from("seguros")
        .update(dados)
        .eq("id", id);

      if (error) throw error;
      toast.success("Proteção atualizada com sucesso!");
      fetchSeguros();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar proteção.");
      return false;
    }
  };
  // -----------------------------

  const deleteSeguro = async (id: number) => {
    try {
      const { error } = await supabase.from("seguros").delete().eq("id", id);
      if (error) throw error;
      toast.success("Proteção removida.");
      setSeguros((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao excluir.");
    }
  };

  return {
    seguros,
    loading,
    fetchSeguros,
    addSeguro,
    updateSeguro, // <--- Não esqueça de exportar
    deleteSeguro,
  };
}
