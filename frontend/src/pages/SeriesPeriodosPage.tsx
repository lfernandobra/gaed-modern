import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../lib/api";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface SimpleEntity {
  id: number;
  nome: string;
  _count?: { turmas?: number };
}

export function SeriesPage() {
  const [items, setItems] = useState<SimpleEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SimpleEntity | null>(null);
  const [nome, setNome] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/escola/series");
      setItems(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/escola/series/${editing.id}`, { nome });
      else await api.post("/escola/series", { nome });
      setShowForm(false); setEditing(null); setNome(""); loadData();
    } catch (err: unknown) { alert(getApiErrorMessage(err, "Erro ao salvar")); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja remover esta série?")) return;
    try { await api.delete(`/escola/series/${id}`); loadData(); }
    catch (err: unknown) { alert(getApiErrorMessage(err, "Erro ao remover")); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Séries</h1>
        <Button onClick={() => { setEditing(null); setNome(""); setShowForm(true); }}><Plus className="w-4 h-4" /> Nova Série</Button>
      </div>
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <DataTable columns={[{ key: "id", label: "ID" }, { key: "nome", label: "Série" }, { key: "turmas", label: "Turmas", render: (s: SimpleEntity) => s._count?.turmas ?? 0 }]} data={items} loading={loading}
          actions={(s: SimpleEntity) => (
            <div className="flex gap-1 justify-end">
              <button onClick={() => { setEditing(s); setNome(s.nome); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-primary rounded transition"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          )} />
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Editar Série" : "Nova Série"}</h2>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Nome *</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30" /></div>
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

export function PeriodosPage() {
  const [items, setItems] = useState<SimpleEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SimpleEntity | null>(null);
  const [nome, setNome] = useState("");

  const loadData = async () => {
    setLoading(true);
    try { const res = await api.get("/escola/periodos"); setItems(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/escola/periodos/${editing.id}`, { nome });
      else await api.post("/escola/periodos", { nome });
      setShowForm(false); setEditing(null); setNome(""); loadData();
    } catch (err: unknown) { alert(getApiErrorMessage(err, "Erro ao salvar")); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Períodos</h1>
        <Button onClick={() => { setEditing(null); setNome(""); setShowForm(true); }}><Plus className="w-4 h-4" /> Novo Período</Button>
      </div>
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <DataTable columns={[{ key: "id", label: "ID" }, { key: "nome", label: "Período" }]} data={items} loading={loading}
          actions={(p: SimpleEntity) => (
            <div className="flex gap-1 justify-end">
              <button onClick={() => { setEditing(p); setNome(p.nome); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-primary rounded transition"><Pencil className="w-4 h-4" /></button>
            </div>
          )} />
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Editar Período" : "Novo Período"}</h2>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Nome *</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30" /></div>
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
