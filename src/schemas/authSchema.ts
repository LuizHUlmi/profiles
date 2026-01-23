// src/schemas/authSchema.ts
import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export const registerSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 letras"),
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const recoverySchema = z.object({
  email: z.string().email("Digite seu e-mail para recuperação"),
});

// Tipos inferidos para uso nos componentes
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type RecoveryData = z.infer<typeof recoverySchema>;
