// src/components/clients/FamilyForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input/Input";
import { Button } from "../ui/button/Button";
import { Save } from "lucide-react";
import { unmask } from "../../utils/masks";
import styles from "./FamilyForm.module.css";

type FamilyFormData = {
  nome: string;
  data_nascimento: string;
  parentesco: "Cônjuge" | "Filho" | "Pais" | "Animal" | "Outros";
  cpf?: string;
  idade_aposentadoria?: string;
};

interface FamilyFormProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<boolean>;
}

export function FamilyForm({ onClose, onSubmit }: FamilyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FamilyFormData>();

  // Monitoramento
  const parentescoSelecionado = watch("parentesco");
  const isConjuge = parentescoSelecionado === "Cônjuge";

  const handleFormSubmit = async (data: FamilyFormData) => {
    setIsSubmitting(true);

    // Tratamento dos dados antes de enviar
    const payload = {
      ...data,
      cpf: data.cpf ? unmask(data.cpf) : undefined,
      idade_aposentadoria:
        isConjuge && data.idade_aposentadoria
          ? Number(data.idade_aposentadoria)
          : null,
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Adicionar Familiar</h3>

      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        <Input
          label="Nome Completo"
          error={errors.nome?.message}
          {...register("nome", { required: "Nome é obrigatório" })}
        />

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Parentesco</label>
          <select
            {...register("parentesco", { required: true })}
            className={styles.select}
          >
            <option value="Cônjuge">Cônjuge</option>
            <option value="Filho">Filho(a)</option>
            <option value="Pais">Pais</option>
            <option value="Animal">Animal de Estimação</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        {isConjuge && (
          <div className={styles.fadeIn}>
            <Input
              label="Idade Prevista Aposentadoria"
              type="number"
              placeholder="Ex: 65"
              error={errors.idade_aposentadoria?.message}
              {...register("idade_aposentadoria", {
                required: isConjuge ? "Informe a idade prevista" : false,
                min: { value: 1, message: "Idade inválida" },
                max: { value: 100, message: "Idade inválida" },
              })}
            />
          </div>
        )}

        <Input
          label="Data de Nascimento"
          type="date"
          error={errors.data_nascimento?.message}
          {...register("data_nascimento", { required: "Data obrigatória" })}
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            icon={<Save size={16} />}
          >
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
