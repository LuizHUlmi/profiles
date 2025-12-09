// src/components/simulacao/SimulacaoControls.tsx

import styles from "./ControleGrafico.module.css"; // Se renomeou para SimulacaoControls.module.css, ajuste aqui
import { SliderControl } from "../slider/Slider";

type SimulacaoControlsProps = {
  idade: number;
  setIdade: (value: number) => void;
  renda: number;
  setRenda: (value: number) => void;
  outrasRendas: number;
  setOutrasRendas: (value: number) => void;
  investimento: number;
  setInvestimento: (value: number) => void;

  // Novas props para o botão de salvar
  onSave: () => void;
  isSaving?: boolean;
};

export function SimulacaoControls({
  idade,
  setIdade,
  renda,
  setRenda,
  outrasRendas,
  setOutrasRendas,
  investimento,
  setInvestimento,
  onSave,
  isSaving = false,
}: SimulacaoControlsProps) {
  return (
    <div className={styles.container}>
      <h4>Configurar simulação</h4>

      {/* 1. Slider de Idade */}
      <SliderControl
        label="Idade aposentadoria"
        value={idade}
        onChange={setIdade}
        min={50}
        max={100}
        type="number"
        rightElement={
          <button className={styles.editButton} title="Editar">
            ✏️
          </button>
        }
      />

      {/* 2. Slider de Renda */}
      <SliderControl
        label="Renda desejada"
        value={renda}
        onChange={setRenda}
        min={0}
        max={50000}
        step={100}
        type="currency"
      />

      {/* 3. Slider de Outras Fontes */}
      <SliderControl
        label="Outras fontes de renda"
        value={outrasRendas}
        onChange={setOutrasRendas}
        min={0}
        max={20000}
        step={50}
        type="currency"
      />

      {/* 4. Slider de Investimento */}
      <SliderControl
        label="Investimento mensal"
        value={investimento}
        onChange={setInvestimento}
        min={0}
        max={10000}
        step={50}
        type="currency"
      />

      <div className={styles.footer}>
        <button
          className={styles.saveButton}
          onClick={onSave}
          disabled={isSaving}
          style={{
            opacity: isSaving ? 0.5 : 1,
            cursor: isSaving ? "wait" : "pointer",
          }}
        >
          {isSaving ? "Salvando..." : "Salvar meta"}
        </button>
      </div>
    </div>
  );
}
