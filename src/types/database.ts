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
