// src/components/forms/FormNovoCliente.tsx

import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import styles from "./FormNovoCliente.module.css"; // Vamos criar este CSS abaixo

type FormNovoClienteProps = {
  onClose: () => void;
  onSuccess: () => void; // Para recarregar a lista
};

export function FormNovoCliente({ onClose, onSuccess }: FormNovoClienteProps) {
  const { profile } = useAuth(); // Precisamos do ID do Master/Consultor logado
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.userType !== "staff") {
      alert(
        "Permissão negada. Apenas Master/Consultor podem cadastrar clientes."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Validar o email
      if (!email.includes("@") || !email.includes(".")) {
        throw new Error("E-mail inválido.");
      }

      // 2. Montar o objeto para inserção na tabela 'perfis'
      const novoCliente = {
        nome: nome,
        email: email.toLowerCase().trim(),
        consultor_id: profile.id, // ID do Master/Consultor logado
      };

      // 3. Inserir o novo cliente (Pré-cadastro)
      const { error } = await supabase.from("perfis").insert([novoCliente]);

      if (error) {
        // Se o erro for por email duplicado
        if (error.code === "23505") {
          throw new Error("Este e-mail já está cadastrado no sistema.");
        }
        throw error;
      }

      alert(
        `Cliente ${nome} pré-cadastrado com sucesso! Avise-o para criar a conta.`
      );
      onSuccess();
      onClose();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao cadastrar cliente:", err);
      setError(err.message || "Erro desconhecido ao cadastrar cliente.");
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

      <div className={styles.formFooter}>
        <button
          type="button"
          onClick={onClose}
          className={styles.cancelButton}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Cadastrar Cliente"}
        </button>
      </div>
    </form>
  );
}
