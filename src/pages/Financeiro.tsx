// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import {
  LandmarkIcon,
  PencilIcon,
  PlusIcon,
  ReceiptIcon,
  TrashIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  WalletIcon,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDate, todayISO } from '../lib/format';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const inputClass = `w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500 transition-colors`;
export const ACCOUNT_STATUS_LABELS = {
  aberto: `Em aberto`,
  parcial: `Parcial`,
  pago: `Pago`,
  atrasado: `Atrasado`,
  cancelado: `Cancelado`,
};
export const ACCOUNT_STATUS_TONES = {
  aberto: `default`,
  parcial: `warning`,
  pago: `success`,
  atrasado: `danger`,
  cancelado: `default`,
};
export const PAYMENT_METHOD_LABELS = {
  pix: `Pix`,
  dinheiro: `Dinheiro`,
  cartao: `Cartão`,
  transferencia: `Transferência`,
  boleto: `Boleto`,
  prazo_comercial: `Prazo comercial`,
  outro: `Outro`,
};
export const EMPTY_RECEIVABLE = {
  service_order_id: null,
  client_id: null,
  description: ``,
  gross_value: 0,
  due_date: todayISO(),
};
export const EMPTY_PAYABLE = {
  purchase_id: null,
  supplier_id: null,
  expense_category_id: null,
  description: ``,
  gross_value: 0,
  due_date: todayISO(),
};
export function FinanceiroPage() {
  let { user: e } = useAuth(),
    [t, n] = useState(`receber`),
    [r, i] = useState([]),
    [a, o] = useState([]),
    [s, c] = useState([]),
    [l, u] = useState([]),
    [d, f] = useState([]),
    [p, m] = useState([]),
    [h, g] = useState([]),
    [_, v] = useState([]),
    [y, b] = useState(true),
    [x, S] = useState(null),
    [C, T] = useState(false),
    [E, D] = useState(false),
    [O, k] = useState(null),
    [A, j] = useState(null),
    [M, N] = useState(null),
    [ee, P] = useState(null),
    [te, F] = useState(null);
  useEffect(() => {
    isSupabaseConfigured ? ne() : b(false);
  }, []);
  async function ne() {
    (b(true), S(null));
    let [e, t, n, r, a, s, l, d] = await Promise.all([
        supabase.from(`accounts_receivable`).select(`*`).order(`due_date`),
        supabase.from(`accounts_payable`).select(`*`).order(`due_date`),
        supabase.from(`payments`).select(`*`).order(`paid_at`, {
          ascending: false,
        }),
        supabase.from(`clients`).select(`*`).order(`name`),
        supabase.from(`suppliers`).select(`*`).order(`name`),
        supabase.from(`service_orders`).select(`*`).order(`order_number`, {
          ascending: false,
        }),
        supabase.from(`expense_categories`).select(`*`).order(`name`),
        supabase.from(`financial_accounts`).select(`*`).order(`name`),
      ]),
      p = [e, t, n, r, a, s, l, d].find((e) => e.error);
    (p?.error && S(p.error.message),
      i(e.data ?? []),
      o(t.data ?? []),
      c(n.data ?? []),
      u(r.data ?? []),
      f(a.data ?? []),
      m(s.data ?? []),
      g(l.data ?? []),
      v(d.data ?? []),
      b(false));
  }
  let re = useMemo(() => new Map(l.map((e) => [e.id, e])), [l]),
    ie = useMemo(() => new Map(d.map((e) => [e.id, e])), [d]),
    ae = useMemo(() => new Map(h.map((e) => [e.id, e])), [h]),
    oe = useMemo(() => {
      let e = new Map();
      for (let t of s)
        t.direction === `recebimento` &&
          t.receivable_id &&
          e.set(t.receivable_id, (e.get(t.receivable_id) ?? 0) + t.amount);
      return e;
    }, [s]),
    se = useMemo(() => {
      let e = new Map();
      for (let t of s)
        t.direction === `pagamento` &&
          t.payable_id &&
          e.set(t.payable_id, (e.get(t.payable_id) ?? 0) + t.amount);
      return e;
    }, [s]),
    ce = todayISO(),
    le = useMemo(() => {
      let e = r
          .filter((e) => e.status !== `pago` && e.status !== `cancelado`)
          .reduce((e, t) => e + (t.gross_value - (oe.get(t.id) ?? 0)), 0),
        t = a
          .filter((e) => e.status !== `pago` && e.status !== `cancelado`)
          .reduce((e, t) => e + (t.gross_value - (se.get(t.id) ?? 0)), 0),
        n = r.filter(
          (e) => e.status !== `pago` && e.status !== `cancelado` && e.due_date < ce,
        ).length,
        i = a.filter(
          (e) => e.status !== `pago` && e.status !== `cancelado` && e.due_date < ce,
        ).length,
        o = ce.slice(0, 7);
      return {
        openReceivable: e,
        openPayable: t,
        overdueReceivable: n,
        overduePayable: i,
        receivedMonth: s
          .filter((e) => e.direction === `recebimento` && e.paid_at.slice(0, 7) === o)
          .reduce((e, t) => e + t.amount, 0),
        paidMonth: s
          .filter((e) => e.direction === `pagamento` && e.paid_at.slice(0, 7) === o)
          .reduce((e, t) => e + t.amount, 0),
      };
    }, [r, a, s, oe, se, ce]);
  function ue(e, t) {
    return (e === `aberto` || e === `parcial`) && t < ce ? `atrasado` : e;
  }
  async function de(e) {
    let { error: t } = await supabase.from(`accounts_receivable`).delete().eq(`id`, e.id);
    if (t)
      throw t.message.toLowerCase().includes(`foreign key`) || t.code === `23503`
        ? Error(
            `Não é possível excluir: já existem recebimentos registrados para esta conta. Em vez de excluir, marque a conta como "Cancelado" ou edite os dados.`,
          )
        : Error(t.message);
    (N(null), ne());
  }
  async function fe(e) {
    let { error: t } = await supabase.from(`accounts_payable`).delete().eq(`id`, e.id);
    if (t)
      throw t.message.toLowerCase().includes(`foreign key`) || t.code === `23503`
        ? Error(
            `Não é possível excluir: já existem pagamentos registrados para esta conta. Em vez de excluir, marque a conta como "Cancelado" ou edite os dados.`,
          )
        : Error(t.message);
    (F(null), ne());
  }
  return isSupabaseConfigured ? (
    <div>
      <PageHeader
        title="Financeiro"
        description="Contas a pagar e a receber, com registro de pagamentos e recebimentos."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => T(true)}
              className="flex items-center gap-1.5 text-sm bg-accent-500 text-base-950 font-medium px-3 py-1.5 rounded-lg hover:bg-accent-400 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              {' Conta a receber'}
            </button>
            <button
              onClick={() => D(true)}
              className="flex items-center gap-1.5 text-sm bg-base-800 text-base-100 font-medium px-3 py-1.5 rounded-lg hover:bg-base-700 transition-colors border border-base-700"
            >
              <PlusIcon className="w-4 h-4" />
              {' Conta a pagar'}
            </button>
          </div>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="A receber (em aberto)"
          value={formatCurrency(le.openReceivable)}
          icon={TrendingUpIcon}
          tone="success"
          loading={y}
        />
        <StatCard
          label="A pagar (em aberto)"
          value={formatCurrency(le.openPayable)}
          icon={TrendingDownIcon}
          tone="warning"
          loading={y}
        />
        <StatCard
          label="Recebido no mês"
          value={formatCurrency(le.receivedMonth)}
          icon={WalletIcon}
          loading={y}
        />
        <StatCard
          label="Contas atrasadas"
          value={String(le.overdueReceivable + le.overduePayable)}
          icon={TriangleAlertIcon}
          tone={le.overdueReceivable + le.overduePayable > 0 ? `danger` : `default`}
          loading={y}
        />
      </div>
      {x && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {x}
        </div>
      )}
      <div className="flex gap-1 mb-4 border-b border-base-800">
        <button
          onClick={() => n(`receber`)}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${t === `receber` ? `border-accent-500 text-accent-400` : `border-transparent text-base-400 hover:text-base-200`}`}
        >
          Contas a receber
        </button>
        <button
          onClick={() => n(`pagar`)}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${t === `pagar` ? `border-accent-500 text-accent-400` : `border-transparent text-base-400 hover:text-base-200`}`}
        >
          Contas a pagar
        </button>
      </div>
      <div className="bg-base-900 border border-base-800 rounded-xl overflow-x-auto">
        {y ? (
          <div className="p-6 text-sm text-base-500">Carregando…</div>
        ) : t === `receber` ? (
          r.length === 0 ? (
            <EmptyState
              icon={ReceiptIcon}
              title="Nenhuma conta a receber cadastrada"
              description="Cadastre uma conta a receber usando o botão acima, vinculando a um cliente e, se quiser, a uma ordem de serviço."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-base-500 border-b border-base-800">
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Vencimento</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {r.map((e) => {
                  let t = oe.get(e.id) ?? 0,
                    n = ue(e.status, e.due_date),
                    r = e.service_order_id ? p.find((t) => t.id === e.service_order_id) : null;
                  return (
                    <tr
                      className="border-b border-base-800/60 last:border-0 hover:bg-base-850/50"
                      key={e.id}
                    >
                      <td className="px-4 py-3">
                        <p className="text-base-100 font-medium">{e.description}</p>
                        {r && <p className="text-xs text-base-500">OS #{r.order_number}</p>}
                      </td>
                      <td className="px-4 py-3 text-base-300">
                        {e.client_id ? (re.get(e.client_id)?.name ?? `—`) : `—`}
                      </td>
                      <td className="px-4 py-3 text-base-400">{formatDate(e.due_date)}</td>
                      <td className="px-4 py-3">
                        <p className="text-base-100">{formatCurrency(e.gross_value)}</p>
                        {t > 0 && t < e.gross_value && (
                          <p className="text-xs text-success">
                            {'recebido '}
                            {formatCurrency(t)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={ACCOUNT_STATUS_TONES[n]}>{ACCOUNT_STATUS_LABELS[n]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {n !== `pago` && n !== `cancelado` && (
                            <button
                              onClick={() =>
                                k({
                                  direction: `recebimento`,
                                  id: e.id,
                                  description: e.description,
                                  grossValue: e.gross_value,
                                  alreadyPaid: t,
                                })
                              }
                              className="text-xs text-accent-400 hover:text-accent-300 font-medium"
                            >
                              Registrar recebimento
                            </button>
                          )}
                          <button
                            onClick={() => j(e)}
                            title="Editar"
                            className="w-7 h-7 flex items-center justify-center rounded-md text-base-400 hover:text-accent-400 hover:bg-base-800 transition-colors"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => N(e)}
                            title="Excluir"
                            className="w-7 h-7 flex items-center justify-center rounded-md text-base-400 hover:text-danger hover:bg-base-800 transition-colors"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : a.length === 0 ? (
          <EmptyState
            icon={LandmarkIcon}
            title="Nenhuma conta a pagar cadastrada"
            description="Cadastre uma conta a pagar usando o botão acima, vinculando a um fornecedor e a uma categoria de despesa."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-base-500 border-b border-base-800">
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Fornecedor</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Vencimento</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {a.map((e) => {
                let t = se.get(e.id) ?? 0,
                  n = ue(e.status, e.due_date);
                return (
                  <tr
                    className="border-b border-base-800/60 last:border-0 hover:bg-base-850/50"
                    key={e.id}
                  >
                    <td className="px-4 py-3 text-base-100 font-medium">{e.description}</td>
                    <td className="px-4 py-3 text-base-300">
                      {e.supplier_id ? (ie.get(e.supplier_id)?.name ?? `—`) : `—`}
                    </td>
                    <td className="px-4 py-3 text-base-400">
                      {e.expense_category_id ? (ae.get(e.expense_category_id)?.name ?? `—`) : `—`}
                    </td>
                    <td className="px-4 py-3 text-base-400">{formatDate(e.due_date)}</td>
                    <td className="px-4 py-3">
                      <p className="text-base-100">{formatCurrency(e.gross_value)}</p>
                      {t > 0 && t < e.gross_value && (
                        <p className="text-xs text-warning">
                          {'pago '}
                          {formatCurrency(t)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={ACCOUNT_STATUS_TONES[n]}>{ACCOUNT_STATUS_LABELS[n]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {n !== `pago` && n !== `cancelado` && (
                          <button
                            onClick={() =>
                              k({
                                direction: `pagamento`,
                                id: e.id,
                                description: e.description,
                                grossValue: e.gross_value,
                                alreadyPaid: t,
                              })
                            }
                            className="text-xs text-accent-400 hover:text-accent-300 font-medium"
                          >
                            Registrar pagamento
                          </button>
                        )}
                        <button
                          onClick={() => P(e)}
                          title="Editar"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-base-400 hover:text-accent-400 hover:bg-base-800 transition-colors"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => F(e)}
                          title="Excluir"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-base-400 hover:text-danger hover:bg-base-800 transition-colors"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {(C || A) && (
        <ReceivableFormModal
          clients={l}
          serviceOrders={p}
          editing={A}
          onClose={() => {
            (T(false), j(null));
          }}
          onSaved={() => {
            (T(false), j(null), ne());
          }}
        />
      )}
      {(E || ee) && (
        <PayableFormModal
          suppliers={d}
          expenseCategories={h}
          editing={ee}
          onClose={() => {
            (D(false), P(null));
          }}
          onSaved={() => {
            (D(false), P(null), ne());
          }}
        />
      )}
      {O && (
        <PaymentModal
          target={O}
          financialAccounts={_}
          userId={e?.id ?? null}
          onClose={() => k(null)}
          onSaved={() => {
            (k(null), ne());
          }}
        />
      )}
      <ConfirmDialog
        open={!!M}
        title="Excluir conta a receber"
        description={`Tem certeza que deseja excluir "${M?.description ?? ``}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={() => {
          if (M) return de(M);
        }}
        onClose={() => N(null)}
      />
      <ConfirmDialog
        open={!!te}
        title="Excluir conta a pagar"
        description={`Tem certeza que deseja excluir "${te?.description ?? ``}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={() => {
          if (te) return fe(te);
        }}
        onClose={() => F(null)}
      />
    </div>
  ) : (
    <div>
      <PageHeader title="Financeiro" />
      <EmptyState
        icon={TriangleAlertIcon}
        title="Conecte o Supabase para usar este módulo"
        description="Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env."
      />
    </div>
  );
}
export function ReceivableFormModal({
  clients: e,
  serviceOrders: t,
  editing: n,
  onClose: r,
  onSaved: i,
}) {
  let [a, o] = useState(
      n
        ? {
            service_order_id: n.service_order_id,
            client_id: n.client_id,
            description: n.description,
            gross_value: n.gross_value,
            due_date: n.due_date,
          }
        : {
            ...EMPTY_RECEIVABLE,
            due_date: todayISO(),
          },
    ),
    [s, c] = useState(false),
    [l, u] = useState(null),
    d = useMemo(
      () => (a.client_id ? t.filter((e) => e.client_id === a.client_id) : t),
      [t, a.client_id],
    );
  async function f(e) {
    if ((e.preventDefault(), !a.description.trim())) {
      u(`Descreva a cobrança.`);
      return;
    }
    if (!a.gross_value || a.gross_value <= 0) {
      u(`Informe um valor maior que zero.`);
      return;
    }
    (c(true), u(null));
    let { error: t } = n
      ? await supabase.from(`accounts_receivable`).update(a).eq(`id`, n.id)
      : await supabase.from(`accounts_receivable`).insert([a]);
    (c(false), t ? u(t.message) : i());
  }
  return (
    <Modal
      open
      onClose={r}
      title={n ? `Editar conta a receber` : `Nova conta a receber`}
      width="lg"
    >
      <form onSubmit={f} className="space-y-3">
        <Field label="Descrição">
          <input
            required
            placeholder="Ex: Reparo de tela — OS #12"
            value={a.description}
            onChange={(e) =>
              o({
                ...a,
                description: e.target.value,
              })
            }
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cliente">
            <select
              value={a.client_id ?? ``}
              onChange={(e) =>
                o({
                  ...a,
                  client_id: e.target.value || null,
                  service_order_id: null,
                })
              }
              className={inputClass}
            >
              <option value="">Não vinculado</option>
              {e.map((e) => (
                <option value={e.id} key={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ordem de serviço (opcional)">
            <select
              value={a.service_order_id ?? ``}
              onChange={(e) =>
                o({
                  ...a,
                  service_order_id: e.target.value || null,
                })
              }
              className={inputClass}
            >
              <option value="">Não vinculada</option>
              {d.map((e) => (
                <option value={e.id} key={e.id}>
                  OS #{e.order_number}
                  {' — '}
                  {formatCurrency(e.total_value)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor (R$)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={a.gross_value}
              onChange={(e) =>
                o({
                  ...a,
                  gross_value: Number(e.target.value) || 0,
                })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Vencimento">
            <input
              type="date"
              required
              value={a.due_date}
              onChange={(e) =>
                o({
                  ...a,
                  due_date: e.target.value,
                })
              }
              className={inputClass}
            />
          </Field>
        </div>
        {l && <p className="text-sm text-danger">{l}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={r}
            className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={s}
            className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
          >
            {s ? `Salvando…` : n ? `Salvar alterações` : `Salvar`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function PayableFormModal({
  suppliers: e,
  expenseCategories: t,
  editing: n,
  onClose: r,
  onSaved: i,
}) {
  let [a, o] = useState(
      n
        ? {
            purchase_id: n.purchase_id,
            supplier_id: n.supplier_id,
            expense_category_id: n.expense_category_id,
            description: n.description,
            gross_value: n.gross_value,
            due_date: n.due_date,
          }
        : {
            ...EMPTY_PAYABLE,
            due_date: todayISO(),
          },
    ),
    [s, c] = useState(``),
    [l, u] = useState(false),
    [d, f] = useState(null);
  async function p(e) {
    if ((e.preventDefault(), !a.description.trim())) {
      f(`Descreva a despesa.`);
      return;
    }
    if (!a.gross_value || a.gross_value <= 0) {
      f(`Informe um valor maior que zero.`);
      return;
    }
    (u(true), f(null));
    let t = a.expense_category_id;
    if (s.trim()) {
      let { data: e, error: n } = await supabase
        .from(`expense_categories`)
        .insert([
          {
            name: s.trim(),
          },
        ])
        .select(`*`)
        .single();
      if (n || !e) {
        (u(false), f(n?.message ?? `Erro ao criar categoria de despesa.`));
        return;
      }
      t = e.id;
    }
    let r = {
        ...a,
        expense_category_id: t,
      },
      { error: o } = n
        ? await supabase.from(`accounts_payable`).update(r).eq(`id`, n.id)
        : await supabase.from(`accounts_payable`).insert([r]);
    (u(false), o ? f(o.message) : i());
  }
  return (
    <Modal open onClose={r} title={n ? `Editar conta a pagar` : `Nova conta a pagar`} width="lg">
      <form onSubmit={p} className="space-y-3">
        <Field label="Descrição">
          <input
            required
            placeholder="Ex: Compra de peças — fornecedor X"
            value={a.description}
            onChange={(e) =>
              o({
                ...a,
                description: e.target.value,
              })
            }
            className={inputClass}
          />
        </Field>
        <Field label="Fornecedor (opcional)">
          <select
            value={a.supplier_id ?? ``}
            onChange={(e) =>
              o({
                ...a,
                supplier_id: e.target.value || null,
              })
            }
            className={inputClass}
          >
            <option value="">Não vinculado</option>
            {e.map((e) => (
              <option value={e.id} key={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoria de despesa existente">
            <select
              value={a.expense_category_id ?? ``}
              onChange={(e) =>
                o({
                  ...a,
                  expense_category_id: e.target.value || null,
                })
              }
              className={inputClass}
            >
              <option value="">Sem categoria</option>
              {t.map((e) => (
                <option value={e.id} key={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ou criar nova categoria">
            <input
              placeholder="Ex: Aluguel, Peças, Energia..."
              value={s}
              onChange={(e) => c(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor (R$)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={a.gross_value}
              onChange={(e) =>
                o({
                  ...a,
                  gross_value: Number(e.target.value) || 0,
                })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Vencimento">
            <input
              type="date"
              required
              value={a.due_date}
              onChange={(e) =>
                o({
                  ...a,
                  due_date: e.target.value,
                })
              }
              className={inputClass}
            />
          </Field>
        </div>
        {d && <p className="text-sm text-danger">{d}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={r}
            className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={l}
            className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
          >
            {l ? `Salvando…` : n ? `Salvar alterações` : `Salvar`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function PaymentModal({
  target: e,
  financialAccounts: t,
  userId: n,
  onClose: r,
  onSaved: i,
}) {
  let a = Math.max(0, e.grossValue - e.alreadyPaid),
    [o, s] = useState(a),
    [c, l] = useState(`pix`),
    [u, d] = useState(t[0]?.id ?? ``),
    [f, p] = useState(``),
    [m, h] = useState(`caixa`),
    [g, _] = useState(todayISO()),
    [v, y] = useState(false),
    [b, x] = useState(null);
  async function S(t) {
    if ((t.preventDefault(), !o || o <= 0)) {
      x(`Informe um valor maior que zero.`);
      return;
    }
    if (!f.trim() && !u) {
      x(`Selecione uma conta financeira ou crie uma nova.`);
      return;
    }
    (y(true), x(null));
    let r = u;
    if (f.trim()) {
      let { data: e, error: t } = await supabase
        .from(`financial_accounts`)
        .insert([
          {
            name: f.trim(),
            account_type: m,
            initial_balance: 0,
          },
        ])
        .select(`*`)
        .single();
      if (t || !e) {
        (y(false), x(t?.message ?? `Erro ao criar conta financeira.`));
        return;
      }
      r = e.id;
    }
    let { error: a } = await supabase.from(`payments`).insert([
      {
        direction: e.direction,
        receivable_id: e.direction === `recebimento` ? e.id : null,
        payable_id: e.direction === `pagamento` ? e.id : null,
        financial_account_id: r || null,
        amount: o,
        method: c,
        paid_at: new Date(`${g}T12:00:00`).toISOString(),
        created_by: n,
      },
    ]);
    if (a) {
      (y(false), x(a.message));
      return;
    }
    let s = e.alreadyPaid + o,
      l = s >= e.grossValue ? `pago` : s > 0 ? `parcial` : `aberto`,
      d = e.direction === `recebimento` ? `accounts_receivable` : `accounts_payable`,
      { error: p } = await supabase
        .from(d)
        .update({
          status: l,
        })
        .eq(`id`, e.id);
    (y(false), p && x(`Registrado, mas houve erro ao atualizar o status: ${p.message}`), i());
  }
  let C =
    e.direction === `recebimento`
      ? `Registrar recebimento — ${e.description}`
      : `Registrar pagamento — ${e.description}`;
  return (
    <Modal open onClose={r} title={C} width="md">
      <form onSubmit={S} className="space-y-3">
        <div className="text-sm text-base-400 flex justify-between">
          <span>
            {'Valor total: '}
            <span className="text-base-100">{formatCurrency(e.grossValue)}</span>
          </span>
          <span>
            {'Já '}
            {e.direction === `recebimento` ? `recebido` : `pago`}:{' '}
            <span className="text-base-100">{formatCurrency(e.alreadyPaid)}</span>
          </span>
        </div>
        <Field label="Valor deste pagamento (R$)">
          <input
            type="number"
            min={0}
            step="0.01"
            value={o}
            onChange={(e) => s(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Forma de pagamento">
            <select value={c} onChange={(e) => l(e.target.value)} className={inputClass}>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([e, t]) => (
                <option value={e} key={e}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data">
            <input
              type="date"
              value={g}
              onChange={(e) => _(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Conta financeira">
          <select
            value={u}
            onChange={(e) => d(e.target.value)}
            className={inputClass}
            disabled={!!f.trim()}
          >
            <option value="">Selecione...</option>
            {t.map((e) => (
              <option value={e.id} key={e.id}>
                {e.name}
                {' ('}
                {e.account_type})
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ou criar nova conta">
            <input
              placeholder="Ex: Caixa loja, Banco PJ..."
              value={f}
              onChange={(e) => p(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Tipo da nova conta">
            <select
              value={m}
              onChange={(e) => h(e.target.value)}
              className={inputClass}
              disabled={!f.trim()}
            >
              <option value="caixa">Caixa</option>
              <option value="banco">Banco</option>
              <option value="carteira_digital">Carteira digital</option>
            </select>
          </Field>
        </div>
        {b && <p className="text-sm text-danger">{b}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={r}
            className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={v}
            className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
          >
            {v ? `Salvando…` : `Confirmar`}
          </button>
        </div>
      </form>
    </Modal>
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
