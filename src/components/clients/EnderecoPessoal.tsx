import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabase";

import styles from "./EnderecoPessoal.module.css";
import { maskCEP, unmask } from "../../utils/masks";

import { Save } from "lucide-react";
import { useToast } from "../ui/toast/ToastContext";
import { Input } from "../ui/input/input";
import { Button } from "../ui/button/Button";

interface EnderecoPessoalProps {
  title: string;
  targetId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

export function EnderecoPessoal({
  title,
  targetId,
  initialData,
}: EnderecoPessoalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    if (initialData) {
      if (initialData.cep) initialData.cep = maskCEP(initialData.cep);
      reset(initialData);
    }
  }, [initialData, reset]);

  const cepValue = watch("cep");
  const handleBlurCEP = async () => {
    const cep = unmask(cepValue);
    if (cep?.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setValue("endereco", data.logradouro);
          setValue("bairro", data.bairro);
          setValue("cidade", data.localidade);
          setValue("estado", data.uf);
          document.getElementById("numeroInput")?.focus();
        }
      } catch (error) {
        console.error("Erro CEP", error);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    if (!targetId) return;
    setIsSubmitting(true);
    try {
      const payload = {
        cep: unmask(data.cep),
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
      };

      const { error } = await supabase
        .from("perfis")
        .update(payload)
        .eq("id", targetId);
      if (error) throw error;
      toast.success("Endereço atualizado!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar endereço.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <form className={styles.card} onSubmit={handleSubmit(onSubmit)}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "1rem",
          }}
        >
          <Input
            label="CEP"
            placeholder="00000-000"
            maxLength={9}
            {...register("cep", {
              onChange: (e) => (e.target.value = maskCEP(e.target.value)),
              onBlur: handleBlurCEP,
            })}
          />
          <Input label="Rua / Logradouro" {...register("endereco")} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "1rem",
          }}
        >
          <Input id="numeroInput" label="Número" {...register("numero")} />
          <Input label="Complemento" {...register("complemento")} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <Input label="Bairro" {...register("bairro")} />
          <Input label="Cidade" {...register("cidade")} />
        </div>

        <div className={styles.fullWidth}>
          <Input
            label="Estado (UF)"
            maxLength={2}
            {...register("estado")}
            style={{ textTransform: "uppercase" }}
          />
        </div>

        {/* --- BOTÃO PADRONIZADO --- */}
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
            Salvar Endereço
          </Button>
        </div>
      </form>
    </div>
  );
}
