import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends { id: number }>({
  columns,
  data,
  loading,
  onRowClick,
  actions,
  emptyMessage = "Nenhum registro encontrado.",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "border-b border-border/50 transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/50"
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-sm">
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
              {actions && (
                <td className="py-3 px-4 text-right">{actions(item)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
