import { useEffect, useState } from "react";
import api from "../lib/api";
import type { Tarefa } from "../types";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Plus } from "lucide-react";

export function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tarefas").then((res) => { setTarefas(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "descricao", label: "Descrição", render: (t: Tarefa) => t.descricao.substring(0, 60) },
    { key: "disciplina", label: "Disciplina", render: (t: Tarefa) => t.disciplina?.nome || "-" },
    { key: "turmas", label: "Turmas", render: (t: Tarefa) => t.turmas?.map(tt => tt.turma?.nome).join(", ") || "-" },
    { key: "inicio", label: "Início", render: (t: Tarefa) => t.inicio ? new Date(t.inicio).toLocaleDateString("pt-BR") : "-" },
    { key: "fim", label: "Prazo", render: (t: Tarefa) => t.fim ? new Date(t.fim).toLocaleDateString("pt-BR") : "-" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Tarefas</h1>
        <Button><Plus className="w-4 h-4" /> Nova Tarefa</Button>
      </div>
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <DataTable columns={columns} data={tarefas} loading={loading} />
      </div>
    </div>
  );
}
