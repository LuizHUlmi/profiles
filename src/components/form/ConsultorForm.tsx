// src/components/forms/ConsultorForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import { Input } from "../input/input";
//import styles from "./ConsultorForm.module.css"; // Você pode copiar o CSS do outro form e ajustar

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
      // Salva na tabela separada 'consultores'
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
    <div style={{ padding: "1rem" }}>
      <h3>Novo Membro da Equipe</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "1rem",
        }}
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

        {/* Select simples para o nível */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
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
            }}
          >
            <option value="consultor">Consultor</option>
            <option value="master">Master</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "#eee",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "#007bff",
              color: "white",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {isSubmitting ? "Salvando..." : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
