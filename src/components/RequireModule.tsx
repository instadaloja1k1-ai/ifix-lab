// @ts-nocheck
import { ShieldAlertIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MODULE_LABELS, ROLE_LABELS, canAccess } from '../lib/permissions';

export function RequireModule({ module: e, children: t }) {
  let { profile: n, configError: r } = useAuth();
  if (r) return <>{t}</>;
  let i = n?.role ?? null;
  return n && !canAccess(i, e) ? (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-12 h-12 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center mb-4">
        <ShieldAlertIcon className="w-6 h-6 text-danger" />
      </div>
      <h3 className="text-sm font-medium text-base-200">Acesso restrito</h3>
      <p className="text-sm text-base-500 mt-1 max-w-md">
        {'O perfil '}
        <span className="text-base-300 font-medium">{i ? ROLE_LABELS[i] : `—`}</span>
        {' não tem acesso ao módulo "'}
        {MODULE_LABELS[e]}". Se você precisa desta tela, peça a um administrador para revisar as
        permissões em Configurações.
      </p>
    </div>
  ) : (
    <>{t}</>
  );
}
