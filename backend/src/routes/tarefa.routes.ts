import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

export const tarefaRouter = Router();
tarefaRouter.use(authMiddleware);

// GET — listar tarefas
tarefaRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { disciplinaId, turmaId } = req.query;
    const where: any = {};
    if (disciplinaId) where.disciplinaId = Number(disciplinaId);
    if (turmaId) where.turmas = { some: { turmaId: Number(turmaId) } };

    const tarefas = await prisma.tarefa.findMany({
      where,
      include: {
        disciplina: { select: { id: true, nome: true } },
        turmas: {
          include: { turma: { select: { id: true, nome: true } } },
        },
      },
      orderBy: { fim: "desc" },
    });
    res.json(tarefas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// GET /:id
tarefaRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const tarefa = await prisma.tarefa.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        disciplina: true,
        turmas: { include: { turma: true } },
      },
    });
    if (!tarefa) {
      res.status(404).json({ error: "Tarefa não encontrada" });
      return;
    }
    res.json(tarefa);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// POST — criar tarefa (com turmas)
tarefaRouter.post(
  "/",
  requireRole("ADMIN", "GESTOR", "PROFESSOR"),
  upload.single("anexo"),
  async (req: Request, res: Response) => {
    try {
      const { descricao, inicio, fim, disciplinaId, turmaIds } = req.body;
      const anexoUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const parsedTurmaIds: number[] = turmaIds
        ? JSON.parse(turmaIds)
        : [];

      const tarefa = await prisma.tarefa.create({
        data: {
          descricao,
          inicio: inicio ? new Date(inicio) : null,
          fim: fim ? new Date(fim) : null,
          disciplinaId: Number(disciplinaId),
          anexoUrl,
          turmas: {
            create: parsedTurmaIds.map((turmaId: number) => ({ turmaId })),
          },
        },
        include: { turmas: true },
      });

      res.status(201).json(tarefa);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// PUT — atualizar
tarefaRouter.put(
  "/:id",
  requireRole("ADMIN", "GESTOR", "PROFESSOR"),
  async (req: Request, res: Response) => {
    try {
      const { turmaIds, ...data } = req.body;
      const updateData: any = { ...data };

      if (data.inicio) updateData.inicio = new Date(data.inicio);
      if (data.fim) updateData.fim = new Date(data.fim);
      if (data.disciplinaId) updateData.disciplinaId = Number(data.disciplinaId);

      // Se turmaIds fornecidos, recriar vínculos
      if (turmaIds) {
        await prisma.tarefaTurma.deleteMany({
          where: { tarefaId: Number(req.params.id) },
        });
        updateData.turmas = {
          create: turmaIds.map((turmaId: number) => ({ turmaId })),
        };
      }

      const tarefa = await prisma.tarefa.update({
        where: { id: Number(req.params.id) },
        data: updateData,
        include: { turmas: true },
      });

      res.json(tarefa);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// DELETE
tarefaRouter.delete(
  "/:id",
  requireRole("ADMIN", "GESTOR"),
  async (req: Request, res: Response) => {
    try {
      await prisma.tarefa.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Tarefa removida" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);
