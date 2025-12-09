// src/utils/masks.ts

// --- MÁSCARAS VISUAIS (Para o Input) ---

export const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, "") // Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto após o 3º digito
    .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto após o 6º digito
    .replace(/(\d{3})(\d{1,2})/, "$1-$2") // Coloca traço após o 9º digito
    .replace(/(-\d{2})\d+?$/, "$1"); // Impede digitar mais que 11 dígitos
};

export const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2") // Coloca parênteses no DDD
    .replace(/(\d{5})(\d)/, "$1-$2") // Coloca traço após o 5º dígito
    .replace(/(-\d{4})\d+?$/, "$1"); // Limita o tamanho
};

export const maskCurrency = (value: string) => {
  // Remove tudo que não é dígito
  const numericValue = value.replace(/\D/g, "");

  // Converte para número e divide por 100 para ter os centavos
  const number = Number(numericValue) / 100;

  // Formata como BRL
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
};

export const maskDate = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{4})\d+?$/, "$1");
};

// --- FUNÇÕES DE LIMPEZA (Para salvar no Banco) ---

export const unmask = (value: string) => {
  return value.replace(/\D/g, ""); // Retorna apenas números
};

export const unmaskCurrency = (value: string) => {
  // Remove o R$, pontos e troca vírgula por ponto para o banco aceitar
  // Ex: "R$ 1.200,50" -> 1200.50
  if (!value) return 0;
  return Number(value.replace(/\D/g, "")) / 100;
};
