require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const allowedOrigin = process.env.FRONTEND_URL || "*";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "API do Sistema de Eventos Acadêmicos está funcionando." });
});

app.get("/api/eventos", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao listar eventos:", error.message);
    res.status(500).json({ erro: "Não foi possível carregar os eventos." });
  }
});

app.post("/api/eventos", async (req, res) => {
  try {
    const { titulo, descricao, data_evento, local } = req.body;

    if (
      typeof titulo !== "string" || !titulo.trim() ||
      typeof data_evento !== "string" || !data_evento.trim() ||
      typeof local !== "string" || !local.trim()
    ) {
      return res.status(400).json({
        erro: "Preencha obrigatoriamente título, data do evento e local."
      });
    }

    if (titulo.trim().length > 150 || local.trim().length > 100) {
      return res.status(400).json({
        erro: "O título deve ter até 150 caracteres e o local até 100 caracteres."
      });
    }

    const novoEvento = {
      titulo: titulo.trim(),
      descricao: typeof descricao === "string" ? descricao.trim() : "",
      data_evento: data_evento.trim(),
      local: local.trim()
    };

    const { data, error } = await supabase
      .from("eventos")
      .insert(novoEvento)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Erro ao cadastrar evento:", error.message);
    res.status(500).json({ erro: "Não foi possível cadastrar o evento." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
