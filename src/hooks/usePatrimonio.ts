import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { ItemPatrimonio } from "../types/database";
import { useToast } from "../components/ui/toast/ToastContext";

export function usePatrimonio() {
  const [itens, setItens] = useState<ItemPatrimonio[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Buscar Itens
  const fetchPatrimonio = useCallback(async (perfilId: string) => {
    setLoading(true);
    try {
      // Nota: Você precisará criar a tabela 'patrimonio' no Supabase depois
      const { data, error } = await supabase
        .from("patrimonio")
        .select("*")
        .eq("perfil_id", perfilId)
        .order("valor", { ascending: false });

      if (error) throw error;
      setItens(data || []);
    } catch (error) {
      console.error(error);
      // Mock de dados caso a tabela não exista ainda, para visualizarmos o layout
      // Remova isso quando criar a tabela
      setItens([
        {
          id: 1,
          perfilId,
          nome: "CDB Liquidez Diária",
          valor: 50000,
          categoria: "investimento",
        },
        {
          id: 2,
          perfilId,
          nome: "VGBL XP",
          valor: 120000,
          categoria: "previdencia",
        },
        {
          id: 3,
          perfilId,
          nome: "Apartamento Centro",
          valor: 450000,
          categoria: "imobilizado",
        },
        {
          id: 4,
          perfilId,
          nome: "Financiamento Carro",
          valor: 35000,
          categoria: "passivo",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any);

      // toast.error("Erro ao carregar patrimônio."); // Descomentar quando backend estiver ok
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = async (id: number) => {
    try {
      const { error } = await supabase.from("patrimonio").delete().eq("id", id);
      if (error) throw error;
      setItens((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item removido.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover item.");
    }
  };

  return { itens, loading, fetchPatrimonio, deleteItem, setItens };
}
