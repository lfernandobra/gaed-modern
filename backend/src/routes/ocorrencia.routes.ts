import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

export const ocorrenciaRouter = Router();
ocorrenciaRouter.use(authMiddleware);

// GET — listar ocorrências (com filtro por aluno)
ocorrenciaRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { alunoId, page = "1", limit = "20" } = req.query;
    const where = alunoId ? { alunoId: Number(alunoId) } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [ocorrencias, total] = await Promise.all([
      prisma.ocorrencia.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          aluno: { select: { id: true, nome: true, sobrenome: true } },
        },
        orderBy: { data: "desc" },
      }),
      prisma.ocorrencia.count({ where }),
    ]);

    res.json({
      data: ocorrencias,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// GET /:id
ocorrenciaRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        aluno: { select: { id: true, nome: true, sobrenome: true } },
      },
    });
    if (!ocorrencia) {
      res.status(404).json({ error: "Ocorrência não encontrada" });
      return;
    }
    res.json(ocorrencia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// POST — criar
ocorrenciaRouter.post(
  "/",
  requireRole("ADMIN", "GESTOR", "SECRETARIA", "PROFESSOR"),
  async (req: Request, res: Response) => {
    try {
      const ocorrencia = await prisma.ocorrencia.create({ data: req.body });
      res.status(201).json(ocorrencia);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// PUT — atualizar
ocorrenciaRouter.put(
  "/:id",
  requireRole("ADMIN", "GESTOR", "SECRETARIA", "PROFESSOR"),
  async (req: Request, res: Response) => {
    try {
      const ocorrencia = await prisma.ocorrencia.update({
        where: { id: Number(req.params.id) },
        data: req.body,
      });
      res.json(ocorrencia);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// DELETE
ocorrenciaRouter.delete(
  "/:id",
  requireRole("ADMIN", "GESTOR"),
  async (req: Request, res: Response) => {
    try {
      await prisma.ocorrencia.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Ocorrência removida" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);
