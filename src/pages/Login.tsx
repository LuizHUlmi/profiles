// src/pages/Login.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button/Button";
import styles from "./Login.module.css";
import { useToast } from "../components/ui/toast/ToastContext";

// Importando os schemas e tipos organizados
import {
  loginSchema,
  registerSchema,
  recoverySchema,
  type LoginData,
  type RegisterData,
  type RecoveryData,
} from "../schemas/authSchema";

// Import do Logo
import logoFull from "../assets/logo/logo-full.png";
import { Input } from "../components/ui/input/Input";

export function Login() {
  const navigate = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState<"login" | "register" | "recovery">("login");
  const [loading, setLoading] = useState(false);

  // Forms independentes utilizando os schemas importados
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

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message,
      );
      setLoading(false);
    } else {
      toast.success("Login realizado com sucesso!");
      navigate("/");
    }
  };

  // 2. CADASTRO (Com validação de e-mail pré-cadastrado)
  const handleRegister = async (data: RegisterData) => {
    setLoading(true);

    try {
      // Verifica se o e-mail está pré-cadastrado como CONSULTOR
      const { data: consultor } = await supabase
        .from("consultores")
        .select("id")
        .eq("email", data.email)
        .maybeSingle();

      // Verifica se o e-mail está pré-cadastrado como CLIENTE
      const { data: cliente } = await supabase
        .from("perfis")
        .select("id, user_id")
        .eq("email", data.email)
        .maybeSingle();

      // Bloqueia se não estiver em nenhuma tabela
      if (!consultor && !cliente) {
        toast.error(
          "Este e-mail não está autorizado para cadastro. Entre em contato com seu consultor.",
        );
        setLoading(false);
        return;
      }

      // Bloqueia se a conta já estiver ativa
      if (cliente?.user_id) {
        toast.error(
          "Este e-mail já possui uma conta ativa. Tente fazer login.",
        );
        setLoading(false);
        return;
      }

      // Realiza o cadastro no Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.nome,
            },
          },
        },
      );

      if (signUpError) {
        toast.error(signUpError.message);
        setLoading(false);
        return;
      }

      // Se for cliente, vincula o user_id gerado ao perfil existente
      if (authData.user && cliente) {
        await supabase
          .from("perfis")
          .update({ user_id: authData.user.id })
          .eq("id", cliente.id);
      }

      toast.success(
        "Cadastro realizado! Verifique seu e-mail para confirmar a conta.",
      );
      registerForm.reset();
      setMode("login");
    } catch (err) {
      toast.error("Erro inesperado ao validar cadastro.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. RECUPERAÇÃO DE SENHA
  const handleRecovery = async (data: RecoveryData) => {
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        "Se este e-mail existir, um link de recuperação foi enviado.",
      );
      recoveryForm.reset();
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Cabeçalho com Logo */}
        <div className={styles.header}>
          <img src={logoFull} alt="Profiles Logo" className={styles.logo} />
          <p className={styles.subtitle}>Planejamento Financeiro Inteligente</p>
        </div>

        {/* 1. MODO RECUPERAÇÃO */}
        {mode === "recovery" ? (
          <form
            onSubmit={recoveryForm.handleSubmit(handleRecovery)}
            className={styles.form}
          >
            <h3 className={styles.formTitle}>Recuperar Senha</h3>
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
                onClick={() => setMode("login")}
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
                onClick={() => setMode("login")}
              >
                Entrar
              </button>
              <button
                type="button"
                className={`${styles.tab} ${
                  mode === "register" ? styles.activeTab : ""
                }`}
                onClick={() => setMode("register")}
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
                    onClick={() => setMode("recovery")}
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
                    variant="primary" // Botão Azul
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

        {/* Rodapé com Copyright */}
        <footer className={styles.footer}>
          <p>
            © {new Date().getFullYear()} Profiles. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}
