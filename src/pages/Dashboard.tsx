// @ts-nocheck
import { useEffect, useState } from 'react';
import {
  ClipboardListIcon,
  ClockIcon,
  SmartphoneIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  WalletIcon,
} from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { formatCurrency, todayISO, startOfTodayISO } from '../lib/format';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const EMPTY_STATS = {
  devicesToday: 0,
  openOrders: 0,
  inRepair: 0,
  waitingParts: 0,
  readyForPickup: 0,
  lateOrders: 0,
  revenuePeriod: 0,
  receivedPeriod: 0,
};
export const OPEN_STATUSES = [
  `recebido`,
  `em_triagem`,
  `em_diagnostico`,
  `aguardando_orcamento`,
  `aguardando_aprovacao`,
  `aguardando_pecas`,
  `aprovado_reparo`,
  `em_reparo`,
  `em_testes`,
];
export function DashboardPage() {
  let [e, t] = useState(EMPTY_STATS),
    [n, r] = useState(true),
    [i, a] = useState(null);
  useEffect(() => {
    isSupabaseConfigured ? o() : r(false);
  }, []);
  async function o() {
    (r(true), a(null));
    try {
      let e = todayISO(),
        n = `${e.slice(0, 7)}-01T00:00:00`,
        [r, i, a, o, s, c, l, u] = await Promise.all([
          supabase
            .from(`devices`)
            .select(`id`, {
              count: `exact`,
              head: true,
            })
            .gte(`entry_at`, e),
          supabase
            .from(`service_orders`)
            .select(`id`, {
              count: `exact`,
              head: true,
            })
            .in(`status`, OPEN_STATUSES),
          supabase
            .from(`service_orders`)
            .select(`id`, {
              count: `exact`,
              head: true,
            })
            .eq(`status`, `em_reparo`),
          supabase
            .from(`service_orders`)
            .select(`id`, {
              count: `exact`,
              head: true,
            })
            .eq(`status`, `aguardando_pecas`),
          supabase
            .from(`service_orders`)
            .select(`id`, {
              count: `exact`,
              head: true,
            })
            .eq(`status`, `pronto_retirada`),
          supabase
            .from(`service_orders`)
            .select(`id`, {
              count: `exact`,
              head: true,
            })
            .in(`status`, OPEN_STATUSES)
            .lt(`due_at`, startOfTodayISO()),
          supabase.from(`service_orders`).select(`total_value`),
          supabase
            .from(`payments`)
            .select(`amount`)
            .eq(`direction`, `recebimento`)
            .gte(`paid_at`, n),
        ]),
        d = [r, i, a, o, s, c, l, u].find((e) => e.error);
      if (d?.error) throw d.error;
      let f = (l.data ?? []).reduce((e, t) => e + (t.total_value || 0), 0),
        p = (u.data ?? []).reduce((e, t) => e + (t.amount || 0), 0);
      t({
        devicesToday: r.count ?? 0,
        openOrders: i.count ?? 0,
        inRepair: a.count ?? 0,
        waitingParts: o.count ?? 0,
        readyForPickup: s.count ?? 0,
        lateOrders: c.count ?? 0,
        revenuePeriod: f,
        receivedPeriod: p,
      });
    } catch (e) {
      a(e instanceof Error ? e.message : `Erro ao carregar indicadores.`);
    } finally {
      r(false);
    }
  }
  return isSupabaseConfigured ? (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do laboratório — todos os números abaixo vêm do banco de dados real."
      />
      {i && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {i}
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Aparelhos recebidos hoje"
          value={String(e.devicesToday)}
          icon={SmartphoneIcon}
          loading={n}
        />
        <StatCard
          label="Ordens de serviço abertas"
          value={String(e.openOrders)}
          icon={ClipboardListIcon}
          loading={n}
        />
        <StatCard label="Em reparo" value={String(e.inRepair)} icon={ClockIcon} loading={n} />
        <StatCard
          label="Aguardando peças"
          value={String(e.waitingParts)}
          icon={ClockIcon}
          tone="warning"
          loading={n}
        />
        <StatCard
          label="Prontos para retirada"
          value={String(e.readyForPickup)}
          icon={ClipboardListIcon}
          tone="success"
          loading={n}
        />
        <StatCard
          label="Ordens atrasadas"
          value={String(e.lateOrders)}
          icon={TriangleAlertIcon}
          tone="danger"
          loading={n}
        />
        <StatCard
          label="Faturamento (todas as OS)"
          value={formatCurrency(e.revenuePeriod)}
          icon={WalletIcon}
          loading={n}
        />
        <StatCard
          label="Recebido no mês"
          value={formatCurrency(e.receivedPeriod)}
          icon={WalletIcon}
          tone="success"
          loading={n}
        />
        <StatCard
          label="Ticket médio"
          value={formatCurrency(e.openOrders ? e.revenuePeriod / Math.max(1, e.openOrders) : 0)}
          icon={TrendingUpIcon}
          loading={n}
        />
      </div>
      {!n && e.openOrders === 0 && e.devicesToday === 0 && (
        <EmptyState
          icon={ClipboardListIcon}
          title="Nenhum dado cadastrado ainda"
          description="Os indicadores acima são calculados em tempo real a partir do banco. Cadastre clientes, aparelhos e ordens de serviço para começar a ver os números do laboratório aqui."
        />
      )}
      <p className="text-xs text-base-500 mt-6">
        Filtros por período (dia/semana/mês/ano/personalizado) e os gráficos de faturamento, lucro e
        ranking de lojistas entram na Fase 5 (Relatórios), quando houver OS e pagamentos suficientes
        para análise.
      </p>
    </div>
  ) : (
    <div>
      <PageHeader title="Dashboard" description="Visão geral do laboratório" />
      <EmptyState
        icon={TriangleAlertIcon}
        title="Conecte o Supabase para ver dados reais"
        description="Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env e rode a migration supabase/migrations/0001_init.sql no seu projeto."
      />
    </div>
  );
}
