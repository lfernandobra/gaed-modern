import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  AlertTriangle,
  Image,
  LogOut,
  School,
  Calendar,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ROLE_LABELS } from "../../types";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", roles: null },
  {
    to: "/usuarios",
    icon: Users,
    label: "Usuários",
    roles: ["ADMIN", "GESTOR", "SECRETARIA"],
  },
  {
    to: "/turmas",
    icon: School,
    label: "Turmas",
    roles: ["ADMIN", "GESTOR", "SECRETARIA", "PROFESSOR"],
  },
  {
    to: "/disciplinas",
    icon: BookOpen,
    label: "Disciplinas",
    roles: ["ADMIN", "GESTOR", "SECRETARIA", "PROFESSOR"],
  },
  {
    to: "/series",
    icon: GraduationCap,
    label: "Séries",
    roles: ["ADMIN", "GESTOR", "SECRETARIA"],
  },
  {
    to: "/periodos",
    icon: Calendar,
    label: "Períodos",
    roles: ["ADMIN", "GESTOR", "SECRETARIA"],
  },
  {
    to: "/boletins",
    icon: ClipboardList,
    label: "Boletins",
    roles: ["ADMIN", "GESTOR", "SECRETARIA", "PROFESSOR", "RESPONSAVEL", "ALUNO"],
  },
  {
    to: "/tarefas",
    icon: FileText,
    label: "Tarefas",
    roles: ["ADMIN", "GESTOR", "PROFESSOR", "ALUNO"],
  },
  {
    to: "/ocorrencias",
    icon: AlertTriangle,
    label: "Ocorrências",
    roles: ["ADMIN", "GESTOR", "SECRETARIA", "PROFESSOR", "RESPONSAVEL"],
  },
  {
    to: "/galeria",
    icon: Image,
    label: "Galeria",
    roles: null,
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="w-64 min-h-screen bg-sidebar-background text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary-foreground tracking-tight">
          GAED Modern
        </h1>
        <p className="text-xs text-sidebar-muted-foreground mt-1">
          Sistema de Gestão Escolar
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-white text-sm font-medium">
            {user?.nome.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.nome} {user?.sobrenome}
            </p>
            <p className="text-xs text-sidebar-muted-foreground">
              {user?.role ? ROLE_LABELS[user.role] : ""}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-muted-foreground hover:text-red-400 hover:bg-sidebar-accent/50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
