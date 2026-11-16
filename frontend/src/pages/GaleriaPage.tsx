import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../lib/api";
import type { Imagem, PaginatedResponse } from "../types";
import { Button } from "../components/ui/Button";
import { Plus, Trash2 } from "lucide-react";

export function GaleriaPage() {
  const [data, setData] = useState<PaginatedResponse<Imagem> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/imagens").then((res) => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja remover esta imagem?")) return;
    try { await api.delete(`/imagens/${id}`); window.location.reload(); }
    catch (err: unknown) { alert(getApiErrorMessage(err, "Erro ao remover")); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Galeria</h1>
        <Button><Plus className="w-4 h-4" /> Upload</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhuma imagem encontrada.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.data.map((img) => (
            <div key={img.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm group relative">
              <div className="aspect-square bg-muted flex items-center justify-center">
                <img src={img.url} alt={img.nome} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground truncate">{img.nome}</p>
                {img.descricao && <p className="text-xs text-muted-foreground truncate mt-0.5">{img.descricao}</p>}
              </div>
              <button onClick={() => handleDelete(img.id)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
