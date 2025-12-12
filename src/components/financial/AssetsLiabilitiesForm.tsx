// src/components/financial/AssetsLiabilitiesForm.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input/input";
import { Button } from "../ui/button/Button";
import { maskCurrency, unmaskCurrency } from "../../utils/masks";
import { Save } from "lucide-react";
import type { Familiar, ItemAtivoPassivo } from "../../types/database";

type AssetFormData = {
  proprietario_select: string;
  tipo: string;
  nome: string;
  valor: string;
  inventariar: boolean;
  percentual_inventario?: number;
  investir_pos_morte: boolean;
};

interface FormProps {
  categoria: "ativo" | "passivo";
  familiares: Familiar[];
  onClose: () => void;
  initialData?: ItemAtivoPassivo | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<boolean>;
}

export function AssetsLiabilitiesForm({
  categoria,
  familiares,
  onClose,
  initialData,
  onSubmit,
}: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<AssetFormData>({
      defaultValues: {
        inventariar: false,
        investir_pos_morte: false,
        percentual_inventario: 100, // Padrão
      },
    });

  const watchInventariar = watch("inventariar");

  // Opções de Tipo sugeridas
  const tiposAtivo = [
    "Imóvel",
    "Veículo",
    "Aplicação Financeira",
    "Saldo em Conta",
    "Empresa",
    "Outros",
  ];
  const tiposPassivo = [
    "Financiamento Imobiliário",
    "Financiamento Veicular",
    "Empréstimo Pessoal",
    "Cartão de Crédito",
    "Outros",
  ];
  const opcoesTipo = categoria === "ativo" ? tiposAtivo : tiposPassivo;

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

      reset({
        proprietario_select: propSelect,
        tipo: initialData.tipo,
        nome: initialData.nome,
        valor: maskCurrency(valorString),
        inventariar: initialData.inventariar,
        percentual_inventario: initialData.percentual_inventario || 100,
        investir_pos_morte: initialData.investir_pos_morte,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: AssetFormData) => {
    setIsSubmitting(true);

    let proprietario_tipo = "titular";
    let familiar_id: number | null = null;

    if (["titular", "casal", "familia"].includes(data.proprietario_select)) {
      proprietario_tipo = data.proprietario_select;
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
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div style={{ minWidth: "350px", padding: "0.5rem" }}>
      <h3 style={{ marginTop: 0, textTransform: "capitalize" }}>
        {initialData ? "Editar" : "Novo"}{" "}
        {categoria === "ativo" ? "Ativo" : "Passivo"}
      </h3>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {/* Proprietário */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#333" }}>
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

        {/* Tipo e Nome */}
        <div style={{ display: "flex", gap: "10px" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <label
              style={{ fontSize: "0.9rem", fontWeight: 500, color: "#333" }}
            >
              Tipo
            </label>
            <select
              {...register("tipo", { required: true })}
              style={{
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                width: "100%",
              }}
            >
              {opcoesTipo.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <Input
              label="Nome / Descrição"
              placeholder="Ex: Apto Centro"
              {...register("nome", { required: true })}
            />
          </div>
        </div>

        <Input
          label="Valor Total"
          placeholder="R$ 0,00"
          {...register("valor", {
            required: true,
            onChange: (e) => setValue("valor", maskCurrency(e.target.value)),
          })}
        />

        {/* Campos Específicos de ATIVOS */}
        {categoria === "ativo" && (
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

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="investir"
                {...register("investir_pos_morte")}
                style={{ width: "18px", height: "18px" }}
              />
              <label
                htmlFor="investir"
                style={{ fontWeight: 500, color: "#333" }}
              >
                Investir Pós-morte?
              </label>
            </div>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#666",
                margin: 0,
                paddingLeft: "28px",
              }}
            >
              Se marcado, este ativo será considerado liquidez e gerará renda
              para os herdeiros na simulação.
            </p>
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
