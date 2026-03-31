import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.routes";
import { usuarioRouter } from "./routes/usuario.routes";
import { enderecoRouter } from "./routes/endereco.routes";
import { escolaRouter } from "./routes/escola.routes";
import { boletimRouter } from "./routes/boletim.routes";
import { ocorrenciaRouter } from "./routes/ocorrencia.routes";
import { tarefaRouter } from "./routes/tarefa.routes";
import { imagemRouter } from "./routes/imagem.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir uploads estáticos
app.use("/uploads", express.static("uploads"));

// Rotas
app.use("/api/auth", authRouter);
app.use("/api/usuarios", usuarioRouter);
app.use("/api/enderecos", enderecoRouter);
app.use("/api/escola", escolaRouter);
app.use("/api/boletins", boletimRouter);
app.use("/api/ocorrencias", ocorrenciaRouter);
app.use("/api/tarefas", tarefaRouter);
app.use("/api/imagens", imagemRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler global
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Erro:", err.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
);

app.listen(PORT, () => {
  console.log(`GAED Modern API rodando em http://localhost:${PORT}`);
});

export default app;
