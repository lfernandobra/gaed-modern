import { useEffect, useState } from "react";
import { useAuth } from "../contexts/useAuth";
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  AlertTriangle,
  FileText,
} from "lucide-react";
import api from "../lib/api";
import { ROLE_LABELS, type Usuario } from "../types";

interface DashStats {
  totalUsuarios: number;
  totalAlunos: number;
  totalProfessores: number;
  totalTurmas: number;
  totalDisciplinas: number;
  totalOcorrencias: number;
  totalTarefas: number;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [usuarios, turmas, disciplinas, ocorrencias, tarefas] =
          await Promise.all([
            api.get("/usuarios?limit=1"),
            api.get("/escola/turmas"),
            api.get("/escola/disciplinas"),
            api.get("/ocorrencias?limit=1"),
            api.get("/tarefas"),
          ]);

        setStats({
          totalUsuarios: usuarios.data.total || 0,
          totalAlunos:
            (usuarios.data.total || 0) -
            (usuarios.data.data?.filter(
              (u: Usuario) => u.role !== "ALUNO"
            ).length || 0),
          totalProfessores: 0,
          totalTurmas: turmas.data?.length || 0,
          totalDisciplinas: disciplinas.data?.length || 0,
          totalOcorrencias: ocorrencias.data.total || 0,
          totalTarefas: tarefas.data?.length || 0,
        });
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      }
    }

    loadStats();
  }, []);

  const cards = [
    {
      label: "Usuários",
      value: stats?.totalUsuarios ?? "-",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Turmas",
      value: stats?.totalTurmas ?? "-",
      icon: School,
      color: "bg-green-500",
    },
    {
      label: "Disciplinas",
      value: stats?.totalDisciplinas ?? "-",
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      label: "Tarefas",
      value: stats?.totalTarefas ?? "-",
      icon: FileText,
      color: "bg-amber-500",
    },
    {
      label: "Ocorrências",
      value: stats?.totalOcorrencias ?? "-",
      icon: AlertTriangle,
      color: "bg-red-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Olá, {user?.nome}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao GAED Modern.{" "}
          {user?.role ? `Você está logado como ${ROLE_LABELS[user.role]}.` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-card border border-border rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {card.label}
              </span>
              <div
                className={`w-9 h-9 ${card.color} rounded-lg flex items-center justify-center`}
              >
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Acesso Rápido
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Use o menu lateral para navegar pelas funcionalidades do sistema.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Informações do Sistema
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Versão: 1.0.0</p>
            <p>Stack: React + Node.js + PostgreSQL</p>
            <p>
              Desenvolvido como reconstrução moderna do projeto GAED original.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
