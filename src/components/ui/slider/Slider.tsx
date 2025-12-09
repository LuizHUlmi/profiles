// src/components/ui/SliderControl.tsx

import React from "react";
import styles from "./Slider.module.css";

type SliderControlProps = {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  type?: "number" | "currency";
  rightElement?: React.ReactNode;
};

export function SliderControl({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  type = "number",
  rightElement,
}: SliderControlProps) {
  // Função para lidar com a digitação manual
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? 0 : parseFloat(e.target.value);

    // Opcional: Impedir valores fora do range enquanto digita?
    // Geralmente é melhor deixar digitar e validar no 'onBlur',
    // mas aqui vamos deixar livre e o slider se ajusta ao limite visualmente.
    onChange(newValue);
  };

  return (
    <div className={styles.controlGroup}>
      <div className={styles.labelRow}>
        <label>{label}</label>

        {/* Container do Valor (Input) */}
        <div className={styles.valueContainer}>
          {/* Se for moeda, mostra o símbolo R$ */}
          {type === "currency" && (
            <span className={styles.currencySymbol}>R$</span>
          )}

          {/* O Input Editável */}
          <input
            type="number"
            className={styles.valueInput}
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            // Remove o step do input para permitir digitação livre (ex: 1550)
            // mesmo que o slider pule de 100 em 100
          />

          {/* Elementos extras (como botão de editar, se houver) */}
          {rightElement && rightElement}
        </div>
      </div>

      {/* O Slider */}
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
