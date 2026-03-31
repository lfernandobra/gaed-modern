import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

export const boletimRouter = Router();
boletimRouter.use(authMiddleware);

// ========================
// BIMESTRES
// ========================

boletimRouter.get("/bimestres", async (_req: Request, res: Response) => {
  try {
    const bimestres = await prisma.bimestre.findMany({
      orderBy: { dataFinal: "asc" },
    });
    res.json(bimestres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

boletimRouter.post(
  "/bimestres",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const bimestre = await prisma.bimestre.create({ data: req.body });
      res.status(201).json(bimestre);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// ========================
// BOLETINS
// ========================

boletimRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { bimestreId } = req.query;
    const where = bimestreId ? { bimestreId: Number(bimestreId) } : {};
    const boletins = await prisma.boletim.findMany({
      where,
      include: { bimestre: true, _count: { select: { notas: true } } },
    });
    res.json(boletins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

boletimRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const boletim = await prisma.boletim.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        bimestre: true,
        notas: {
          include: {
            aluno: { select: { id: true, nome: true, sobrenome: true } },
            disciplina: { select: { id: true, nome: true } },
          },
        },
      },
    });
    if (!boletim) {
      res.status(404).json({ error: "Boletim não encontrado" });
      return;
    }
    res.json(boletim);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

boletimRouter.post(
  "/",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const boletim = await prisma.boletim.create({ data: req.body });
      res.status(201).json(boletim);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// ========================
// NOTAS (BoletimAlunoDisciplina)
// ========================

// GET notas por aluno
boletimRouter.get("/notas/aluno/:alunoId", async (req: Request, res: Response) => {
  try {
    const notas = await prisma.boletimAlunoDisciplina.findMany({
      where: { alunoId: Number(req.params.alunoId) },
      include: {
        boletim: { include: { bimestre: true } },
        disciplina: true,
      },
      orderBy: { boletim: { bimestre: { dataFinal: "asc" } } },
    });
    res.json(notas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// POST criar/atualizar nota
boletimRouter.post(
  "/notas",
  requireRole("ADMIN", "GESTOR", "SECRETARIA", "PROFESSOR"),
  async (req: Request, res: Response) => {
    try {
      const { boletimId, alunoId, disciplinaId, nota, falta } = req.body;
      const result = await prisma.boletimAlunoDisciplina.upsert({
        where: {
          boletimId_alunoId_disciplinaId: { boletimId, alunoId, disciplinaId },
        },
        update: { nota, falta },
        create: { boletimId, alunoId, disciplinaId, nota, falta },
      });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);
