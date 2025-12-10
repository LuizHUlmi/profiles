// src/hooks/useClients.ts

import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/toast/ToastContext";

export type Cliente = {
  id: string;
  nome: string;
  email: string;
  user_id: string | null; // Se não nulo, já completou cadastro
};

export function useClients() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Buscar Clientes do Consultor Logado
  const fetchClientes = useCallback(
    async (consultorId: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("perfis")
          .select("id, nome, email, user_id")
          .eq("consultor_id", consultorId)
          .order("nome");

        if (error) throw error;
        setClientes(data || []);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar clientes.");
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Deletar Cliente
  const deleteCliente = async (id: string) => {
    try {
      const { error } = await supabase.from("perfis").delete().eq("id", id);
      if (error) throw error;

      // Atualização otimista da lista
      setClientes((prev) => prev.filter((c) => c.id !== id));
      toast.success("Cliente removido com sucesso.");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar cliente.");
      return false;
    }
  };

  return {
    clientes,
    loading,
    fetchClientes,
    deleteCliente,
  };
}
