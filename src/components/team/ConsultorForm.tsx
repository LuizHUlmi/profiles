// src/components/clients/ConsultantForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import { Input } from "../ui/input/Input";
import { Button } from "../ui/button/Button"; // <--- Novo Import

type ConsultorFormData = {
  nome: string;
  email: string;
  nivel: "master" | "consultor";
};

interface ConsultorFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function ConsultorForm({ onClose, onSuccess }: ConsultorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultorFormData>();

  const onSubmit = async (data: ConsultorFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("consultores").insert({
        nome: data.nome,
        email: data.email,
        nivel: data.nivel,
      });

      if (error) throw error;

      alert("Membro da equipe cadastrado com sucesso!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar consultor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "1rem", minWidth: "350px" }}>
      <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>
        Novo Membro da Equipe
      </h3>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <Input
          label="Nome Completo"
          placeholder="Ex: João Consultor"
          error={errors.nome?.message}
          {...register("nome", { required: "Nome obrigatório" })}
        />

        <Input
          label="E-mail Corporativo"
          type="email"
          placeholder="joao@empresa.com"
          error={errors.email?.message}
          {...register("email", { required: "E-mail obrigatório" })}
        />

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#333" }}>
            Nível de Acesso
          </label>
          <select
            {...register("nivel")}
            style={{
              padding: "0.75rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "white",
              fontSize: "1rem",
            }}
          >
            <option value="consultor">Consultor</option>
            <option value="master">Master</option>
          </select>
        </div>

        {/* RODAPÉ COM NOVOS BOTÕES */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
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

          <Button type="submit" loading={isSubmitting}>
            Cadastrar
          </Button>
        </div>
      </form>
    </div>
  );
}
