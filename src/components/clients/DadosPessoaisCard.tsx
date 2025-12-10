import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";

import styles from "./DadosPessoaisCard.module.css";
import { maskCPF, maskPhone, unmask } from "../../utils/masks";

// ADICIONEI O ÍCONE 'X'
import { Save, X } from "lucide-react";
import { useToast } from "../ui/toast/ToastContext";
import { Input } from "../ui/input/input";
import { Button } from "../ui/button/Button";

interface DadosPessoaisCardProps {
  title: string;
  targetId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  prefixo?: string;
  isClient?: boolean;
  // NOVA PROPRIEDADE OPCIONAL
  onRemove?: () => void;
}

export function DadosPessoaisCard({
  title,
  targetId,
  initialData,
  prefixo = "",
  isClient = true,
  onRemove, // Recebendo a função
}: DadosPessoaisCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    if (!targetId) return;
    setIsSubmitting(true);

    try {
      const table = isClient ? "perfis" : "consultores";
      const payload = { ...data };

      if (payload[`${prefixo}cpf`])
        payload[`${prefixo}cpf`] = unmask(payload[`${prefixo}cpf`]);
      if (payload[`${prefixo}telefone`])
        payload[`${prefixo}telefone`] = unmask(payload[`${prefixo}telefone`]);

      const { error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", targetId);

      if (error) throw error;
      toast.success(`${title} salvo com sucesso!`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* CABEÇALHO FLEXÍVEL: Título + Botão Fechar (se existir) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1 className={styles.title} style={{ marginBottom: 0 }}>
          {title}
        </h1>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s",
            }}
            title="Remover esta seção"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")} // Fica vermelho ao passar mouse
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
          >
            <X size={24} />
          </button>
        )}
      </div>

      <form className={styles.card} onSubmit={handleSubmit(onSubmit)}>
        {/* ... (Todo o resto do formulário continua IGUAL) ... */}

        <div className={styles.fullWidth}>
          <Input
            label="Nome Completo"
            placeholder="Nome Completo"
            error={errors[`${prefixo}nome`]?.message as string}
            {...register(`${prefixo}nome`, { required: "Nome é obrigatório" })}
          />
        </div>

        <div className={styles.fullWidth}>
          <Input
            label="CPF"
            placeholder="000.000.000-00"
            maxLength={14}
            error={errors[`${prefixo}cpf`]?.message as string}
            {...register(`${prefixo}cpf`, {
              onChange: (e) => (e.target.value = maskCPF(e.target.value)),
            })}
          />
        </div>

        {!prefixo && (
          <div className={styles.fullWidth}>
            <Input
              label="E-mail"
              type="email"
              disabled={true}
              {...register(`${prefixo}email`)}
            />
          </div>
        )}

        <div>
          <Input
            label="Data de nascimento"
            type="date"
            error={errors[`${prefixo}data_nascimento`]?.message as string}
            {...register(`${prefixo}data_nascimento`)}
          />
        </div>

        <div>
          <Input
            label="Expectativa de vida"
            type="number"
            placeholder="Ex: 90"
            {...register(`${prefixo}expectativa_vida`)}
          />
        </div>

        <div className={styles.fullWidth}>
          <Input
            label="Telefone / Celular"
            placeholder="(00) 00000-0000"
            maxLength={15}
            {...register(`${prefixo}telefone`, {
              onChange: (e) => (e.target.value = maskPhone(e.target.value)),
            })}
          />
        </div>

        <div
          className={styles.fullWidth}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1rem",
          }}
        >
          <Button
            type="submit"
            loading={isSubmitting}
            icon={<Save size={18} />}
          >
            Salvar Dados
          </Button>
        </div>
      </form>
    </div>
  );
}
