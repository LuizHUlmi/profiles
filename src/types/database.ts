// src/types/database.ts

// --- 1. CONTROLE DE ACESSO ---
export type UserRole =
  | "master"
  | "consultor"
  | "cliente_leitor"
  | "cliente_editor";

export type NivelAcesso = "master" | "consultor";

export interface Consultor {
  id: string;
  nome: string;
  email: string;
  nivel: NivelAcesso;
  ativo: boolean;
}

// --- 2. PERFIS E FAMÍLIA ---
export interface Perfil {
  id: string;
  user_id?: string;
  nome: string;
  email: string;
  cpf?: string;
  data_nascimento?: string;
  telefone?: string;
  expectativa_vida?: number;
  role: UserRole;
  consultor_id?: string | null;
}

export interface Endereco {
  id: number;
  perfil_id: string;
  cep: string;
  logradouro: string;
}

export interface Familiar {
  id: number;
  perfil_id: string;
  nome: string;
  data_nascimento: string;
  parentesco: "Cônjuge" | "Filho" | "Pais" | "Animal" | "Outros";
  // CPF removido conforme sua alteração no banco
  // Novo campo unificado:
  idade_aposentadoria?: number | null;
}

// --- 3. PROJETOS DE VIDA ---
// Interface unificada e completa
export interface Projeto {
  id: number;
  perfil_id: string; // Padronizado como perfil_id (vinculo com o Cliente)
  nome: string;
  prioridade: string; // 'essencial', 'desejo', 'sonho'
  valor: number;
  prazo: string;
  tipo?: string;
  idade_realizacao?: number | null; // Importante para o cálculo futuro
}

// --- 4. SIMULAÇÃO E CENÁRIOS ---
export interface Simulacao {
  id: string;
  perfil_id: string;
  titulo: string;
  ativo: boolean;
  idade_aposentadoria: number;
  renda_desejada: number;
  outras_rendas: number;
  investimento_mensal: number;
  patrimonio_atual: number;
}

export interface SimulacaoProjeto {
  id: string;
  simulacao_id: string;
  projeto_id: number;
  ativo: boolean;
}

// --- 5. FINANCEIRO E PATRIMÔNIO ---

export interface ItemFluxoCaixa {
  id: number;
  perfil_id: string;
  familiar_id: number | null;
  proprietario_tipo: "titular" | "dependente" | "casal" | "familia";
  tipo: "receita" | "despesa";
  descricao: string;
  valor_mensal: number;
  inicio_tipo: "ano" | "idade";
  inicio_valor: number;
  duracao_anos: number;
  correcao_anual?: number | null;
}

// Tabela Unificada para Bens, Direitos e Deveres
export interface ItemAtivoPassivo {
  id: number;
  perfil_id: string;
  familiar_id: number | null;
  proprietario_tipo: "titular" | "dependente" | "casal" | "familia";
  categoria: "ativo" | "passivo";

  tipo: string;
  nome: string;
  valor: number;

  // Ativos
  inventariar: boolean;
  percentual_inventario?: number | null;
  investir_pos_morte: boolean;
  rentabilidade_tipo?: "cdi" | "bruta" | "ipca" | "pre" | "selic" | null;
  rentabilidade_valor?: number | null;
  regime_tributario?: "progressivo" | "regressivo" | null;

  // Passivos
  valor_parcela?: number | null;
  prazo_meses?: number | null;
  amortizacao_tipo?: "SAC" | "PRICE" | "BULLET" | null;
  correcao_anual?: number | null;
  segurado?: boolean | null;
}

// --- 6. PROTEÇÃO E EDUCAÇÃO ---

export interface ItemSeguro {
  id: number;
  perfil_id: string;
  proprietario_tipo: "titular" | "dependente"; // 'conjuge' removido (use familiar_id)
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

// Adicione junto com as outras interfaces
export interface PremissasEconomicas {
  id: number;
  perfil_id: string | null; // Null = Sistema, String = Cliente
  selic: number;
  inflacao: number;
  custo_inventario_padrao: number;
}
