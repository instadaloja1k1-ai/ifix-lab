// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatCurrency, formatDate, formatDateTime } from '../lib/format';
import { supabase } from '../lib/supabase';
import { OS_STATUS_LABELS } from './OrdensServico';

export function ImprimirOSPage() {
  let { id: e } = useParams(),
    [t, n] = useState(null),
    [r, i] = useState(null),
    [a, o] = useState(null),
    [s, c] = useState([]),
    [l, u] = useState(true),
    [d, f] = useState(null);
  useEffect(() => {
    e && p(e);
  }, [e]);
  async function p(e) {
    (u(true), f(null));
    let { data: t, error: r } = await supabase
      .from(`service_orders`)
      .select(`*`)
      .eq(`id`, e)
      .maybeSingle();
    if (r || !t) {
      (f(r?.message ?? `Ordem de serviço não encontrada.`), u(false));
      return;
    }
    n(t);
    let [a, s, l] = await Promise.all([
      supabase.from(`clients`).select(`*`).eq(`id`, t.client_id).maybeSingle(),
      t.device_id
        ? supabase.from(`devices`).select(`*`).eq(`id`, t.device_id).maybeSingle()
        : Promise.resolve({
            data: null,
          }),
      supabase.from(`service_order_items`).select(`*`).eq(`service_order_id`, e),
    ]);
    (i(a.data ?? null), o(s.data ?? null), c(l.data ?? []), u(false));
  }
  return l ? (
    <div className="p-10 text-center text-gray-500">Carregando…</div>
  ) : d || !t ? (
    <div className="p-10 text-center text-red-600">{d ?? `Ordem de serviço não encontrada.`}</div>
  ) : (
    <div className="max-w-2xl mx-auto p-8 text-gray-900 bg-white print:p-0">
      <style>
        {
          '\n        @media print {\n          @page { margin: 16mm; }\n          .no-print { display: none; }\n        }\n      '
        }
      </style>
      <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">iFix Lab</h1>
          <p className="text-sm text-gray-600">Ordem de Serviço #{t.order_number}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
        >
          Imprimir
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="text-gray-500">Cliente</p>
          <p className="font-medium">{r?.name ?? `—`}</p>
          {r?.phone && <p>{r.phone}</p>}
        </div>
        <div>
          <p className="text-gray-500">Status / Data de abertura</p>
          <p className="font-medium">{OS_STATUS_LABELS[t.status]}</p>
          <p>{formatDateTime(t.created_at)}</p>
        </div>
        <div>
          <p className="text-gray-500">Aparelho</p>
          <p className="font-medium">
            {a ? `${a.brand} ${a.model}` : `—`}{' '}
            {a?.storage_capacity ? `(${a.storage_capacity})` : ``}
          </p>
          {a?.imei1 && (
            <p>
              {'IMEI: '}
              {a.imei1}
            </p>
          )}
          {a?.internal_code && (
            <p>
              {'Código: '}
              {a.internal_code}
            </p>
          )}
        </div>
        <div>
          <p className="text-gray-500">Previsão de entrega</p>
          <p className="font-medium">{formatDate(t.due_at)}</p>
        </div>
      </div>
      <div className="mb-6">
        <p className="text-gray-500 text-sm mb-1">Defeito relatado</p>
        <p className="text-sm border border-gray-200 rounded-lg p-3">{t.reported_defect || `—`}</p>
      </div>
      {t.diagnosis && (
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">Diagnóstico</p>
          <p className="text-sm border border-gray-200 rounded-lg p-3">{t.diagnosis}</p>
        </div>
      )}
      <div className="mb-6">
        <p className="text-gray-500 text-sm mb-2">Itens</p>
        <table className="w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2">Descrição</th>
              <th className="text-left px-3 py-2">Tipo</th>
              <th className="text-right px-3 py-2">Qtd</th>
              <th className="text-right px-3 py-2">Unitário</th>
              <th className="text-right px-3 py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {s.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 px-3 py-4">
                  Nenhum item lançado.
                </td>
              </tr>
            ) : (
              s.map((e) => (
                <tr className="border-b border-gray-100 last:border-0" key={e.id}>
                  <td className="px-3 py-2">{e.description}</td>
                  <td className="px-3 py-2">{e.item_type === `servico` ? `Serviço` : `Peça`}</td>
                  <td className="px-3 py-2 text-right">{e.quantity}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(e.unit_price)}</td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(e.quantity * e.unit_price)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-end mt-2 text-sm">
          <div className="w-56">
            <div className="flex justify-between text-gray-600">
              <span>Desconto</span>
              <span>{formatCurrency(t.discount_value)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-300 mt-1 pt-1">
              <span>Total</span>
              <span>{formatCurrency(t.total_value)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8 mt-16 pt-8 text-sm text-center">
        <div className="border-t border-gray-400 pt-2">Assinatura do cliente</div>
        <div className="border-t border-gray-400 pt-2">Assinatura do laboratório</div>
      </div>
    </div>
  );
}
