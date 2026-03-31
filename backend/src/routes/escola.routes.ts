import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

export const escolaRouter = Router();
escolaRouter.use(authMiddleware);

// ========================
// SÉRIES
// ========================

escolaRouter.get("/series", async (_req: Request, res: Response) => {
  try {
    const series = await prisma.serie.findMany({
      orderBy: { nome: "asc" },
      include: { _count: { select: { turmas: true } } },
    });
    res.json(series);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

escolaRouter.post(
  "/series",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const serie = await prisma.serie.create({ data: req.body });
      res.status(201).json(serie);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

escolaRouter.put(
  "/series/:id",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const serie = await prisma.serie.update({
        where: { id: Number(req.params.id) },
        data: req.body,
      });
      res.json(serie);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

escolaRouter.delete(
  "/series/:id",
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await prisma.serie.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Série removida" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// ========================
// PERÍODOS
// ========================

escolaRouter.get("/periodos", async (_req: Request, res: Response) => {
  try {
    const periodos = await prisma.periodo.findMany({ orderBy: { nome: "asc" } });
    res.json(periodos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

escolaRouter.post(
  "/periodos",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const periodo = await prisma.periodo.create({ data: req.body });
      res.status(201).json(periodo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

escolaRouter.put(
  "/periodos/:id",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const periodo = await prisma.periodo.update({
        where: { id: Number(req.params.id) },
        data: req.body,
      });
      res.json(periodo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// ========================
// TURMAS
// ========================

escolaRouter.get("/turmas", async (req: Request, res: Response) => {
  try {
    const { serieId, periodoId } = req.query;
    const where: any = {};
    if (serieId) where.serieId = Number(serieId);
    if (periodoId) where.periodoId = Number(periodoId);

    const turmas = await prisma.turma.findMany({
      where,
      orderBy: { nome: "asc" },
      include: {
        serie: true,
        periodo: true,
        _count: { select: { alunos: true } },
      },
    });
    res.json(turmas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

escolaRouter.get("/turmas/:id", async (req: Request, res: Response) => {
  try {
    const turma = await prisma.turma.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        serie: true,
        periodo: true,
        alunos: { select: { id: true, nome: true, sobrenome: true } },
        turmaDisciplinas: {
          include: {
            disciplina: true,
            professor: { select: { id: true, nome: true, sobrenome: true } },
          },
        },
      },
    });
    if (!turma) {
      res.status(404).json({ error: "Turma não encontrada" });
      return;
    }
    res.json(turma);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

escolaRouter.post(
  "/turmas",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const turma = await prisma.turma.create({ data: req.body });
      res.status(201).json(turma);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

escolaRouter.put(
  "/turmas/:id",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const turma = await prisma.turma.update({
        where: { id: Number(req.params.id) },
        data: req.body,
      });
      res.json(turma);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

escolaRouter.delete(
  "/turmas/:id",
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await prisma.turma.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Turma removida" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// ========================
// DISCIPLINAS
// ========================

escolaRouter.get("/disciplinas", async (_req: Request, res: Response) => {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      orderBy: { nome: "asc" },
      include: {
        _count: { select: { professores: true, turmaDisciplinas: true } },
      },
    });
    res.json(disciplinas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

escolaRouter.post(
  "/disciplinas",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const disciplina = await prisma.disciplina.create({ data: req.body });
      res.status(201).json(disciplina);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

escolaRouter.put(
  "/disciplinas/:id",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const disciplina = await prisma.disciplina.update({
        where: { id: Number(req.params.id) },
        data: req.body,
      });
      res.json(disciplina);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

escolaRouter.delete(
  "/disciplinas/:id",
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await prisma.disciplina.delete({
        where: { id: Number(req.params.id) },
      });
      res.json({ message: "Disciplina removida" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// ========================
// PROFESSOR-DISCIPLINA (vincular)
// ========================

escolaRouter.post(
  "/professor-disciplina",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const { professorId, disciplinaId } = req.body;
      const pd = await prisma.professorDisciplina.create({
        data: { professorId, disciplinaId },
      });
      res.status(201).json(pd);
    } catch (err: any) {
      if (err.code === "P2002") {
        res.status(409).json({ error: "Vínculo já existe" });
        return;
      }
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

escolaRouter.delete(
  "/professor-disciplina/:professorId/:disciplinaId",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      await prisma.professorDisciplina.delete({
        where: {
          professorId_disciplinaId: {
            professorId: Number(req.params.professorId),
            disciplinaId: Number(req.params.disciplinaId),
          },
        },
      });
      res.json({ message: "Vínculo removido" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// ========================
// TURMA-DISCIPLINA-PROFESSOR (vincular)
// ========================

escolaRouter.post(
  "/turma-disciplina-professor",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const tdp = await prisma.turmaDisciplinaProfessor.create({
        data: req.body,
      });
      res.status(201).json(tdp);
    } catch (err: any) {
      if (err.code === "P2002") {
        res.status(409).json({ error: "Vínculo já existe" });
        return;
      }
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

escolaRouter.delete(
  "/turma-disciplina-professor/:id",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      await prisma.turmaDisciplinaProfessor.delete({
        where: { id: Number(req.params.id) },
      });
      res.json({ message: "Vínculo removido" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);
