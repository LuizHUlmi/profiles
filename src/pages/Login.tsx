// src/pages/Login.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/input/input";

// Schemas de Validação
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const registerSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"), // Campo extra para cadastro
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export function Login() {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true); // Controla se é Login ou Cadastro
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  // Forms separados para não confundir a validação
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
          full_name: data.nome, // Envia o nome para ser usado no Trigger
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
      // Opcional: Se o Supabase estiver com "Confirm Email" desligado, ele já loga direto.
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f7fa",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Título e Alternador */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ color: "#333", marginBottom: "0.5rem" }}>Profiles</h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              fontSize: "0.9rem",
            }}
          >
            <button
              onClick={() => {
                setIsLoginMode(true);
                setMessage(null);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: isLoginMode ? "bold" : "normal",
                color: isLoginMode ? "#007bff" : "#666",
                borderBottom: isLoginMode ? "2px solid #007bff" : "none",
              }}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setIsLoginMode(false);
                setMessage(null);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: !isLoginMode ? "bold" : "normal",
                color: !isLoginMode ? "#007bff" : "#666",
                borderBottom: !isLoginMode ? "2px solid #007bff" : "none",
              }}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Mensagens de Erro/Sucesso */}
        {message && (
          <div
            style={{
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "4px",
              fontSize: "0.9rem",
              textAlign: "center",
              backgroundColor: message.type === "error" ? "#fee2e2" : "#dcfce7",
              color: message.type === "error" ? "#dc2626" : "#16a34a",
            }}
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
              style={{
                padding: "0.75rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
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
              style={{
                padding: "0.75rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Criando..." : "Criar Conta"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
