// src/pages/Parametros.tsx
import { useState, useEffect } from "react";
import { Input } from "../components/ui/input/Input";
import { Button } from "../components/ui/button/Button";
import { Save, TrendingUp, Percent } from "lucide-react";
import styles from "./Parametros.module.css";
import { useToast } from "../components/ui/toast/ToastContext";
import { usePremissas } from "../hooks/usePremissas"; // <--- Hook reaproveitado!

export function Parametros() {
  const toast = useToast();
  // Usamos o hook passando profileId = NULL para indicar que é o SISTEMA
  const { loading, fetchPremissas, savePremissas } = usePremissas();

  const [values, setValues] = useState({
    selic: "",
    inflacao: "",
    custo_inventario_padrao: "", // Antigo 'taxa_adm_padrao' ou similar
    // Campos visuais extras (ainda não salvam no banco, mantive como placeholder)
    cdi: "10.65",
    poupanca: "6.17",
    igpm: "3.50",
    tr: "0.00",
  });

  // Carregar valores do banco ao abrir
  useEffect(() => {
    async function load() {
      // Busca premissas do sistema (perfilId = "")
      // O hook vai retornar o registro onde perfil_id é NULL
      const data = await fetchPremissas(null);

      setValues((prev) => ({
        ...prev,
        selic: String(data.selic),
        inflacao: String(data.inflacao),
        custo_inventario_padrao: String(data.custo_inventario_padrao),
      }));
    }
    load();
  }, [fetchPremissas]);

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepara payload apenas com o que existe no banco
    const payload = {
      selic: Number(values.selic),
      inflacao: Number(values.inflacao),
      custo_inventario_padrao: Number(values.custo_inventario_padrao),
    };

    // Salva passando NULL como ID para indicar "Global do Sistema"
    // O hook savePremissas já trata null como "perfil_id IS NULL"
    const sucesso = await savePremissas(null, payload);

    if (sucesso) {
      toast.success("Parâmetros globais do sistema atualizados!");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Parâmetros Globais do Sistema</h1>
          <p className={styles.subtitle}>
            Defina as premissas econômicas padrão. Elas serão usadas para todos
            os clientes que não tiverem uma configuração personalizada.
          </p>
        </div>
        <Button
          onClick={handleSave}
          loading={loading}
          icon={<Save size={18} />}
        >
          Salvar Padrões
        </Button>
      </header>

      <form className={styles.grid}>
        {/* CARD 1: INDICADORES PRINCIPAIS (Conectados ao Banco) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <TrendingUp size={20} />
            </div>
            <h3>Indicadores Chave (Salvos no Banco)</h3>
          </div>
          <div className={styles.cardBody}>
            <Input
              label="Meta SELIC (%)"
              placeholder="0.00"
              value={values.selic}
              onChange={(e) => handleChange("selic", e.target.value)}
              type="number"
              step="0.01"
            />
            <Input
              label="IPCA - Inflação (%)"
              placeholder="0.00"
              value={values.inflacao}
              onChange={(e) => handleChange("inflacao", e.target.value)}
              type="number"
              step="0.01"
            />
            <Input
              label="Custo Inventário Padrão (%)"
              placeholder="Ex: 15.0"
              value={values.custo_inventario_padrao}
              onChange={(e) =>
                handleChange("custo_inventario_padrao", e.target.value)
              }
              type="number"
              step="0.1"
            />
          </div>
        </div>

        {/* CARD 2: OUTROS INDICADORES (Ainda Visuais/Mock) */}
        <div className={styles.card} style={{ opacity: 0.7 }}>
          <div className={styles.cardHeader}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
            >
              <Percent size={20} />
            </div>
            <h3>Outros Indicadores (Futuro)</h3>
          </div>
          <div className={styles.cardBody}>
            <Input
              label="CDI (%)"
              value={values.cdi}
              onChange={(e) => handleChange("cdi", e.target.value)}
              disabled
              tooltip="Será calculado automaticamente baseado na Selic no futuro"
            />
            <Input
              label="Poupança (%)"
              value={values.poupanca}
              onChange={(e) => handleChange("poupanca", e.target.value)}
              disabled
            />
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "#888",
              padding: "0 1rem 1rem",
            }}
          >
            * Estes campos ainda não estão salvando no banco nesta versão.
          </p>
        </div>
      </form>
    </div>
  );
}
