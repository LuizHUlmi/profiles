// src/components/protection/SeguroForm.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import { Input } from "../ui/input/Input";
import { Select } from "../ui/select/Select";
import { Button } from "../ui/button/Button";
import { Save, Clock, Infinity as InfinityIcon } from "lucide-react";
import { maskCurrency, unmaskCurrency } from "../../utils/masks";
import { useToast } from "../ui/toast/ToastContext";
import type { Familiar, ItemSeguro } from "../../types/database";
import { InfoTooltip } from "../ui/tooltip/InfoTooltip";
import styles from "./SeguroForm.module.css";

type SeguroFormData = {
  segurado_select: string;
  nome: string;
  cobertura: string;
  valor_mensal?: string;
  tipo_vigencia: "vitalicio" | "termo";
  prazo_anos?: number;
};

interface SeguroFormProps {
  familiares: Familiar[];
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<boolean>;
  profileId?: string;
  initialData?: ItemSeguro | null; // <--- Dados para edição
}

export function SeguroForm({
  familiares,
  onClose,
  onSubmit,
  profileId,
  initialData,
}: SeguroFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SeguroFormData>({
    defaultValues: {
      tipo_vigencia: "vitalicio",
    },
  });

  const watchTipoVigencia = watch("tipo_vigencia");

  // --- POPULAR FORMULÁRIO SE FOR EDIÇÃO ---
  useEffect(() => {
    if (initialData) {
      // Reconstrói o valor do select (titular ou dep_ID)
      let seguradoValue = "titular";
      if (
        initialData.proprietario_tipo === "dependente" &&
        initialData.familiar_id
      ) {
        seguradoValue = `dep_${initialData.familiar_id}`;
      }

      reset({
        segurado_select: seguradoValue,
        nome: initialData.nome,
        cobertura: maskCurrency(initialData.cobertura.toFixed(2)),
        valor_mensal: initialData.valor_mensal
          ? maskCurrency(initialData.valor_mensal.toFixed(2))
          : "",
        tipo_vigencia: initialData.tipo_vigencia || "vitalicio",
        prazo_anos: initialData.prazo_anos || undefined,
      });
    }
  }, [initialData, reset]);

  // Auxiliar Idade
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

    // Lógica de Despesa Automática (Apenas na Criação para não duplicar no update)
    // Se for edição (initialData existe), evitamos criar nova despesa automaticamente
    if (success && valorMensal > 0 && profileId && !initialData) {
      try {
        let duracaoCalculada = 10;
        if (data.tipo_vigencia === "termo" && prazoAnosInput) {
          duracaoCalculada = prazoAnosInput;
        } else if (data.tipo_vigencia === "vitalicio") {
          const { data: perfilData } = await supabase
            .from("perfis")
            .select("data_nascimento, expectativa_vida")
            .eq("id", profileId)
            .single();

          if (perfilData) {
            const expectativa = perfilData.expectativa_vida || 90;
            let idadeAtual = 30;
            if (perfilData.data_nascimento)
              idadeAtual = calculateAge(perfilData.data_nascimento);
            duracaoCalculada = expectativa - idadeAtual;
            if (duracaoCalculada < 1) duracaoCalculada = 1;
          }
        }

        await supabase.from("fluxo_caixa").insert({
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
        toast.success(`Despesa projetada criada.`);
      } catch (err) {
        console.error(err);
      }
    }

    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {initialData ? "Editar Proteção" : "Nova Proteção"}
      </h3>

      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        <Select
          label="Segurado"
          {...register("segurado_select", { required: "Selecione o segurado" })}
          error={errors.segurado_select?.message}
          placeholder="Quem é o segurado?"
        >
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
        </Select>

        <Input
          label="Nome / Seguradora"
          placeholder="Ex: Prudential Vida Inteira"
          {...register("nome", { required: "Nome é obrigatório" })}
          error={errors.nome?.message}
        />

        <Input
          label="Valor da Cobertura"
          placeholder="R$ 0,00"
          {...register("cobertura", {
            required: "Cobertura é obrigatória",
            onChange: (e) =>
              setValue("cobertura", maskCurrency(e.target.value)),
          })}
          error={errors.cobertura?.message}
        />

        <div className={styles.vigenciaCard}>
          <label className={styles.vigenciaLabel}>
            Tipo de Vigência
            <InfoTooltip text="Define por quanto tempo essa despesa impactará o fluxo de caixa." />
          </label>

          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="vitalicio"
                className={styles.radioInput}
                {...register("tipo_vigencia")}
              />
              <InfinityIcon size={18} color="#0ea5e9" />
              <span className={styles.radioText}>Vitalício</span>
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="termo"
                className={styles.radioInput}
                {...register("tipo_vigencia")}
              />
              <Clock size={18} color="#f59e0b" />
              <span className={styles.radioText}>Temporário</span>
            </label>
          </div>

          {watchTipoVigencia === "termo" && (
            <Input
              label="Prazo (Anos)"
              type="number"
              {...register("prazo_anos", { required: "Informe o prazo" })}
              error={errors.prazo_anos?.message}
              style={{ backgroundColor: "white" }}
            />
          )}
        </div>

        <Input
          label="Custo Mensal (Prêmio)"
          placeholder="R$ 0,00"
          {...register("valor_mensal", {
            onChange: (e) =>
              setValue("valor_mensal", maskCurrency(e.target.value)),
          })}
        />

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
            {initialData ? "Salvar Alterações" : "Criar Proteção"}
          </Button>
        </div>
      </form>
    </div>
  );
}
