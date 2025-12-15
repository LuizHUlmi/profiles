// src/pages/Login.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input/Input";
import { Button } from "../components/ui/button/Button"; // Importando o novo botão inteligente
import styles from "./Login.module.css";
import { useToast } from "../components/ui/toast/ToastContext";

// --- Schemas de Validação ---
const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

const registerSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 letras"),
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const recoverySchema = z.object({
  email: z.string().email("Digite seu e-mail para recuperação"),
});

// Tipos inferidos
type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type RecoveryData = z.infer<typeof recoverySchema>;

export function Login() {
  const navigate = useNavigate();
  const toast = useToast(); // <--- CHAMA O HOOK

  // Modos: 'login', 'register' ou 'recovery'
  const [mode, setMode] = useState<"login" | "register" | "recovery">("login");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  // Forms independentes
  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });
  const recoveryForm = useForm<RecoveryData>({
    resolver: zodResolver(recoverySchema),
  });

  // 1. LOGIN
  const handleLogin = async (data: LoginData) => {
    setLoading(true);
    setFeedback(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      // SUBSTITUI O FEEDBACK VISUAL POR TOAST
      toast.error(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      );
      setLoading(false);
    } else {
      toast.success("Login realizado com sucesso!"); // Opcional, pois vai redirecionar rápido
      navigate("/");
    }
  };

  // 2. CADASTRO
  const handleRegister = async (data: RegisterData) => {
    setLoading(true);
    setFeedback(null);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.nome, // Salva o nome no metadata do usuário
        },
      },
    });

    if (error) {
      setFeedback({ message: error.message, type: "error" });
    } else {
      setFeedback({
        message:
          "Cadastro realizado! Verifique seu e-mail para confirmar a conta.",
        type: "success",
      });
      registerForm.reset();
    }
    setLoading(false);
  };

  // 3. RECUPERAÇÃO DE SENHA
  const handleRecovery = async (data: RecoveryData) => {
    setLoading(true);
    setFeedback(null);

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/update-password`, // URL para onde o usuário volta
    });

    if (error) {
      setFeedback({ message: error.message, type: "error" });
    } else {
      setFeedback({
        message: "Se este e-mail existir, um link de recuperação foi enviado.",
        type: "success",
      });
      recoveryForm.reset();
    }
    setLoading(false);
  };

  // --- Renderização ---
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Cabeçalho */}
        <div className={styles.header}>
          <h1 className={styles.title}>Profiles</h1>
          <p className={styles.subtitle}>Planejamento Financeiro Inteligente</p>
        </div>

        {/* Feedback (Erro/Sucesso) */}
        {feedback && (
          <div
            className={`${styles.alert} ${
              feedback.type === "error" ? styles.error : styles.success
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* 1. MODO RECUPERAÇÃO */}
        {mode === "recovery" ? (
          <form
            onSubmit={recoveryForm.handleSubmit(handleRecovery)}
            className={styles.form}
          >
            <h3 style={{ textAlign: "center", margin: 0, fontSize: "1rem" }}>
              Recuperar Senha
            </h3>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              error={recoveryForm.formState.errors.email?.message}
              {...recoveryForm.register("email")}
            />
            <div className={styles.actions}>
              <Button type="submit" loading={loading} block>
                Enviar Link
              </Button>

              <button
                type="button"
                className={styles.forgotPassBtn}
                onClick={() => {
                  setMode("login");
                  setFeedback(null);
                }}
              >
                Voltar para o Login
              </button>
            </div>
          </form>
        ) : (
          /* 2. MODO LOGIN OU CADASTRO */
          <>
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${
                  mode === "login" ? styles.activeTab : ""
                }`}
                onClick={() => {
                  setMode("login");
                  setFeedback(null);
                }}
              >
                Entrar
              </button>
              <button
                type="button"
                className={`${styles.tab} ${
                  mode === "register" ? styles.activeTab : ""
                }`}
                onClick={() => {
                  setMode("register");
                  setFeedback(null);
                }}
              >
                Criar Conta
              </button>
            </div>

            {mode === "login" ? (
              <form
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className={styles.form}
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

                <div className={styles.actions}>
                  <Button type="submit" loading={loading} block>
                    Acessar
                  </Button>

                  <button
                    type="button"
                    className={styles.forgotPassBtn}
                    onClick={() => {
                      setMode("recovery");
                      setFeedback(null);
                    }}
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={registerForm.handleSubmit(handleRegister)}
                className={styles.form}
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
                <div className={styles.actions}>
                  <Button
                    type="submit"
                    variant="success"
                    loading={loading}
                    block
                  >
                    Criar Conta
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
