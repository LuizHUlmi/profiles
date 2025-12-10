// src/components/projects/ProjectForm.tsx   FormNovoProjeto

// src/components/projects/ProjectForm.tsx

// ... (imports permanecem iguais)
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";
import styles from "./FormNovoProjeto.module.css";
import { Input } from "../ui/input/input";
import { Button } from "../ui/button/Button";
import { maskCurrency, unmaskCurrency } from "../../utils/masks";
import type { Projeto } from "../../types/database";
// ... imports de ícones (Lucide) ...
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
  projectToEdit?: Projeto | null;
  ownerId: string; // <--- NOVO: ID do dono do projeto (obrigatório)
};

type ProjectFormData = {
  nome: string;
  prioridade: string;
  tipo: string;
  valor: string;
  prazo: string;
  repeticao: string;
  qtdRepeticoes: string;
};

export function FormNovoProjeto({
  onClose,
  onSuccess,
  projectToEdit,
  ownerId, // <--- Recebendo a prop
}: FormNovoProjetoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = {
    prioridade: projectToEdit?.prioridade || "essencial",
    tipo: "Outro",
    prazo: "nao",
    valor: projectToEdit ? maskCurrency(String(projectToEdit.valor * 100)) : "",
    nome: projectToEdit?.nome || "",
  };

  const { register, handleSubmit, watch } = useForm<ProjectFormData>({
    defaultValues,
  });

  const selectedPrioridade = watch("prioridade");
  const selectedTipo = watch("tipo");

  // ... (Lista de projectTypes permanece igual) ...
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
        perfil_id: ownerId, // <--- O PULO DO GATO: Vincula o projeto ao dono!
      };

      if (projectToEdit) {
        const { error } = await supabase
          .from("projetos")
          .update(payload)
          .eq("id", projectToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projetos").insert(payload);
        if (error) throw error;
      }

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

  // ... (O return do JSX permanece igual, apenas usando as props novas) ...
  return (
    <form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
      {/* ... resto do formulário igual ... */}

      <h3 style={{ marginTop: 0 }}>
        {projectToEdit ? "Editar Projeto" : "Novo Projeto"}
      </h3>

      {/* Prioridade */}
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

      {/* Tipos */}
      <div className={styles.formSection}>
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

      {/* Inputs */}
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
      </div>

      <div className={styles.formFooter}>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>

        <Button type="submit" loading={isSubmitting}>
          {projectToEdit ? "Salvar Alterações" : "Criar Projeto"}
        </Button>
      </div>
    </form>
  );
}
