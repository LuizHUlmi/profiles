// src/components/ui/tooltip/InfoTooltip.tsx

import styles from "./InfoTooltip.module.css";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <div className={styles.container}>
      <Info size={16} className={styles.icon} />
      <span className={styles.tooltip}>{text}</span>
    </div>
  );
}
