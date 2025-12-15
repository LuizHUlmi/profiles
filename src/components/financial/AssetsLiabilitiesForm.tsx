// src/components/financial/AssetsLiabilitiesForm.tsx

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import { Input } from "../ui/input/Input"; // <--- Import corrigido (PascalCase)
import { Button } from "../ui/button/Button";
import { maskCurrency, unmaskCurrency } from "../../utils/masks";
import { Save } from "lucide-react";
import type { Familiar, ItemAtivoPassivo } from "../../types/database";
import { useToast } from "../ui/toast/ToastContext";

// Definição do Payload para uso no onSubmit
export type AssetLiabilityPayload = Omit<ItemAtivoPassivo, "id" | "perfil_id">;

type AssetFormData = {
  proprietario_select: string;
  tipo: string;
  nome: string;
  valor: string;
  inventariar: boolean;
  percentual_inventario?: number;
  investir_pos_morte: boolean;

  // Investimentos
  rentabilidade_tipo: "cdi" | "bruta" | "ipca";
  rentabilidade_valor?: number;
  regime_tributario?: "progressivo" | "regressivo";

  // Passivos
  valor_parcela?: string;
  prazo_meses?: number;
  amortizacao_tipo?: "SAC" | "PRICE";
  correcao_anual?: number;
  segurado: boolean;
};

interface FormProps {
  categoria: "ativo" | "passivo";
  familiares: Familiar[];
  onClose: () => void;
  initialData?: ItemAtivoPassivo | null;
  defaultType?: string;
  allowedTypes?: string[];
  // Tipagem corrigida para evitar 'any'
  onSubmit: (data: AssetLiabilityPayload) => Promise<boolean>;
  profileId?: string;
}

const TIPOS_ATIVO = [
  "Renda Fixa",
  "Renda Variável",
  "Fundos de Investimento",
  "Previdência",
  "Saldo em Conta",
  "Imóvel",
  "Veículo",
  "Empresa",
  "Outros",
];

const TIPOS_PASSIVO = [
  "Financiamento Imobiliário",
  "Financiamento Veicular",
  "Empréstimo Pessoal",
  "Cartão de Crédito",
  "Outros",
];

export function AssetsLiabilitiesForm({
  categoria,
  familiares,
  onClose,
  initialData,
  defaultType,
  allowedTypes,
  onSubmit,
  profileId,
}: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<AssetFormData>({
      defaultValues: {
        inventariar: false,
        investir_pos_morte: false,
        percentual_inventario: 100,
        rentabilidade_tipo: "cdi",
        regime_tributario: "progressivo",
        segurado: false,
        amortizacao_tipo: "SAC",
      },
    });

  const watchInventariar = watch("inventariar");
  const watchTipo = watch("tipo");
  const watchRentabilidadeTipo = watch("rentabilidade_tipo");

  const opcoesDisponiveis = useMemo(() => {
    const todasOpcoes = categoria === "ativo" ? TIPOS_ATIVO : TIPOS_PASSIVO;
    return allowedTypes
      ? todasOpcoes.filter((tipo) => allowedTypes.includes(tipo))
      : todasOpcoes;
  }, [categoria, allowedTypes]);

  const isTypeLocked = opcoesDisponiveis.length === 1;

  const isInvestimentoFinanceiro = [
    "Renda Fixa",
    "Renda Variável",
    "Fundos de Investimento",
    "Previdência",
    "Saldo em Conta",
  ].includes(watchTipo);

  const isPrevidencia = watchTipo === "Previdência";

  const getLabelRentabilidade = () => {
    switch (watchRentabilidadeTipo) {
      case "cdi":
        return "% do CDI (Ex: 100)";
      case "ipca":
        return "Taxa Fixa + IPCA (Ex: 6 para IPCA+6%)";
      case "bruta":
        return "Taxa Pré-fixada Anual (Ex: 12 para 12% a.a.)";
      default:
        return "Taxa";
    }
  };

  const getPlaceholderRentabilidade = () => {
    switch (watchRentabilidadeTipo) {
      case "cdi":
        return "100";
      case "ipca":
        return "6.0";
      case "bruta":
        return "12.5";
      default:
        return "0";
    }
  };

  useEffect(() => {
    if (initialData) {
      let propSelect = initialData.proprietario_tipo as string;
      if (
        initialData.proprietario_tipo === "dependente" &&
        initialData.familiar_id
      ) {
        propSelect = `dep_${initialData.familiar_id}`;
      }

      const valorString = (initialData.valor * 100).toFixed(0);
      const valorParcelaString = initialData.valor_parcela
        ? (initialData.valor_parcela * 100).toFixed(0)
        : "";

      reset({
        proprietario_select: propSelect,
        tipo: initialData.tipo,
        nome: initialData.nome,
        valor: maskCurrency(valorString),
        inventariar: !!initialData.inventariar,
        percentual_inventario: initialData.percentual_inventario ?? 100,
        investir_pos_morte: !!initialData.investir_pos_morte,
        rentabilidade_tipo: initialData.rentabilidade_tipo || "cdi",
        rentabilidade_valor: initialData.rentabilidade_valor || undefined,
        regime_tributario: initialData.regime_tributario || "progressivo",
        valor_parcela: valorParcelaString
          ? maskCurrency(valorParcelaString)
          : "",
        prazo_meses: initialData.prazo_meses || undefined,
        amortizacao_tipo: initialData.amortizacao_tipo || "SAC",
        correcao_anual: initialData.correcao_anual || undefined,
        segurado: !!initialData.segurado,
      });
    } else {
      reset({
        proprietario_select: "titular",
        tipo:
          defaultType ||
          (opcoesDisponiveis.length === 1 ? opcoesDisponiveis[0] : ""),
        nome: "",
        valor: "",
        inventariar: false,
        investir_pos_morte: false,
        percentual_inventario: 100,
        rentabilidade_tipo: "cdi",
        regime_tributario: "progressivo",
        segurado: false,
        amortizacao_tipo: "SAC",
      });
    }
  }, [initialData, defaultType, reset, opcoesDisponiveis]);

  const handleFormSubmit = async (data: AssetFormData) => {
    setIsSubmitting(true);

    // CORREÇÃO: Tipagem explícita para resolver o erro do TypeScript
    let proprietario_tipo: ItemAtivoPassivo["proprietario_tipo"] = "titular";
    let familiar_id: number | null = null;

    if (["titular", "casal", "familia"].includes(data.proprietario_select)) {
      // "Assegura" ao TS que a string é do tipo permitido
      proprietario_tipo =
        data.proprietario_select as ItemAtivoPassivo["proprietario_tipo"];
    } else if (data.proprietario_select.startsWith("dep_")) {
      proprietario_tipo = "dependente";
      familiar_id = Number(data.proprietario_select.replace("dep_", ""));
    }

    const payload = {
      categoria,
      proprietario_tipo,
      familiar_id,
      tipo: data.tipo,
      nome: data.nome,
      valor: unmaskCurrency(data.valor),
      inventariar: categoria === "ativo" ? data.inventariar : false,
      percentual_inventario:
        categoria === "ativo" && data.inventariar
          ? Number(data.percentual_inventario)
          : null,
      investir_pos_morte:
        categoria === "ativo" ? data.investir_pos_morte : false,
      rentabilidade_tipo:
        categoria === "ativo" && isInvestimentoFinanceiro
          ? data.rentabilidade_tipo
          : null,
      rentabilidade_valor:
        categoria === "ativo" &&
        isInvestimentoFinanceiro &&
        data.rentabilidade_valor
          ? Number(data.rentabilidade_valor)
          : null,
      regime_tributario:
        categoria === "ativo" && isPrevidencia ? data.regime_tributario : null,
      valor_parcela:
        categoria === "passivo" && data.valor_parcela
          ? unmaskCurrency(data.valor_parcela)
          : null,
      prazo_meses:
        categoria === "passivo" && data.prazo_meses
          ? Number(data.prazo_meses)
          : null,
      amortizacao_tipo: categoria === "passivo" ? data.amortizacao_tipo : null,
      correcao_anual:
        categoria === "passivo" && data.correcao_anual
          ? Number(data.correcao_anual)
          : null,
      segurado: categoria === "passivo" ? data.segurado : false,
    };

    const success = await onSubmit(payload);

    // LÓGICA DE CRIAÇÃO AUTOMÁTICA DE DESPESA
    if (
      success &&
      categoria === "passivo" &&
      !initialData &&
      data.valor_parcela &&
      profileId
    ) {
      const valorParcela = unmaskCurrency(data.valor_parcela);
      const prazoMeses = data.prazo_meses ? Number(data.prazo_meses) : 0;
      const duracaoAnos = prazoMeses > 0 ? Math.ceil(prazoMeses / 12) : 10;

      if (valorParcela > 0) {
        try {
          const { error } = await supabase.from("fluxo_caixa").insert({
            perfil_id: profileId,
            tipo: "despesa",
            descricao: `Parcela - ${data.nome}`,
            valor_mensal: valorParcela,
            inicio_tipo: "ano",
            inicio_valor: new Date().getFullYear(),
            duracao_anos: duracaoAnos,
            proprietario_tipo: proprietario_tipo,
            familiar_id: familiar_id,
          });

          if (!error) {
            toast.success("Despesa mensal criada no Fluxo de Caixa!");
          } else {
            console.error("Erro insert fluxo:", error);
            toast.error("Erro ao criar despesa automática");
          }
        } catch (err) {
          console.error("Erro ao criar despesa automática", err);
        }
      }
    }

    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div style={{ minWidth: "500px", padding: "0.5rem" }}>
      <h3 style={{ marginTop: 0, textTransform: "capitalize" }}>
        {initialData ? "Editar" : "Novo"}{" "}
        {categoria === "ativo" ? "Ativo" : "Passivo"}
      </h3>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {/* BLOCO PROPRIETÁRIO/TIPO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            <label
              style={{ fontSize: "0.9rem", fontWeight: 500, color: "#333" }}
            >
              Proprietário
            </label>
            <select
              {...register("proprietario_select", { required: "Obrigatório" })}
              style={{
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "white",
              }}
            >
              <option value="">Selecione...</option>
              <optgroup label="Geral">
                <option value="titular">Titular</option>
                <option value="casal">Casal</option>
                <option value="familia">Família</option>
              </optgroup>
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

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            <label
              style={{ fontSize: "0.9rem", fontWeight: 500, color: "#333" }}
            >
              Tipo
            </label>
            {isTypeLocked ? (
              <select
                {...register("tipo")}
                disabled
                style={{
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "100%",
                  backgroundColor: "#f3f4f6",
                  color: "#555",
                  cursor: "not-allowed",
                }}
              >
                {opcoesDisponiveis.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <select
                {...register("tipo", { required: true })}
                style={{
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "100%",
                  backgroundColor: "white",
                }}
              >
                <option value="">Selecione o tipo...</option>
                {opcoesDisponiveis.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
            {isTypeLocked && (
              <input
                type="hidden"
                {...register("tipo")}
                value={opcoesDisponiveis[0]}
              />
            )}
          </div>
        </div>

        {/* BLOCO NOME/VALOR */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <Input
            label="Nome / Descrição"
            placeholder={
              categoria === "passivo" ? "Ex: Financ. Apartamento" : "Ex: CDB"
            }
            {...register("nome", { required: true })}
          />
          <Input
            label={
              categoria === "passivo" ? "Saldo Devedor Total" : "Saldo Atual"
            }
            placeholder="R$ 0,00"
            {...register("valor", {
              required: true,
              onChange: (e) => setValue("valor", maskCurrency(e.target.value)),
            })}
          />
        </div>

        {/* BLOCO PASSIVO */}
        {categoria === "passivo" && (
          <div
            style={{
              backgroundColor: "#fff1f2",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #fecdd3",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#9f1239" }}>
              Detalhes do Financiamento
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <Input
                label="Valor Parcela Mensal"
                placeholder="R$ 0,00"
                {...register("valor_parcela", {
                  onChange: (e) =>
                    setValue("valor_parcela", maskCurrency(e.target.value)),
                })}
                style={{ borderColor: "#fecdd3" }}
              />
              <Input
                label="Meses Restantes"
                type="number"
                placeholder="Ex: 360"
                {...register("prazo_meses")}
                style={{ borderColor: "#fecdd3" }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: "#9f1239",
                  }}
                >
                  Tabela
                </label>
                <select
                  {...register("amortizacao_tipo")}
                  style={{
                    padding: "0.6rem",
                    borderRadius: "6px",
                    border: "1px solid #fecdd3",
                    backgroundColor: "white",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="SAC">SAC (Decrescente)</option>
                  <option value="PRICE">PRICE (Fixa)</option>
                </select>
              </div>

              <Input
                label="Correção Anual (% Estimada)"
                type="number"
                step="0.1"
                placeholder="Ex: 3.5 para TR"
                {...register("correcao_anual")}
                style={{ borderColor: "#fecdd3" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="segurado"
                {...register("segurado")}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "#e11d48",
                }}
              />
              <label
                htmlFor="segurado"
                style={{
                  fontWeight: 500,
                  color: "#881337",
                  fontSize: "0.9rem",
                }}
              >
                Possui Seguro Prestamista?
              </label>
            </div>
          </div>
        )}

        {/* BLOCO PREVIDENCIA */}
        {isPrevidencia && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            <label
              style={{ fontSize: "0.9rem", fontWeight: 500, color: "#0ea5e9" }}
            >
              Regime de Tributação
            </label>
            <select
              {...register("regime_tributario", { required: isPrevidencia })}
              style={{
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #0ea5e9",
                backgroundColor: "#f0f9ff",
              }}
            >
              <option value="progressivo">Progressivo (Compensável)</option>
              <option value="regressivo">Regressivo (Definitiva)</option>
            </select>
          </div>
        )}

        {/* BLOCO INVESTIMENTOS */}
        {isInvestimentoFinanceiro && (
          <div
            style={{
              backgroundColor: "#f0f9ff",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #bae6fd",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
            }}
          >
            <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#0369a1" }}>
              Rentabilidade Estimada
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: "#0369a1",
                  }}
                >
                  Indexador
                </label>
                <select
                  {...register("rentabilidade_tipo")}
                  style={{
                    padding: "0.6rem",
                    borderRadius: "6px",
                    border: "1px solid #7dd3fc",
                    backgroundColor: "white",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="cdi">% do CDI</option>
                  <option value="ipca">IPCA +</option>
                  <option value="bruta">Taxa Pré-fixada</option>
                </select>
              </div>
              <Input
                label={getLabelRentabilidade()}
                type="number"
                step="0.01"
                placeholder={getPlaceholderRentabilidade()}
                {...register("rentabilidade_valor")}
                style={{ borderColor: "#7dd3fc" }}
              />
            </div>
          </div>
        )}

        {/* BLOCO HERANÇA */}
        {categoria === "ativo" && !isInvestimentoFinanceiro && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              backgroundColor: "#f9fafb",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #eee",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="inventariar"
                {...register("inventariar")}
                style={{ width: "18px", height: "18px" }}
              />
              <label
                htmlFor="inventariar"
                style={{ fontWeight: 500, color: "#333" }}
              >
                Inventariar este bem?
              </label>
            </div>
            {watchInventariar && (
              <Input
                label="% do Inventário"
                type="number"
                placeholder="100"
                {...register("percentual_inventario", { max: 100, min: 0 })}
              />
            )}
          </div>
        )}

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
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
