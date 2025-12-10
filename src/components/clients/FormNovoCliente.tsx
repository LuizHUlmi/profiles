// src/components/clients/ClientForm.tsx

import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button/Button"; // <--- Novo Import
import styles from "./FormNovoCliente.module.css";

type FormNovoClienteProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export function FormNovoCliente({ onClose, onSuccess }: FormNovoClienteProps) {
  const { profile } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.userType !== "staff") {
      alert("Permissão negada.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!email.includes("@") || !email.includes(".")) {
        throw new Error("E-mail inválido.");
      }

      const novoCliente = {
        nome: nome,
        email: email.toLowerCase().trim(),
        consultor_id: profile.id,
      };

      const { error } = await supabase.from("perfis").insert([novoCliente]);

      if (error) {
        if (error.code === "23505") throw new Error("E-mail já cadastrado.");
        throw error;
      }

      alert(`Cliente ${nome} pré-cadastrado com sucesso!`);
      onSuccess();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h3>Adicionar Novo Cliente</h3>
      <p className={styles.note}>
        O cliente será pré-cadastrado na sua carteira. Ele precisará criar a
        senha no login.
      </p>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.formSection}>
        <label htmlFor="nome">Nome Completo</label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className={styles.formSection}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {/* RODAPÉ COM NOVOS BOTÕES */}
      <div className={styles.formFooter}>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button type="submit" loading={loading}>
          Cadastrar Cliente
        </Button>
      </div>
    </form>
  );
}
