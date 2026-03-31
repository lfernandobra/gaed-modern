import { useEffect, useState } from "react";
import api from "../lib/api";
import type { Turma } from "../types";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Turma | null>(null);
  const [form, setForm] = useState({ nome: "", serieId: 0, periodoId: 0, limite: 40 });

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, sRes, pRes] = await Promise.all([
        api.get("/escola/turmas"),
        api.get("/escola/series"),
        api.get("/escola/periodos"),
      ]);
      setTurmas(tRes.data);
      setSeries(sRes.data);
      setPeriodos(pRes.data);
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
        await api.put(`/escola/turmas/${editing.id}`, form);
      } else {
        await api.post("/escola/turmas", form);
      }
      setShowForm(false);
      setEditing(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao salvar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja remover esta turma?")) return;
    try {
      await api.delete(`/escola/turmas/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao remover");
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "nome", label: "Turma" },
    { key: "serie", label: "Série", render: (t: Turma) => t.serie?.nome || "-" },
    { key: "periodo", label: "Período", render: (t: Turma) => t.periodo?.nome || "-" },
    { key: "alunos", label: "Alunos", render: (t: Turma) => `${t._count?.alunos ?? t.inseridos}/${t.limite}` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Turmas</h1>
        <Button onClick={() => { setEditing(null); setForm({ nome: "", serieId: series[0]?.id || 0, periodoId: periodos[0]?.id || 0, limite: 40 }); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Nova Turma
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <DataTable
          columns={columns}
          data={turmas}
          loading={loading}
          actions={(t: Turma) => (
            <div className="flex gap-1 justify-end">
              <button onClick={() => { setEditing(t); setForm({ nome: t.nome, serieId: t.serieId, periodoId: t.periodoId, limite: t.limite }); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-primary rounded transition"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(t.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Editar Turma" : "Nova Turma"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nome *</label>
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Série *</label>
                <select value={form.serieId} onChange={(e) => setForm({ ...form, serieId: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none">
                  <option value={0}>Selecione...</option>
                  {series.map((s: any) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Período *</label>
                <select value={form.periodoId} onChange={(e) => setForm({ ...form, periodoId: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none">
                  <option value={0}>Selecione...</option>
                  {periodos.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Limite de alunos</label>
                <input type="number" value={form.limite} onChange={(e) => setForm({ ...form, limite: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none" />
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
