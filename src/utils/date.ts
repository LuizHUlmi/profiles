// src/utils/date.ts

export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;

  const today = new Date();
  const birthDate = new Date(birthDateString);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Ajuste fino: se ainda não fez aniversário este ano, diminui 1
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
