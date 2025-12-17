// src/components/financial/forms/PensionPanel.tsx
import { useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { Input } from "../../ui/input/Input";
import { Select } from "../../ui/select/Select";
import { maskCurrency } from "../../../utils/masks";
import type { Familiar } from "../../../types/database";
import styles from "./PensionPanel.module.css";

interface PanelProps {
  familiares: Familiar[];
}

export function PensionPanel({ familiares }: PanelProps) {
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
          label="Participante (Proprietário)"
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
          label="Saldo Acumulado (R$)"
          {...register("valor")}
          onChange={(e) => setValue("valor", maskCurrency(e.target.value))}
          error={errors.valor?.message as string}
        />
      </div>

      <div className={styles.singleColumn}>
        <Input
          label="Nome da Previdência"
          placeholder="Ex: VGBL Icatu Seguros, PGBL XP Advisory..."
          {...register("nome")}
          error={errors.nome?.message as string}
        />
      </div>

      <div className={styles.separator} />

      {/* BLOCO 2: DETALHES TÉCNICOS (Tributação + Rentabilidade) */}

      <h5 className={styles.sectionTitle}>Detalhes do Plano</h5>

      <div className={styles.singleColumn}>
        <Select
          label="Regime de Tributação"
          placeholder="Selecione o regime..."
          {...register("regime_tributario")}
          error={errors.regime_tributario?.message as string}
        >
          <option value="progressivo">Progressivo </option>
          <option value="regressivo">Regressivo </option>
        </Select>
      </div>

      <div className={styles.row}>
        <Select
          label="Indexador / Rentabilidade"
          {...register("rentabilidade_tipo")}
        >
          <option value="cdi">% do CDI</option>
          <option value="ipca">IPCA +</option>
          <option value="bruta">Pré-fixado (Atuarial)</option>
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
