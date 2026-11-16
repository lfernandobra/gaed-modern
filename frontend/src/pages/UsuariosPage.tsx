import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../lib/api";
import type { Usuario, PaginatedResponse } from "../types";
import { ROLE_LABELS } from "../types";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/useAuth";

export function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<PaginatedResponse<Usuario> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState({
    login: "",
    senha: "",
    nome: "",
    sobrenome: "",
    email: "",
    cpf: "",
    telefone: "",
    role: "ALUNO" as string,
  });

  const canEdit = currentUser && ["ADMIN", "GESTOR", "SECRETARIA"].includes(currentUser.role);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (activeSearch) params.search = activeSearch;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get("/usuarios", { params });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, activeSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = () => {
    setPage(1);
    if (activeSearch === search && page === 1) {
      void loadData();
    } else {
      setActiveSearch(search);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/usuarios/${editing.id}`, form);
      } else {
        await api.post("/usuarios", { ...form, senha: form.senha || "123456" });
      }
      setShowForm(false);
      setEditing(null);
      setForm({ login: "", senha: "", nome: "", sobrenome: "", email: "", cpf: "", telefone: "", role: "ALUNO" });
      loadData();
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Erro ao salvar"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja desativar este usuário?")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      loadData();
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Erro ao desativar"));
    }
  };

  const openEdit = (u: Usuario) => {
    setEditing(u);
    setForm({
      login: u.login,
      senha: "",
      nome: u.nome,
      sobrenome: u.sobrenome || "",
      email: u.email || "",
      cpf: u.cpf || "",
      telefone: u.telefone || "",
      role: u.role,
    });
    setShowForm(true);
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "nome",
      label: "Nome",
      render: (u: Usuario) => `${u.nome} ${u.sobrenome || ""}`.trim(),
    },
    { key: "login", label: "Login" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Tipo",
      render: (u: Usuario) => (
        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
          {ROLE_LABELS[u.role]}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (u: Usuario) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${u.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {u.status ? "Ativo" : "Inativo"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
        {canEdit && (
          <Button
            onClick={() => {
              setEditing(null);
              setForm({ login: "", senha: "", nome: "", sobrenome: "", email: "", cpf: "", telefone: "", role: "ALUNO" });
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" /> Novo Usuário
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, login ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-border rounded-lg text-sm outline-none"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={handleSearch}>
          Buscar
        </Button>
      </div>

      {/* Tabela */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          loading={loading}
          actions={
            canEdit
              ? (u: Usuario) => (
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => openEdit(u)}
                      className="p-1.5 text-muted-foreground hover:text-primary rounded transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              : undefined
          }
        />
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {data.total} registro(s) - Página {data.page} de {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Anterior
              </Button>
              <Button variant="ghost" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "Editar Usuário" : "Novo Usuário"}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Nome *</label>
                  <input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Sobrenome</label>
                  <input
                    value={form.sobrenome}
                    onChange={(e) => setForm({ ...form, sobrenome: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Login *</label>
                  <input
                    value={form.login}
                    onChange={(e) => setForm({ ...form, login: e.target.value })}
                    disabled={!!editing}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {editing ? "Nova Senha (deixe vazio para manter)" : "Senha *"}
                  </label>
                  <input
                    type="password"
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">CPF</label>
                  <input
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Telefone</label>
                  <input
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="secondary" onClick={() => { setShowForm(false); setEditing(null); }}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
