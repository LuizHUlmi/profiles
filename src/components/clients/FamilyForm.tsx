// src/components/clients/FamilyForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input/input";
import { Button } from "../ui/button/Button";
import { Save } from "lucide-react";
import { maskCPF, unmask } from "../../utils/masks"; // Importando máscara

type FamilyFormData = {
  nome: string;
  data_nascimento: string;
  parentesco: "Cônjuge" | "Filho" | "Pais" | "Animal" | "Outros";
  cpf?: string;
};

interface FamilyFormProps {
  onClose: () => void;
  onSubmit: (data: FamilyFormData) => Promise<boolean>;
}

export function FamilyForm({ onClose, onSubmit }: FamilyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FamilyFormData>();

  const handleFormSubmit = async (data: FamilyFormData) => {
    setIsSubmitting(true);
    // Remove pontuação do CPF antes de enviar
    const payload = {
      ...data,
      cpf: data.cpf ? unmask(data.cpf) : undefined,
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div style={{ padding: "0.5rem", minWidth: "300px" }}>
      <h3 style={{ marginTop: 0 }}>Adicionar Familiar</h3>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <Input
          label="Nome Completo"
          error={errors.nome?.message}
          {...register("nome", { required: "Nome é obrigatório" })}
        />

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#333" }}>
            Parentesco
          </label>
          <select
            {...register("parentesco", { required: true })}
            style={{
              padding: "0.75rem",
              borderRadius: "6px",
              border: "1px solid #e0e0e0",
              backgroundColor: "white",
              fontSize: "1rem",
            }}
          >
            <option value="Cônjuge">Cônjuge</option>
            <option value="Filho">Filho(a)</option>
            <option value="Pais">Pais</option>
            <option value="Animal">Animal de Estimação</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        {/* Campo de CPF (Geralmente importante para Cônjuge) */}
        <Input
          label="CPF (Opcional)"
          placeholder="000.000.000-00"
          maxLength={14}
          error={errors.cpf?.message}
          {...register("cpf", {
            onChange: (e) => setValue("cpf", maskCPF(e.target.value)),
          })}
        />

        <Input
          label="Data de Nascimento"
          type="date"
          error={errors.data_nascimento?.message}
          {...register("data_nascimento", { required: "Data obrigatória" })}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "1rem",
          }}
        >
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
