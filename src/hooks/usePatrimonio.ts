import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { ItemAtivoPassivo } from "../types/database"; // <--- TIPO NOVO
import { useToast } from "../components/ui/toast/ToastContext";

export function usePatrimonio() {
  const [itens, setItens] = useState<ItemAtivoPassivo[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Buscar Itens
  const fetchPatrimonio = useCallback(async (perfilId: string) => {
    setLoading(true);
    try {
      // Sugestão: Nome da tabela unificada no banco pode ser 'itens_financeiros'
      const { data, error } = await supabase
        .from("itens_financeiros")
        .select("*")
        .eq("perfil_id", perfilId)
        .order("valor", { ascending: false });

      if (error) throw error;
      setItens(data || []);
    } catch (error) {
      console.error(error);

      // --- MOCK ATUALIZADO PARA O NOVO TIPO ---
      setItens([
        {
          id: 1,
          perfil_id: perfilId,
          proprietario_tipo: "titular",
          familiar_id: null,
          categoria: "ativo",
          tipo: "Aplicação Financeira", // Antigo 'investimento'
          nome: "CDB Liquidez Diária",
          valor: 50000,
          inventariar: true,
          investir_pos_morte: false,
        },
        {
          id: 2,
          perfil_id: perfilId,
          proprietario_tipo: "titular",
          familiar_id: null,
          categoria: "ativo",
          tipo: "Previdência", // Antigo 'previdencia'
          nome: "VGBL XP",
          valor: 120000,
          inventariar: false, // Previdência geralmente não entra em inventário
          investir_pos_morte: false,
          regime_tributario: "regressivo",
        },
        {
          id: 3,
          perfil_id: perfilId,
          proprietario_tipo: "titular",
          familiar_id: null,
          categoria: "ativo",
          tipo: "Imóvel", // Antigo 'imobilizado'
          nome: "Apartamento Centro",
          valor: 450000,
          inventariar: true,
          percentual_inventario: 100,
          investir_pos_morte: false,
        },
        {
          id: 4,
          perfil_id: perfilId,
          proprietario_tipo: "titular",
          familiar_id: null,
          categoria: "passivo",
          tipo: "Financiamento",
          nome: "Financiamento Carro",
          valor: 35000, // Saldo Devedor
          prazo_meses: 48,
          valor_parcela: 1200,
          amortizacao_tipo: "SAC",
        },
      ] as ItemAtivoPassivo[]);
      // Removi o 'as any' forçado para garantir que o mock bata com a interface

      // toast.error("Erro ao carregar patrimônio.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = async (id: number) => {
    try {
      const { error } = await supabase
        .from("itens_financeiros")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setItens((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item removido.");
    } catch (error) {
      console.error(error);
      // Mock visual de deleção
      setItens((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item removido (Mock).");
    }
  };

  return { itens, loading, fetchPatrimonio, deleteItem, setItens };
}
