// src/hooks/useSeguros.ts
import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/toast/ToastContext";
import type { ItemSeguro } from "../types/database";

export function useSeguros(perfilId: string) {
  const [seguros, setSeguros] = useState<ItemSeguro[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchSeguros = useCallback(async () => {
    if (!perfilId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("seguros")
      .select("*")
      .eq("perfil_id", perfilId)
      .order("id", { ascending: true });

    if (error) {
      console.error("Erro ao buscar seguros:", error);
    } else {
      setSeguros(data || []);
    }
    setLoading(false);
  }, [perfilId]);

  const addSeguro = async (
    novoSeguro: Omit<ItemSeguro, "id" | "perfil_id">
  ) => {
    const { error } = await supabase.from("seguros").insert({
      perfil_id: perfilId,
      ...novoSeguro,
    });

    if (error) {
      console.error("Erro add seguro:", error);
      // USO CORRETO
      toast.error("Erro ao adicionar seguro");
      return false;
    }

    // USO CORRETO
    toast.success("Seguro adicionado!");
    fetchSeguros();
    return true;
  };

  const deleteSeguro = async (id: number) => {
    const { error } = await supabase.from("seguros").delete().eq("id", id);
    if (error) {
      // USO CORRETO
      toast.error("Erro ao excluir");
    } else {
      // USO CORRETO
      toast.success("Seguro removido");
      fetchSeguros();
    }
  };

  return { seguros, loading, fetchSeguros, addSeguro, deleteSeguro };
}
