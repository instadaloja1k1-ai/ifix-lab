import { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDate, todayISO } from '../../lib/format';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

function monthBounds(month: string) {
  const [y, m] = month.split('-').map(Number);
  return { start: new Date(Date.UTC(y, m - 1, 1, 3)), end: new Date(Date.UTC(y, m, 1, 3)) };
}

const pct = (v: number) => `${(Math.round(v * 10) / 10).toLocaleString('pt-BR')}%`;

/** Margem real por OS entregue no mês e comissão de cada técnico. */
export function ProdutividadeSection() {
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const [orders, setOrders] = useState<Row[]>([]);
  const [delivered, setDelivered] = useState<Map<string, string>>(new Map());
  const [profiles, setProfiles] = useState<Map<string, Row>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const [o, h, p] = await Promise.all([
        supabase.from('service_orders').select('*').eq('status', 'entregue'),
        supabase
          .from('service_status_history')
          .select('service_order_id, changed_at')
          .eq('to_status', 'entregue'),
        supabase.from('profiles').select('*'),
      ]);
      const err = [o, h, p].find((x) => x.error)?.error;
      if (err) setError(err.message);
      const map = new Map<string, string>();
      for (const row of (h.data ?? []) as Row[]) {
        const prev = map.get(row.service_order_id);
        if (!prev || row.changed_at > prev) map.set(row.service_order_id, row.changed_at);
      }
      setOrders((o.data ?? []) as Row[]);
      setDelivered(map);
      setProfiles(new Map(((p.data ?? []) as Row[]).map((x) => [x.id, x])));
      setLoading(false);
    })();
  }, []);

  const rows = useMemo(() => {
    const { start, end } = monthBounds(month);
    return orders
      .map((o): Row => {
        const total = Number(o.total_value || 0);
        const cost = Number(o.actual_cost || 0);
        return {
          ...o,
          delivered_at: delivered.get(o.id) ?? o.updated_at,
          total,
          cost,
          margin: total - cost,
          marginPct: total > 0 ? ((total - cost) / total) * 100 : 0,
        };
      })
      .filter((o) => {
        const t = new Date(o.delivered_at);
        return t >= start && t < end;
      })
      .sort((a, b) => a.margin - b.margin);
  }, [orders, delivered, month]);

  const byTech = useMemo(() => {
    const m = new Map<string, Row>();
    for (const o of rows) {
      const key = o.technician_id ?? 'sem';
      const p = o.technician_id ? profiles.get(o.technician_id) : null;
      const cur =
        m.get(key) ??
        ({
          name: p?.full_name ?? 'Sem técnico definido',
          rate: Number(p?.commission_percent ?? 0),
          count: 0,
          total: 0,
          labor: 0,
          margin: 0,
        } as Row);
      cur.count += 1;
      cur.total += o.total;
      cur.labor += Number(o.labor_value || 0);
      cur.margin += o.margin;
      m.set(key, cur);
    }
    return [...m.values()]
      .map((t): Row => ({ ...t, commission: (t.labor * t.rate) / 100 }))
      .sort((a, b) => b.total - a.total);
  }, [rows, profiles]);

  const totals = rows.reduce(
    (s, o) => ({ total: s.total + o.total, cost: s.cost + o.cost, margin: s.margin + o.margin }),
    { total: 0, cost: 0, margin: 0 },
  );
  const totalCommission = byTech.reduce((s, t) => s + t.commission, 0);
  const visible = showAll ? rows : rows.slice(0, 10);

  return (
    <div className="bg-base-900 border border-base-800 rounded-xl p-4 sm:p-5 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-base-100">
            Margem por OS e comissão por técnico
          </h2>
          <p className="text-xs text-base-500 mt-0.5">
            OS entregues no mês. Margem = valor cobrado − custo das peças. Comissão = % do técnico
            sobre a mão de obra.
          </p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          className="bg-base-850 border border-base-700 rounded-lg px-3 py-1.5 text-sm text-base-200 outline-none"
        />
      </div>
      {error && <p className="text-sm text-danger mb-3">{error}</p>}
      {loading ? (
        <p className="text-sm text-base-500">Carregando…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-base-500 py-4">Nenhuma OS entregue neste mês.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              ['Faturado', formatCurrency(totals.total)],
              ['Custo de peças', formatCurrency(totals.cost)],
              [
                'Margem',
                `${formatCurrency(totals.margin)} (${pct(totals.total ? (totals.margin / totals.total) * 100 : 0)})`,
              ],
              ['Comissões', formatCurrency(totalCommission)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-base-800 bg-base-850/50 px-3 py-2.5"
              >
                <p className="text-xs text-base-500">{label}</p>
                <p className="text-sm font-semibold text-base-100 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <p className="text-xs font-medium text-base-400 mb-2">Por técnico</p>
          <div className="border border-base-800 rounded-lg overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-base-500 border-b border-base-800">
                  <th className="px-3 py-2 font-medium">Técnico</th>
                  <th className="px-3 py-2 font-medium text-right">OS</th>
                  <th className="px-3 py-2 font-medium text-right">Faturado</th>
                  <th className="px-3 py-2 font-medium text-right">Mão de obra</th>
                  <th className="px-3 py-2 font-medium text-right">Margem</th>
                  <th className="px-3 py-2 font-medium text-right">Comissão</th>
                </tr>
              </thead>
              <tbody>
                {byTech.map((t) => (
                  <tr key={t.name} className="border-b border-base-800/60 last:border-0">
                    <td className="px-3 py-2 text-base-200">{t.name}</td>
                    <td className="px-3 py-2 text-right text-base-400">{t.count}</td>
                    <td className="px-3 py-2 text-right text-base-300">
                      {formatCurrency(t.total)}
                    </td>
                    <td className="px-3 py-2 text-right text-base-300">
                      {formatCurrency(t.labor)}
                    </td>
                    <td className="px-3 py-2 text-right text-base-300">
                      {formatCurrency(t.margin)}
                    </td>
                    <td className="px-3 py-2 text-right text-base-100 font-medium">
                      {t.rate > 0 ? (
                        <>
                          {formatCurrency(t.commission)}
                          <span className="block text-[11px] text-base-500 font-normal">
                            {pct(t.rate)} da mão de obra
                          </span>
                        </>
                      ) : (
                        <span className="text-base-500 font-normal text-xs">
                          Defina o % em Configurações
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs font-medium text-base-400 mb-2">
            OS do mês (menor margem primeiro)
          </p>
          <div className="border border-base-800 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-base-500 border-b border-base-800">
                  <th className="px-3 py-2 font-medium">OS</th>
                  <th className="px-3 py-2 font-medium">Entrega</th>
                  <th className="px-3 py-2 font-medium text-right">Cobrado</th>
                  <th className="px-3 py-2 font-medium text-right">Peças</th>
                  <th className="px-3 py-2 font-medium text-right">Margem</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} className="border-b border-base-800/60 last:border-0">
                    <td className="px-3 py-2 text-base-200">#{o.order_number}</td>
                    <td className="px-3 py-2 text-base-400">{formatDate(o.delivered_at)}</td>
                    <td className="px-3 py-2 text-right text-base-300">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="px-3 py-2 text-right text-base-400">{formatCurrency(o.cost)}</td>
                    <td
                      className={clsx(
                        'px-3 py-2 text-right font-medium',
                        o.margin < 0
                          ? 'text-danger'
                          : o.marginPct < 30
                            ? 'text-warning'
                            : 'text-success',
                      )}
                    >
                      {formatCurrency(o.margin)}{' '}
                      <span className="text-[11px] font-normal">({pct(o.marginPct)})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-2 text-xs text-accent-400 hover:text-accent-300"
            >
              {showAll ? 'Mostrar menos' : `Mostrar todas (${rows.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
