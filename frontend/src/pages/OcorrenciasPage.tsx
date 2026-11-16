import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../lib/api";
import type { Ocorrencia, PaginatedResponse, Usuario } from "../types";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function OcorrenciasPage() {
  const [data, setData] = useState<PaginatedResponse<Ocorrencia> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ocorrencia | null>(null);
  const [form, setForm] = useState({ assunto: "", descricao: "", alunoId: 0 });
  const [alunos, setAlunos] = useState<Usuario[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, aRes] = await Promise.all([
        api.get("/ocorrencias", { params: { page, limit: 15 } }),
        api.get("/usuarios", { params: { role: "ALUNO", limit: 100 } }),
      ]);
      setData(oRes.data);
      setAlunos(aRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/ocorrencias/${editing.id}`, form);
      else await api.post("/ocorrencias", form);
      setShowForm(false); setEditing(null); loadData();
    } catch (err: unknown) { alert(getApiErrorMessage(err, "Erro ao salvar")); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja remover esta ocorrência?")) return;
    try { await api.delete(`/ocorrencias/${id}`); loadData(); }
    catch (err: unknown) { alert(getApiErrorMessage(err, "Erro ao remover")); }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "assunto", label: "Assunto" },
    { key: "aluno", label: "Aluno", render: (o: Ocorrencia) => o.aluno ? `${o.aluno.nome} ${o.aluno.sobrenome}` : "-" },
    { key: "data", label: "Data", render: (o: Ocorrencia) => new Date(o.data).toLocaleDateString("pt-BR") },
    { key: "descricao", label: "Descrição", render: (o: Ocorrencia) => (o.descricao || "-").substring(0, 50) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Ocorrências</h1>
        <Button onClick={() => { setEditing(null); setForm({ assunto: "", descricao: "", alunoId: 0 }); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Nova Ocorrência
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <DataTable columns={columns} data={data?.data ?? []} loading={loading}
          actions={(o: Ocorrencia) => (
            <div className="flex gap-1 justify-end">
              <button onClick={() => { setEditing(o); setForm({ assunto: o.assunto, descricao: o.descricao || "", alunoId: o.alunoId }); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-primary rounded transition"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(o.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          )} />
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">{data.total} registro(s)</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
              <Button variant="ghost" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Editar Ocorrência" : "Nova Ocorrência"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Aluno *</label>
                <select value={form.alunoId} onChange={(e) => setForm({ ...form, alunoId: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none">
                  <option value={0}>Selecione...</option>
                  {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome} {a.sobrenome || ""}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Assunto *</label>
                <input value={form.assunto} onChange={(e) => setForm({ ...form, assunto: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Descrição</label>
                <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
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
