import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDate, todayISO } from '../lib/format';
import { OS_STATUS_LABELS } from './OrdensServico';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

function monthRange(month: string) {
  const [y, m] = month.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 3)); // 00:00 em Brasília
  const end = new Date(Date.UTC(y, m, 1, 3));
  return { start, end };
}

function monthTitle(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, 1),
  );
}

/** Fechamento mensal de um lojista: OS entregues no mês + contas em aberto. */
export function ImprimirExtratoPage() {
  const { clientId } = useParams();
  const [params, setParams] = useSearchParams();
  const month = params.get('mes') || todayISO().slice(0, 7);
  const [client, setClient] = useState<Row | null>(null);
  const [orders, setOrders] = useState<Row[]>([]);
  const [deliveredAt, setDeliveredAt] = useState<Map<string, string>>(new Map());
  const [devices, setDevices] = useState<Map<string, Row>>(new Map());
  const [receivables, setReceivables] = useState<Row[]>([]);
  const [paidByReceivable, setPaidByReceivable] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    (async () => {
      setLoading(true);
      setError(null);
      const [c, o, d, r] = await Promise.all([
        supabase.from('clients').select('*').eq('id', clientId).maybeSingle(),
        supabase
          .from('service_orders')
          .select('*')
          .eq('client_id', clientId)
          .eq('status', 'entregue'),
        supabase.from('devices').select('*').eq('client_id', clientId),
        supabase
          .from('accounts_receivable')
          .select('*')
          .eq('client_id', clientId)
          .order('due_date'),
      ]);
      const err = [c, o, d, r].find((x) => x.error)?.error;
      if (err) setError(err.message);
      const orderRows = o.data ?? [];
      const ids = orderRows.map((x) => x.id);
      const recIds = (r.data ?? []).map((x) => x.id);
      const [h, p] = await Promise.all([
        ids.length
          ? supabase
              .from('service_status_history')
              .select('service_order_id, changed_at')
              .in('service_order_id', ids)
              .eq('to_status', 'entregue')
          : Promise.resolve({ data: [] as Row[] }),
        recIds.length
          ? supabase.from('payments').select('receivable_id, amount').in('receivable_id', recIds)
          : Promise.resolve({ data: [] as Row[] }),
      ]);
      const delivered = new Map<string, string>();
      for (const row of h.data ?? []) {
        const prev = delivered.get(row.service_order_id);
        if (!prev || row.changed_at > prev) delivered.set(row.service_order_id, row.changed_at);
      }
      const paid = new Map<string, number>();
      for (const row of p.data ?? [])
        paid.set(row.receivable_id, (paid.get(row.receivable_id) ?? 0) + Number(row.amount));
      setClient(c.data ?? null);
      setOrders(orderRows);
      setDeliveredAt(delivered);
      setDevices(new Map((d.data ?? []).map((x) => [x.id, x])));
      setReceivables(r.data ?? []);
      setPaidByReceivable(paid);
      setLoading(false);
    })();
  }, [clientId]);

  const monthOrders = useMemo(() => {
    const { start, end } = monthRange(month);
    return orders
      .map((o): Row => ({ ...o, delivered_at: deliveredAt.get(o.id) ?? o.updated_at }))
      .filter((o) => {
        const t = new Date(o.delivered_at);
        return t >= start && t < end;
      })
      .sort((a, b) => a.delivered_at.localeCompare(b.delivered_at));
  }, [orders, deliveredAt, month]);

  const totalMonth = monthOrders.reduce((s, o) => s + Number(o.total_value || 0), 0);
  const openReceivables = receivables
    .filter((r) => r.status !== 'pago' && r.status !== 'cancelado')
    .map((r): Row => {
      const paid = paidByReceivable.get(r.id) ?? 0;
      return { ...r, paid, balance: Math.max(0, Number(r.gross_value) - paid) };
    })
    .filter((r) => r.balance > 0.004);
  const totalOpen = openReceivables.reduce((s, r) => s + r.balance, 0);
  const today = todayISO();

  if (loading)
    return <div className="p-10 text-center text-gray-500 bg-white min-h-screen">Carregando…</div>;
  if (error || !client)
    return (
      <div className="p-10 text-center text-red-600 bg-white min-h-screen">
        {error ?? 'Lojista não encontrado.'}
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto p-6 sm:p-8 text-gray-900 print:p-0">
        <style>{'@media print { @page { margin: 14mm; } .no-print { display: none; } }'}</style>
        <div className="no-print flex flex-wrap items-center gap-2 mb-6 p-3 rounded-lg bg-gray-100">
          <label className="text-sm text-gray-600">Mês:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setParams({ mes: e.target.value })}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
          />
          <button
            onClick={() => window.print()}
            className="ml-auto px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
          >
            Imprimir / salvar PDF
          </button>
        </div>

        <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold">iFix Lab</h1>
            <p className="text-sm text-gray-600">Fechamento mensal — {monthTitle(month)}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{client.company_name || client.name}</p>
            {client.company_name && <p className="text-gray-600">{client.name}</p>}
            {client.document && <p className="text-gray-600">{client.document}</p>}
            {client.payment_terms_days ? (
              <p className="text-gray-600">Prazo: {client.payment_terms_days} dias</p>
            ) : null}
          </div>
        </div>

        <h2 className="text-sm font-semibold mb-2">
          Serviços entregues no mês ({monthOrders.length})
        </h2>
        <table className="w-full text-sm border border-gray-200 mb-2">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-2 py-2">OS</th>
              <th className="px-2 py-2">Entrega</th>
              <th className="px-2 py-2">Aparelho</th>
              <th className="px-2 py-2">Serviço / defeito</th>
              <th className="px-2 py-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {monthOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-4 text-center text-gray-400">
                  Nenhuma OS entregue neste mês.
                </td>
              </tr>
            ) : (
              monthOrders.map((o) => {
                const d = o.device_id ? devices.get(o.device_id) : null;
                return (
                  <tr key={o.id} className="border-b border-gray-100 align-top">
                    <td className="px-2 py-2 whitespace-nowrap">#{o.order_number}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{formatDate(o.delivered_at)}</td>
                    <td className="px-2 py-2">
                      {d ? `${d.model}${d.storage_capacity ? ` ${d.storage_capacity}` : ''}` : '—'}
                      {d?.imei1 && (
                        <span className="block text-xs text-gray-500">IMEI {d.imei1}</span>
                      )}
                    </td>
                    <td className="px-2 py-2">{o.diagnosis || o.reported_defect || '—'}</td>
                    <td className="px-2 py-2 text-right whitespace-nowrap">
                      {formatCurrency(o.total_value)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="flex justify-end text-sm mb-8">
          <div className="w-64 flex justify-between font-bold border-t border-gray-300 pt-1">
            <span>Total do mês</span>
            <span>{formatCurrency(totalMonth)}</span>
          </div>
        </div>

        <h2 className="text-sm font-semibold mb-2">Valores em aberto (todos os meses)</h2>
        <table className="w-full text-sm border border-gray-200 mb-2">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-2 py-2">Descrição</th>
              <th className="px-2 py-2">Vencimento</th>
              <th className="px-2 py-2 text-right">Valor</th>
              <th className="px-2 py-2 text-right">Pago</th>
              <th className="px-2 py-2 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {openReceivables.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-4 text-center text-gray-400">
                  Nenhum valor em aberto.
                </td>
              </tr>
            ) : (
              openReceivables.map((r) => (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="px-2 py-2">{r.description}</td>
                  <td
                    className={`px-2 py-2 whitespace-nowrap ${r.due_date < today ? 'text-red-600 font-medium' : ''}`}
                  >
                    {formatDate(r.due_date)}
                    {r.due_date < today && ' (vencido)'}
                  </td>
                  <td className="px-2 py-2 text-right">{formatCurrency(r.gross_value)}</td>
                  <td className="px-2 py-2 text-right">{formatCurrency(r.paid)}</td>
                  <td className="px-2 py-2 text-right font-medium">{formatCurrency(r.balance)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-end text-sm">
          <div className="w-64 flex justify-between font-bold border-t border-gray-300 pt-1">
            <span>Total a pagar</span>
            <span>{formatCurrency(totalOpen)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-10">
          Status considerado: {OS_STATUS_LABELS.entregue}. Documento gerado em {formatDate(today)}.
        </p>
      </div>
    </div>
  );
}
