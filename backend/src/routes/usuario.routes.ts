import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../utils/prisma";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

export const usuarioRouter = Router();

// Todas as rotas exigem autenticação
usuarioRouter.use(authMiddleware);

// GET /api/usuarios — listar todos (com filtros opcionais)
usuarioRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { role, status, search, page = "1", limit = "20" } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (status !== undefined) where.status = status === "true";
    if (search) {
      where.OR = [
        { nome: { contains: search as string, mode: "insensitive" } },
        { sobrenome: { contains: search as string, mode: "insensitive" } },
        { login: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          login: true,
          nome: true,
          sobrenome: true,
          email: true,
          role: true,
          status: true,
          fotoUrl: true,
          cpf: true,
          telefone: true,
          createdAt: true,
        },
        orderBy: { nome: "asc" },
      }),
      prisma.usuario.count({ where }),
    ]);

    res.json({
      data: usuarios,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// GET /api/usuarios/:id — buscar por ID
usuarioRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        logradouro: {
          include: {
            bairro: {
              include: {
                municipio: {
                  include: { uf: true },
                },
              },
            },
          },
        },
        alunoTurma: { include: { serie: true, periodo: true } },
        alunoResponsavel: {
          select: { id: true, nome: true, sobrenome: true },
        },
        responsavelAlunos: {
          select: { id: true, nome: true, sobrenome: true },
        },
      },
    });

    if (!usuario) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    const { senha: _, ...data } = usuario;
    res.json(data);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// POST /api/usuarios — criar
usuarioRouter.post(
  "/",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const { senha, ...data } = req.body;
      const senhaHash = await bcrypt.hash(senha || "123456", 10);

      const usuario = await prisma.usuario.create({
        data: { ...data, senha: senhaHash },
      });

      const { senha: _, ...result } = usuario;
      res.status(201).json(result);
    } catch (err: any) {
      if (err.code === "P2002") {
        res.status(409).json({ error: "Login ou CPF já cadastrado" });
        return;
      }
      console.error("Erro ao criar usuário:", err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// PUT /api/usuarios/:id — atualizar
usuarioRouter.put(
  "/:id",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  async (req: Request, res: Response) => {
    try {
      const { senha, ...data } = req.body;
      const updateData: any = { ...data };

      if (senha) {
        updateData.senha = await bcrypt.hash(senha, 10);
      }

      const usuario = await prisma.usuario.update({
        where: { id: Number(req.params.id) },
        data: updateData,
      });

      const { senha: _, ...result } = usuario;
      res.json(result);
    } catch (err: any) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
      }
      console.error("Erro ao atualizar usuário:", err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// DELETE /api/usuarios/:id — deletar (soft delete via status)
usuarioRouter.delete(
  "/:id",
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await prisma.usuario.update({
        where: { id: Number(req.params.id) },
        data: { status: false },
      });
      res.json({ message: "Usuário desativado com sucesso" });
    } catch (err: any) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
      }
      console.error("Erro ao desativar usuário:", err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// POST /api/usuarios/:id/foto — upload de foto
usuarioRouter.post(
  "/:id/foto",
  upload.single("foto"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Nenhum arquivo enviado" });
        return;
      }

      const fotoUrl = `/uploads/${req.file.filename}`;
      await prisma.usuario.update({
        where: { id: Number(req.params.id) },
        data: { fotoUrl },
      });

      res.json({ fotoUrl });
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);
