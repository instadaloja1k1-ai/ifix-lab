// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import {
  PackageCheckIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ShoppingCartIcon,
  StarIcon,
  TrashIcon,
  TriangleAlertIcon,
  TruckIcon,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDate, todayISO } from '../lib/format';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const inputClass = `w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500 transition-colors`;
export const EMPTY_SUPPLIER = {
  name: ``,
  company_name: ``,
  document: ``,
  contact_name: ``,
  whatsapp: ``,
  email: ``,
  website: ``,
  address_line: ``,
  categories: ``,
  avg_delivery_days: null,
  payment_terms: ``,
  freight_terms: ``,
  notes: ``,
  quality_rating: null,
  price_rating: null,
  delivery_rating: null,
};
export const PURCHASE_STATUS_LABELS = {
  pendente: `Pendente`,
  parcial: `Recebida parcial`,
  recebido: `Recebida`,
  cancelado: `Cancelada`,
};
export const PURCHASE_STATUS_TONES = {
  pendente: `default`,
  parcial: `warning`,
  recebido: `success`,
  cancelado: `danger`,
};
export function FornecedoresPage() {
  let { user: e } = useAuth(),
    [t, n] = useState(`fornecedores`),
    [r, i] = useState([]),
    [a, o] = useState([]),
    [s, c] = useState([]),
    [l, u] = useState([]),
    [d, f] = useState(true),
    [p, m] = useState(null),
    [h, g] = useState(``),
    [_, v] = useState(false),
    [y, b] = useState(EMPTY_SUPPLIER),
    [x, S] = useState(false),
    [C, T] = useState(null),
    [E, D] = useState(null),
    [O, k] = useState(null),
    [A, j] = useState(false),
    [M, N] = useState(null),
    [ee, P] = useState(null),
    [te, F] = useState(null);
  useEffect(() => {
    isSupabaseConfigured ? ne() : f(false);
  }, []);
  async function ne() {
    (f(true), m(null));
    let [e, t, n, r] = await Promise.all([
        supabase.from(`suppliers`).select(`*`).order(`name`),
        supabase.from(`products`).select(`*`).order(`name`),
        supabase.from(`purchases`).select(`*`).order(`purchase_date`, {
          ascending: false,
        }),
        supabase.from(`expense_categories`).select(`*`).order(`name`),
      ]),
      a = [e, t, n, r].find((e) => e.error);
    (a?.error && m(a.error.message),
      i(e.data ?? []),
      o(t.data ?? []),
      c(n.data ?? []),
      u(r.data ?? []),
      f(false));
  }
  let re = useMemo(() => new Map(r.map((e) => [e.id, e])), [r]),
    ie = useMemo(() => {
      if (!h.trim()) return r;
      let e = h.toLowerCase();
      return r.filter(
        (t) =>
          t.name.toLowerCase().includes(e) ||
          (t.company_name ?? ``).toLowerCase().includes(e) ||
          (t.categories ?? ``).toLowerCase().includes(e),
      );
    }, [r, h]);
  function ae() {
    (D(null), b(EMPTY_SUPPLIER), T(null), v(true));
  }
  function oe(e) {
    (D(e),
      b({
        name: e.name,
        company_name: e.company_name ?? ``,
        document: e.document ?? ``,
        contact_name: e.contact_name ?? ``,
        whatsapp: e.whatsapp ?? ``,
        email: e.email ?? ``,
        website: e.website ?? ``,
        address_line: e.address_line ?? ``,
        categories: e.categories ?? ``,
        avg_delivery_days: e.avg_delivery_days,
        payment_terms: e.payment_terms ?? ``,
        freight_terms: e.freight_terms ?? ``,
        notes: e.notes ?? ``,
        quality_rating: e.quality_rating,
        price_rating: e.price_rating,
        delivery_rating: e.delivery_rating,
      }),
      T(null),
      v(true));
  }
  async function se(e) {
    let { error: t } = await supabase.from(`suppliers`).delete().eq(`id`, e.id);
    if (t)
      throw t.message.toLowerCase().includes(`foreign key`) || t.code === `23503`
        ? Error(
            `Não é possível excluir: este fornecedor já está vinculado a produtos ou compras cadastradas.`,
          )
        : Error(t.message);
    (k(null), ne());
  }
  async function ce(e) {
    if (e.status !== `pendente`)
      throw Error(
        `Não é possível excluir: esta compra já teve itens recebidos (estoque e movimentações já foram gerados). Cancele a compra em vez de excluir.`,
      );
    let { data: t } = await supabase
      .from(`accounts_payable`)
      .select(`id`)
      .eq(`purchase_id`, e.id)
      .maybeSingle();
    if (t) {
      let { error: e } = await supabase.from(`accounts_payable`).delete().eq(`id`, t.id);
      if (e)
        throw e.message.toLowerCase().includes(`foreign key`) || e.code === `23503`
          ? Error(
              `Não é possível excluir: já existem pagamentos registrados para a conta a pagar desta compra. Cancele a conta a pagar em vez de excluir a compra.`,
            )
          : Error(e.message);
    }
    let { error: n } = await supabase.from(`purchases`).delete().eq(`id`, e.id);
    if (n)
      throw n.message.toLowerCase().includes(`foreign key`) || n.code === `23503`
        ? Error(`Não é possível excluir: esta compra já tem movimentações de estoque vinculadas.`)
        : Error(n.message);
    (F(null), ne());
  }
  async function le(e) {
    if ((e.preventDefault(), !y.name.trim())) {
      T(`Informe o nome do fornecedor.`);
      return;
    }
    (S(true), T(null));
    let { error: t } = E
      ? await supabase.from(`suppliers`).update(y).eq(`id`, E.id)
      : await supabase.from(`suppliers`).insert([y]);
    (S(false), t ? T(t.message) : (v(false), ne()));
  }
  return isSupabaseConfigured ? (
    <div>
      <PageHeader
        title="Fornecedores e Compras"
        description="Cadastro de fornecedores de peças e registro de compras (notas de entrada), com baixa automática no estoque e lançamento no financeiro."
        action={
          t === `fornecedores` ? (
            <button
              onClick={ae}
              className="flex items-center gap-1.5 text-sm bg-accent-500 text-base-950 font-medium px-3 py-1.5 rounded-lg hover:bg-accent-400 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              {' Novo fornecedor'}
            </button>
          ) : (
            <button
              onClick={() => j(true)}
              disabled={r.length === 0 || a.length === 0}
              title={
                r.length === 0 || a.length === 0
                  ? `Cadastre um fornecedor e um produto antes de lançar uma compra.`
                  : undefined
              }
              className="flex items-center gap-1.5 text-sm bg-accent-500 text-base-950 font-medium px-3 py-1.5 rounded-lg hover:bg-accent-400 transition-colors disabled:opacity-50"
            >
              <PlusIcon className="w-4 h-4" />
              {' Nova compra'}
            </button>
          )
        }
      />
      <div className="flex gap-1 mb-4 border-b border-base-800">
        <button
          onClick={() => n(`fornecedores`)}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${t === `fornecedores` ? `border-accent-500 text-accent-400` : `border-transparent text-base-400 hover:text-base-200`}`}
        >
          Fornecedores
        </button>
        <button
          onClick={() => n(`compras`)}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${t === `compras` ? `border-accent-500 text-accent-400` : `border-transparent text-base-400 hover:text-base-200`}`}
        >
          Compras
        </button>
      </div>
      {p && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {p}
        </div>
      )}
      {t === `fornecedores` ? (
        <>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="w-4 h-4 text-base-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={h}
                onChange={(e) => g(e.target.value)}
                placeholder="Buscar por nome, razão social, categoria..."
                className="w-full bg-base-900 border border-base-800 rounded-lg pl-9 pr-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500/50"
              />
            </div>
          </div>
          <div className="bg-base-900 border border-base-800 rounded-xl overflow-x-auto">
            {d ? (
              <div className="p-6 text-sm text-base-500">Carregando…</div>
            ) : ie.length === 0 ? (
              <EmptyState
                icon={TruckIcon}
                title="Nenhum fornecedor cadastrado"
                description="Cadastre o primeiro fornecedor de peças usando o botão acima."
              />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-base-500 border-b border-base-800">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Contato</th>
                    <th className="px-4 py-3 font-medium">Categorias</th>
                    <th className="px-4 py-3 font-medium">Prazo médio</th>
                    <th className="px-4 py-3 font-medium">Avaliação</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {ie.map((e) => (
                    <tr
                      className="border-b border-base-800/60 last:border-0 hover:bg-base-850/50"
                      key={e.id}
                    >
                      <td className="px-4 py-3">
                        <p className="text-base-100 font-medium">{e.name}</p>
                        {e.company_name && (
                          <p className="text-xs text-base-500">{e.company_name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-base-300">{e.whatsapp || e.email || `—`}</td>
                      <td className="px-4 py-3 text-base-400">{e.categories || `—`}</td>
                      <td className="px-4 py-3 text-base-400">
                        {e.avg_delivery_days ? `${e.avg_delivery_days} dias` : `—`}
                      </td>
                      <td className="px-4 py-3">
                        {e.quality_rating ? (
                          <div className="flex items-center gap-1 text-accent-400">
                            <StarIcon className="w-3.5 h-3.5 fill-current" />
                            <span className="text-base-300">{e.quality_rating}/5</span>
                          </div>
                        ) : (
                          `—`
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => oe(e)}
                            title="Editar"
                            className="w-7 h-7 flex items-center justify-center rounded-md text-base-500 hover:text-accent-400 hover:bg-base-850"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => k(e)}
                            title="Excluir"
                            className="w-7 h-7 flex items-center justify-center rounded-md text-base-500 hover:text-danger hover:bg-base-850"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="bg-base-900 border border-base-800 rounded-xl overflow-x-auto">
          {d ? (
            <div className="p-6 text-sm text-base-500">Carregando…</div>
          ) : s.length === 0 ? (
            <EmptyState
              icon={ShoppingCartIcon}
              title="Nenhuma compra registrada"
              description="Registre uma compra usando o botão acima. Ao receber os itens, o estoque é atualizado automaticamente e uma conta a pagar é lançada no Financeiro."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-base-500 border-b border-base-800">
                  <th className="px-4 py-3 font-medium">Nº / Nota</th>
                  <th className="px-4 py-3 font-medium">Fornecedor</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {s.map((e) => (
                  <tr
                    className="border-b border-base-800/60 last:border-0 hover:bg-base-850/50"
                    key={e.id}
                  >
                    <td className="px-4 py-3 text-base-200 font-mono text-xs">
                      {e.document_number || `#${e.id.slice(0, 8)}`}
                    </td>
                    <td className="px-4 py-3 text-base-300">
                      {re.get(e.supplier_id)?.name ?? `—`}
                    </td>
                    <td className="px-4 py-3 text-base-400">{formatDate(e.purchase_date)}</td>
                    <td className="px-4 py-3 text-base-100">{formatCurrency(e.total_cost)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={PURCHASE_STATUS_TONES[e.status]}>
                        {PURCHASE_STATUS_LABELS[e.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(e.status === `pendente` || e.status === `parcial`) && (
                          <button
                            onClick={() => N(e)}
                            className="inline-flex items-center gap-1 text-xs text-accent-400 hover:text-accent-300 font-medium"
                          >
                            <PackageCheckIcon className="w-3.5 h-3.5" />
                            {' Receber'}
                          </button>
                        )}
                        {e.status === `pendente` && (
                          <>
                            <button
                              onClick={() => P(e)}
                              title="Editar"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-base-500 hover:text-accent-400 hover:bg-base-850"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => F(e)}
                              title="Excluir"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-base-500 hover:text-danger hover:bg-base-850"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <Modal
        open={_}
        onClose={() => v(false)}
        title={E ? `Editar ${E.name}` : `Novo fornecedor`}
        width="xl"
      >
        <form onSubmit={le} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome">
              <input
                required
                value={y.name}
                onChange={(e) =>
                  b({
                    ...y,
                    name: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Razão social">
              <input
                value={y.company_name ?? ``}
                onChange={(e) =>
                  b({
                    ...y,
                    company_name: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contato">
              <input
                value={y.contact_name ?? ``}
                onChange={(e) =>
                  b({
                    ...y,
                    contact_name: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="WhatsApp">
              <input
                value={y.whatsapp ?? ``}
                onChange={(e) =>
                  b({
                    ...y,
                    whatsapp: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="E-mail">
              <input
                type="email"
                value={y.email ?? ``}
                onChange={(e) =>
                  b({
                    ...y,
                    email: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="CNPJ/CPF">
              <input
                value={y.document ?? ``}
                onChange={(e) =>
                  b({
                    ...y,
                    document: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Categorias de peças fornecidas">
            <input
              placeholder="Ex: telas, baterias, conectores..."
              value={y.categories ?? ``}
              onChange={(e) =>
                b({
                  ...y,
                  categories: e.target.value,
                })
              }
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prazo médio de entrega (dias)">
              <input
                type="number"
                min={0}
                value={y.avg_delivery_days ?? ``}
                onChange={(e) =>
                  b({
                    ...y,
                    avg_delivery_days: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Condições de pagamento">
              <input
                value={y.payment_terms ?? ``}
                onChange={(e) =>
                  b({
                    ...y,
                    payment_terms: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Qualidade (1-5)">
              <input
                type="number"
                min={1}
                max={5}
                value={y.quality_rating ?? ``}
                onChange={(e) =>
                  b({
                    ...y,
                    quality_rating: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Preço (1-5)">
              <input
                type="number"
                min={1}
                max={5}
                value={y.price_rating ?? ``}
                onChange={(e) =>
                  b({
                    ...y,
                    price_rating: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Entrega (1-5)">
              <input
                type="number"
                min={1}
                max={5}
                value={y.delivery_rating ?? ``}
                onChange={(e) =>
                  b({
                    ...y,
                    delivery_rating: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Observações">
            <textarea
              value={y.notes ?? ``}
              onChange={(e) =>
                b({
                  ...y,
                  notes: e.target.value,
                })
              }
              className={inputClass + ` min-h-[50px]`}
            />
          </Field>
          {C && <p className="text-sm text-danger">{C}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => v(false)}
              className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={x}
              className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
            >
              {x ? `Salvando…` : `Salvar`}
            </button>
          </div>
        </form>
      </Modal>
      {(A || ee) && (
        <PurchaseFormModal
          suppliers={r}
          products={a}
          expenseCategories={l}
          userId={e?.id ?? null}
          editing={ee}
          onClose={() => {
            (j(false), P(null));
          }}
          onSaved={() => {
            (j(false), P(null), ne());
          }}
        />
      )}
      {M && (
        <ReceivePurchaseModal
          purchase={M}
          products={a}
          userId={e?.id ?? null}
          onClose={() => N(null)}
          onSaved={() => {
            (N(null), ne());
          }}
        />
      )}
      <ConfirmDialog
        open={!!O}
        title="Excluir fornecedor"
        description={`Tem certeza que deseja excluir "${O?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onClose={() => k(null)}
        onConfirm={() => {
          if (O) return se(O);
        }}
      />
      <ConfirmDialog
        open={!!te}
        title="Excluir compra"
        description={`Tem certeza que deseja excluir a compra "${te?.document_number || (te ? `#` + te.id.slice(0, 8) : ``)}"? A conta a pagar vinculada também será removida. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onClose={() => F(null)}
        onConfirm={() => {
          if (te) return ce(te);
        }}
      />
    </div>
  ) : (
    <div>
      <PageHeader title="Fornecedores e Compras" />
      <EmptyState
        icon={TriangleAlertIcon}
        title="Conecte o Supabase para usar este módulo"
        description="Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env."
      />
    </div>
  );
}
export function emptyPurchaseItem() {
  return {
    product_id: ``,
    quantity_ordered: 1,
    unit_cost: 0,
  };
}
export function PurchaseFormModal({
  suppliers: e,
  products: t,
  expenseCategories: n,
  userId: r,
  editing: i,
  onClose: a,
  onSaved: o,
}) {
  let [s, c] = useState(i?.supplier_id ?? e[0]?.id ?? ``),
    [l, u] = useState(i?.document_number ?? ``),
    [d, f] = useState(i?.purchase_date ?? todayISO()),
    [p, m] = useState(todayISO()),
    [h, g] = useState(i?.payment_method ?? ``),
    [_, v] = useState(i?.installments ?? 1),
    [y, b] = useState(i?.freight_value ?? 0),
    [x, S] = useState(i?.discount_value ?? 0),
    [C, T] = useState(i?.tax_value ?? 0),
    [E, D] = useState(i?.notes ?? ``),
    [O, k] = useState([emptyPurchaseItem()]),
    [A, j] = useState(!!i),
    [M, N] = useState(false),
    [ee, P] = useState(null),
    te = useMemo(() => new Map(t.map((e) => [e.id, e])), [t]);
  useEffect(() => {
    if (!i) return;
    let e = true;
    return (
      j(true),
      Promise.all([
        supabase.from(`purchase_items`).select(`*`).eq(`purchase_id`, i.id),
        supabase.from(`accounts_payable`).select(`due_date`).eq(`purchase_id`, i.id).maybeSingle(),
      ]).then(([t, n]) => {
        if (!e) return;
        let r = t.data ?? [];
        (k(
          r.length > 0
            ? r.map((e) => ({
                product_id: e.product_id,
                quantity_ordered: e.quantity_ordered,
                unit_cost: e.unit_cost,
              }))
            : [emptyPurchaseItem()],
        ),
          n.data?.due_date && m(n.data.due_date),
          j(false));
      }),
      () => {
        e = false;
      }
    );
  }, [i]);
  function F(e, t) {
    k((n) =>
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
  function ne(e) {
    k((t) => t.filter((t, n) => n !== e));
  }
  let re = useMemo(() => O.reduce((e, t) => e + t.quantity_ordered * t.unit_cost, 0), [O]),
    ie = Math.max(0, re + y + C - x);
  async function ae(t) {
    if ((t.preventDefault(), !s)) {
      P(`Selecione o fornecedor.`);
      return;
    }
    let a = O.filter((e) => e.product_id && e.quantity_ordered > 0);
    if (a.length === 0) {
      P(`Adicione ao menos um item com produto e quantidade.`);
      return;
    }
    if (!p) {
      P(`Informe o vencimento da conta a pagar gerada por esta compra.`);
      return;
    }
    if ((N(true), P(null), i)) {
      let { error: t } = await supabase
        .from(`purchases`)
        .update({
          supplier_id: s,
          document_number: l || null,
          purchase_date: d,
          freight_value: y,
          discount_value: x,
          tax_value: C,
          total_cost: ie,
          payment_method: h || null,
          installments: _ || 1,
          notes: E || null,
        })
        .eq(`id`, i.id);
      if (t) {
        (N(false), P(t.message));
        return;
      }
      let { error: n } = await supabase.from(`purchase_items`).delete().eq(`purchase_id`, i.id);
      if (n) {
        (N(false),
          P(`Dados da compra salvos, mas houve erro ao atualizar os itens: ${n.message}`),
          o());
        return;
      }
      let r = a.map((e) => ({
          purchase_id: i.id,
          product_id: e.product_id,
          quantity_ordered: e.quantity_ordered,
          quantity_received: 0,
          unit_cost: e.unit_cost,
        })),
        { error: c } = await supabase.from(`purchase_items`).insert(r);
      if (c) {
        (N(false), P(`Compra atualizada, mas houve erro ao salvar os itens: ${c.message}`), o());
        return;
      }
      let u = e.find((e) => e.id === s)?.name ?? `fornecedor`,
        { error: f } = await supabase
          .from(`accounts_payable`)
          .update({
            supplier_id: s,
            description: `Compra${l ? ` ` + l : ``} — ${u}`,
            gross_value: ie,
            due_date: p,
          })
          .eq(`purchase_id`, i.id);
      if ((N(false), f)) {
        (P(
          `Compra atualizada, mas houve erro ao atualizar a conta a pagar vinculada: ${f.message}`,
        ),
          o());
        return;
      }
      o();
      return;
    }
    let c = {
        supplier_id: s,
        document_number: l || null,
        purchase_date: d,
        received_date: null,
        freight_value: y,
        discount_value: x,
        tax_value: C,
        total_cost: ie,
        payment_method: h || null,
        installments: _ || 1,
        notes: E || null,
        created_by: r,
      },
      { data: u, error: f } = await supabase.from(`purchases`).insert([c]).select(`*`).single();
    if (f || !u) {
      (N(false), P(f?.message ?? `Erro ao salvar a compra.`));
      return;
    }
    let m = a.map((e) => ({
        purchase_id: u.id,
        product_id: e.product_id,
        quantity_ordered: e.quantity_ordered,
        quantity_received: 0,
        unit_cost: e.unit_cost,
      })),
      { error: g } = await supabase.from(`purchase_items`).insert(m);
    if (g) {
      (N(false), P(`Compra criada, mas houve erro ao salvar os itens: ${g.message}`), o());
      return;
    }
    let v = n.find((e) => e.name.toLowerCase() === `compra de peças`)?.id ?? null;
    if (!v) {
      let { data: e } = await supabase
        .from(`expense_categories`)
        .insert([
          {
            name: `Compra de peças`,
          },
        ])
        .select(`*`)
        .single();
      v = e?.id ?? null;
    }
    let b = e.find((e) => e.id === s)?.name ?? `fornecedor`,
      { error: S } = await supabase.from(`accounts_payable`).insert([
        {
          purchase_id: u.id,
          supplier_id: s,
          expense_category_id: v,
          description: `Compra${l ? ` ` + l : ``} — ${b}`,
          gross_value: ie,
          due_date: p,
        },
      ]);
    (N(false),
      S && P(`Compra registrada, mas houve erro ao lançar a conta a pagar: ${S.message}`),
      o());
  }
  return (
    <Modal open onClose={a} title={i ? `Editar compra` : `Nova compra`} width="2xl">
      {A ? (
        <p className="text-sm text-base-500 py-6 text-center">Carregando dados da compra…</p>
      ) : (
        <form onSubmit={ae} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fornecedor">
              <select value={s} onChange={(e) => c(e.target.value)} className={inputClass}>
                <option value="">Selecione...</option>
                {e.map((e) => (
                  <option value={e.id} key={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nº da nota (opcional)">
              <input value={l} onChange={(e) => u(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data da compra">
              <input
                type="date"
                value={d}
                onChange={(e) => f(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Vencimento (conta a pagar)">
              <input
                type="date"
                value={p}
                onChange={(e) => m(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Forma de pagamento">
              <input
                placeholder="Ex: boleto, pix, cartão..."
                value={h}
                onChange={(e) => g(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Parcelas">
              <input
                type="number"
                min={1}
                value={_}
                onChange={(e) => v(Number(e.target.value) || 1)}
                className={inputClass}
              />
            </Field>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-base-400">Itens (peças do estoque)</p>
              <button
                type="button"
                onClick={() => k((e) => [...e, emptyPurchaseItem()])}
                className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                {' Adicionar item'}
              </button>
            </div>
            <div className="space-y-2">
              {O.map((e, n) => {
                let r = e.product_id ? te.get(e.product_id) : null;
                return (
                  <div
                    className="bg-base-850/50 border border-base-800 rounded-lg p-2 grid grid-cols-12 gap-2 items-center"
                    key={n}
                  >
                    <select
                      value={e.product_id}
                      onChange={(e) => {
                        let t = e.target.value,
                          r = t ? te.get(t) : null;
                        F(n, {
                          product_id: t,
                          ...(r
                            ? {
                                unit_cost: r.unit_cost,
                              }
                            : {}),
                        });
                      }}
                      className="col-span-6 bg-base-850 border border-base-700 rounded-md px-2 py-1.5 text-xs text-base-200 outline-none"
                    >
                      <option value="">Selecione o produto...</option>
                      {t.map((e) => (
                        <option value={e.id} key={e.id}>
                          {e.name} {e.sku ? `(${e.sku})` : ``}
                          {' — estoque: '}
                          {e.quantity_available}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0.01}
                      step="0.01"
                      title="Quantidade"
                      value={e.quantity_ordered}
                      onChange={(e) =>
                        F(n, {
                          quantity_ordered: Number(e.target.value) || 0,
                        })
                      }
                      className="col-span-2 bg-base-850 border border-base-700 rounded-md px-2 py-1.5 text-xs text-base-200 outline-none"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      title="Custo unitário"
                      placeholder="Custo"
                      value={e.unit_cost}
                      onChange={(e) =>
                        F(n, {
                          unit_cost: Number(e.target.value) || 0,
                        })
                      }
                      className="col-span-3 bg-base-850 border border-base-700 rounded-md px-2 py-1.5 text-xs text-base-200 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => ne(n)}
                      className="col-span-1 flex items-center justify-center text-base-500 hover:text-danger"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    {r && (
                      <p className="col-span-12 text-xs text-base-500">
                        {'Subtotal: '}
                        {formatCurrency(e.quantity_ordered * e.unit_cost)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Frete (R$)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={y}
                onChange={(e) => b(Number(e.target.value) || 0)}
                className={inputClass}
              />
            </Field>
            <Field label="Desconto (R$)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={x}
                onChange={(e) => S(Number(e.target.value) || 0)}
                className={inputClass}
              />
            </Field>
            <Field label="Impostos (R$)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={C}
                onChange={(e) => T(Number(e.target.value) || 0)}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="bg-base-850/50 border border-base-800 rounded-lg px-3 py-2 text-sm flex justify-between font-medium text-base-100">
            <span>Total da compra</span>
            <span>{formatCurrency(ie)}</span>
          </div>
          <Field label="Observações">
            <textarea
              value={E}
              onChange={(e) => D(e.target.value)}
              className={inputClass + ` min-h-[50px]`}
            />
          </Field>
          <p className="text-xs text-base-500">
            Ao salvar, uma conta a pagar é lançada automaticamente no Financeiro com o valor total e
            o vencimento acima. O estoque só é atualizado quando os itens forem recebidos (botão
            "Receber" na lista de compras).
          </p>
          {ee && <p className="text-sm text-danger">{ee}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={a}
              className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={M}
              className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
            >
              {M ? `Salvando…` : i ? `Salvar alterações` : `Salvar compra`}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
export function ReceivePurchaseModal({
  purchase: e,
  products: t,
  userId: n,
  onClose: r,
  onSaved: i,
}) {
  let [a, o] = useState([]),
    [s, c] = useState({}),
    [l, u] = useState(true),
    [d, f] = useState(false),
    [p, m] = useState(null),
    h = useMemo(() => new Map(t.map((e) => [e.id, e])), [t]);
  useEffect(() => {
    supabase
      .from(`purchase_items`)
      .select(`*`)
      .eq(`purchase_id`, e.id)
      .then(({ data: e }) => {
        let t = e ?? [];
        o(t);
        let n = {};
        for (let e of t) n[e.id] = Math.max(0, e.quantity_ordered - e.quantity_received);
        (c(n), u(false));
      });
  }, [e.id]);
  async function g(t) {
    if ((t.preventDefault(), a.filter((e) => (s[e.id] ?? 0) > 0).length === 0)) {
      m(`Informe uma quantidade a receber maior que zero em pelo menos um item.`);
      return;
    }
    (f(true), m(null));
    let r = [],
      o = true,
      c = false;
    for (let t of a) {
      let i = s[t.id] ?? 0,
        a = t.quantity_received + i;
      if ((a < t.quantity_ordered && (o = false), a > 0 && (c = true), i <= 0)) continue;
      let { error: l } = await supabase
        .from(`purchase_items`)
        .update({
          quantity_received: a,
        })
        .eq(`id`, t.id);
      if (l) {
        r.push(`Erro ao atualizar item recebido: ${l.message}`);
        continue;
      }
      let { data: u, error: d } = await supabase
        .from(`products`)
        .select(`quantity_available`)
        .eq(`id`, t.product_id)
        .single();
      if (d || !u) {
        r.push(
          `Não foi possível atualizar o estoque de "${h.get(t.product_id)?.name ?? t.product_id}".`,
        );
        continue;
      }
      let f = u.quantity_available + i,
        { error: p } = await supabase
          .from(`products`)
          .update({
            quantity_available: f,
          })
          .eq(`id`, t.product_id);
      p
        ? r.push(`Erro ao atualizar estoque: ${p.message}`)
        : await supabase.from(`stock_movements`).insert([
            {
              product_id: t.product_id,
              movement_type: `entrada_compra`,
              quantity: i,
              unit_cost: t.unit_cost,
              purchase_id: e.id,
              reason: `Recebimento da compra ${e.document_number || `#` + e.id.slice(0, 8)}`,
              created_by: n,
            },
          ]);
    }
    let l = o ? `recebido` : c ? `parcial` : e.status,
      { error: u } = await supabase
        .from(`purchases`)
        .update({
          status: l,
          received_date: l === `recebido` ? todayISO() : e.received_date,
        })
        .eq(`id`, e.id);
    (u && r.push(`Erro ao atualizar status da compra: ${u.message}`),
      f(false),
      r.length > 0 && m(r.join(` `)),
      i());
  }
  return (
    <Modal
      open
      onClose={r}
      title={`Receber compra — ${e.document_number || `#` + e.id.slice(0, 8)}`}
      width="xl"
    >
      <form onSubmit={g} className="space-y-3">
        {l ? (
          <p className="text-sm text-base-500">Carregando itens…</p>
        ) : a.length === 0 ? (
          <p className="text-sm text-base-500">Esta compra não tem itens.</p>
        ) : (
          <div className="space-y-2">
            {a.map((e) => {
              let t = h.get(e.product_id),
                n = Math.max(0, e.quantity_ordered - e.quantity_received);
              return (
                <div
                  className="bg-base-850/50 border border-base-800 rounded-lg p-3 flex items-center justify-between gap-3"
                  key={e.id}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-base-100 font-medium truncate">
                      {t?.name ?? e.product_id}
                    </p>
                    <p className="text-xs text-base-500">
                      {'Pedido: '}
                      {e.quantity_ordered}
                      {' · Já recebido: '}
                      {e.quantity_received}
                      {' · Pendente: '}
                      {n}
                    </p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={n}
                    step="0.01"
                    value={s[e.id] ?? 0}
                    onChange={(t) =>
                      c((n) => ({
                        ...n,
                        [e.id]: Number(t.target.value) || 0,
                      }))
                    }
                    disabled={n === 0}
                    className="w-24 bg-base-850 border border-base-700 rounded-md px-2 py-1.5 text-sm text-base-100 outline-none text-right disabled:opacity-40"
                  />
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-base-500">
          Recebimento parcial é permitido: se nem tudo chegou, informe só a quantidade recebida
          agora — o restante fica pendente para um próximo recebimento.
        </p>
        {p && <p className="text-sm text-danger">{p}</p>}
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
            disabled={d || l}
            className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
          >
            {d ? `Salvando…` : `Confirmar recebimento`}
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
