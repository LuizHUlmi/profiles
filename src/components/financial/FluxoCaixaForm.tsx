// src/components/financial/FluxoCaixaForm.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input/Input";
import { Select } from "../ui/select/Select";
import { Button } from "../ui/button/Button";
import { TrendingUp, TrendingDown, Save, CalendarRange } from "lucide-react";
import { maskCurrency, unmaskCurrency } from "../../utils/masks";
import type { Familiar, ItemFluxoCaixa } from "../../types/database";
import styles from "./FluxoCaixaForm.module.css";

type FluxoFormData = {
  proprietario_select: string;
  descricao: string;
  valor_mensal: string;
  correcao_anual: string;
  inicio_valor: number;
  duracao_anos: number;
};

interface FluxoCaixaFormProps {
  tipo: "receita" | "despesa";
  familiares: Familiar[];
  initialData?: ItemFluxoCaixa | null;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<boolean>;
}

export function FluxoCaixaForm({
  tipo,
  familiares,
  initialData,
  onClose,
  onSubmit,
}: FluxoCaixaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReceita = tipo === "receita";

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FluxoFormData>({
    defaultValues: {
      inicio_valor: new Date().getFullYear(),
      duracao_anos: 1, // Padrão: 1 ano (pontual) ou recorrente curto
      correcao_anual: "0",
    },
  });

  // --- POPULAR FORMULÁRIO (Edição) ---
  useEffect(() => {
    if (initialData) {
      let propValue = "titular";

      // Lógica para recuperar o valor correto do select
      if (
        initialData.proprietario_tipo === "dependente" &&
        initialData.familiar_id
      ) {
        propValue = `dep_${initialData.familiar_id}`;
      } else if (["casal", "familia"].includes(initialData.proprietario_tipo)) {
        propValue = initialData.proprietario_tipo;
      }

      reset({
        proprietario_select: propValue,
        descricao: initialData.descricao,
        valor_mensal: maskCurrency(initialData.valor_mensal.toFixed(2)),
        correcao_anual: String(initialData.correcao_anual || 0),
        inicio_valor: initialData.inicio_valor,
        duracao_anos: initialData.duracao_anos,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: FluxoFormData) => {
    setIsSubmitting(true);

    let proprietario_tipo = "titular";
    let familiar_id: number | null = null;

    // Lógica inversa do Select
    if (["titular", "casal", "familia"].includes(data.proprietario_select)) {
      proprietario_tipo = data.proprietario_select;
    } else if (data.proprietario_select.startsWith("dep_")) {
      proprietario_tipo = "dependente";
      familiar_id = Number(data.proprietario_select.replace("dep_", ""));
    }

    const payload = {
      tipo, // 'receita' ou 'despesa'
      proprietario_tipo,
      familiar_id,
      descricao: data.descricao,
      valor_mensal: unmaskCurrency(data.valor_mensal),
      correcao_anual: Number(data.correcao_anual),
      inicio_tipo: "ano", // Hardcoded para simplificar, mas poderia ser 'idade'
      inicio_valor: Number(data.inicio_valor),
      duracao_anos: Number(data.duracao_anos),
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className={styles.container}>
      {/* HEADER DINÂMICO */}
      <h3
        className={`${styles.header} ${
          isReceita ? styles.headerReceita : styles.headerDespesa
        }`}
      >
        {isReceita ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
        {initialData
          ? `Editar ${isReceita ? "Receita" : "Despesa"}`
          : `Nova ${isReceita ? "Receita" : "Despesa"}`}
      </h3>

      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        {/* PROPRIETÁRIO */}
        <Select
          label="Responsável / Beneficiário"
          {...register("proprietario_select", {
            required: "Selecione o responsável",
          })}
          error={errors.proprietario_select?.message}
        >
          <option value="titular">Titular (Cliente)</option>
          <option value="casal">Casal (Conjunto)</option>
          <option value="familia">Família (Todos)</option>
          {familiares.length > 0 && (
            <optgroup label="Dependentes">
              {familiares.map((f) => (
                <option key={f.id} value={`dep_${f.id}`}>
                  {f.nome}
                </option>
              ))}
            </optgroup>
          )}
        </Select>

        {/* DESCRIÇÃO */}
        <Input
          label="Descrição"
          placeholder={
            isReceita
              ? "Ex: Salário, Aluguel Recebido..."
              : "Ex: Aluguel, Mercado, Luz..."
          }
          {...register("descricao", { required: "Descrição obrigatória" })}
          error={errors.descricao?.message}
        />

        {/* VALOR E CORREÇÃO */}
        <div className={styles.row}>
          <Input
            label="Valor Mensal"
            placeholder="R$ 0,00"
            {...register("valor_mensal", {
              required: "Valor obrigatório",
              onChange: (e) =>
                setValue("valor_mensal", maskCurrency(e.target.value)),
            })}
            error={errors.valor_mensal?.message}
          />
          <Input
            label="Correção Anual (%)"
            type="number"
            step="0.1"
            placeholder="Ex: IPCA (0)"
            {...register("correcao_anual")}
          />
        </div>

        {/* BOX DE TEMPO */}
        <div className={styles.highlightBox}>
          <h4 className={styles.boxTitle}>
            <CalendarRange size={16} />
            Duração e Vigência
          </h4>

          <div className={styles.row}>
            <Input
              label="Ano de Início"
              type="number"
              placeholder={`Ex: ${new Date().getFullYear()}`}
              {...register("inicio_valor", {
                required: "Ano obrigatório",
                min: { value: 1900, message: "Ano inválido" },
                max: { value: 2100, message: "Ano inválido" },
              })}
              error={errors.inicio_valor?.message}
              style={{ backgroundColor: "white" }}
            />
            <Input
              label="Duração (Anos)"
              type="number"
              placeholder="Ex: 1 (Pontual) ou 30 (Longo Prazo)"
              {...register("duracao_anos", {
                required: "Duração obrigatória",
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
            variant={isReceita ? "success" : "danger"} // Botão segue a cor do tipo
          >
            {initialData ? "Salvar Alterações" : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
