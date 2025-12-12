// src/hooks/useFluxoCaixa.ts

import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/toast/ToastContext";
import type { ItemFluxoCaixa } from "../types/database";

export function useFluxoCaixa(profileId: string) {
  // ... (estados e fetchItems existentes mantidos iguais) ...
  const [items, setItems] = useState<ItemFluxoCaixa[]>([]); // Mantendo contexto
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchItems = useCallback(async () => {
    // ... (código existente) ...
    if (!profileId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fluxo_caixa")
        .select("*")
        .eq("perfil_id", profileId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [profileId, toast]);

  const addItem = async (item: Omit<ItemFluxoCaixa, "id" | "perfil_id">) => {
    // ... (código existente) ...
    try {
      const { error } = await supabase.from("fluxo_caixa").insert({
        perfil_id: profileId,
        ...item,
      });

      if (error) throw error;
      toast.success("Item adicionado!");
      fetchItems();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar item.");
      return false;
    }
  };

  const deleteItem = async (id: number) => {
    // ... (código existente) ...
    try {
      const { error } = await supabase
        .from("fluxo_caixa")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item removido.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover.");
    }
  };

  // --- NOVA FUNÇÃO ---
  const updateItem = async (id: number, item: Partial<ItemFluxoCaixa>) => {
    try {
      const { error } = await supabase
        .from("fluxo_caixa")
        .update(item)
        .eq("id", id);

      if (error) throw error;
      toast.success("Item atualizado!");
      fetchItems(); // Recarrega para garantir ordenação e dados frescos
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar item.");
      return false;
    }
  };

  return { items, loading, fetchItems, addItem, deleteItem, updateItem };
}
