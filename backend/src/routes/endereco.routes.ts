import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { authMiddleware } from "../middleware/auth.middleware";

export const enderecoRouter = Router();
enderecoRouter.use(authMiddleware);

// ========== UFs ==========
enderecoRouter.get("/ufs", async (_req: Request, res: Response) => {
  try {
    const ufs = await prisma.uf.findMany({ orderBy: { nome: "asc" } });
    res.json(ufs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// ========== Municípios ==========
enderecoRouter.get("/municipios", async (req: Request, res: Response) => {
  try {
    const { ufId } = req.query;
    const where = ufId ? { ufId: Number(ufId) } : {};
    const municipios = await prisma.municipio.findMany({
      where,
      orderBy: { nome: "asc" },
      include: { uf: true },
    });
    res.json(municipios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// ========== Bairros ==========
enderecoRouter.get("/bairros", async (req: Request, res: Response) => {
  try {
    const { municipioId } = req.query;
    const where = municipioId ? { municipioId: Number(municipioId) } : {};
    const bairros = await prisma.bairro.findMany({
      where,
      orderBy: { nome: "asc" },
      include: { municipio: true },
    });
    res.json(bairros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// ========== Logradouros ==========
enderecoRouter.get("/logradouros", async (req: Request, res: Response) => {
  try {
    const { bairroId } = req.query;
    const where = bairroId ? { bairroId: Number(bairroId) } : {};
    const logradouros = await prisma.logradouro.findMany({
      where,
      orderBy: { nome: "asc" },
      include: { bairro: { include: { municipio: { include: { uf: true } } } } },
    });
    res.json(logradouros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// POST genérico para criar endereço
enderecoRouter.post("/ufs", async (req: Request, res: Response) => {
  try {
    const uf = await prisma.uf.create({ data: req.body });
    res.status(201).json(uf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

enderecoRouter.post("/municipios", async (req: Request, res: Response) => {
  try {
    const municipio = await prisma.municipio.create({ data: req.body });
    res.status(201).json(municipio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

enderecoRouter.post("/bairros", async (req: Request, res: Response) => {
  try {
    const bairro = await prisma.bairro.create({ data: req.body });
    res.status(201).json(bairro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

enderecoRouter.post("/logradouros", async (req: Request, res: Response) => {
  try {
    const logradouro = await prisma.logradouro.create({ data: req.body });
    res.status(201).json(logradouro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});
