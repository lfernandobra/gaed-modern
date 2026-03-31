import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import { z } from "zod";

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "gaed-modern-jwt-secret-dev";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const loginSchema = z.object({
  login: z.string().min(1, "Login é obrigatório"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

const registerSchema = z.object({
  login: z.string().min(3, "Login deve ter pelo menos 3 caracteres"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  nome: z.string().min(1, "Nome é obrigatório"),
  sobrenome: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  role: z.enum(["ADMIN", "GESTOR", "SECRETARIA", "PROFESSOR", "RESPONSAVEL", "ALUNO"]),
});

// POST /api/auth/login
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const usuario = await prisma.usuario.findUnique({
      where: { login: data.login },
    });

    if (!usuario) {
      res.status(401).json({ error: "Login ou senha inválidos" });
      return;
    }

    const senhaValida = await bcrypt.compare(data.senha, usuario.senha);
    if (!senhaValida) {
      res.status(401).json({ error: "Login ou senha inválidos" });
      return;
    }

    if (!usuario.status) {
      res.status(403).json({ error: "Usuário inativo" });
      return;
    }

    const token = jwt.sign(
      { userId: usuario.id, role: usuario.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    const { senha: _, ...usuarioSemSenha } = usuario;
    res.json({ token, usuario: usuarioSemSenha });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// POST /api/auth/register
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const existe = await prisma.usuario.findUnique({
      where: { login: data.login },
    });
    if (existe) {
      res.status(409).json({ error: "Login já está em uso" });
      return;
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        login: data.login,
        senha: senhaHash,
        nome: data.nome,
        sobrenome: data.sobrenome,
        email: data.email,
        role: data.role,
      },
    });

    const { senha: _, ...usuarioSemSenha } = usuario;
    res.status(201).json(usuarioSemSenha);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error("Erro no registro:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// GET /api/auth/me
authRouter.get("/me", async (req: Request, res: Response) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      res.status(401).json({ error: "Token não fornecido" });
      return;
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        login: true,
        nome: true,
        sobrenome: true,
        email: true,
        role: true,
        fotoUrl: true,
        status: true,
      },
    });

    if (!usuario) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    res.json(usuario);
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
});
