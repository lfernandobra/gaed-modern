import { useEffect, useState } from "react";
import api from "../lib/api";
import type { Disciplina } from "../types";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Disciplina | null>(null);
  const [form, setForm] = useState({ nome: "", conteudo: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/escola/disciplinas");
      setDisciplinas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/escola/disciplinas/${editing.id}`, form);
      } else {
        await api.post("/escola/disciplinas", form);
      }
      setShowForm(false);
      setEditing(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao salvar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja remover esta disciplina?")) return;
    try {
      await api.delete(`/escola/disciplinas/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao remover");
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "nome", label: "Disciplina" },
    { key: "conteudo", label: "Conteúdo", render: (d: Disciplina) => (d.conteudo || "-").substring(0, 60) + (d.conteudo && d.conteudo.length > 60 ? "..." : "") },
    { key: "professores", label: "Professores", render: (d: Disciplina) => d._count?.professores ?? 0 },
    { key: "turmas", label: "Turmas", render: (d: Disciplina) => d._count?.turmaDisciplinas ?? 0 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Disciplinas</h1>
        <Button onClick={() => { setEditing(null); setForm({ nome: "", conteudo: "" }); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Nova Disciplina
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <DataTable
          columns={columns}
          data={disciplinas}
          loading={loading}
          actions={(d: Disciplina) => (
            <div className="flex gap-1 justify-end">
              <button onClick={() => { setEditing(d); setForm({ nome: d.nome, conteudo: d.conteudo || "" }); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-primary rounded transition"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(d.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Editar Disciplina" : "Nova Disciplina"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nome *</label>
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Conteúdo</label>
                <textarea value={form.conteudo} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} rows={3} className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</Button>
              <Button onClick={handleSave}>{editing ? "Salvar" : "Criar"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
