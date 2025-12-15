// src/hooks/useAssetsLiabilities.ts
import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/toast/ToastContext";
import type { ItemAtivoPassivo } from "../types/database";

export function useAssetsLiabilities(profileId: string) {
  const [items, setItems] = useState<ItemAtivoPassivo[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchItems = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ativos_passivos")
        .select("*")
        .eq("perfil_id", profileId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar patrimônio.");
    } finally {
      setLoading(false);
    }
  }, [profileId, toast]);

  const addItem = async (item: Omit<ItemAtivoPassivo, "id" | "perfil_id">) => {
    try {
      const { error } = await supabase.from("ativos_passivos").insert({
        perfil_id: profileId,
        ...item,
      });
      if (error) throw error;
      toast.success("Item salvo!");
      fetchItems();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar.");
      return false;
    }
  };

  // updateItem recebe um objeto parcial (pode atualizar só o nome, ou só o valor, etc)
  const updateItem = async (id: number, item: Partial<ItemAtivoPassivo>) => {
    try {
      const { error } = await supabase
        .from("ativos_passivos")
        .update(item)
        .eq("id", id);
      if (error) throw error;
      toast.success("Atualizado!");
      fetchItems();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar.");
      return false;
    }
  };

  const deleteItem = async (id: number) => {
    try {
      const { error } = await supabase
        .from("ativos_passivos")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Removido.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover.");
    }
  };

  return { items, loading, fetchItems, addItem, updateItem, deleteItem };
}
