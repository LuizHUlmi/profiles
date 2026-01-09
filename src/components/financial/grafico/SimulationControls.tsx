// src/components/financial/grafico/SimulationControls.tsx

import { Sliders, Save } from "lucide-react";
import { Button } from "../../ui/button/Button";
import { maskCurrency, unmaskCurrency } from "../../../utils/masks";
import styles from "./SimulationControls.module.css";

interface SimulationControlsProps {
  idade: number;
  setIdade: (v: number) => void;
  renda: number;
  setRenda: (v: number) => void;
  outrasRendas: number;
  setOutrasRendas: (v: number) => void;
  investimento: number;
  setInvestimento: (v: number) => void;
  onSave: () => void;
  isSaving: boolean;
}

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
  isSaving,
}: SimulationControlsProps) {
  const renderControl = (
    label: string,
    value: number,
    setValue: (v: number) => void,
    min: number,
    max: number,
    step: number,
    isCurrency: boolean = true
  ) => (
    <div className={styles.controlWrapper}>
      <div className={styles.controlHeader}>
        <span className={styles.label}>{label}</span>
        <input
          type="text"
          className={styles.valueInput}
          value={isCurrency ? maskCurrency(value.toFixed(2)) : value}
          // --- MUDANÇA AQUI: Seleciona tudo ao clicar ---
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const rawValue = e.target.value;
            if (isCurrency) {
              setValue(unmaskCurrency(rawValue));
            } else {
              setValue(Number(rawValue));
            }
          }}
        />
      </div>

      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Sliders size={20} />
          Parâmetros
        </h3>
        <p className={styles.subtitle}>Arraste para simular cenários.</p>
      </div>

      {renderControl("Idade Aposentadoria", idade, setIdade, 40, 90, 1, false)}
      {renderControl("Renda na Aposentadoria", renda, setRenda, 0, 50000, 500)}
      {renderControl(
        "Aporte Mensal",
        investimento,
        setInvestimento,
        0,
        30000,
        100
      )}
      {renderControl(
        "Outras Rendas",
        outrasRendas,
        setOutrasRendas,
        0,
        20000,
        100
      )}

      <div className={styles.actions}>
        <Button
          onClick={onSave}
          loading={isSaving}
          icon={<Save size={16} />}
          style={{ width: "100%" }}
        >
          Salvar Cenário
        </Button>
      </div>
    </div>
  );
}
