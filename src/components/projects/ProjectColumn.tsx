import styles from "./ProjectColumn.module.css";
import React from "react";

type ProjectColumnProps = {
  title: string;
  totalValue: string;
  children: React.ReactNode;

  // NOVAS PROPS
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
};

export function ProjectColumn({
  title,
  totalValue,
  children,
  isChecked,
  onToggle,
}: ProjectColumnProps) {
  return (
    <div className={styles.projectColumn}>
      <div className={styles.columnHeader}>
        <div className={styles.titleArea}>
          <h4>{title}</h4>
        </div>
        <span className={styles.columnTotal}>{totalValue}</span>

        {/* Switch Mestre Controlado */}
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
      {children}
    </div>
  );
}
