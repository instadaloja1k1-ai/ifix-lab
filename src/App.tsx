// @ts-nocheck
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequireModule } from './components/RequireModule';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AparelhosPage } from './pages/Aparelhos';
import { ClientesPage } from './pages/Clientes';
import { ConfiguracoesPage } from './pages/Configuracoes';
import { DashboardPage } from './pages/Dashboard';
import { EstoquePage } from './pages/Estoque';
import { FinanceiroPage } from './pages/Financeiro';
import { FornecedoresPage } from './pages/Fornecedores';
import { ImprimirOSPage } from './pages/ImprimirOS';
import { LoginPage } from './pages/Login';
import { OrdensServicoPage } from './pages/OrdensServico';
import { RelatoriosPage } from './pages/Relatorios';
import { ResetPasswordPage } from './pages/ResetPassword';

export function AppRoutes() {
  let { passwordRecovery: e } = useAuth();
  return e ? (
    <ResetPasswordPage />
  ) : (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/imprimir/os/:id"
        element={
          <ProtectedRoute>
            <ImprimirOSPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="clientes"
          element={
            <RequireModule module="clientes">
              <ClientesPage />
            </RequireModule>
          }
        />
        <Route
          path="aparelhos"
          element={
            <RequireModule module="aparelhos">
              <AparelhosPage />
            </RequireModule>
          }
        />
        <Route
          path="ordens-servico"
          element={
            <RequireModule module="ordens-servico">
              <OrdensServicoPage />
            </RequireModule>
          }
        />
        <Route
          path="estoque"
          element={
            <RequireModule module="estoque">
              <EstoquePage />
            </RequireModule>
          }
        />
        <Route
          path="fornecedores"
          element={
            <RequireModule module="fornecedores">
              <FornecedoresPage />
            </RequireModule>
          }
        />
        <Route
          path="financeiro"
          element={
            <RequireModule module="financeiro">
              <FinanceiroPage />
            </RequireModule>
          }
        />
        <Route
          path="relatorios"
          element={
            <RequireModule module="relatorios">
              <RelatoriosPage />
            </RequireModule>
          }
        />
        <Route
          path="configuracoes"
          element={
            <RequireModule module="configuracoes">
              <ConfiguracoesPage />
            </RequireModule>
          }
        />
      </Route>
    </Routes>
  );
}
export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
