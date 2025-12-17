// src/components/financial/forms/PhysicalAssetPanel.tsx

import { useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { Input } from "../../ui/input/Input";
import { Select } from "../../ui/select/Select";
import { maskCurrency } from "../../../utils/masks";
import type { Familiar } from "../../../types/database";
import styles from "./PhysicalAssetPanel.module.css";

interface PhysicalAssetPanelProps {
  familiares: Familiar[];
}

export function PhysicalAssetPanel({ familiares }: PhysicalAssetPanelProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const inventariar = watch("inventariar");
  const tipoSelecionado = watch("tipo");

  // --- NOVA FUNÇÃO: Aplica Configurações Padrão ---
  const handleUseDefault = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita que o botão submeta o formulário

    // 1. Marca o checkbox automaticamente
    setValue("inventariar", true);

    // 2. Define o valor padrão (Futuramente você ligará isso ao seu input global)
    // Por enquanto, estou usando 50% como exemplo de "regra padrão"
    setValue("percentual_inventario", 50);
  };
  // -----------------------------------------------

  const placeholderNome = useMemo(() => {
    switch (tipoSelecionado) {
      case "Imóvel":
        return "Ex: Apartamento Centro, Casa de Praia...";
      case "Veículo":
        return "Ex: BMW X1, Toyota Corolla...";
      case "Outros":
        return "Ex: Joias, Obras de Arte...";
      default:
        return "Ex: Descrição do bem...";
    }
  }, [tipoSelecionado]);

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
      {/* ... (Bloco Identificação mantido igual) ... */}
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
          label="Valor de Mercado (R$)"
          {...register("valor")}
          onChange={(e) => setValue("valor", maskCurrency(e.target.value))}
          error={errors.valor?.message as string}
        />
      </div>

      <div className={styles.singleColumn}>
        <Select
          label="Tipo de Bem"
          placeholder="Selecione o tipo..."
          {...register("tipo")}
          error={errors.tipo?.message as string}
        >
          <option value="Imóvel">Imóvel</option>
          <option value="Veículo">Automóvel / Veículo</option>
          <option value="Outros">Outros</option>
        </Select>
      </div>

      <div className={styles.singleColumn}>
        <Input
          label="Nome / Descrição"
          placeholder={placeholderNome}
          {...register("nome")}
          error={errors.nome?.message as string}
        />
      </div>

      <div className={styles.separator} />

      <h5 className={styles.sectionTitle}>Estratégia Sucessória</h5>

      {/* --- CHECKBOX COM BOTÃO DE AÇÃO --- */}
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id="inventariar"
          {...register("inventariar")}
          className="w-4 h-4 accent-gray-700"
        />
        <label htmlFor="inventariar" className={styles.checkboxLabel}>
          Este bem entrará em Inventário?
        </label>

        {/* Botão de Atalho */}
        <button
          type="button"
          onClick={handleUseDefault}
          className={styles.defaultButton}
          title="Preencher com valores padrão definidos no perfil"
        >
          (Usar configurações padrão)
        </button>
      </div>

      {inventariar && (
        <div className={styles.singleColumn}>
          <Input
            label="Percentual a ser inventariado (%)"
            tooltip="Informe a porcentagem deste bem que deve entrar no inventário."
            type="number"
            placeholder="Ex: 100"
            {...register("percentual_inventario")}
            error={errors.percentual_inventario?.message as string}
          />
        </div>
      )}

      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id="investir_pos_morte"
          {...register("investir_pos_morte")}
          className="w-4 h-4 accent-gray-700"
        />
        <label htmlFor="investir_pos_morte" className={styles.checkboxLabel}>
          Liquidar e investir capital após falecimento?
        </label>
      </div>
    </>
  );
}
