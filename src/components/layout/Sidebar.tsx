// @ts-nocheck
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  BoxesIcon,
  ChartColumnIcon,
  ClipboardListIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  SmartphoneIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
  WrenchIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/format';
import { canAccess } from '../../lib/permissions';
import { ChangeMyPinModal } from '../../pages/configuracoes/UserAccessModals';

export const NAV_ITEMS = [
  {
    to: `/`,
    label: `Dashboard`,
    icon: LayoutDashboardIcon,
    end: true,
    module: `dashboard`,
  },
  {
    to: `/clientes`,
    label: `Clientes e Lojistas`,
    icon: UsersIcon,
    module: `clientes`,
  },
  {
    to: `/aparelhos`,
    label: `Aparelhos`,
    icon: SmartphoneIcon,
    module: `aparelhos`,
  },
  {
    to: `/ordens-servico`,
    label: `Ordens de Serviço`,
    icon: ClipboardListIcon,
    module: `ordens-servico`,
  },
  {
    to: `/estoque`,
    label: `Estoque`,
    icon: BoxesIcon,
    module: `estoque`,
  },
  {
    to: `/fornecedores`,
    label: `Fornecedores e Compras`,
    icon: TruckIcon,
    module: `fornecedores`,
  },
  {
    to: `/financeiro`,
    label: `Financeiro`,
    icon: WalletIcon,
    module: `financeiro`,
  },
  {
    to: `/relatorios`,
    label: `Relatórios`,
    icon: ChartColumnIcon,
    module: `relatorios`,
  },
  {
    to: `/configuracoes`,
    label: `Configurações`,
    icon: SettingsIcon,
    module: `configuracoes`,
  },
];
export function Sidebar() {
  let { profile: e, user: t, signOut: n, configError: r } = useAuth(),
    i = e?.role ?? null,
    a = r || !e ? NAV_ITEMS : NAV_ITEMS.filter((e) => canAccess(i, e.module));
  const [showPinModal, setShowPinModal] = useState(false);
  return (
    <aside className="w-60 shrink-0 bg-base-900 border-r border-base-800 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-base-800">
        <div className="w-8 h-8 rounded-lg bg-accent-500/10 border border-accent-500/30 flex items-center justify-center">
          <WrenchIcon className="w-4 h-4 text-accent-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-base-100 leading-none">iFix Lab</p>
          <p className="text-[11px] text-base-500 leading-none mt-0.5">Gestão do laboratório</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {a.map((e) => (
          <NavLink
            to={e.to}
            end={e.end}
            className={({ isActive: e }) =>
              clsx(
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors`,
                e
                  ? `bg-accent-500/10 text-accent-300 font-medium`
                  : `text-base-400 hover:text-base-200 hover:bg-base-850`,
              )
            }
            key={e.to}
          >
            <e.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{e.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-base-800 p-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-base-800 flex items-center justify-center text-xs font-medium text-base-300 shrink-0">
          {getInitials(e?.full_name || t?.email || `?`)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-base-200 truncate">{e?.full_name || t?.email}</p>
          <p className="text-[11px] text-base-500 truncate capitalize">{e?.role ?? `—`}</p>
        </div>
        <button
          onClick={() => setShowPinModal(true)}
          title="Alterar meu PIN"
          className="w-7 h-7 rounded-md flex items-center justify-center text-base-500 hover:text-accent-300 hover:bg-accent-500/10 transition-colors"
        >
          <KeyRoundIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => n()}
          title="Sair"
          className="w-7 h-7 rounded-md flex items-center justify-center text-base-500 hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOutIcon className="w-4 h-4" />
        </button>
      </div>
      {showPinModal && <ChangeMyPinModal onClose={() => setShowPinModal(false)} />}
    </aside>
  );
}
