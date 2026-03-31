import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

export const imagemRouter = Router();
imagemRouter.use(authMiddleware);

// GET — listar imagens
imagemRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [imagens, total] = await Promise.all([
      prisma.imagem.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.imagem.count(),
    ]);

    res.json({
      data: imagens,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// POST — upload de imagem
imagemRouter.post(
  "/",
  requireRole("ADMIN", "GESTOR", "SECRETARIA"),
  upload.single("imagem"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Nenhum arquivo enviado" });
        return;
      }

      const imagem = await prisma.imagem.create({
        data: {
          nome: req.body.nome || req.file.originalname,
          descricao: req.body.descricao,
          url: `/uploads/${req.file.filename}`,
        },
      });

      res.status(201).json(imagem);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);

// DELETE
imagemRouter.delete(
  "/:id",
  requireRole("ADMIN", "GESTOR"),
  async (req: Request, res: Response) => {
    try {
      await prisma.imagem.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Imagem removida" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro interno" });
    }
  }
);
