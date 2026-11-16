import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/useAuth";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UsuariosPage } from "./pages/UsuariosPage";
import { TurmasPage } from "./pages/TurmasPage";
import { DisciplinasPage } from "./pages/DisciplinasPage";
import { SeriesPage, PeriodosPage } from "./pages/SeriesPeriodosPage";
import { BoletinsPage } from "./pages/BoletinsPage";
import { TarefasPage } from "./pages/TarefasPage";
import { OcorrenciasPage } from "./pages/OcorrenciasPage";
import { GaleriaPage } from "./pages/GaleriaPage";
import type { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="turmas" element={<TurmasPage />} />
            <Route path="disciplinas" element={<DisciplinasPage />} />
            <Route path="series" element={<SeriesPage />} />
            <Route path="periodos" element={<PeriodosPage />} />
            <Route path="boletins" element={<BoletinsPage />} />
            <Route path="tarefas" element={<TarefasPage />} />
            <Route path="ocorrencias" element={<OcorrenciasPage />} />
            <Route path="galeria" element={<GaleriaPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
