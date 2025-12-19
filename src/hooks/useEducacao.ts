// src/hooks/useEducacao.ts

import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/toast/ToastContext";
import type { ItemEducacao } from "../types/database";

export function useEducacao(perfilId: string) {
  const [itens, setItens] = useState<ItemEducacao[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchEducacao = useCallback(async () => {
    if (!perfilId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("planejamento_educacional")
      .select("*")
      .eq("perfil_id", perfilId)
      .order("ano_inicio", { ascending: true });

    if (error) {
      console.error("Erro busca educacao:", error);
      toast.error("Erro ao carregar planejamento.");
    } else {
      setItens(data || []);
    }
    setLoading(false);
  }, [perfilId, toast]);

  const addEducacao = async (
    novoItem: Omit<ItemEducacao, "id" | "perfil_id">
  ) => {
    // 1. Salvar no Planejamento Educacional
    const { error } = await supabase.from("planejamento_educacional").insert({
      perfil_id: perfilId,
      ...novoItem,
    });

    if (error) {
      console.error("Erro add educacao:", error);
      toast.error("Erro ao salvar planejamento.");
      return false;
    }

    // 2. Integração com Fluxo de Caixa (Automático)
    try {
      const { error: fluxoError } = await supabase.from("fluxo_caixa").insert({
        perfil_id: perfilId,
        tipo: "despesa",
        descricao: `Educ - ${novoItem.nome}`,
        valor_mensal: novoItem.custo_mensal,
        inicio_tipo: "ano",
        inicio_valor: novoItem.ano_inicio,
        duracao_anos: novoItem.duracao_anos,
        proprietario_tipo:
          novoItem.beneficiario_tipo === "titular" ? "titular" : "dependente",
        familiar_id: novoItem.familiar_id,
      });

      if (!fluxoError) {
        toast.success("Planejamento salvo e despesa criada no fluxo!");
      }
    } catch (err) {
      console.error(err);
    }

    fetchEducacao();
    return true;
  };

  // --- NOVA FUNÇÃO DE UPDATE ---
  const updateEducacao = async (id: number, dados: Partial<ItemEducacao>) => {
    try {
      const { error } = await supabase
        .from("planejamento_educacional")
        .update(dados)
        .eq("id", id);

      if (error) throw error;
      toast.success("Planejamento atualizado!");
      fetchEducacao();
      return true;
    } catch (error) {
      console.error("Erro update educacao:", error);
      toast.error("Erro ao atualizar.");
      return false;
    }
  };

  const deleteEducacao = async (id: number) => {
    const { error } = await supabase
      .from("planejamento_educacional")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Erro ao excluir.");
    } else {
      toast.success("Item removido.");
      fetchEducacao();
    }
  };

  return {
    itens,
    loading,
    fetchEducacao,
    addEducacao,
    updateEducacao,
    deleteEducacao,
  };
}
