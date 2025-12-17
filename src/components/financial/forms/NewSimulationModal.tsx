// src/components/financial/NewSimulationModal.tsx

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

import { Plus, Copy } from "lucide-react";
import { Input } from "../../ui/input/Input";
import { Button } from "../../ui/button/Button";
import { useToast } from "../../ui/toast/ToastContext";
import { Select } from "../../ui/select/Select";

type NewSimulationModalProps = {
  clientId: string;
  onClose: () => void;
  onSuccess: (newSimId: string) => void; // Retorna o ID para já selecionarmos ele
};

type SimSummary = { id: string; titulo: string };

export function NewSimulationModal({
  clientId,
  onClose,
  onSuccess,
}: NewSimulationModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState("");

  // Para a funcionalidade de Duplicar
  const [sourceSimId, setSourceSimId] = useState<string>("");
  const [existingSims, setExistingSims] = useState<SimSummary[]>([]);

  // 1. Busca simulações existentes ao abrir para popular o select
  useEffect(() => {
    async function fetchExisting() {
      const { data } = await supabase
        .from("simulacoes")
        .select("id, titulo")
        .eq("perfil_id", clientId)
        .order("created_at", { ascending: false });

      setExistingSims(data || []);
    }
    if (clientId) fetchExisting();
  }, [clientId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return toast.error("Dê um nome para o cenário.");

    setLoading(true);
    try {
      let newSimId = "";

      // CENÁRIO A: CRIAR DO ZERO (Padrão)
      if (!sourceSimId) {
        const { data, error } = await supabase
          .from("simulacoes")
          .insert({
            perfil_id: clientId,
            titulo: titulo,
            ativo: true, // Já nasce ativo para o usuário ver
            // Valores padrão (opcional, pode ajustar conforme regra de negócio)
            idade_aposentadoria: 65,
            renda_desejada: 10000,
            patrimonio_atual: 0,
            investimento_mensal: 0,
            outras_rendas: 0,
          })
          .select()
          .single();

        if (error) throw error;
        newSimId = data.id;
      }

      // CENÁRIO B: DUPLICAR EXISTENTE
      else {
        // 1. Buscar dados da origem
        const { data: sourceData, error: sourceError } = await supabase
          .from("simulacoes")
          .select("*")
          .eq("id", sourceSimId)
          .single();

        if (sourceError) throw sourceError;

        // 2. Criar a nova simulação com os mesmos dados numéricos
        const { data: newData, error: createError } = await supabase
          .from("simulacoes")
          .insert({
            perfil_id: clientId,
            titulo: titulo,
            ativo: true,
            idade_aposentadoria: sourceData.idade_aposentadoria,
            renda_desejada: sourceData.renda_desejada,
            patrimonio_atual: sourceData.patrimonio_atual,
            investimento_mensal: sourceData.investimento_mensal,
            outras_rendas: sourceData.outras_rendas,
          })
          .select()
          .single();

        if (createError) throw createError;
        newSimId = newData.id;

        // 3. Duplicar os vínculos de projetos (simulacao_projetos)
        const { data: sourceProjects } = await supabase
          .from("simulacao_projetos")
          .select("projeto_id")
          .eq("simulacao_id", sourceSimId);

        if (sourceProjects && sourceProjects.length > 0) {
          const linksToCreate = sourceProjects.map((p) => ({
            simulacao_id: newSimId,
            projeto_id: p.projeto_id,
            ativo: true,
          }));

          await supabase.from("simulacao_projetos").insert(linksToCreate);
        }
      }

      // Finalização
      // Desativar outras simulações para deixar só essa ativa (Opcional, mas recomendado)
      await supabase
        .from("simulacoes")
        .update({ ativo: false })
        .eq("perfil_id", clientId)
        .neq("id", newSimId);

      toast.success("Novo estudo criado com sucesso!");
      onSuccess(newSimId);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar estudo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleCreate}
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      <div>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>
          Novo Estudo
        </h3>
        <p
          style={{
            margin: 0,
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
          }}
        >
          Crie um cenário alternativo para comparar resultados.
        </p>
      </div>

      <Input
        label="Nome do Cenário"
        placeholder="Ex: Aposentadoria antecipada, Compra de Casa..."
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
      />

      {/* Seção de Duplicação */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          style={{
            fontSize: "0.9rem",
            fontWeight: 500,
            color: "var(--text-primary)",
          }}
        >
          Basear-se em (Duplicar)
        </label>
        <div style={{ position: "relative" }}>
          <Select
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-page)",
              color: "var(--text-primary)",
              appearance: "none",
            }}
            value={sourceSimId}
            onChange={(e) => setSourceSimId(e.target.value)}
          >
            <option value="">Criar em branco (Limpo)</option>
            {existingSims.map((sim) => (
              <option key={sim.id} value={sim.id}>
                Copiar de: {sim.titulo}
              </option>
            ))}
          </Select>
          <Copy
            size={16}
            style={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "var(--text-secondary)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={loading} icon={<Plus size={18} />}>
          Criar Estudo
        </Button>
      </div>
    </form>
  );
}
