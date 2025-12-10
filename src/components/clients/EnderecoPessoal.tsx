// src/components/dados/DadosPessoaisCard.tsx

import { Input } from "../ui/input/input";
import styles from "../../components/clients/EnderecoPessoal.module.css"; // Usa os mesmos estilos de layout

type EnderecoPessoalProps = {
  title: string;
};

export function EnderecoPessoal({ title }: EnderecoPessoalProps) {
  return (
    <>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.card}>
        {/* Linha 1: Nome (Largura Total) */}
        <div className={styles.fullWidth}>
          <Input
            label="CEP + Adicionar botão de busca CEP"
            name="cep"
            placeholder="00.000-000"
          />
        </div>

        {/* Linha 2: CPF (Largura Total) */}
        <div className={styles.fullWidth}>
          <Input
            label="Logradouro"
            name="logradouro"
            placeholder="Nome da rua, avenida, etc"
          />
        </div>

        {/* Linha 3: E-mail (Largura Total) */}
        <div className={styles.fullWidth}>
          <Input
            label="Número"
            name="logradouroNumero"
            placeholder="Número da residencia"
          />
        </div>

        <div className={styles.fullWidth}>
          <Input
            label="Complemento"
            name="logradouroComplemento"
            placeholder="Bloco, apartamento, fundos de terreno ou outras observações"
          />
        </div>

        {/* Linha 4: Data e Telefone (Lado a Lado) */}
        <div>
          <Input label="Cidade" name="cidade" placeholder="Cidade" />
        </div>

        <div>
          <Input label="Estado" name="estado" placeholder="Estado" />
        </div>

        {/* Botão Salvar */}
        <div className={styles.fullWidth}>
          <button className={styles.saveButton}>Salvar</button>
        </div>
      </div>
    </>
  );
}
