// src/components/ui/Spinner.tsx
import styles from "./Spinner.module.css";

type SpinnerProps = {
  fullScreen?: boolean; // Se true, cobre a tela inteira (usado no Auth)
  size?: "default" | "small"; // 'small' é bom para dentro de botões
};

export function Spinner({
  fullScreen = false,
  size = "default",
}: SpinnerProps) {
  return (
    <div
      className={`${styles.spinnerContainer} ${
        fullScreen ? styles.fullScreen : ""
      }`}
    >
      <div
        className={`${styles.spinner} ${size === "small" ? styles.small : ""}`}
      />
    </div>
  );
}
