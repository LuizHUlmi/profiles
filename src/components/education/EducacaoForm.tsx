// src/components/education/EducacaoForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input/Input";
import { Button } from "../ui/button/Button";
import { Save, GraduationCap } from "lucide-react";
import { maskCurrency, unmaskCurrency } from "../../utils/masks";
import type { Familiar } from "../../types/database";

type EducacaoFormData = {
  beneficiario_select: string;
  nome: string;
  custo_mensal: string;
  correcao_anual: string;
  ano_inicio: number;
  duracao_anos: number;
};

interface EducacaoFormProps {
  familiares: Familiar[];
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<boolean>;
}

export function EducacaoForm({
  familiares,
  onClose,
  onSubmit,
}: EducacaoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue } = useForm<EducacaoFormData>({
    defaultValues: {
      ano_inicio: new Date().getFullYear(), // Default ano atual
      duracao_anos: 12, // Default escola
      correcao_anual: "0",
    },
  });

  const handleFormSubmit = async (data: EducacaoFormData) => {
    setIsSubmitting(true);

    let beneficiario_tipo = "titular";
    let familiar_id: number | null = null;

    if (data.beneficiario_select === "titular") {
      beneficiario_tipo = "titular";
    } else if (data.beneficiario_select.startsWith("dep_")) {
      beneficiario_tipo = "dependente";
      familiar_id = Number(data.beneficiario_select.replace("dep_", ""));
    }

    const payload = {
      beneficiario_tipo,
      familiar_id,
      nome: data.nome,
      custo_mensal: unmaskCurrency(data.custo_mensal),
      correcao_anual: Number(data.correcao_anual),
      ano_inicio: Number(data.ano_inicio),
      duracao_anos: Number(data.duracao_anos),
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div style={{ minWidth: "450px", padding: "0.5rem" }}>
      <h3
        style={{
          marginTop: 0,
          color: "#1e293b",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <GraduationCap size={24} color="#0ea5e9" />
        Novo Planejamento Educacional
      </h3>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {/* Para Quem? */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#333" }}>
            Para quem?
          </label>
          <select
            {...register("beneficiario_select", {
              required: "Selecione o beneficiário",
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
              <optgroup label="Dependentes">
                {familiares.map((f) => (
                  <option key={f.id} value={`dep_${f.id}`}>
                    {f.nome}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Nome */}
        <Input
          label="Nome (Ex: Escola, Faculdade)"
          placeholder="Instituição ou Objetivo"
          {...register("nome", { required: true })}
        />

        {/* Custo e Correção */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <Input
            label="Custo Mensal (Hoje)"
            placeholder="R$ 0,00"
            {...register("custo_mensal", {
              required: true,
              onChange: (e) =>
                setValue("custo_mensal", maskCurrency(e.target.value)),
            })}
          />
          <Input
            label="Correção Anual (%)"
            type="number"
            step="0.1"
            placeholder="Ex: 5"
            {...register("correcao_anual")}
          />
        </div>

        {/* Início e Duração */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            backgroundColor: "#f0f9ff",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #bae6fd",
          }}
        >
          <Input
            label="Ano de Início"
            type="number"
            placeholder="Ex: 2026"
            {...register("ano_inicio", {
              required: true,
              min: 1900,
              max: 2100,
            })}
            style={{ backgroundColor: "white" }}
          />
          <Input
            label="Duração (Anos)"
            type="number"
            placeholder="Ex: 5"
            {...register("duracao_anos", { required: true, min: 1 })}
            style={{ backgroundColor: "white" }}
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
            Salvar Planejamento
          </Button>
        </div>
      </form>
    </div>
  );
}
