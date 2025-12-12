// src/components/financial/FluxoCaixaForm.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input/input";
import { Button } from "../ui/button/Button";
import { maskCurrency, unmaskCurrency } from "../../utils/masks";
import { Save } from "lucide-react";
import type { Familiar, ItemFluxoCaixa } from "../../types/database";

type FluxoFormData = {
  proprietario_select: string;
  descricao: string;
  valor_mensal: string;
  inicio_tipo: "ano" | "idade";
  inicio_valor: number;
  duracao_anos: number;
  correcao_anual?: number;
};

interface FluxoCaixaFormProps {
  tipo: "receita" | "despesa";
  familiares: Familiar[];
  onClose: () => void;
  // Agora aceita initialData para edição
  initialData?: ItemFluxoCaixa | null;
  // O submit pode ser create ou update, então o tipo do payload é genérico aqui
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<boolean>;
}

export function FluxoCaixaForm({
  tipo,
  familiares,
  onClose,
  initialData,
  onSubmit,
}: FluxoCaixaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FluxoFormData>({
    defaultValues: {
      inicio_tipo: "ano",
      duracao_anos: 1,
      inicio_valor: new Date().getFullYear(),
    },
  });

  // EFEITO: Preencher formulário se estiver editando
  useEffect(() => {
    if (initialData) {
      // 1. Reconstruir o valor do Select Inteligente
      let propSelect = "titular";
      if (
        initialData.proprietario_tipo === "dependente" &&
        initialData.familiar_id
      ) {
        propSelect = `dep_${initialData.familiar_id}`;
      } else {
        propSelect = initialData.proprietario_tipo; // titular, casal, familia
      }

      // 2. Formatar moeda para o input (Input espera string mascarada "R$ 1.000,00")
      // A maskCurrency espera uma string de digitos que será dividida por 100.
      // Ex: 1000.00 -> "100000" -> mask -> "1.000,00"
      const valorString = (initialData.valor_mensal * 100).toFixed(0);

      reset({
        proprietario_select: propSelect,
        descricao: initialData.descricao,
        valor_mensal: maskCurrency(valorString),
        inicio_tipo: initialData.inicio_tipo,
        inicio_valor: initialData.inicio_valor,
        duracao_anos: initialData.duracao_anos,
        correcao_anual: initialData.correcao_anual || undefined,
      });
    }
  }, [initialData, reset]);

  const inicioTipo = watch("inicio_tipo");

  const handleFormSubmit = async (data: FluxoFormData) => {
    setIsSubmitting(true);

    let proprietario_tipo = "titular";
    let familiar_id: number | null = null;

    if (data.proprietario_select === "titular") {
      proprietario_tipo = "titular";
    } else if (data.proprietario_select === "casal") {
      proprietario_tipo = "casal";
    } else if (data.proprietario_select === "familia") {
      proprietario_tipo = "familia";
    } else if (data.proprietario_select.startsWith("dep_")) {
      proprietario_tipo = "dependente";
      familiar_id = Number(data.proprietario_select.replace("dep_", ""));
    }

    const payload = {
      tipo, // Mantém o tipo original ou o da prop
      proprietario_tipo,
      familiar_id,
      descricao: data.descricao,
      valor_mensal: unmaskCurrency(data.valor_mensal),
      inicio_tipo: data.inicio_tipo,
      inicio_valor: Number(data.inicio_valor),
      duracao_anos: Number(data.duracao_anos),
      correcao_anual: data.correcao_anual ? Number(data.correcao_anual) : null,
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div style={{ minWidth: "350px", padding: "0.5rem" }}>
      <h3 style={{ marginTop: 0, textTransform: "capitalize" }}>
        {initialData ? `Editar ${tipo}` : `Nova ${tipo}`}
      </h3>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {/* SELECT INTELIGENTE */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#333" }}>
            Proprietário
          </label>
          <select
            {...register("proprietario_select", {
              required: "Selecione a quem pertence",
            })}
            style={{
              padding: "0.75rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "white",
            }}
          >
            <option value="">Selecione...</option>
            <optgroup label="Geral">
              <option value="titular">Titular (Eu)</option>
              <option value="casal">Casal (Eu + Cônjuge)</option>
              <option value="familia">Família (Todos)</option>
            </optgroup>

            {familiares.length > 0 && (
              <optgroup label="Dependentes / Familiares">
                {familiares.map((f) => (
                  <option key={f.id} value={`dep_${f.id}`}>
                    {f.nome} ({f.parentesco})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {errors.proprietario_select && (
            <span style={{ color: "red", fontSize: "0.8rem" }}>
              Campo obrigatório
            </span>
          )}
        </div>

        <Input
          label="Descrição"
          placeholder="Ex: Salário, Aluguel..."
          {...register("descricao", { required: "Obrigatório" })}
        />

        <Input
          label="Valor Mensal"
          placeholder="R$ 0,00"
          {...register("valor_mensal", {
            required: "Obrigatório",
            onChange: (e) =>
              setValue("valor_mensal", maskCurrency(e.target.value)),
          })}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            <label
              style={{ fontSize: "0.9rem", fontWeight: 500, color: "#333" }}
            >
              Início por
            </label>
            <select
              {...register("inicio_tipo")}
              style={{
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            >
              <option value="ano">Ano</option>
              <option value="idade">Idade</option>
            </select>
          </div>

          <Input
            label={inicioTipo === "ano" ? "Ano Início" : "Idade Início"}
            type="number"
            {...register("inicio_valor", { required: true, min: 0 })}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <Input
            label="Duração (Anos)"
            type="number"
            {...register("duracao_anos", { required: true, min: 1 })}
          />

          <Input
            label="Correção (%)"
            type="number"
            step="0.01"
            placeholder="IPCA"
            {...register("correcao_anual")}
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
            {initialData ? "Salvar Alterações" : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
