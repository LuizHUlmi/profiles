// src/components/projetos/ProjectColumn.tsx

import styles from "./ProjectColumn.module.css";
import React from "react";

type ProjectColumnProps = {
  title: string;
  totalValue: string;
  children: React.ReactNode;
};

export function ProjectColumn({
  title,
  totalValue,
  children,
}: ProjectColumnProps) {
  return (
    <div className={styles.projectColumn}>
      <div className={styles.columnHeader}>
        <div className={styles.titleArea}>
          <h4>{title}</h4>
        </div>
        <span className={styles.columnTotal}>{totalValue}</span>
        <label className={styles.switch}>
          <input type="checkbox" />
          <span className={styles.slider}></span>
        </label>
      </div>
      {children}
    </div>
  );
}
