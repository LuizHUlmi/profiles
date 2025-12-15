// 1. Define os papéis possíveis no sistema (usado no AuthContext e Perfil)
export type UserRole =
  | "master"
  | "consultor"
  | "cliente_leitor"
  | "cliente_editor";

// 2. Define o nível de acesso específico da equipe (usado no ConsultorForm)
export type NivelAcesso = "master" | "consultor";

// --- PROJETO (A Biblioteca) ---
export interface Projeto {
  id: number; // ou string, dependendo de como criou no banco (bigint é number/string)
  user_id?: string;
  nome: string;
  prioridade: string;
  valor: number;
  prazo: string;
  tipo?: string;
  idade_realizacao?: number;
}

// --- SIMULAÇÃO (O Cenário) ---
export interface Simulacao {
  id: string;
  perfil_id: string;
  titulo: string;
  ativo: boolean;

  // Sliders
  idade_aposentadoria: number;
  renda_desejada: number;
  outras_rendas: number;
  investimento_mensal: number;
  patrimonio_atual: number;
}

// --- VÍNCULO (A Ligação) ---
export interface SimulacaoProjeto {
  id: string;
  simulacao_id: string;
  projeto_id: number;
  ativo: boolean;
}

// 3. Interface da tabela 'perfis' (Clientes e Usuários logados)
export interface Perfil {
  id: string;
  user_id?: string; // Link com a autenticação do Supabase
  nome: string;
  cpf?: string;
  email: string;
  data_nascimento?: string;
  telefone?: string;
  expectativa_vida?: number;
  // Controle de Acesso
  role: UserRole;
  consultor_id?: string | null;
}

// 4. Interface da tabela 'consultores' (A lista de permissão da equipe)
export interface Consultor {
  id: string;
  nome: string;
  email: string;
  nivel: NivelAcesso;
  ativo: boolean;
}

// 5. Interfaces auxiliares (já existiam)
export interface Conjuge {
  id: number;
  perfil_id: string;
  nome: string;
  cpf: string;
}

export interface Endereco {
  id: number;
  perfil_id: string;
  cep: string;
  logradouro: string;
}

export interface Projeto {
  id: number;
  nome: string;
  prioridade: string; // 'essencial', 'desejo', 'sonho'
  valor: number;
  prazo: string;
}

export interface Familiar {
  id: number;
  perfil_id: string;
  nome: string;
  data_nascimento: string;
  parentesco: "Cônjuge" | "Filho" | "Pais" | "Animal" | "Outros"; // Adicionado Cônjuge
  cpf?: string; // Adicionado opcional
}

export interface ItemFluxoCaixa {
  id: number;
  perfil_id: string;
  familiar_id: number | null; // Nulo se for Titular, Casal ou Família
  proprietario_tipo: "titular" | "dependente" | "casal" | "familia"; // <--- NOVO
  tipo: "receita" | "despesa";
  descricao: string;
  valor_mensal: number;
  inicio_tipo: "ano" | "idade";
  inicio_valor: number;
  duracao_anos: number;
  correcao_anual?: number | null;
}

// src/types/database.ts

export interface ItemAtivoPassivo {
  id: number;
  perfil_id: string;
  familiar_id: number | null;
  proprietario_tipo: "titular" | "dependente" | "casal" | "familia";
  categoria: "ativo" | "passivo";
  tipo: string;
  nome: string;
  valor: number;

  // Campos de Herança
  inventariar: boolean;
  percentual_inventario?: number | null;
  investir_pos_morte: boolean;

  // Campos de Investimento
  rentabilidade_tipo?: "cdi" | "bruta" | "ipca" | null;
  rentabilidade_valor?: number | null;

  // Campo de Previdência
  regime_tributario?: "progressivo" | "regressivo" | null;

  // NOVOS CAMPOS (Passivos)
  valor_parcela?: number | null;
  prazo_meses?: number | null;
  amortizacao_tipo?: "SAC" | "PRICE" | null;
  correcao_anual?: number | null;
  segurado?: boolean | null;
}

export type CategoriaPatrimonio =
  | "investimento"
  | "previdencia"
  | "imobilizado"
  | "passivo";

export interface ItemPatrimonio {
  id: number;
  perfil_id: string; // Dono do ativo/passivo
  nome: string;
  valor: number;
  categoria: CategoriaPatrimonio;
  detalhes?: string; // Ex: Instituição, Endereço, Taxa (vamos expandir depois)
}

export interface ItemSeguro {
  id: number;
  perfil_id: string;
  proprietario_tipo: "titular" | "dependente" | "conjuge";
  familiar_id: number | null;
  nome: string;
  cobertura: number;
  valor_mensal?: number | null;
  tipo_cobertura?: string;
  tipo_vigencia?: "vitalicio" | "termo";
  prazo_anos?: number | null;
}

export interface ItemEducacao {
  id: number;
  perfil_id: string;
  beneficiario_tipo: "titular" | "dependente";
  familiar_id: number | null;
  nome: string;
  custo_mensal: number;
  correcao_anual?: number | null;
  ano_inicio: number;
  duracao_anos: number;
}
