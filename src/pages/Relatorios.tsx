// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import {
  ChartColumnIcon,
  ClipboardListIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  TrophyIcon,
  WalletIcon,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { formatCurrency } from '../lib/format';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { OS_STATUS_LABELS } from './OrdensServico';

export const CHART_COLORS = {
  accent: `#d4a017`,
  accentLight: `#e6b82f`,
  success: `#22c55e`,
  danger: `#ef4444`,
  info: `#3b82f6`,
  warning: `#f59e0b`,
  base300: `#c4c4c9`,
  base400: `#9a9aa0`,
  base700: `#323236`,
};
export const STATUS_COLORS = {
  recebido: `#9a9aa0`,
  em_triagem: `#9a9aa0`,
  em_diagnostico: `#3b82f6`,
  aguardando_orcamento: `#f59e0b`,
  aguardando_aprovacao: `#f59e0b`,
  aguardando_pecas: `#f59e0b`,
  aprovado_reparo: `#3b82f6`,
  em_reparo: `#3b82f6`,
  em_testes: `#3b82f6`,
  pronto_retirada: `#d4a017`,
  aguardando_entrega: `#d4a017`,
  entregue: `#22c55e`,
  sem_reparo: `#ef4444`,
  cancelado: `#ef4444`,
  em_garantia: `#3b82f6`,
};
export const PERIOD_OPTIONS = [
  {
    label: `Últimos 3 meses`,
    months: 3,
  },
  {
    label: `Últimos 6 meses`,
    months: 6,
  },
  {
    label: `Últimos 12 meses`,
    months: 12,
  },
];
export function monthKey(e) {
  return e.slice(0, 7);
}
export function monthLabel(e) {
  let [t, n] = e.split(`-`).map(Number),
    r = new Date(t, n - 1, 1);
  return new Intl.DateTimeFormat(`pt-BR`, {
    month: `short`,
    year: `2-digit`,
  }).format(r);
}
export function RelatoriosPage() {
  let [e, t] = useState([]),
    [n, r] = useState([]),
    [i, a] = useState(true),
    [o, s] = useState(null),
    [c, l] = useState(6);
  useEffect(() => {
    isSupabaseConfigured ? u() : a(false);
  }, []);
  async function u() {
    (a(true), s(null));
    let [e, n] = await Promise.all([
        supabase.from(`service_orders`).select(`*`),
        supabase.from(`clients`).select(`*`),
      ]),
      i = [e, n].find((e) => e.error);
    (i?.error && s(i.error.message), t(e.data ?? []), r(n.data ?? []), a(false));
  }
  let d = useMemo(() => new Map(n.map((e) => [e.id, e])), [n]),
    f = useMemo(() => {
      let e = new Date();
      return (e.setDate(1), e.setMonth(e.getMonth() - (c - 1)), e);
    }, [c]),
    p = useMemo(() => e.filter((e) => new Date(e.created_at) >= f), [e, f]),
    m = useMemo(() => {
      let e = new Map(),
        t = new Date(f);
      for (let n = 0; n < c; n++) {
        let n = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, `0`)}`;
        (e.set(n, {
          revenue: 0,
          profit: 0,
          count: 0,
        }),
          t.setMonth(t.getMonth() + 1));
      }
      for (let t of p) {
        let n = monthKey(t.created_at),
          r = e.get(n);
        r &&
          ((r.revenue += t.total_value),
          (r.profit += t.total_value - t.actual_cost),
          (r.count += 1));
      }
      return Array.from(e.entries()).map(([e, t]) => ({
        month: monthLabel(e),
        faturamento: Math.round(t.revenue * 100) / 100,
        lucro: Math.round(t.profit * 100) / 100,
        quantidade: t.count,
      }));
    }, [p, f, c]),
    h = useMemo(() => {
      let e = p.reduce((e, t) => e + t.total_value, 0),
        t = p.reduce((e, t) => e + t.actual_cost, 0),
        n = p.length;
      return {
        revenue: e,
        profit: e - t,
        count: n,
        ticket: n > 0 ? e / n : 0,
      };
    }, [p]),
    g = useMemo(() => {
      let e = new Map();
      for (let t of p) e.set(t.status, (e.get(t.status) ?? 0) + 1);
      return Array.from(e.entries())
        .map(([e, t]) => ({
          status: e,
          label: OS_STATUS_LABELS[e],
          value: t,
        }))
        .sort((e, t) => t.value - e.value);
    }, [p]),
    _ = useMemo(() => {
      let e = new Map();
      for (let t of p) {
        let n = d.get(t.client_id);
        if (!n || n.kind !== `lojista`) continue;
        let r = e.get(n.id) ?? {
          name: n.name,
          revenue: 0,
          count: 0,
        };
        ((r.revenue += t.total_value), (r.count += 1), e.set(n.id, r));
      }
      return Array.from(e.values())
        .sort((e, t) => t.revenue - e.revenue)
        .slice(0, 10);
    }, [p, d]);
  return isSupabaseConfigured ? (
    <div>
      <PageHeader
        title="Relatórios"
        description="Faturamento, lucro e ranking de lojistas calculados a partir das ordens de serviço reais."
        action={
          <select
            value={c}
            onChange={(e) => l(Number(e.target.value))}
            className="bg-base-900 border border-base-800 rounded-lg px-3 py-2 text-sm text-base-200 outline-none"
          >
            {PERIOD_OPTIONS.map((e) => (
              <option value={e.months} key={e.months}>
                {e.label}
              </option>
            ))}
          </select>
        }
      />
      {o && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {o}
        </div>
      )}
      {i ? (
        <div className="p-6 text-sm text-base-500">Carregando…</div>
      ) : e.length === 0 ? (
        <EmptyState
          icon={ChartColumnIcon}
          title="Ainda não há ordens de serviço para gerar relatórios"
          description="Os gráficos abaixo aparecem automaticamente conforme ordens de serviço forem criadas."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Faturamento no período"
              value={formatCurrency(h.revenue)}
              icon={WalletIcon}
            />
            <StatCard
              label="Lucro estimado no período"
              value={formatCurrency(h.profit)}
              icon={TrendingUpIcon}
              tone="success"
            />
            <StatCard
              label="Ticket médio"
              value={formatCurrency(h.ticket)}
              icon={ChartColumnIcon}
            />
            <StatCard label="OS no período" value={String(h.count)} icon={ClipboardListIcon} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-base-900 border border-base-800 rounded-xl p-4">
              <p className="text-sm font-medium text-base-200 mb-3">Faturamento e lucro por mês</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={m}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.base700} />
                    <XAxis dataKey="month" stroke={CHART_COLORS.base400} fontSize={12} />
                    <YAxis
                      stroke={CHART_COLORS.base400}
                      fontSize={12}
                      tickFormatter={(e) => (e >= 1e3 ? `${(e / 1e3).toFixed(0)}k` : String(e))}
                    />
                    <Tooltip
                      contentStyle={{
                        background: `#121214`,
                        border: `1px solid #1f1f23`,
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(e) => formatCurrency(Number(e))}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="faturamento"
                      name="Faturamento"
                      fill={CHART_COLORS.accent}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      dataKey="lucro"
                      name="Lucro"
                      stroke={CHART_COLORS.success}
                      strokeWidth={2}
                      dot={{
                        r: 3,
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-base-900 border border-base-800 rounded-xl p-4">
              <p className="text-sm font-medium text-base-200 mb-3">OS por status no período</p>
              {g.length === 0 ? (
                <p className="text-xs text-base-500">Sem dados no período selecionado.</p>
              ) : (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={g}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={40}
                        outerRadius={70}
                      >
                        {g.map((e) => (
                          <Cell fill={STATUS_COLORS[e.status]} key={e.status} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: `#121214`,
                          border: `1px solid #1f1f23`,
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="mt-2 space-y-1 max-h-28 overflow-y-auto">
                {g.map((e) => (
                  <div className="flex items-center justify-between text-xs" key={e.status}>
                    <span className="flex items-center gap-1.5 text-base-400">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: STATUS_COLORS[e.status],
                        }}
                      />
                      {e.label}
                    </span>
                    <span className="text-base-300">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-base-900 border border-base-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-base-800 flex items-center gap-2">
              <TrophyIcon className="w-4 h-4 text-accent-400" />
              <p className="text-sm font-medium text-base-200">
                Ranking de lojistas (B2B) por faturamento no período
              </p>
            </div>
            {_.length === 0 ? (
              <EmptyState
                icon={TrophyIcon}
                title="Nenhuma OS de lojista no período"
                description="O ranking aparece quando houver ordens de serviço vinculadas a clientes do tipo lojista."
              />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-base-500 border-b border-base-800">
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">Lojista</th>
                    <th className="px-4 py-2 font-medium">OS no período</th>
                    <th className="px-4 py-2 font-medium">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {_.map((e, t) => (
                    <tr className="border-b border-base-800/60 last:border-0" key={e.name + t}>
                      <td className="px-4 py-2 text-base-500">{t + 1}</td>
                      <td className="px-4 py-2 text-base-200">{e.name}</td>
                      <td className="px-4 py-2 text-base-400">{e.count}</td>
                      <td className="px-4 py-2 text-base-100 font-medium">
                        {formatCurrency(e.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="text-xs text-base-500 mt-4">
            Faturamento considera o valor total de todas as OS criadas no período (independente do
            status). Lucro é estimado como faturamento menos o custo real das peças lançadas.
            Exportação (PDF/planilha) e filtros por técnico/categoria entram em uma próxima etapa.
          </p>
        </>
      )}
    </div>
  ) : (
    <div>
      <PageHeader title="Relatórios" />
      <EmptyState
        icon={TriangleAlertIcon}
        title="Conecte o Supabase para usar este módulo"
        description="Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env."
      />
    </div>
  );
}
