import { useState } from "react";
import { DadosPessoaisCard } from "../components/form/DadosPessoaisCard"; // Novo import
import styles from "./perfil.module.css"; // Seus estilos de layout
import { EnderecoPssoal } from "../components/form/EnderecoPessoal";

export function Perfil() {
  // 1. Estado para controlar a exibição do formulário do cônjuge
  const [mostrarConjuge, setMostrarConjuge] = useState(false);

  const handleAdicionarConjuge = () => {
    setMostrarConjuge(true);
  };

  return (
    <div className={styles.container}>
      {/* 1. Formulário Principal: "Meus Dados" */}
      <DadosPessoaisCard title="Meus Dados" />

      {/* Separador visual opcional */}
      <div style={{ margin: "3rem 0" }}></div>

      {/* 2. Formulário do Cônjuge: Renderização Condicional */}
      {mostrarConjuge && (
        <>
          {/* O novo formulário duplicado */}
          <DadosPessoaisCard title="Dados do Cônjuge" />

          {/* Opcional: Se já adicionou o cônjuge, o botão deve mudar, ou sumir.
              Neste exemplo, ele sumiu */}
        </>
      )}

      {/* 3. Botão: Renderiza SÓ SE o cônjuge AINDA NÃO foi adicionado */}
      {!mostrarConjuge && (
        <div style={{ marginTop: "2rem" }}>
          <button
            className={styles.saveButton}
            onClick={handleAdicionarConjuge}
          >
            Adicionar Cônjuge
          </button>
        </div>
      )}

      <div>
        <EnderecoPssoal title="Endereço" />
      </div>
    </div>
  );
}
