// src/components/education/EducacaoForm.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input/Input";
import { Select } from "../ui/select/Select"; // <--- Componente Padronizado
import { Button } from "../ui/button/Button";
import { Save, GraduationCap, CalendarRange } from "lucide-react";
import { maskCurrency, unmaskCurrency } from "../../utils/masks";
import type { Familiar, ItemEducacao } from "../../types/database";
import styles from "./EducacaoForm.module.css"; // <--- Importando CSS

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
  initialData?: ItemEducacao | null; // <--- Dados para edição
}

export function EducacaoForm({
  familiares,
  onClose,
  onSubmit,
  initialData,
}: EducacaoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EducacaoFormData>({
    defaultValues: {
      ano_inicio: new Date().getFullYear(),
      duracao_anos: 12, // Padrão escolar
      correcao_anual: "0",
    },
  });

  // --- PREENCHIMENTO PARA EDIÇÃO ---
  useEffect(() => {
    if (initialData) {
      // Reconstrói o valor do select (titular ou dep_ID)
      let beneficiarioValue = "titular";
      if (
        initialData.beneficiario_tipo === "dependente" &&
        initialData.familiar_id
      ) {
        beneficiarioValue = `dep_${initialData.familiar_id}`;
      }

      reset({
        beneficiario_select: beneficiarioValue,
        nome: initialData.nome,
        custo_mensal: maskCurrency(initialData.custo_mensal.toFixed(2)),
        correcao_anual: String(initialData.correcao_anual || 0),
        ano_inicio: initialData.ano_inicio,
        duracao_anos: initialData.duracao_anos,
      });
    }
  }, [initialData, reset]);

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
    <div className={styles.container}>
      <h3 className={styles.header}>
        <GraduationCap size={28} color="#0ea5e9" />
        {initialData ? "Editar Planejamento" : "Novo Planejamento"}
      </h3>

      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        {/* SELEÇÃO DO BENEFICIÁRIO */}
        <Select
          label="Quem é o estudante?"
          {...register("beneficiario_select", {
            required: "Selecione o beneficiário",
          })}
          error={errors.beneficiario_select?.message}
          placeholder="Selecione..."
        >
          <option value="titular">Titular (Cliente)</option>
          {familiares.length > 0 && (
            <optgroup label="Dependentes">
              {familiares.map((f) => (
                <option key={f.id} value={`dep_${f.id}`}>
                  {f.nome} ({f.parentesco})
                </option>
              ))}
            </optgroup>
          )}
        </Select>

        {/* NOME DA INSTITUIÇÃO */}
        <Input
          label="Instituição / Objetivo"
          placeholder="Ex: Colégio Santa Maria, Faculdade de Medicina..."
          {...register("nome", { required: "Nome é obrigatório" })}
          error={errors.nome?.message}
        />

        {/* CUSTO E CORREÇÃO */}
        <div className={styles.row}>
          <Input
            label="Mensalidade Atual"
            placeholder="R$ 0,00"
            {...register("custo_mensal", {
              required: "Valor obrigatório",
              onChange: (e) =>
                setValue("custo_mensal", maskCurrency(e.target.value)),
            })}
            error={errors.custo_mensal?.message}
          />
          <Input
            label="Correção Anual (%)"
            type="number"
            step="0.1"
            placeholder="Ex: 6.0"
            {...register("correcao_anual")}
          />
        </div>

        {/* BOX DE PERÍODO */}
        <div className={styles.periodoBox}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarRange size={18} color="#64748b" />
            <h4 className={styles.periodoTitle} style={{ margin: 0 }}>
              Definição do Período
            </h4>
          </div>

          <div className={styles.row}>
            <Input
              label="Ano de Início"
              type="number"
              placeholder={`Ex: ${new Date().getFullYear() + 1}`}
              {...register("ano_inicio", {
                required: "Obrigatório",
                min: { value: 1900, message: "Ano inválido" },
                max: { value: 2100, message: "Ano inválido" },
              })}
              error={errors.ano_inicio?.message}
              style={{ backgroundColor: "white" }}
            />
            <Input
              label="Duração (Anos)"
              type="number"
              placeholder="Ex: 5"
              {...register("duracao_anos", {
                required: "Obrigatório",
                min: { value: 1, message: "Mínimo 1 ano" },
              })}
              error={errors.duracao_anos?.message}
              style={{ backgroundColor: "white" }}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
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
            {initialData ? "Salvar Alterações" : "Criar Planejamento"}
          </Button>
        </div>
      </form>
    </div>
  );
}
