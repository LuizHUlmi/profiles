// src/schemas/financialSchema.ts
import { z } from "zod";
import { unmaskCurrency } from "../utils/masks";

// --- 1. BLOCO COMUM ---
const baseSchema = z.object({
  proprietario_select: z.string().min(1, "Selecione o proprietário"),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  valor: z
    .string()
    .transform((val) => unmaskCurrency(val))
    .refine((val) => val >= 0, "Valor inválido"),
});

// --- 2. BLOCO PASSIVO (Dívidas) ---
const liabilitySchema = baseSchema.extend({
  categoria: z.literal("passivo"),
  tipo: z.string().min(1, "Selecione o tipo de dívida"),

  // Reuse o campo 'rentabilidade_tipo' para salvar o Indexador (Selic/IPCA/Pré)
  rentabilidade_tipo: z
    .enum(["pre", "ipca", "selic"])
    .optional()
    .default("pre"),

  valor_parcela: z
    .string()
    .transform((val) => (val ? unmaskCurrency(val) : 0))
    .refine((val) => val >= 0, "Valor inválido"), // Permitir 0 se for Bullet

  prazo_meses: z.coerce.number().min(1, "Prazo obrigatório"),

  // Adicionado "BULLET" nas opções
  amortizacao_tipo: z.enum(["SAC", "PRICE", "BULLET"]),

  correcao_anual: z.coerce.number().optional().default(0),
  segurado: z.boolean().default(false),
});

// --- 3. BLOCO ATIVO (Investimentos + Bens) ---
const activeSchema = baseSchema
  .extend({
    categoria: z.literal("ativo"),
    tipo: z.string().min(1, "Selecione o tipo"),

    rentabilidade_tipo: z.enum(["cdi", "ipca", "bruta"]).optional().nullable(),
    rentabilidade_valor: z.coerce.number().optional().nullable(),
    regime_tributario: z
      .enum(["progressivo", "regressivo"])
      .optional()
      .nullable(),

    inventariar: z.boolean().default(false),
    percentual_inventario: z.coerce.number().optional(),
    investir_pos_morte: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const isFinancial = ["Aplicação Financeira", "Previdência"].includes(
      data.tipo
    );

    if (isFinancial) {
      if (data.tipo === "Previdência" && !data.regime_tributario) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["regime_tributario"],
          message: "Selecione o regime de tributação",
        });
      }
    } else {
      if (
        data.inventariar &&
        (!data.percentual_inventario || data.percentual_inventario <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["percentual_inventario"],
          message: "Informe o percentual do inventário",
        });
      }
    }
  });

// --- 4. UNIÃO FINAL ---
export const financialItemSchema = z.discriminatedUnion("categoria", [
  liabilitySchema,
  activeSchema,
]);

export type FinancialItemFormValues = z.infer<typeof financialItemSchema>;
export type FinancialItemInput = z.input<typeof financialItemSchema>;
