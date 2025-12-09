// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

// O Vite expõe as variáveis de ambiente em import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltam as variáveis de ambiente do Supabase (.env)");
}

// Cria e exporta o cliente pronto para uso
export const supabase = createClient(supabaseUrl, supabaseKey);
