// src/components/forms/DadosPessoaisForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import { Input } from "../ui/input/input";
import styles from "./DadosPessoaisCard.module.css";
import { maskCPF, maskPhone, unmask } from "../../utils/masks";

interface DadosPessoaisFormProps {
  title: string;
  onSuccess?: () => void;
}

type PerfilFormData = {
  nomeCompleto: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  telefone: string;
  expectativaVida: string;
};

export function DadosPessoaisCard({
  title,
  onSuccess,
}: DadosPessoaisFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PerfilFormData>();

  const onSubmit = async (data: PerfilFormData) => {
    setIsSubmitting(true);

    try {
      const perfilParaSalvar = {
        nome: data.nomeCompleto,
        // 2. LIMPAMOS OS DADOS ANTES DE SALVAR (Normatização)
        // Salvamos no banco apenas "12345678900", sem pontos/traços
        cpf: unmask(data.cpf),
        email: data.email,
        data_nascimento: data.dataNascimento || null,
        telefone: unmask(data.telefone), // Salvamos apenas "11999999999"
        expectativa_vida: data.expectativaVida
          ? parseInt(data.expectativaVida)
          : null,
      };

      console.log("Enviando limpo para o banco:", perfilParaSalvar);

      const { error } = await supabase
        .from("perfis")
        .insert(perfilParaSalvar)
        .select()
        .single();

      if (error) throw error;

      alert(`${title} salvo com sucesso!`);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar. Verifique se o CPF já não existe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>

      <form className={styles.card} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.fullWidth}>
          <Input
            label="Nome"
            placeholder="Nome Completo"
            error={errors.nomeCompleto?.message}
            {...register("nomeCompleto", { required: "O Nome é obrigatório" })}
          />
        </div>

        <div className={styles.fullWidth}>
          {/* 3. APLICAÇÃO DA MÁSCARA DE CPF */}
          <Input
            label="CPF"
            placeholder="000.000.000-00"
            maxLength={14} // Limita o tamanho visual
            error={errors.cpf?.message}
            {...register("cpf", {
              required: "O CPF é obrigatório",
              onChange: (e) => {
                // Pega o valor, aplica a máscara e devolve pro input
                e.target.value = maskCPF(e.target.value);
              },
            })}
          />
        </div>

        <div className={styles.fullWidth}>
          <Input
            label="E-mail"
            type="email"
            placeholder="exemplo@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div>
          <Input
            label="Data de nascimento"
            type="date"
            error={errors.dataNascimento?.message}
            {...register("dataNascimento")}
          />
        </div>

        <div>
          <Input
            label="Expectativa de vida"
            type="number"
            placeholder="Ex: 100"
            error={errors.expectativaVida?.message}
            {...register("expectativaVida")}
          />
        </div>

        <div className={styles.fullWidth}>
          {/* 4. APLICAÇÃO DA MÁSCARA DE TELEFONE */}
          <Input
            label="Telefone"
            placeholder="(00) 00000-0000"
            maxLength={15}
            error={errors.telefone?.message}
            {...register("telefone", {
              onChange: (e) => {
                e.target.value = maskPhone(e.target.value);
              },
            })}
          />
        </div>

        <div className={styles.fullWidth}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
