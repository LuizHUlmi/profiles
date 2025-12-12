import { useActiveClient } from "../context/ActiveClientContext";
import { GestaoPatrimonio } from "../components/patrimonio/GestaoPatrimonio";
import { Users } from "lucide-react";

export function AtivosPassivos() {
  const { activeClientId } = useActiveClient();

  if (!activeClientId) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--text-secondary)",
        }}
      >
        <Users size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
        <h2>Selecione um cliente</h2>
        <p>
          Selecione um cliente na barra superior para gerenciar seus ativos e
          passivos.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Estrutura Patrimonial
        </h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          Gerencie Investimentos, Previdência, Imóveis e Dívidas.
        </p>
      </div>

      <GestaoPatrimonio perfilId={activeClientId} />
    </div>
  );
}
