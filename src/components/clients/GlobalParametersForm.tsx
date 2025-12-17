// src/components/settings/GlobalParametersForm.tsx

import { useForm } from "react-hook-form";
import { Input } from "../ui/input/Input";
import { Button } from "../ui/button/Button";
import { Save } from "lucide-react"; // Importei ícone de reset (opcional)
import styles from "./GlobalParametersForm.module.css";

interface GlobalParams {
  selic: number;
  inflacao: number;
  custo_inventario_padrao: number;
}

// 1. Definição dos Valores Padrão do Sistema
const SYSTEM_DEFAULTS: GlobalParams = {
  selic: 10.75,
  inflacao: 4.5,
  custo_inventario_padrao: 15.0,
};

export function GlobalParametersForm() {
  const {
    register,
    handleSubmit,
    reset, // Necessário para resetar o form
    formState: { errors, isSubmitting },
  } = useForm<GlobalParams>({
    defaultValues: SYSTEM_DEFAULTS, // Começa com os padrões
  });

  const onSubmit = async (data: GlobalParams) => {
    console.log("Salvando parâmetros:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // 2. Função para restaurar os padrões
  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita submit
    const confirmou = window.confirm(
      "Deseja restaurar os valores originais do sistema?"
    );
    if (confirmou) {
      reset(SYSTEM_DEFAULTS);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Premissas do Sistema</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.card}>
        <Input
          label="Taxa SELIC (% a.a.)"
          type="number"
          step="0.01"
          placeholder="0.00"
          tooltip="Taxa básica de juros. Base para cálculo de renda fixa."
          {...register("selic", { required: "Obrigatório" })}
          error={errors.selic?.message}
        />

        <Input
          label="Inflação (IPCA % a.a.)"
          type="number"
          step="0.01"
          placeholder="0.00"
          tooltip="Usado para calcular ganho real e trazer valores futuros a valor presente."
          {...register("inflacao", { required: "Obrigatório" })}
          error={errors.inflacao?.message}
        />

        <div className={styles.fullWidth}>
          <Input
            label="Custo Estimado de Inventário (%)"
            type="number"
            step="0.1"
            placeholder="0.0"
            tooltip="Soma estimada de ITCMD, Advogado e Custas. Será usado como padrão ao cadastrar bens."
            {...register("custo_inventario_padrao", {
              required: "Obrigatório",
            })}
            error={errors.custo_inventario_padrao?.message}
          />
        </div>

        {/* ÁREA DE AÇÕES */}
        <div className={`${styles.fullWidth} ${styles.actions}`}>
          {/* 3. Botão de Reset */}
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleReset}
            title="Restaurar valores originais (Selic 10.75%, Inflação 4.5%, Custo 15%)"
          >
            Usar parâmetros padrão
          </button>

          <Button
            type="submit"
            loading={isSubmitting}
            icon={<Save size={16} />}
          >
            Salvar Parâmetros
          </Button>
        </div>
      </form>
    </div>
  );
}
