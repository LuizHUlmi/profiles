// src/components/protection/SeguroForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import { Input } from "../ui/input/input";
import { Button } from "../ui/button/Button";
import { Save, Clock, Infinity as InfinityIcon } from "lucide-react";
import { maskCurrency, unmaskCurrency } from "../../utils/masks";
import { useToast } from "../ui/toast/ToastContext";
import type { Familiar } from "../../types/database";
import { InfoTooltip } from "../ui/tooltip/InfoTooltip";

type SeguroFormData = {
  segurado_select: string;
  nome: string;
  cobertura: string;
  valor_mensal?: string;
  // Novos Inputs
  tipo_vigencia: "vitalicio" | "termo";
  prazo_anos?: number;
};

interface SeguroFormProps {
  familiares: Familiar[];
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<boolean>;
  profileId?: string;
}

export function SeguroForm({
  familiares,
  onClose,
  onSubmit,
  profileId,
}: SeguroFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const { register, handleSubmit, setValue, watch } = useForm<SeguroFormData>({
    defaultValues: {
      tipo_vigencia: "vitalicio", // Padrão
    },
  });

  const watchTipoVigencia = watch("tipo_vigencia");

  // Função auxiliar para calcular idade
  const calculateAge = (birthDateString: string) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleFormSubmit = async (data: SeguroFormData) => {
    setIsSubmitting(true);

    let proprietario_tipo = "titular";
    let familiar_id: number | null = null;

    if (data.segurado_select === "titular") {
      proprietario_tipo = "titular";
    } else if (data.segurado_select.startsWith("dep_")) {
      proprietario_tipo = "dependente";
      familiar_id = Number(data.segurado_select.replace("dep_", ""));
    }

    const valorMensal = data.valor_mensal
      ? unmaskCurrency(data.valor_mensal)
      : 0;
    const prazoAnosInput = data.prazo_anos ? Number(data.prazo_anos) : null;

    // 1. Salva o Seguro no Patrimônio/Proteção
    const payload = {
      proprietario_tipo,
      familiar_id,
      nome: data.nome,
      cobertura: unmaskCurrency(data.cobertura),
      valor_mensal: valorMensal,
      tipo_vigencia: data.tipo_vigencia,
      prazo_anos: prazoAnosInput,
    };

    const success = await onSubmit(payload);

    // 2. Lógica Inteligente de Despesa
    if (success && valorMensal > 0 && profileId) {
      try {
        let duracaoCalculada = 10; // Fallback padrão

        if (data.tipo_vigencia === "termo" && prazoAnosInput) {
          // Se é termo, usa o que o usuário digitou
          duracaoCalculada = prazoAnosInput;
        } else if (data.tipo_vigencia === "vitalicio") {
          // Se é vitalício, precisamos calcular: Expectativa - Idade Atual

          // Buscar dados do perfil para calcular
          const { data: perfilData, error } = await supabase
            .from("perfis")
            .select("data_nascimento, expectativa_vida")
            .eq("id", profileId)
            .single();

          if (!error && perfilData) {
            const expectativa = perfilData.expectativa_vida || 90; // Default 90 se não tiver
            let idadeAtual = 30; // Default 30

            if (perfilData.data_nascimento) {
              idadeAtual = calculateAge(perfilData.data_nascimento);
            }

            // A duração é o tempo que falta para chegar na expectativa
            duracaoCalculada = expectativa - idadeAtual;

            if (duracaoCalculada < 1) duracaoCalculada = 1; // Mínimo 1 ano
          }
        }

        const { error: fluxoError } = await supabase
          .from("fluxo_caixa")
          .insert({
            perfil_id: profileId,
            tipo: "despesa",
            descricao: `Seguro (${data.tipo_vigencia}) - ${data.nome}`,
            valor_mensal: valorMensal,
            inicio_tipo: "ano",
            inicio_valor: new Date().getFullYear(),
            duracao_anos: duracaoCalculada,
            proprietario_tipo: proprietario_tipo,
            familiar_id: familiar_id,
          });

        if (!fluxoError) {
          toast.success(
            `Despesa criada com duração de ${duracaoCalculada} anos.`
          );
        } else {
          console.error("Erro insert fluxo:", fluxoError);
        }
      } catch (err) {
        console.error("Erro interno ao criar despesa:", err);
      }
    }

    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div style={{ minWidth: "450px", padding: "0.5rem" }}>
      <h3 style={{ marginTop: 0, color: "#1e293b" }}>Nova Proteção</h3>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {/* Segurado */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#333" }}>
            Segurado
          </label>
          <select
            {...register("segurado_select", {
              required: "Selecione o segurado",
            })}
            style={{
              padding: "0.75rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "white",
            }}
          >
            <option value="">Selecione...</option>
            <option value="titular">Titular (Cliente)</option>
            {familiares.length > 0 && (
              <optgroup label="Familiares">
                {familiares.map((f) => (
                  <option key={f.id} value={`dep_${f.id}`}>
                    {f.nome} ({f.parentesco})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Nome */}
        <Input
          label="Nome / Seguradora"
          placeholder="Ex: Prudential Vida Inteira"
          {...register("nome", { required: true })}
        />

        {/* Cobertura */}
        <Input
          label="Valor da Cobertura"
          placeholder="R$ 0,00"
          {...register("cobertura", {
            required: true,
            onChange: (e) =>
              setValue("cobertura", maskCurrency(e.target.value)),
          })}
        />

        {/* === TIPO DE VIGÊNCIA === */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <label
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#475569",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Tipo de Vigência (Pagamento)
            <InfoTooltip text="Define por quanto tempo essa despesa impactará o fluxo de caixa do cliente." />
          </label>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                value="vitalicio"
                {...register("tipo_vigencia")}
              />
              <InfinityIcon size={16} color="#0ea5e9" />
              <span style={{ fontSize: "0.9rem" }}>
                Vida Inteira (Vitalício)
              </span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                value="termo"
                {...register("tipo_vigencia")}
              />
              <Clock size={16} color="#f59e0b" />
              <span style={{ fontSize: "0.9rem" }}>
                Seguro a Termo (Temporário)
              </span>
            </label>
          </div>

          {watchTipoVigencia === "termo" && (
            <Input
              label="Prazo de Pagamento (Anos)"
              type="number"
              placeholder="Ex: 10, 20 ou 30 anos"
              {...register("prazo_anos", { required: true })}
              style={{ backgroundColor: "white" }}
            />
          )}

          {watchTipoVigencia === "vitalicio" && (
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>
              * O custo será projetado no fluxo de caixa até a expectativa de
              vida do cliente.
            </p>
          )}
        </div>

        {/* Custo Mensal */}
        <div style={{ marginTop: "0.5rem" }}>
          <Input
            label="Custo Mensal (Prêmio)"
            placeholder="R$ 0,00"
            {...register("valor_mensal", {
              onChange: (e) =>
                setValue("valor_mensal", maskCurrency(e.target.value)),
            })}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "1rem",
          }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            icon={<Save size={16} />}
          >
            Salvar Proteção
          </Button>
        </div>
      </form>
    </div>
  );
}
