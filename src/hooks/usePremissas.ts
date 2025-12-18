// src/hooks/usePremissas.ts
import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/toast/ToastContext";

// Valores padrão caso falhe a conexão
const SYSTEM_DEFAULTS = {
  selic: 10.75,
  inflacao: 4.5,
  custo_inventario_padrao: 15.0,
};

export function usePremissas() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // 1. Busca Inteligente (Aceita string ou null)
  const fetchPremissas = useCallback(
    async (perfilId: string | null) => {
      setLoading(true);
      try {
        let query = supabase.from("premissas_economicas").select("*");

        if (perfilId) {
          // Se tem ID de cliente, busca o dele OU o do sistema
          query = query.or(`perfil_id.eq.${perfilId},perfil_id.is.null`);
        } else {
          // Se não tem ID (é o Master editando globais), busca só o do sistema
          query = query.is("perfil_id", null);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Lógica de Prioridade:
        // Se tiver perfilId, tenta achar o específico. Se não, pega o do sistema (null).
        const doCliente = perfilId
          ? data.find((p) => p.perfil_id === perfilId)
          : null;
        const doSistema = data.find((p) => p.perfil_id === null);

        return doCliente || doSistema || SYSTEM_DEFAULTS;
      } catch (error) {
        console.error("Erro ao buscar premissas:", error);
        toast.error("Erro ao carregar indicadores.");
        return SYSTEM_DEFAULTS;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // 2. Salvar (Aceita string ou null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savePremissas = async (perfilId: string | null, values: any) => {
    setLoading(true);
    try {
      // Monta a query para verificar existência
      let query = supabase.from("premissas_economicas").select("id");

      if (perfilId) {
        query = query.eq("perfil_id", perfilId);
      } else {
        query = query.is("perfil_id", null);
      }

      const { data: existing, error } = await query.maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (existing) {
        // UPDATE
        await supabase
          .from("premissas_economicas")
          .update(values)
          .eq("id", existing.id);
      } else {
        // INSERT
        await supabase
          .from("premissas_economicas")
          .insert({ ...values, perfil_id: perfilId }); // Supabase aceita null aqui
      }

      // toast.success("Parâmetros atualizados!"); // Opcional: deixar o feedback visual pro componente
      return true;
    } catch (error) {
      console.error("Erro ao salvar premissas:", error);
      toast.error("Erro ao salvar.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset (Aceita string obrigatória, pois só faz sentido resetar cliente)
  const resetToSystemDefaults = async (perfilId: string) => {
    setLoading(true);
    try {
      await supabase
        .from("premissas_economicas")
        .delete()
        .eq("perfil_id", perfilId);
      toast.success("Restaurado para os padrões do sistema.");

      // Retorna os dados do sistema atualizados
      const { data } = await supabase
        .from("premissas_economicas")
        .select("*")
        .is("perfil_id", null)
        .single();

      return data || SYSTEM_DEFAULTS;
    } catch (error) {
      console.error(error);
      return SYSTEM_DEFAULTS;
    } finally {
      setLoading(false);
    }
  };

  return { loading, fetchPremissas, savePremissas, resetToSystemDefaults };
}
