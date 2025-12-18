// src/components/clients/GlobalParametersForm.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input/Input";
import { Button } from "../ui/button/Button";
import { Save, AlertTriangle } from "lucide-react";
import { usePremissas } from "../../hooks/usePremissas";
import styles from "./GlobalParametersForm.module.css";

interface FormProps {
  profileId: string;
}

interface GlobalParams {
  selic: number;
  inflacao: number;
  custo_inventario_padrao: number;
}

export function GlobalParametersForm({ profileId }: FormProps) {
  const { loading, fetchPremissas, savePremissas, resetToSystemDefaults } =
    usePremissas();
  const [isCustomized, setIsCustomized] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GlobalParams>();

  // 1. Carregar dados
  useEffect(() => {
    async function load() {
      if (profileId) {
        const data = await fetchPremissas(profileId);
        setIsCustomized(data.perfil_id !== null); // Se tem perfil_id, é customizado
        reset({
          selic: data.selic,
          inflacao: data.inflacao,
          custo_inventario_padrao: data.custo_inventario_padrao,
        });
      }
    }
    load();
  }, [profileId, fetchPremissas, reset]);

  // 2. Salvar
  const onSubmit = async (data: GlobalParams) => {
    const payload = {
      selic: Number(data.selic),
      inflacao: Number(data.inflacao),
      custo_inventario_padrao: Number(data.custo_inventario_padrao),
    };

    const sucesso = await savePremissas(profileId, payload);
    if (sucesso) setIsCustomized(true);
  };

  // 3. Restaurar
  const handleReset = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (
      window.confirm(
        "Deseja remover as personalizações e voltar ao padrão do sistema?"
      )
    ) {
      const defaults = await resetToSystemDefaults(profileId);
      reset(defaults);
      setIsCustomized(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Premissas Econômicas</h2>

        {/* Renderização Condicional do Alerta */}
        {isCustomized ? (
          <div className={styles.warningBox}>
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Taxas Personalizadas Ativas</strong>
              Este cliente possui configurações específicas que substituem o
              padrão global do sistema.
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.card}>
        <Input
          label="Taxa SELIC (% a.a.)"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("selic", { required: true })}
          error={errors.selic?.message}
        />

        <Input
          label="Inflação (IPCA % a.a.)"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("inflacao", { required: true })}
          error={errors.inflacao?.message}
        />

        <div className={styles.fullWidth}>
          <Input
            label="Custo Estimado de Inventário (%)"
            type="number"
            step="0.1"
            placeholder="0.0"
            tooltip="Valor padrão sugerido ao cadastrar novos bens."
            {...register("custo_inventario_padrao", { required: true })}
            error={errors.custo_inventario_padrao?.message}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleReset}
            disabled={loading || isSubmitting || !isCustomized} // Só habilita se for personalizado
            title="Apagar personalização e voltar ao padrão master"
          >
            Restaurar padrão do sistema
          </button>

          <Button
            type="submit"
            loading={loading || isSubmitting}
            icon={<Save size={16} />}
          >
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
