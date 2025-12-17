// src/components/financial/AssetsLiabilitiesForm.tsx

import { useEffect } from "react";
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button/Button";
import { Save } from "lucide-react";
import { useToast } from "../ui/toast/ToastContext";
import { maskCurrency } from "../../utils/masks";
import styles from "./AssetsLiabilitiesForm.module.css"; // <--- Importação do CSS

// Schemas e Tipos
import {
  financialItemSchema,
  type FinancialItemInput,
  type FinancialItemFormValues,
} from "../../schemas/financialSchema";

import type { Familiar, ItemAtivoPassivo } from "../../types/database";

// Painéis Específicos
import { LiabilityPanel } from "./forms/LiabilityPanel";
import { PensionPanel } from "./forms/PensionPanel";
import { FinancialInvestmentPanel } from "./forms/FinancialInvestmentPanel";
import { PhysicalAssetPanel } from "./forms/PhysicalAssetPanel";

export type AssetPayload = Omit<
  ItemAtivoPassivo,
  "id" | "perfil_id" | "created_at"
>;

interface FormProps {
  categoria: "ativo" | "passivo";
  familiares: Familiar[];
  onClose: () => void;
  initialData?: ItemAtivoPassivo | null;
  defaultType?: string;
  allowedTypes?: string[];
  onSubmit: (data: AssetPayload) => Promise<boolean>;
  profileId?: string;
}

const INVESTIMENTOS_GERAIS = [
  "Aplicação Financeira",
  "Renda Fixa",
  "Renda Variável",
  "Fundos de Investimento",
  "Saldo em Conta",
];

export function AssetsLiabilitiesForm({
  categoria,
  familiares,
  onClose,
  initialData,
  defaultType,
  onSubmit,
  profileId,
}: FormProps) {
  const toast = useToast();

  const methods = useForm<FinancialItemInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(financialItemSchema) as any,
    defaultValues: {
      categoria,
      tipo:
        defaultType ||
        (categoria === "ativo" ? "Aplicação Financeira" : "Outros"),
      proprietario_select: "titular",
      valor: "",
      rentabilidade_tipo: "cdi",
      regime_tributario: "progressivo",
      amortizacao_tipo: "SAC",
      percentual_inventario: 100,
      inventariar: false,
      investir_pos_morte: false,
      segurado: false,
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  // Monitoramento para decisão de qual painel exibir
  const tipoSelecionado = watch("tipo");
  const isPrevidencia = tipoSelecionado === "Previdência";
  const isInvestimentoGeral = INVESTIMENTOS_GERAIS.includes(tipoSelecionado);

  useEffect(() => {
    if (initialData) {
      let propSelect = initialData.proprietario_tipo as string;
      if (
        initialData.proprietario_tipo === "dependente" &&
        initialData.familiar_id
      ) {
        propSelect = `dep_${initialData.familiar_id}`;
      }

      reset({
        ...initialData,
        proprietario_select: propSelect,
        valor: maskCurrency((initialData.valor * 100).toFixed(0)),
        valor_parcela: initialData.valor_parcela
          ? maskCurrency((initialData.valor_parcela * 100).toFixed(0))
          : "",
        percentual_inventario: initialData.percentual_inventario ?? 100,
        rentabilidade_tipo: initialData.rentabilidade_tipo || "cdi",
        regime_tributario: initialData.regime_tributario || "progressivo",
        amortizacao_tipo: initialData.amortizacao_tipo || "SAC",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    } else {
      setValue("categoria", categoria);
      if (defaultType) {
        setValue("tipo", defaultType);
      } else {
        const tipoPadrao =
          categoria === "ativo" ? "Aplicação Financeira" : "Outros";
        setValue("tipo", tipoPadrao);
      }
    }
  }, [initialData, defaultType, categoria, reset, setValue]);

  const onFormSubmit: SubmitHandler<FinancialItemFormValues> = async (data) => {
    let proprietario_tipo: ItemAtivoPassivo["proprietario_tipo"] = "titular";
    let familiar_id: number | null = null;

    if (["titular", "casal", "familia"].includes(data.proprietario_select)) {
      proprietario_tipo =
        data.proprietario_select as ItemAtivoPassivo["proprietario_tipo"];
    } else if (data.proprietario_select.startsWith("dep_")) {
      proprietario_tipo = "dependente";
      familiar_id = Number(data.proprietario_select.replace("dep_", ""));
    }

    const payload: AssetPayload = {
      categoria,
      proprietario_tipo,
      familiar_id,
      tipo: data.tipo,
      nome: data.nome,
      valor: data.valor,

      inventariar: "inventariar" in data ? data.inventariar : false,
      percentual_inventario:
        "percentual_inventario" in data
          ? data.percentual_inventario ?? null
          : null,
      investir_pos_morte:
        "investir_pos_morte" in data ? data.investir_pos_morte : false,

      rentabilidade_tipo:
        "rentabilidade_tipo" in data ? data.rentabilidade_tipo ?? null : null,
      rentabilidade_valor:
        "rentabilidade_valor" in data ? data.rentabilidade_valor ?? null : null,
      regime_tributario:
        "regime_tributario" in data ? data.regime_tributario ?? null : null,

      valor_parcela:
        "valor_parcela" in data ? data.valor_parcela ?? null : null,
      prazo_meses: "prazo_meses" in data ? data.prazo_meses ?? null : null,
      amortizacao_tipo:
        "amortizacao_tipo" in data ? data.amortizacao_tipo ?? null : null,
      correcao_anual:
        "correcao_anual" in data ? data.correcao_anual ?? null : null,
      segurado: "segurado" in data ? data.segurado : false,
    };

    const success = await onSubmit(payload);

    if (
      success &&
      categoria === "passivo" &&
      !initialData &&
      payload.valor_parcela &&
      payload.valor_parcela > 0 &&
      profileId
    ) {
      handleAutomaticExpense(payload, proprietario_tipo, familiar_id);
    }

    if (success) onClose();
  };

  const handleAutomaticExpense = async (
    payload: AssetPayload,
    prop_tipo: string,
    fam_id: number | null
  ) => {
    const prazoMeses = payload.prazo_meses || 0;
    const duracaoAnos = prazoMeses > 0 ? Math.ceil(prazoMeses / 12) : 10;
    try {
      const { error } = await supabase.from("fluxo_caixa").insert({
        perfil_id: profileId,
        tipo: "despesa",
        descricao: `Parcela - ${payload.nome}`,
        valor_mensal: payload.valor_parcela,
        inicio_tipo: "ano",
        inicio_valor: new Date().getFullYear(),
        duracao_anos: duracaoAnos,
        proprietario_tipo: prop_tipo,
        familiar_id: fam_id,
      });
      if (!error) toast.success("Despesa mensal criada no Fluxo de Caixa!");
    } catch (err) {
      console.error("Erro ao criar despesa automática", err);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {initialData ? "Editar" : "Novo"}{" "}
        {categoria === "ativo" ? "Ativo" : "Passivo"}
      </h3>

      <FormProvider {...methods}>
        <form
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSubmit={handleSubmit(onFormSubmit as any)}
          className={styles.form}
        >
          <input type="hidden" {...methods.register("tipo")} />

          {/* Painéis */}

          {categoria === "passivo" && (
            <LiabilityPanel familiares={familiares} />
          )}

          {categoria === "ativo" && isPrevidencia && (
            <PensionPanel familiares={familiares} />
          )}

          {categoria === "ativo" && isInvestimentoGeral && (
            <FinancialInvestmentPanel familiares={familiares} />
          )}

          {categoria === "ativo" && !isPrevidencia && !isInvestimentoGeral && (
            <PhysicalAssetPanel familiares={familiares} />
          )}

          {/* Botões */}
          <div className={styles.actions}>
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
              Salvar
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
