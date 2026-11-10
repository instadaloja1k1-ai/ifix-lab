// @ts-nocheck
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-base-950">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
