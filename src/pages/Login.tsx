// src/pages/Login.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

import styles from "./Login.module.css"; // Import do CSS Module
import { Input } from "../components/ui/input/input";

// Schemas de Validação
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const registerSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export function Login() {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const handleLogin = async (data: LoginData) => {
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setMessage({ text: "E-mail ou senha incorretos.", type: "error" });
      setLoading(false);
    } else {
      navigate("/");
    }
  };

  const handleRegister = async (data: RegisterData) => {
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.nome,
        },
      },
    });

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({
        text: "Cadastro realizado! Verifique seu e-mail para confirmar.",
        type: "success",
      });
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Cabeçalho */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 className={styles.title}>Profiles</h2>

          {/* Alternador Login / Cadastro */}
          <div className={styles.toggleContainer}>
            <button
              onClick={() => {
                setIsLoginMode(true);
                setMessage(null);
              }}
              className={`${styles.toggleBtn} ${
                isLoginMode ? styles.activeToggle : ""
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setIsLoginMode(false);
                setMessage(null);
              }}
              className={`${styles.toggleBtn} ${
                !isLoginMode ? styles.activeToggle : ""
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {message && (
          <div
            className={`${styles.message} ${
              message.type === "error" ? styles.errorMsg : styles.successMsg
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Formulário de LOGIN */}
        {isLoginMode ? (
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              error={loginForm.formState.errors.email?.message}
              {...loginForm.register("email")}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="******"
              error={loginForm.formState.errors.password?.message}
              {...loginForm.register("password")}
            />
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Entrando..." : "Acessar"}
            </button>
          </form>
        ) : (
          /* Formulário de CADASTRO */
          <form
            onSubmit={registerForm.handleSubmit(handleRegister)}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Input
              label="Nome Completo"
              placeholder="Seu nome"
              error={registerForm.formState.errors.nome?.message}
              {...registerForm.register("nome")}
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              error={registerForm.formState.errors.email?.message}
              {...registerForm.register("email")}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              error={registerForm.formState.errors.password?.message}
              {...registerForm.register("password")}
            />
            <button
              type="submit"
              disabled={loading}
              className={`${styles.submitBtn} ${styles.registerBtn}`}
            >
              {loading ? "Criando..." : "Criar Conta"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
