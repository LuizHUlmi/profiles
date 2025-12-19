// src/pages/Login.tsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import styles from "./Login.module.css";
import logoFull from "../assets/logo/logo-full.png";

// Icons
import { Mail, Lock, User, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "../components/ui/toast/ToastContext";

// --- Schemas de Validação ---
const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

const registerSchema = z.object({
  nome: z.string().min(3, "Mínimo 3 letras"),
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const recoverySchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

// Tipos
type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type RecoveryData = z.infer<typeof recoverySchema>;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState<"login" | "register" | "recovery">("login");
  const [loading, setLoading] = useState(false);

  // Redireciona se já logado
  useEffect(() => {
    if (session) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [session, navigate, location]);

  // Forms
  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });
  const recoveryForm = useForm<RecoveryData>({
    resolver: zodResolver(recoverySchema),
  });

  // HANDLERS

  const onLogin = async (data: LoginData) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : "Erro ao entrar. Tente novamente."
      );
      setLoading(false);
    }
    // Sucesso redireciona via useEffect
  };

  const onRegister = async (data: RegisterData) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.nome } },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Conta criada! Verifique seu e-mail.");
      setMode("login");
      registerForm.reset();
    }
    setLoading(false);
  };

  const onRecovery = async (data: RecoveryData) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Link enviado! Verifique seu e-mail.");
      setMode("login");
      recoveryForm.reset();
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* CABEÇALHO */}
        <div className={styles.header}>
          <img src={logoFull} alt="Profiles Logo" className={styles.logo} />

          {mode === "login" && (
            <>
              <h1 className={styles.title}>Bem-vindo</h1>
              <p className={styles.subtitle}>
                Faça login para acessar sua conta
              </p>
            </>
          )}
          {mode === "register" && (
            <>
              <h1 className={styles.title}>Criar Conta</h1>
              <p className={styles.subtitle}>Comece seu planejamento hoje</p>
            </>
          )}
          {mode === "recovery" && (
            <>
              <h1 className={styles.title}>Recuperar Senha</h1>
              <p className={styles.subtitle}>
                Enviaremos um link para seu e-mail
              </p>
            </>
          )}
        </div>

        {/* --- FORMULÁRIO DE LOGIN --- */}
        {mode === "login" && (
          <form
            onSubmit={loginForm.handleSubmit(onLogin)}
            className={styles.form}
          >
            <div className={styles.inputGroup}>
              <label className={styles.label}>E-mail</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  className={styles.input}
                  placeholder="seu@email.com"
                  disabled={loading}
                  {...loginForm.register("email")}
                />
              </div>
              {loginForm.formState.errors.email && (
                <span className={styles.errorText}>
                  {loginForm.formState.errors.email.message}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className={styles.label}>Senha</label>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => setMode("recovery")}
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  disabled={loading}
                  {...loginForm.register("password")}
                />
              </div>
              {loginForm.formState.errors.password && (
                <span className={styles.errorText}>
                  {loginForm.formState.errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Entrar <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className={styles.footerLink}>
              Não tem uma conta?{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => setMode("register")}
              >
                Cadastre-se
              </button>
            </div>
          </form>
        )}

        {/* --- FORMULÁRIO DE CADASTRO --- */}
        {mode === "register" && (
          <form
            onSubmit={registerForm.handleSubmit(onRegister)}
            className={styles.form}
          >
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nome Completo</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Seu nome"
                  disabled={loading}
                  {...registerForm.register("nome")}
                />
              </div>
              {registerForm.formState.errors.nome && (
                <span className={styles.errorText}>
                  {registerForm.formState.errors.nome.message}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>E-mail</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  className={styles.input}
                  placeholder="seu@email.com"
                  disabled={loading}
                  {...registerForm.register("email")}
                />
              </div>
              {registerForm.formState.errors.email && (
                <span className={styles.errorText}>
                  {registerForm.formState.errors.email.message}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Senha</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                  {...registerForm.register("password")}
                />
              </div>
              {registerForm.formState.errors.password && (
                <span className={styles.errorText}>
                  {registerForm.formState.errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Criar Conta"}
            </button>

            <div className={styles.footerLink}>
              Já tem conta?{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => setMode("login")}
              >
                Fazer Login
              </button>
            </div>
          </form>
        )}

        {/* --- FORMULÁRIO DE RECUPERAÇÃO --- */}
        {mode === "recovery" && (
          <form
            onSubmit={recoveryForm.handleSubmit(onRecovery)}
            className={styles.form}
          >
            <div className={styles.inputGroup}>
              <label className={styles.label}>E-mail</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  className={styles.input}
                  placeholder="seu@email.com"
                  disabled={loading}
                  {...recoveryForm.register("email")}
                />
              </div>
              {recoveryForm.formState.errors.email && (
                <span className={styles.errorText}>
                  {recoveryForm.formState.errors.email.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Enviar Link"}
            </button>

            <button
              type="button"
              className={styles.backButton}
              onClick={() => setMode("login")}
            >
              <ArrowLeft size={16} /> Voltar para o Login
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <p>© 2025 Profiles. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
