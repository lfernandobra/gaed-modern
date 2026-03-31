import { useEffect, useState } from "react";
import api from "../lib/api";
import { Button } from "../components/ui/Button";
import { Plus } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";

interface BoletimItem {
  id: number;
  bimestreId: number;
  bimestre?: { nome: string };
  _count?: { notas: number };
}

export function BoletinsPage() {
  const [boletins, setBoletins] = useState<BoletimItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/boletins").then((res) => { setBoletins(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "bimestre", label: "Bimestre", render: (b: BoletimItem) => b.bimestre?.nome || "-" },
    { key: "notas", label: "Notas registradas", render: (b: BoletimItem) => b._count?.notas ?? 0 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Boletins</h1>
        <Button><Plus className="w-4 h-4" /> Novo Boletim</Button>
      </div>
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <DataTable columns={columns} data={boletins} loading={loading} />
      </div>
    </div>
  );
}
