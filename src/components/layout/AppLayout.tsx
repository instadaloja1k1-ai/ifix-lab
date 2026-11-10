import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MenuIcon, WrenchIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Fecha o menu do celular ao trocar de tela.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-screen bg-base-950">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 min-h-14 pt-[env(safe-area-inset-top)] px-4 bg-base-900/95 backdrop-blur border-b border-base-800">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            className="w-11 h-11 -ml-2 rounded-lg flex items-center justify-center text-base-300 hover:bg-base-850"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-accent-500/10 border border-accent-500/30 flex items-center justify-center">
            <WrenchIcon className="w-3.5 h-3.5 text-accent-400" />
          </div>
          <p className="text-sm font-semibold text-base-100">iFix Lab</p>
        </header>
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
