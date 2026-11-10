// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardListIcon,
  PencilIcon,
  PlusIcon,
  PrinterIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
  TrashIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import {
  addDaysISO,
  formatCurrency,
  formatDate,
  formatDateTime,
  todayISO,
  dateInputToISO,
  isoToDateInput,
} from '../lib/format';
import { ShareWithClient } from './os/ShareWithClient';
import { OpenOrdersSummary } from './os/OpenOrdersSummary';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const inputClass = `w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500 transition-colors`;
export const OS_STATUS_LABELS = {
  recebido: `Recebido`,
  em_triagem: `Em triagem`,
  em_diagnostico: `Em diagnóstico`,
  aguardando_orcamento: `Aguardando orçamento`,
  aguardando_aprovacao: `Aguardando aprovação`,
  aguardando_pecas: `Aguardando peças`,
  aprovado_reparo: `Reparo aprovado`,
  em_reparo: `Em reparo`,
  em_testes: `Em testes`,
  pronto_retirada: `Pronto para retirada`,
  aguardando_entrega: `Aguardando entrega`,
  entregue: `Entregue`,
  sem_reparo: `Sem reparo`,
  cancelado: `Cancelado`,
  em_garantia: `Em garantia`,
};
export const OS_STATUSES = Object.keys(OS_STATUS_LABELS);
export const WARRANTY_RESOLUTION_LABELS = {
  garantia: `Garantia (sem custo)`,
  cortesia: `Cortesia`,
  novo_servico_pago: `Novo serviço pago (fora da garantia)`,
};
export function statusTone(e) {
  return e === `entregue`
    ? `success`
    : e === `cancelado` || e === `sem_reparo`
      ? `danger`
      : e === `pronto_retirada` || e === `aguardando_entrega`
        ? `accent`
        : e.startsWith(`aguardando`)
          ? `warning`
          : e === `em_garantia`
            ? `info`
            : `default`;
}
export function emptyItem() {
  return {
    description: ``,
    item_type: `servico`,
    quantity: 1,
    unit_price: 0,
    unit_cost: 0,
    product_id: null,
  };
}
export function OrdensServicoPage() {
  let { user: e } = useAuth(),
    [t, n] = useState([]),
    [r, i] = useState([]),
    [a, o] = useState([]),
    [s, c] = useState([]),
    [l, u] = useState([]),
    [d, f] = useState(true),
    [p, m] = useState(null),
    [h, g] = useState(``),
    [_, v] = useState(`todos`),
    [y, b] = useState(false),
    [x, S] = useState(``),
    [C, T] = useState(``),
    [E, D] = useState(``),
    [O, k] = useState(`normal`),
    [A, j] = useState(``),
    [M, N] = useState(``),
    [ee, P] = useState(0),
    [te, F] = useState(``),
    [ne, re] = useState([]),
    [ie, ae] = useState(false),
    [oe, se] = useState(null),
    [ce, le] = useState(null);
  useEffect(() => {
    isSupabaseConfigured ? ue() : f(false);
  }, []);
  async function ue() {
    (f(true), m(null));
    let [e, t, r, a, s] = await Promise.all([
        supabase.from(`service_orders`).select(`*`).order(`created_at`, {
          ascending: false,
        }),
        supabase.from(`clients`).select(`*`).order(`name`),
        supabase.from(`devices`).select(`*`).order(`created_at`, {
          ascending: false,
        }),
        supabase.from(`profiles`).select(`*`).order(`full_name`),
        supabase.from(`products`).select(`*`).eq(`status`, `ativo`).order(`name`),
      ]),
      l = [e, t, r, a, s].find((e) => e.error);
    (l?.error && m(l.error.message),
      n(e.data ?? []),
      // Mantém a OS aberta no modal sincronizada com o banco (status, resposta do cliente…).
      le((cur) => (cur ? ((e.data ?? []).find((o) => o.id === cur.id) ?? cur) : cur)),
      i(t.data ?? []),
      o(r.data ?? []),
      c(a.data ?? []),
      u(s.data ?? []),
      f(false));
  }
  let de = useMemo(() => new Map(r.map((e) => [e.id, e])), [r]),
    fe = useMemo(() => new Map(a.map((e) => [e.id, e])), [a]),
    pe = useMemo(() => new Map(s.map((e) => [e.id, e])), [s]),
    me = useMemo(() => new Map(l.map((e) => [e.id, e])), [l]),
    I = useMemo(() => {
      let e = [`entregue`, `sem_reparo`, `cancelado`],
        n = new Set(t.filter((t) => !e.includes(t.status) && t.device_id).map((e) => e.device_id));
      return a.filter((e) => !n.has(e.id));
    }, [a, t]),
    he = useMemo(
      () =>
        t.filter((e) => {
          if (_ !== `todos` && e.status !== _) return false;
          if (!h.trim()) return true;
          let t = h.toLowerCase(),
            n = de.get(e.client_id)?.name ?? ``,
            r = e.device_id ? fe.get(e.device_id) : null;
          return (
            String(e.order_number).includes(t) ||
            n.toLowerCase().includes(t) ||
            (r ? `${r.brand} ${r.model}`.toLowerCase().includes(t) : false) ||
            (r?.internal_code ?? ``).toLowerCase().includes(t)
          );
        }),
      [t, h, _, de, fe],
    );
  function ge() {
    (S(``), T(``), D(``), k(`normal`), j(``), N(``), P(0), F(``), re([]), se(null), b(true));
  }
  function _e(e) {
    S(e);
    let t = fe.get(e);
    t &&
      (T(t.reported_defect ?? ``),
      k(t.priority),
      t.technician_id && j(t.technician_id),
      t.promised_at && N(isoToDateInput(t.promised_at)));
  }
  function ve(e, t) {
    re((n) =>
      n.map((n, r) =>
        r === e
          ? {
              ...n,
              ...t,
            }
          : n,
      ),
    );
  }
  function ye(e) {
    re((t) => t.filter((t, n) => n !== e));
  }
  let be = useMemo(() => {
    let e = ne
        .filter((e) => e.item_type === `servico`)
        .reduce((e, t) => e + t.quantity * t.unit_price, 0),
      t = ne
        .filter((e) => e.item_type === `peca`)
        .reduce((e, t) => e + t.quantity * t.unit_price, 0);
    return {
      labor: e,
      parts: t,
      cost: ne
        .filter((e) => e.item_type === `peca`)
        .reduce((e, t) => e + t.quantity * t.unit_cost, 0),
      total: Math.max(0, e + t - (ee || 0)),
    };
  }, [ne, ee]);
  async function xe(t) {
    t.preventDefault();
    let n = x ? fe.get(x) : null;
    if (!n) {
      se(`Selecione o aparelho para o qual esta OS será aberta.`);
      return;
    }
    let r = de.get(n.client_id);
    if (!r) {
      se(`Cliente do aparelho não encontrado.`);
      return;
    }
    if (!C.trim()) {
      se(`Descreva o defeito relatado.`);
      return;
    }
    (ae(true), se(null));
    let i = {
        client_id: r.id,
        client_type: r.kind === `lojista` ? `B2B` : `B2C`,
        device_id: n.id,
        reported_defect: C,
        diagnosis: E || null,
        labor_value: be.labor,
        parts_value: be.parts,
        discount_value: ee || 0,
        total_value: be.total,
        estimated_cost: be.cost,
        actual_cost: be.cost,
        technician_id: A || null,
        due_at: dateInputToISO(M),
        priority: O,
        status: `recebido`,
        internal_notes: te || null,
        created_by: e?.id ?? null,
      },
      { data: a, error: o } = await supabase
        .from(`service_orders`)
        .insert([i])
        .select(`*`)
        .single();
    if (o || !a) {
      (ae(false), se(o?.message ?? `Erro ao salvar a ordem de serviço.`));
      return;
    }
    let s = ne.filter((e) => e.description.trim()),
      c = [];
    if (s.length > 0) {
      let t = s.map((e) => ({
          service_order_id: a.id,
          description: e.description,
          item_type: e.item_type,
          quantity: e.quantity,
          unit_price: e.unit_price,
          unit_cost: e.item_type === `peca` ? e.unit_cost : 0,
          product_id: e.item_type === `peca` ? e.product_id : null,
        })),
        { error: n } = await supabase.from(`service_order_items`).insert(t);
      if (n) {
        (ae(false),
          se(`OS #${a.order_number} criada, mas houve erro ao salvar os itens: ${n.message}`),
          ue());
        return;
      }
      for (let t of s) {
        if (t.item_type !== `peca` || !t.product_id) continue;
        let { data: n, error: r } = await supabase
          .from(`products`)
          .select(`quantity_available`)
          .eq(`id`, t.product_id)
          .single();
        if (r || !n) {
          c.push(
            `Não foi possível dar baixa em "${t.description}": ${r?.message ?? `produto não encontrado.`}`,
          );
          continue;
        }
        let i = n.quantity_available - t.quantity,
          { error: o } = await supabase
            .from(`products`)
            .update({
              quantity_available: i,
            })
            .eq(`id`, t.product_id);
        o
          ? c.push(`Não foi possível dar baixa em "${t.description}": ${o.message}`)
          : (await supabase.from(`stock_movements`).insert([
              {
                product_id: t.product_id,
                movement_type: `saida_os`,
                quantity: -t.quantity,
                unit_cost: t.unit_cost,
                service_order_id: a.id,
                created_by: e?.id ?? null,
              },
            ]),
            i < 0 &&
              c.push(`Estoque de "${t.description}" ficou negativo (${i}) — confira a contagem.`));
      }
    }
    let { error: l } = await supabase.from(`service_status_history`).insert([
      {
        service_order_id: a.id,
        from_status: null,
        to_status: `recebido`,
        changed_by: e?.id ?? null,
        notes: `Abertura da ordem de serviço.`,
      },
    ]);
    (l && c.push(`Houve erro ao registrar o histórico: ${l.message}`),
      ae(false),
      ue(),
      c.length > 0 ? se(`OS #${a.order_number} criada. ${c.join(` `)}`) : b(false));
  }
  return isSupabaseConfigured ? (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        description="Abertura a partir de um aparelho cadastrado, acompanhamento de status e impressão."
        action={
          <button
            onClick={ge}
            disabled={I.length === 0}
            title={
              I.length === 0
                ? `Cadastre um aparelho (ou finalize as OS em aberto) para abrir uma nova OS`
                : undefined
            }
            className="flex items-center gap-1.5 text-sm bg-accent-500 text-base-950 font-medium px-3 py-1.5 rounded-lg hover:bg-accent-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-4 h-4" />
            {' Nova OS'}
          </button>
        }
      />
      {a.length === 0 && !d && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          Cadastre um aparelho em "Aparelhos" antes de abrir a primeira ordem de serviço.
        </div>
      )}
      {!d && t.length > 0 && <OpenOrdersSummary orders={t} />}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="w-4 h-4 text-base-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={h}
            onChange={(e) => g(e.target.value)}
            placeholder="Buscar por nº, cliente, aparelho..."
            className="w-full bg-base-900 border border-base-800 rounded-lg pl-9 pr-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500/50"
          />
        </div>
        <select
          value={_}
          onChange={(e) => v(e.target.value)}
          className="bg-base-900 border border-base-800 rounded-lg px-3 py-2 text-sm text-base-200 outline-none"
        >
          <option value="todos">Todos os status</option>
          {OS_STATUSES.map((e) => (
            <option value={e} key={e}>
              {OS_STATUS_LABELS[e]}
            </option>
          ))}
        </select>
      </div>
      {p && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {p}
        </div>
      )}
      <div className="bg-base-900 border border-base-800 rounded-xl overflow-x-auto">
        {d ? (
          <div className="p-6 text-sm text-base-500">Carregando…</div>
        ) : he.length === 0 ? (
          <EmptyState
            icon={ClipboardListIcon}
            title="Nenhuma ordem de serviço encontrada"
            description="Abra a primeira OS a partir de um aparelho já cadastrado."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-base-500 border-b border-base-800">
                <th className="px-4 py-3 font-medium">Nº OS</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Aparelho</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Valor total</th>
                <th className="px-4 py-3 font-medium">Previsão</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {he.map((e) => {
                let t = e.device_id ? fe.get(e.device_id) : null;
                return (
                  <tr
                    className="border-b border-base-800/60 last:border-0 hover:bg-base-850/50 cursor-pointer"
                    onClick={() => le(e)}
                    key={e.id}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-accent-400">
                      #{e.order_number}
                    </td>
                    <td className="px-4 py-3 text-base-200">{de.get(e.client_id)?.name ?? `—`}</td>
                    <td className="px-4 py-3 text-base-300">
                      {t ? `${t.brand} ${t.model}` : `—`}
                      {t && <span className="text-xs text-base-500 ml-1">({t.internal_code})</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(e.status)}>{OS_STATUS_LABELS[e.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-base-200">{formatCurrency(e.total_value)}</td>
                    <td className="px-4 py-3 text-base-400">{formatDate(e.due_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/imprimir/os/${e.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-base-400 hover:text-accent-400"
                      >
                        <PrinterIcon className="w-3.5 h-3.5" />
                        {' Imprimir'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={y} onClose={() => b(false)} title="Nova ordem de serviço" width="2xl">
        <form onSubmit={xe} className="space-y-4">
          <Field label="Aparelho">
            <select value={x} onChange={(e) => _e(e.target.value)} required className={inputClass}>
              <option value="">Selecione…</option>
              {I.map((e) => {
                let t = de.get(e.client_id);
                return (
                  <option value={e.id} key={e.id}>
                    {e.internal_code}
                    {' — '}
                    {e.brand} {e.model}
                    {' ('}
                    {t?.name ?? `cliente desconhecido`})
                  </option>
                );
              })}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prioridade">
              <select value={O} onChange={(e) => k(e.target.value)} className={inputClass}>
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </Field>
            <Field label="Técnico responsável">
              <select value={A} onChange={(e) => j(e.target.value)} className={inputClass}>
                <option value="">Não definido</option>
                {s.map((e) => (
                  <option value={e.id} key={e.id}>
                    {e.full_name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Defeito relatado">
            <textarea
              required
              value={C}
              onChange={(e) => T(e.target.value)}
              className={inputClass + ` min-h-[50px]`}
            />
          </Field>
          <Field label="Diagnóstico (se já houver)">
            <textarea
              value={E}
              onChange={(e) => D(e.target.value)}
              className={inputClass + ` min-h-[50px]`}
            />
          </Field>
          <Field label="Previsão de entrega">
            <input
              type="date"
              value={M}
              onChange={(e) => N(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-base-400">Itens (serviços e peças)</p>
              <button
                type="button"
                onClick={() => re((e) => [...e, emptyItem()])}
                className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                {' Adicionar item'}
              </button>
            </div>
            {ne.length === 0 ? (
              <p className="text-xs text-base-500 border border-dashed border-base-800 rounded-lg px-3 py-4 text-center">
                Nenhum item adicionado ainda. A OS pode ser aberta sem itens e detalhada depois do
                diagnóstico.
              </p>
            ) : (
              <div className="space-y-2">
                {ne.map((e, t) => {
                  let n = e.product_id ? me.get(e.product_id) : null,
                    r = n ? e.quantity > n.quantity_available : false;
                  return (
                    <div
                      className="bg-base-850/50 border border-base-800 rounded-lg p-2 space-y-2"
                      key={t}
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <select
                          value={e.item_type}
                          onChange={(e) =>
                            ve(t, {
                              item_type: e.target.value,
                              product_id: null,
                            })
                          }
                          className="col-span-2 bg-base-850 border border-base-700 rounded-md px-2 py-1.5 text-xs text-base-200 outline-none"
                        >
                          <option value="servico">Serviço</option>
                          <option value="peca">Peça</option>
                        </select>
                        <input
                          placeholder="Descrição"
                          value={e.description}
                          onChange={(e) =>
                            ve(t, {
                              description: e.target.value,
                            })
                          }
                          className="col-span-4 bg-base-850 border border-base-700 rounded-md px-2 py-1.5 text-xs text-base-200 outline-none focus:border-accent-500"
                        />
                        <input
                          type="number"
                          min={0.01}
                          step="0.01"
                          title="Quantidade"
                          value={e.quantity}
                          onChange={(e) =>
                            ve(t, {
                              quantity: Number(e.target.value) || 0,
                            })
                          }
                          className="col-span-1 bg-base-850 border border-base-700 rounded-md px-2 py-1.5 text-xs text-base-200 outline-none"
                        />
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          title="Preço unitário"
                          placeholder="Preço"
                          value={e.unit_price}
                          onChange={(e) =>
                            ve(t, {
                              unit_price: Number(e.target.value) || 0,
                            })
                          }
                          className="col-span-2 bg-base-850 border border-base-700 rounded-md px-2 py-1.5 text-xs text-base-200 outline-none"
                        />
                        {e.item_type === `peca` ? (
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            title="Custo unitário"
                            placeholder="Custo"
                            value={e.unit_cost}
                            onChange={(e) =>
                              ve(t, {
                                unit_cost: Number(e.target.value) || 0,
                              })
                            }
                            className="col-span-2 bg-base-850 border border-base-700 rounded-md px-2 py-1.5 text-xs text-base-200 outline-none"
                          />
                        ) : (
                          <div className="col-span-2" />
                        )}
                        <button
                          type="button"
                          onClick={() => ye(t)}
                          className="col-span-1 flex items-center justify-center text-base-500 hover:text-danger"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {e.item_type === `peca` && (
                        <div className="flex items-center gap-2 pl-1">
                          <select
                            value={e.product_id ?? ``}
                            onChange={(n) => {
                              let r = n.target.value || null,
                                i = r ? me.get(r) : null;
                              ve(t, {
                                product_id: r,
                                ...(i
                                  ? {
                                      description: e.description || i.name,
                                      unit_price: i.sale_price ?? e.unit_price,
                                      unit_cost: i.unit_cost,
                                    }
                                  : {}),
                              });
                            }}
                            className="flex-1 bg-base-850 border border-base-700 rounded-md px-2 py-1.5 text-xs text-base-300 outline-none"
                          >
                            <option value="">Peça avulsa (não vinculada ao estoque)</option>
                            {l.map((e) => (
                              <option value={e.id} key={e.id}>
                                {e.name}
                                {' — estoque: '}
                                {e.quantity_available}
                              </option>
                            ))}
                          </select>
                          {n && (
                            <span
                              className={`text-xs whitespace-nowrap ${r ? `text-danger` : `text-base-500`}`}
                            >
                              {r
                                ? `Estoque insuficiente (${n.quantity_available} disp.)`
                                : `${n.quantity_available} em estoque`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Desconto (R$)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={ee}
                onChange={(e) => P(Number(e.target.value) || 0)}
                className={inputClass}
              />
            </Field>
            <div className="bg-base-850/50 border border-base-800 rounded-lg px-3 py-2 text-sm">
              <div className="flex justify-between text-base-400">
                <span>Mão de obra</span>
                <span>{formatCurrency(be.labor)}</span>
              </div>
              <div className="flex justify-between text-base-400">
                <span>Peças</span>
                <span>{formatCurrency(be.parts)}</span>
              </div>
              <div className="flex justify-between text-base-100 font-medium border-t border-base-800 mt-1 pt-1">
                <span>Total</span>
                <span>{formatCurrency(be.total)}</span>
              </div>
            </div>
          </div>
          <Field label="Observações internas">
            <textarea
              value={te}
              onChange={(e) => F(e.target.value)}
              className={inputClass + ` min-h-[50px]`}
            />
          </Field>
          {oe && <p className="text-sm text-danger">{oe}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => b(false)}
              className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={ie}
              className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
            >
              {ie ? `Salvando…` : `Abrir OS`}
            </button>
          </div>
        </form>
      </Modal>
      {ce && (
        <OrderDetailModal
          order={ce}
          client={de.get(ce.client_id) ?? null}
          device={ce.device_id ? (fe.get(ce.device_id) ?? null) : null}
          technicianName={ce.technician_id ? (pe.get(ce.technician_id)?.full_name ?? null) : null}
          products={l}
          onClose={() => le(null)}
          onChanged={() => {
            ue();
          }}
        />
      )}
    </div>
  ) : (
    <div>
      <PageHeader title="Ordens de Serviço" />
      <EmptyState
        icon={TriangleAlertIcon}
        title="Conecte o Supabase para usar este módulo"
        description="Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env."
      />
    </div>
  );
}
export function OrderDetailModal({
  order: e,
  client: t,
  device: n,
  technicianName: r,
  products: i,
  onClose: a,
  onChanged: o,
}) {
  let { user: s } = useAuth(),
    [c, l] = useState(e),
    [u, d] = useState([]),
    [f, p] = useState([]),
    [m, h] = useState(true),
    [g, _] = useState(e.status),
    [v, y] = useState(``),
    [b, x] = useState(false),
    [S, C] = useState(null),
    [T, E] = useState(null),
    [D, O] = useState(null),
    [k, A] = useState(null),
    [j, M] = useState(null),
    [N, ee] = useState(null),
    [P, te] = useState(90),
    [F, ne] = useState(``),
    [re, ie] = useState(``),
    [ae, oe] = useState(false),
    [se, ce] = useState(null),
    [le, ue] = useState(false),
    [de, fe] = useState(false),
    [pe, me] = useState(false),
    [I, he] = useState(`garantia`),
    [ge, _e] = useState(``),
    [ve, ye] = useState(``),
    [be, xe] = useState(false),
    [Se, Ce] = useState(null);
  useEffect(() => {
    (l(e), we());
  }, [e.id]);
  async function we() {
    h(true);
    let [t, n, r] = await Promise.all([
      supabase.from(`service_order_items`).select(`*`).eq(`service_order_id`, e.id),
      supabase
        .from(`service_status_history`)
        .select(`*`)
        .eq(`service_order_id`, e.id)
        .order(`changed_at`, {
          ascending: false,
        }),
      supabase.from(`service_warranties`).select(`*`).eq(`service_order_id`, e.id).maybeSingle(),
    ]);
    (d(t.data ?? []), p(n.data ?? []), ee(r.data ?? null), h(false));
  }
  async function Te(t) {
    if ((t.preventDefault(), oe(true), ce(null), le && N)) {
      let e = new Date(N.starts_at),
        t = new Date(e);
      t.setDate(t.getDate() + (P || 0));
      let { data: n, error: r } = await supabase
        .from(`service_warranties`)
        .update({
          warranty_days: P || 0,
          ends_at: t.toISOString(),
          covered_service: F || null,
          coverage_terms: re || null,
        })
        .eq(`id`, N.id)
        .select(`*`)
        .single();
      if ((oe(false), r || !n)) {
        ce(r?.message ?? `Erro ao salvar a garantia.`);
        return;
      }
      (ee(n), ue(false));
      return;
    }
    let n = new Date(),
      r = new Date(n);
    r.setDate(r.getDate() + (P || 0));
    let i = {
        service_order_id: e.id,
        warranty_days: P || 0,
        starts_at: n.toISOString(),
        ends_at: r.toISOString(),
        covered_service: F || null,
        coverage_terms: re || null,
      },
      { data: a, error: o } = await supabase
        .from(`service_warranties`)
        .insert([i])
        .select(`*`)
        .single();
    (oe(false), o || !a ? ce(o?.message ?? `Erro ao registrar a garantia.`) : ee(a));
  }
  function Ee() {
    N &&
      (te(N.warranty_days),
      ne(N.covered_service ?? ``),
      ie(N.coverage_terms ?? ``),
      ce(null),
      ue(true));
  }
  async function De() {
    if (!N) return;
    if (N.return_type)
      throw Error(
        `Não é possível excluir: já há um retorno em garantia registrado para esta OS. Para corrigir, ajuste os dados do retorno em vez de excluir a garantia.`,
      );
    let { error: e } = await supabase.from(`service_warranties`).delete().eq(`id`, N.id);
    if (e) throw Error(e.message);
    (ee(null), fe(false));
  }
  async function Oe(t) {
    if (t.item_type !== `peca` || !t.product_id) return null;
    let { data: n, error: r } = await supabase
      .from(`products`)
      .select(`quantity_available`)
      .eq(`id`, t.product_id)
      .single();
    if (r || !n)
      return `Não foi possível repor o estoque de "${t.description}": ${r?.message ?? `produto não encontrado.`}`;
    let i = n.quantity_available + t.quantity,
      { error: a } = await supabase
        .from(`products`)
        .update({
          quantity_available: i,
        })
        .eq(`id`, t.product_id);
    return a
      ? `Não foi possível repor o estoque de "${t.description}": ${a.message}`
      : (await supabase.from(`stock_movements`).insert([
          {
            product_id: t.product_id,
            movement_type: `devolucao_estoque`,
            quantity: t.quantity,
            unit_cost: t.unit_cost,
            service_order_id: e.id,
            created_by: s?.id ?? null,
          },
        ]),
        null);
  }
  async function ke(t) {
    let { data: n, error: r } = await supabase
      .from(`products`)
      .select(`quantity_available`)
      .eq(`id`, t.product_id)
      .single();
    if (r || !n)
      return `Não foi possível dar baixa no estoque de "${t.description}": ${r?.message ?? `produto não encontrado.`}`;
    let i = n.quantity_available - t.quantity,
      { error: a } = await supabase
        .from(`products`)
        .update({
          quantity_available: i,
        })
        .eq(`id`, t.product_id);
    return a
      ? `Não foi possível dar baixa no estoque de "${t.description}": ${a.message}`
      : (await supabase.from(`stock_movements`).insert([
          {
            product_id: t.product_id,
            movement_type: `saida_os`,
            quantity: -t.quantity,
            unit_cost: t.unit_cost,
            service_order_id: e.id,
            created_by: s?.id ?? null,
          },
        ]),
        i < 0 ? `Estoque de "${t.description}" ficou negativo (${i}) — confira a contagem.` : null);
  }
  async function Ae(t) {
    let n = t
        .filter((e) => e.item_type === `servico`)
        .reduce((e, t) => e + t.quantity * t.unit_price, 0),
      r = t
        .filter((e) => e.item_type === `peca`)
        .reduce((e, t) => e + t.quantity * t.unit_price, 0),
      i = t.filter((e) => e.item_type === `peca`).reduce((e, t) => e + t.quantity * t.unit_cost, 0),
      a = Math.max(0, n + r - (c.discount_value || 0)),
      { data: o, error: s } = await supabase
        .from(`service_orders`)
        .update({
          labor_value: n,
          parts_value: r,
          total_value: a,
          estimated_cost: i,
          actual_cost: i,
        })
        .eq(`id`, e.id)
        .select(`*`)
        .single();
    return s ? s.message : (o && l(o), null);
  }
  async function je(t) {
    if (!D) return;
    let n = [],
      r = await Oe(D);
    r && n.push(r);
    let i = t.item_type,
      a = i === `peca` ? t.product_id : null,
      s = i === `peca` ? t.unit_cost : 0;
    if (a) {
      let e = await ke({
        description: t.description,
        product_id: a,
        quantity: t.quantity,
        unit_cost: s,
      });
      e && n.push(e);
    }
    let { error: c } = await supabase
      .from(`service_order_items`)
      .update({
        description: t.description,
        item_type: i,
        quantity: t.quantity,
        unit_price: t.unit_price,
        unit_cost: s,
        product_id: a,
      })
      .eq(`id`, D.id);
    if (c) throw Error(c.message);
    let { data: l } = await supabase
        .from(`service_order_items`)
        .select(`*`)
        .eq(`service_order_id`, e.id),
      u = await Ae(l ?? []);
    (u && n.push(`Item salvo, mas houve erro ao recalcular o total da OS: ${u}`),
      O(null),
      M(n.length > 0 ? n.join(` `) : null),
      await we(),
      o());
  }
  async function Me(t) {
    let n = [],
      r = await Oe(t);
    r && n.push(r);
    let { error: i } = await supabase.from(`service_order_items`).delete().eq(`id`, t.id);
    if (i) throw Error(i.message);
    let { data: a } = await supabase
        .from(`service_order_items`)
        .select(`*`)
        .eq(`service_order_id`, e.id),
      s = await Ae(a ?? []);
    (s && n.push(`Item excluído, mas houve erro ao recalcular o total da OS: ${s}`),
      A(null),
      M(n.length > 0 ? n.join(` `) : null),
      await we(),
      o());
  }
  async function Ne(t) {
    if ((t.preventDefault(), !N)) return;
    (xe(true), Ce(null));
    let { data: n, error: r } = await supabase
      .from(`service_warranties`)
      .update({
        return_type: I,
        return_diagnosis: ge || null,
        return_resolution: ve || null,
        handled_by: s?.id ?? null,
      })
      .eq(`id`, N.id)
      .select(`*`)
      .single();
    r || !n
      ? (xe(false), Ce(r?.message ?? `Erro ao registrar o retorno em garantia.`))
      : (ee(n),
        await supabase
          .from(`service_orders`)
          .update({
            status: `em_garantia`,
          })
          .eq(`id`, e.id),
        await supabase.from(`service_status_history`).insert([
          {
            service_order_id: e.id,
            from_status: e.status,
            to_status: `em_garantia`,
            changed_by: s?.id ?? null,
            notes: `Retorno em garantia registrado (${WARRANTY_RESOLUTION_LABELS[I]}).`,
          },
        ]),
        xe(false),
        me(false),
        o(),
        we());
  }
  async function Pe() {
    if (g === e.status) return;
    (x(true), C(null), E(null));
    let { error: n } = await supabase
      .from(`service_orders`)
      .update({
        status: g,
      })
      .eq(`id`, e.id);
    if (n) {
      (x(false), C(n.message));
      return;
    }
    let { error: r } = await supabase.from(`service_status_history`).insert([
      {
        service_order_id: e.id,
        from_status: e.status,
        to_status: g,
        changed_by: s?.id ?? null,
        notes: v || null,
      },
    ]);
    if (
      (r && C(`Status atualizado, mas houve erro ao registrar o histórico: ${r.message}`),
      g === `entregue` && c.total_value > 0)
    ) {
      let { data: n } = await supabase
        .from(`accounts_receivable`)
        .select(`id`)
        .eq(`service_order_id`, e.id)
        .maybeSingle();
      if (!n) {
        let n =
            t?.kind === `lojista` && t.payment_terms_days
              ? addDaysISO(todayISO(), t.payment_terms_days)
              : todayISO(),
          { error: r } = await supabase.from(`accounts_receivable`).insert([
            {
              service_order_id: e.id,
              client_id: e.client_id,
              description: `OS #${e.order_number}${t ? ` — ` + t.name : ``}`,
              gross_value: c.total_value,
              due_date: n,
            },
          ]);
        E(
          r
            ? `Status atualizado, mas houve erro ao lançar a conta a receber: ${r.message}`
            : `Conta a receber de ${formatCurrency(c.total_value)} lançada automaticamente no Financeiro (vencimento ${formatDate(n)}).`,
        );
      }
    }
    (x(false), y(``), o(), we());
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60"
      onClick={a}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-base-900 border border-base-800 rounded-t-2xl sm:rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-800 sticky top-0 bg-base-900">
          <div>
            <h2 className="text-sm font-semibold text-base-100">OS #{e.order_number}</h2>
            <p className="text-xs text-base-500">{t?.name ?? `Cliente não encontrado`}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/imprimir/os/${e.id}`}
              target="_blank"
              className="flex items-center gap-1 text-xs text-base-400 hover:text-accent-400 border border-base-700 rounded-lg px-2 py-1.5"
            >
              <PrinterIcon className="w-3.5 h-3.5" />
              {' Imprimir'}
            </Link>
            <button
              onClick={a}
              className="w-7 h-7 rounded-md flex items-center justify-center text-base-500 hover:text-base-200 hover:bg-base-850"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <ShareWithClient order={{ ...e, total_value: c.total_value }} client={t} device={n} />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem
              label="Aparelho"
              value={n ? `${n.brand} ${n.model} (${n.internal_code})` : `—`}
            />
            <InfoItem label="Técnico" value={r ?? `Não definido`} />
            <InfoItem label="Criada em" value={formatDateTime(e.created_at)} />
            <InfoItem label="Previsão" value={formatDate(e.due_at)} />
          </div>
          <div>
            <p className="text-xs font-medium text-base-400 mb-1">Defeito relatado</p>
            <p className="text-sm text-base-200">{e.reported_defect || `—`}</p>
          </div>
          {e.diagnosis && (
            <div>
              <p className="text-xs font-medium text-base-400 mb-1">Diagnóstico</p>
              <p className="text-sm text-base-200">{e.diagnosis}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-base-400 mb-2">Itens</p>
            {m ? (
              <p className="text-xs text-base-500">Carregando…</p>
            ) : u.length === 0 ? (
              <p className="text-xs text-base-500">Nenhum item lançado nesta OS ainda.</p>
            ) : (
              <div className="border border-base-800 rounded-lg overflow-hidden">
                {u.map((e) => (
                  <div
                    className="flex items-center justify-between px-3 py-2 text-sm border-b border-base-800 last:border-0"
                    key={e.id}
                  >
                    <div>
                      <span className="text-base-200">{e.description}</span>
                      <span className="text-xs text-base-500 ml-2">
                        {e.item_type === `servico` ? `Serviço` : `Peça`}
                        {' · '}
                        {e.quantity}x
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base-300">
                        {formatCurrency(e.quantity * e.unit_price)}
                      </span>
                      <button
                        onClick={() => O(e)}
                        title="Editar item"
                        className="w-6 h-6 flex items-center justify-center rounded-md text-base-500 hover:text-accent-400 hover:bg-base-850"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => A(e)}
                        title="Excluir item"
                        className="w-6 h-6 flex items-center justify-center rounded-md text-base-500 hover:text-danger hover:bg-base-850"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {j && <p className="text-xs text-warning mt-2">{j}</p>}
            <div className="flex justify-between text-sm font-medium text-base-100 mt-2 pt-2 border-t border-base-800">
              <span>Total da OS</span>
              <span>{formatCurrency(c.total_value)}</span>
            </div>
          </div>
          {(e.status === `entregue` || e.status === `em_garantia` || N) && (
            <div>
              <p className="text-xs font-medium text-base-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  {' Garantia'}
                </span>
                {N && !le && (
                  <span className="flex items-center gap-1">
                    <button
                      onClick={Ee}
                      title="Editar garantia"
                      className="w-6 h-6 flex items-center justify-center rounded-md text-base-500 hover:text-accent-400 hover:bg-base-850"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => fe(true)}
                      title="Excluir garantia"
                      className="w-6 h-6 flex items-center justify-center rounded-md text-base-500 hover:text-danger hover:bg-base-850"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </p>
              {m ? (
                <p className="text-xs text-base-500">Carregando…</p>
              ) : !N || le ? (
                <form
                  onSubmit={Te}
                  className="bg-base-850/50 border border-base-800 rounded-lg p-3 space-y-2"
                >
                  {!le && (
                    <p className="text-xs text-base-500">
                      Nenhuma garantia registrada para esta OS ainda. Defina o prazo e a cobertura
                      ao entregar o aparelho.
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Dias de garantia">
                      <input
                        type="number"
                        min={0}
                        value={P}
                        onChange={(e) => te(Number(e.target.value) || 0)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Serviço coberto">
                      <input
                        placeholder="Ex: troca de tela"
                        value={F}
                        onChange={(e) => ne(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <Field label="Termos da cobertura (opcional)">
                    <textarea
                      value={re}
                      onChange={(e) => ie(e.target.value)}
                      className={inputClass + ` min-h-[40px]`}
                    />
                  </Field>
                  {se && <p className="text-sm text-danger">{se}</p>}
                  <div className="flex justify-end gap-2">
                    {le && (
                      <button
                        type="button"
                        onClick={() => ue(false)}
                        className="text-sm px-3 py-1.5 rounded-lg text-base-400 hover:text-base-200"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={ae}
                      className="text-sm px-3 py-1.5 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
                    >
                      {ae ? `Salvando…` : le ? `Salvar alterações` : `Registrar garantia`}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-base-850/50 border border-base-800 rounded-lg p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoItem
                      label="Vigência"
                      value={`${formatDate(N.starts_at)} a ${formatDate(N.ends_at)}`}
                    />
                    <InfoItem label="Dias de garantia" value={String(N.warranty_days)} />
                    <InfoItem label="Serviço coberto" value={N.covered_service ?? `—`} />
                    <InfoItem label="Termos" value={N.coverage_terms ?? `—`} />
                  </div>
                  {N.return_type ? (
                    <div className="border-t border-base-800 pt-3 grid grid-cols-2 gap-3 text-sm">
                      <InfoItem
                        label="Retorno registrado"
                        value={WARRANTY_RESOLUTION_LABELS[N.return_type]}
                      />
                      <InfoItem label="Novo diagnóstico" value={N.return_diagnosis ?? `—`} />
                      <InfoItem label="Resolução dada" value={N.return_resolution ?? `—`} />
                    </div>
                  ) : pe ? (
                    <form onSubmit={Ne} className="space-y-2 border-t border-base-800 pt-3">
                      <Field label="Tipo de retorno">
                        <select
                          value={I}
                          onChange={(e) => he(e.target.value)}
                          className={inputClass}
                        >
                          {Object.entries(WARRANTY_RESOLUTION_LABELS).map(([e, t]) => (
                            <option value={e} key={e}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Novo diagnóstico do retorno">
                        <textarea
                          value={ge}
                          onChange={(e) => _e(e.target.value)}
                          className={inputClass + ` min-h-[40px]`}
                        />
                      </Field>
                      <Field label="Resolução dada">
                        <textarea
                          value={ve}
                          onChange={(e) => ye(e.target.value)}
                          className={inputClass + ` min-h-[40px]`}
                        />
                      </Field>
                      {Se && <p className="text-sm text-danger">{Se}</p>}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => me(false)}
                          className="text-sm px-3 py-1.5 rounded-lg text-base-400 hover:text-base-200"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={be}
                          className="text-sm px-3 py-1.5 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
                        >
                          {be ? `Salvando…` : `Confirmar retorno`}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => me(true)}
                      className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 font-medium border-t border-base-800 pt-3 w-full"
                    >
                      <RotateCcwIcon className="w-3.5 h-3.5" />
                      {' Registrar retorno em garantia'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-base-400 mb-2">Alterar status</p>
            <div className="flex gap-2">
              <select value={g} onChange={(e) => _(e.target.value)} className={inputClass}>
                {OS_STATUSES.map((e) => (
                  <option value={e} key={e}>
                    {OS_STATUS_LABELS[e]}
                  </option>
                ))}
              </select>
              <button
                onClick={Pe}
                disabled={b || g === e.status}
                className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50 whitespace-nowrap"
              >
                {b ? `Salvando…` : `Atualizar`}
              </button>
            </div>
            <input
              placeholder="Observação sobre a mudança de status (opcional)"
              value={v}
              onChange={(e) => y(e.target.value)}
              className={inputClass + ` mt-2`}
            />
            {S && <p className="text-sm text-danger mt-2">{S}</p>}
            {T && <p className="text-sm text-success mt-2">{T}</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-base-400 mb-2">Histórico</p>
            <div className="space-y-2">
              {f.map((e) => (
                <div className="text-xs text-base-400 flex items-start gap-2" key={e.id}>
                  <span className="text-base-600 whitespace-nowrap">
                    {formatDateTime(e.changed_at)}
                  </span>
                  <span>
                    {e.from_status ? `${OS_STATUS_LABELS[e.from_status]} → ` : `Abertura: `}
                    <span className="text-base-200">{OS_STATUS_LABELS[e.to_status]}</span>
                    {e.notes && (
                      <span className="text-base-500">
                        {' — '}
                        {e.notes}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {D && <EditItemModal item={D} products={i} onClose={() => O(null)} onSubmit={je} />}
      <ConfirmDialog
        open={!!k}
        title="Excluir item"
        description={`Tem certeza que deseja excluir o item "${k?.description ?? ``}"? Se for uma peça vinculada ao estoque, a quantidade será devolvida automaticamente. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={() => {
          if (k) return Me(k);
        }}
        onClose={() => A(null)}
      />
      <ConfirmDialog
        open={de}
        title="Excluir garantia"
        description="Tem certeza que deseja excluir o registro de garantia desta OS? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={De}
        onClose={() => fe(false)}
      />
    </div>
  );
}
export function EditItemModal({ item: e, products: t, onClose: n, onSubmit: r }) {
  let [i, a] = useState({
      description: e.description,
      item_type: e.item_type,
      quantity: e.quantity,
      unit_price: e.unit_price,
      unit_cost: e.unit_cost,
      product_id: e.product_id,
    }),
    [o, s] = useState(false),
    [c, l] = useState(null),
    u = i.product_id ? (t.find((e) => e.id === i.product_id) ?? null) : null;
  async function d(e) {
    if ((e.preventDefault(), !i.description.trim())) l(`Descreva o item.`);
    else if (!i.quantity || i.quantity <= 0) l(`Informe uma quantidade maior que zero.`);
    else {
      (s(true), l(null));
      try {
        await r(i);
      } catch (e) {
        (s(false), l(e instanceof Error ? e.message : `Erro ao salvar o item.`));
        return;
      }
      s(false);
    }
  }
  return (
    <Modal open onClose={n} title="Editar item" width="md">
      <form onSubmit={d} className="space-y-3">
        <Field label="Tipo">
          <select
            value={i.item_type}
            onChange={(e) =>
              a({
                ...i,
                item_type: e.target.value,
                product_id: null,
              })
            }
            className={inputClass}
          >
            <option value="servico">Serviço</option>
            <option value="peca">Peça</option>
          </select>
        </Field>
        <Field label="Descrição">
          <input
            required
            value={i.description}
            onChange={(e) =>
              a({
                ...i,
                description: e.target.value,
              })
            }
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantidade">
            <input
              type="number"
              min={0.01}
              step="0.01"
              value={i.quantity}
              onChange={(e) =>
                a({
                  ...i,
                  quantity: Number(e.target.value) || 0,
                })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Preço unitário (R$)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={i.unit_price}
              onChange={(e) =>
                a({
                  ...i,
                  unit_price: Number(e.target.value) || 0,
                })
              }
              className={inputClass}
            />
          </Field>
        </div>
        {i.item_type === `peca` && (
          <>
            <Field label="Custo unitário (R$)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={i.unit_cost}
                onChange={(e) =>
                  a({
                    ...i,
                    unit_cost: Number(e.target.value) || 0,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Produto vinculado ao estoque (opcional)">
              <select
                value={i.product_id ?? ``}
                onChange={(e) =>
                  a({
                    ...i,
                    product_id: e.target.value || null,
                  })
                }
                className={inputClass}
              >
                <option value="">Peça avulsa (não vinculada ao estoque)</option>
                {t.map((e) => (
                  <option value={e.id} key={e.id}>
                    {e.name}
                    {' — estoque: '}
                    {e.quantity_available}
                  </option>
                ))}
              </select>
            </Field>
            {u && (
              <p className="text-xs text-base-500">
                Ao salvar, o estoque de "{u.name}" será ajustado automaticamente conforme a nova
                quantidade.
              </p>
            )}
          </>
        )}
        {c && <p className="text-sm text-danger">{c}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={n}
            className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={o}
            className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
          >
            {o ? `Salvando…` : `Salvar alterações`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function InfoItem({ label: e, value: t }) {
  return (
    <div>
      <p className="text-xs text-base-500">{e}</p>
      <p className="text-base-200">{t}</p>
    </div>
  );
}
export function Field({ label: e, children: t }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-base-400 mb-1">{e}</span>
      {t}
    </label>
  );
}
