// src/components/forms/FormNovoProjeto.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import styles from "./FormNovoProjeto.module.css";
import { Input } from "../ui/input/input";
import { maskCurrency, unmaskCurrency } from "../../utils/masks";
import type { Projeto } from "../../types/database";
// ... imports dos ícones (Plane, Car, etc) ...
import {
  Plane,
  Car,
  Home,
  Users,
  Monitor,
  BookOpen,
  Palette,
  Briefcase,
  Heart,
  CircleHelp,
  PiggyBank,
  Target,
} from "lucide-react";

type FormNovoProjetoProps = {
  onClose: () => void;
  onSuccess: () => void;
  projectToEdit?: Projeto | null; // Novo: Projeto para editar (opcional)
};

type ProjectFormData = {
  nome: string;
  prioridade: string;
  tipo: string;
  valor: string;
  prazo: string;
  repeticao: string;
  qtdRepeticoes: string;
  dataInicial: string;
};

export function FormNovoProjeto({
  onClose,
  onSuccess,
  projectToEdit,
}: FormNovoProjetoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Valores padrão (vazios se for criar, preenchidos se for editar)
  const defaultValues = {
    prioridade: projectToEdit?.prioridade || "essencial",
    tipo: "Outro", // Você poderia salvar o 'tipo' no banco para recuperar aqui também
    prazo: "nao", // Simplificação: assumindo 'nao' se não tiver lógica de parsing do prazo
    valor: projectToEdit ? maskCurrency(String(projectToEdit.valor * 100)) : "",
    nome: projectToEdit?.nome || "",
  };

  const { register, handleSubmit, watch } = useForm<ProjectFormData>({
    defaultValues,
  });

  const selectedPrioridade = watch("prioridade");
  const selectedTipo = watch("tipo");

  // Ícones (Mantenha sua lista de ícones aqui)
  const projectTypes = [
    { icon: Plane, label: "Viagem" },
    { icon: Car, label: "Veículo" },
    { icon: Home, label: "Casa" },
    { icon: Users, label: "Família" },
    { icon: Monitor, label: "Eletrônico" },
    { icon: BookOpen, label: "Educação" },
    { icon: Palette, label: "Hobby" },
    { icon: Briefcase, label: "Profissional" },
    { icon: Heart, label: "Saúde" },
    { icon: CircleHelp, label: "Outro" },
    { icon: Target, label: "Ajuste da meta" },
    { icon: PiggyBank, label: "Aportes" },
  ];

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);

    try {
      const valorNumerico = unmaskCurrency(data.valor);

      const payload = {
        nome: data.nome,
        prioridade: data.prioridade,
        tipo: data.tipo,
        valor: valorNumerico,
        prazo:
          data.prazo === "sim"
            ? `${data.repeticao} - ${data.qtdRepeticoes}x`
            : "À vista",
      };

      let error;

      if (projectToEdit) {
        // --- MODO EDIÇÃO (UPDATE) ---
        const response = await supabase
          .from("projetos")
          .update(payload)
          .eq("id", projectToEdit.id); // Busca pelo ID
        error = response.error;
      } else {
        // --- MODO CRIAÇÃO (INSERT) ---
        const response = await supabase.from("projetos").insert(payload);
        error = response.error;
      }

      if (error) throw error;

      alert(projectToEdit ? "Projeto atualizado!" : "Projeto criado!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar projeto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
      <h3 style={{ marginTop: 0 }}>
        {projectToEdit ? "Editar Projeto" : "Novo Projeto"}
      </h3>

      {/* ... (Todo o resto do seu formulário, seções de radio, inputs, etc. permanece igual) ... */}
      {/* Vou abreviar aqui para focar na lógica, mas mantenha seus Inputs do passo anterior */}

      <div className={styles.formSection}>
        <label>Prioridade do projeto</label>
        <div className={styles.buttonRadioGroup}>
          {["essencial", "desejo", "sonho"].map((p) => (
            <label key={p}>
              <input type="radio" value={p} {...register("prioridade")} />
              <span
                className={selectedPrioridade === p ? styles.activeRadio : ""}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ... Seção Tipo ... */}
      <div className={styles.formSection}>
        {/* ... Mantenha o código dos ícones ... */}
        {/* Se quiser copiar do anterior, é o bloco .iconRadioGroup */}
        <label>Tipo do projeto</label>
        <div className={styles.iconRadioGroup}>
          {projectTypes.map((type) => (
            <label key={type.label} className={styles.iconButton}>
              <input type="radio" value={type.label} {...register("tipo")} />
              <div
                className={`${styles.iconContainer} ${
                  selectedTipo === type.label ? styles.activeIcon : ""
                }`}
              >
                <type.icon size={24} />
              </div>
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.fullWidth}>
          <Input label="Nome" {...register("nome", { required: true })} />
        </div>
        <div>
          <Input
            label="Valor"
            {...register("valor", {
              required: true,
              onChange: (e) => (e.target.value = maskCurrency(e.target.value)),
            })}
          />
        </div>
        {/* ... Outros inputs (data, prazo, etc) ... */}
      </div>

      <div className={styles.formFooter}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Salvando..."
            : projectToEdit
            ? "Salvar Alterações"
            : "Criar Projeto"}
        </button>
      </div>
    </form>
  );
}
