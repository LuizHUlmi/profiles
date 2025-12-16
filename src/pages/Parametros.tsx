import { useState } from "react";
import { Input } from "../components/ui/input/Input"; // Seu componente Input padronizado
import { Button } from "../components/ui/button/Button";
import { Save, TrendingUp, DollarSign, Percent } from "lucide-react";
import styles from "./Parametros.module.css";
import { useToast } from "../components/ui/toast/ToastContext";

export function Parametros() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Estados locais apenas para visualização por enquanto
  const [values, setValues] = useState({
    selic: "10.75",
    cdi: "10.65",
    ipca: "4.50",
    poupanca: "6.17",
    igpm: "3.50",
    tr: "0.00",
    taxa_adm_padrao: "1.00",
    idade_aposentadoria_padrao: "65",
  });

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de delay de salvamento
    setTimeout(() => {
      setLoading(false);
      toast.success("Parâmetros globais atualizados com sucesso!");
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Parâmetros Globais</h1>
          <p className={styles.subtitle}>
            Defina as premissas econômicas que impactarão as simulações de todos
            os clientes.
          </p>
        </div>
        <Button
          onClick={handleSave}
          loading={loading}
          icon={<Save size={18} />}
        >
          Salvar Alterações
        </Button>
      </header>

      <form className={styles.grid}>
        {/* CARD 1: INDICADORES MACROECONÔMICOS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <TrendingUp size={20} />
            </div>
            <h3>Indicadores de Mercado (Anual)</h3>
          </div>
          <div className={styles.cardBody}>
            <Input
              label="Meta SELIC (%)"
              placeholder="0.00"
              value={values.selic}
              onChange={(e) => handleChange("selic", e.target.value)}
              type="number"
            />
            <Input
              label="CDI (%)"
              placeholder="0.00"
              value={values.cdi}
              onChange={(e) => handleChange("cdi", e.target.value)}
              type="number"
            />
            <Input
              label="IPCA - Inflação (%)"
              placeholder="0.00"
              value={values.ipca}
              onChange={(e) => handleChange("ipca", e.target.value)}
              type="number"
            />
            <Input
              label="IGP-M (%)"
              placeholder="0.00"
              value={values.igpm}
              onChange={(e) => handleChange("igpm", e.target.value)}
              type="number"
            />
          </div>
        </div>

        {/* CARD 2: TAXAS BANCÁRIAS E OUTROS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
            >
              <DollarSign size={20} />
            </div>
            <h3>Taxas de Referência</h3>
          </div>
          <div className={styles.cardBody}>
            <Input
              label="Poupança (a.a.)"
              placeholder="0.00"
              value={values.poupanca}
              onChange={(e) => handleChange("poupanca", e.target.value)}
              type="number"
            />
            <Input
              label="Taxa Referencial (TR)"
              placeholder="0.00"
              value={values.tr}
              onChange={(e) => handleChange("tr", e.target.value)}
              type="number"
            />
          </div>
        </div>

        {/* CARD 3: PREMISSAS DO SISTEMA */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: "#fff7ed", color: "#ea580c" }}
            >
              <Percent size={20} />
            </div>
            <h3>Padrões do Sistema</h3>
          </div>
          <div className={styles.cardBody}>
            <Input
              label="Taxa Adm. Padrão (%)"
              placeholder="Ex: 1.0"
              value={values.taxa_adm_padrao}
              onChange={(e) => handleChange("taxa_adm_padrao", e.target.value)}
              type="number"
            />
            <Input
              label="Idade Aposentadoria Padrão"
              placeholder="Ex: 65"
              value={values.idade_aposentadoria_padrao}
              onChange={(e) =>
                handleChange("idade_aposentadoria_padrao", e.target.value)
              }
              type="number"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
