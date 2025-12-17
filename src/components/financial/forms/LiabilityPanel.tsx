// src/components/financial/forms/LiabilityPanel.tsx

import { useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { Input } from "../../ui/input/Input";
import { Select } from "../../ui/select/Select";
import { maskCurrency } from "../../../utils/masks";
import type { Familiar } from "../../../types/database";
import styles from "./LiabilityPanel.module.css";

interface LiabilityPanelProps {
  familiares: Familiar[];
}

export function LiabilityPanel({ familiares }: LiabilityPanelProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const indexador = watch("rentabilidade_tipo");

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
          label="Devedor (Proprietário)"
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
          label="Saldo Devedor (R$)"
          {...register("valor")}
          onChange={(e) => setValue("valor", maskCurrency(e.target.value))}
          error={errors.valor?.message as string}
        />
      </div>

      <div className={styles.singleColumn}>
        <Input
          label="Descrição da Dívida"
          placeholder="Ex: Financiamento Apt. Jardins (Caixa), Empréstimo Reforma..."
          {...register("nome")}
          error={errors.nome?.message as string}
        />
      </div>

      <div className={styles.separator} />

      {/* BLOCO 2: CONDIÇÕES DE PAGAMENTO */}
      <h5 className={styles.sectionTitle}>Condições de Pagamento</h5>

      <div className={styles.row}>
        <Input
          label="Valor Parcela Mensal"
          placeholder="R$ 0,00"
          tooltip="Se for Bullet, informe 0 ou o valor estimado de juros mensais."
          {...register("valor_parcela")}
          onChange={(e) =>
            setValue("valor_parcela", maskCurrency(e.target.value))
          }
          error={errors.valor_parcela?.message as string}
        />
        <Input
          label="Prazo Restante (Meses)"
          type="number"
          placeholder="Ex: 120"
          {...register("prazo_meses")}
          error={errors.prazo_meses?.message as string}
        />
      </div>

      <div className={styles.row}>
        <Select
          label="Sistema de Amortização"
          {...register("amortizacao_tipo")}
        >
          <option value="SAC">SAC (Decrescente)</option>
          <option value="PRICE">PRICE (Fixa)</option>
          <option value="BULLET">Bullet / Vencimento</option>
        </Select>

        {/* AQUI ESTÁ A CORREÇÃO: Usamos a classe .splitRow */}
        <div className={styles.splitRow}>
          <Select label="Indexador" {...register("rentabilidade_tipo")}>
            <option value="pre">Pré-fixado</option>
            <option value="ipca">IPCA +</option>
            <option value="selic">Selic +</option>
          </Select>

          <Input
            label={indexador === "pre" ? "Taxa Total (%)" : "Taxa Adic. (%)"}
            placeholder={indexador === "pre" ? "12.0" : "2.0"}
            type="number"
            step="0.1"
            {...register("correcao_anual")}
          />
        </div>
      </div>

      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id="segurado"
          {...register("segurado")}
          className="w-4 h-4 accent-gray-700"
        />
        <label htmlFor="segurado" className={styles.checkboxLabel}>
          Possui Seguro Prestamista? (Quita em caso de morte)
        </label>
      </div>
    </>
  );
}
