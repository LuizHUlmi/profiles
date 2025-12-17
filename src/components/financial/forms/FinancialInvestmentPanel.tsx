// src/components/financial/forms/FinancialInvestmentPanel.tsx
import { useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { Input } from "../../ui/input/Input";
import { Select } from "../../ui/select/Select";
import { maskCurrency } from "../../../utils/masks";
import type { Familiar } from "../../../types/database";
import styles from "./FinancialInvestmentPanel.module.css";

interface PanelProps {
  familiares: Familiar[];
}

export function FinancialInvestmentPanel({ familiares }: PanelProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const rentabilidadeTipo = watch("rentabilidade_tipo");

  const { temConjuge, temFamilia } = useMemo(() => {
    const temFamilia = familiares.length > 0;
    const temConjuge = familiares.some((f) => {
      const parentesco = f.parentesco?.toLowerCase() || "";
      return [
        "cônjuge",
        "conjuge",
        "esposo",
        "esposa",
        "companheiro",
        "companheira",
      ].includes(parentesco);
    });
    return { temConjuge, temFamilia };
  }, [familiares]);

  return (
    <>
      {/* BLOCO 1: IDENTIFICAÇÃO */}
      <div className={styles.row}>
        <Select
          label="Proprietário"
          placeholder="Selecione..."
          {...register("proprietario_select")}
          error={errors.proprietario_select?.message as string}
        >
          <optgroup label="Geral">
            <option value="titular">Titular</option>
            {temConjuge && <option value="casal">Casal</option>}
            {temFamilia && <option value="familia">Família</option>}
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
        </Select>

        <Input
          label="Valor Investido (R$)"
          {...register("valor")}
          onChange={(e) => setValue("valor", maskCurrency(e.target.value))}
          error={errors.valor?.message as string}
        />
      </div>

      <div className={styles.singleColumn}>
        <Input
          label="Nome / Descrição"
          placeholder="Ex: Carteira XP"
          {...register("nome")}
          error={errors.nome?.message as string}
        />
      </div>

      <div className={styles.separator} />

      {/* BLOCO 2: RENTABILIDADE */}
      <h5 className={styles.sectionTitle}>Rentabilidade</h5>

      <div className={styles.row}>
        <Select label="Indexador / Tipo" {...register("rentabilidade_tipo")}>
          <option value="cdi">% do CDI</option>
          <option value="ipca">IPCA +</option>
          <option value="bruta">Pré-fixado (Anual)</option>
        </Select>

        <Input
          label={rentabilidadeTipo === "cdi" ? "% do CDI" : "Taxa Anual (%)"}
          type="number"
          step="0.01"
          placeholder={rentabilidadeTipo === "cdi" ? "100" : "6.0"}
          {...register("rentabilidade_valor")}
          error={errors.rentabilidade_valor?.message as string}
        />
      </div>
    </>
  );
}
