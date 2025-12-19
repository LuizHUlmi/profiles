// src/components/projects/FormNovoProjeto.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import { Input } from "../ui/input/Input";
import { Select } from "../ui/select/Select";
import { Button } from "../ui/button/Button";
import { Save, Target, DollarSign } from "lucide-react";
import { useToast } from "../ui/toast/ToastContext";
import { maskCurrency, unmaskCurrency } from "../../utils/masks";
import type { Projeto } from "../../types/database";
import styles from "./FormNovoProjeto.module.css";

interface FormNovoProjetoProps {
  onClose: () => void;
  onSuccess: () => void;
  projectToEdit?: Projeto | null;
  ownerId: string;
}

type ProjectFormData = {
  nome: string;
  valor_total: string;
  ano_realizacao: number;
  prioridade: string;
};

export function FormNovoProjeto({
  onClose,
  onSuccess,
  projectToEdit,
  ownerId,
}: FormNovoProjetoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      nome: "",
      valor_total: "",
      ano_realizacao: new Date().getFullYear() + 1,
      prioridade: "essencial",
    },
  });

  // --- POPULAR FORMULÁRIO (Edição) ---
  useEffect(() => {
    if (projectToEdit) {
      reset({
        nome: projectToEdit.nome,
        valor_total: maskCurrency(projectToEdit.valor_total.toFixed(2)),
        ano_realizacao: projectToEdit.ano_realizacao,
        prioridade: projectToEdit.prioridade,
      });
    }
  }, [projectToEdit, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        perfil_id: ownerId,
        nome: data.nome,
        valor_total: unmaskCurrency(data.valor_total),
        ano_realizacao: Number(data.ano_realizacao),
        prioridade: data.prioridade,
      };

      if (projectToEdit) {
        const { error } = await supabase
          .from("projetos_vida")
          .update(payload)
          .eq("id", projectToEdit.id);
        if (error) throw error;
        toast.success("Projeto atualizado!");
      } else {
        const { error } = await supabase.from("projetos_vida").insert(payload);
        if (error) throw error;
        toast.success("Projeto criado!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar projeto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <h3 className={styles.header}>
        <Target size={26} color="#0ea5e9" />
        {projectToEdit ? "Editar Projeto" : "Novo Projeto de Vida"}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* NOME E PRIORIDADE */}
        <Input
          label="Nome do Objetivo"
          placeholder="Ex: Casa na Praia, Intercâmbio, Trocar de Carro..."
          {...register("nome", { required: "Nome é obrigatório" })}
          error={errors.nome?.message}
        />

        <Select
          label="Nível de Prioridade"
          {...register("prioridade")}
          placeholder="Selecione a prioridade..."
        >
          <option value="vital">Vital (Indispensável)</option>
          <option value="essencial">Essencial (Importante)</option>
          <option value="desejavel">Desejável (Se sobrar dinheiro)</option>
        </Select>

        {/* BOX DE DESTAQUE (Financeiro e Tempo) */}
        <div className={styles.highlightBox}>
          <h4 className={styles.boxTitle}>
            <DollarSign size={14} /> Planejamento Financeiro
          </h4>

          <div className={styles.row}>
            <Input
              label="Custo Total Estimado"
              placeholder="R$ 0,00"
              {...register("valor_total", {
                required: "Valor obrigatório",
                onChange: (e) =>
                  setValue("valor_total", maskCurrency(e.target.value)),
              })}
              error={errors.valor_total?.message}
              style={{ backgroundColor: "white" }} // Contraste dentro do box
            />

            <Input
              label="Ano de Realização"
              type="number"
              placeholder={`Ex: ${new Date().getFullYear() + 2}`}
              {...register("ano_realizacao", {
                required: "Ano obrigatório",
                min: {
                  value: new Date().getFullYear(),
                  message: "Ano inválido",
                },
                max: { value: 2100, message: "Ano muito distante" },
              })}
              error={errors.ano_realizacao?.message}
              style={{ backgroundColor: "white" }}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
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
            {projectToEdit ? "Salvar Alterações" : "Criar Projeto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
