// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import {
  PackageIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  TrashIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDateTime } from '../lib/format';
import { canEdit } from '../lib/permissions';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const inputClass = `w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500 transition-colors`;
export const EMPTY_PRODUCT = {
  sku: ``,
  name: ``,
  category_id: null,
  compatible_brand: ``,
  compatible_models: ``,
  description: ``,
  main_supplier_id: null,
  unit_cost: 0,
  sale_price: null,
  quantity_available: 0,
  minimum_stock: 0,
  location: ``,
  status: `ativo`,
};
export function EstoquePage() {
  let { user: e, profile: t, configError: n } = useAuth(),
    r = n || !t || canEdit(t.role, `estoque`),
    [i, a] = useState([]),
    [o, s] = useState([]),
    [c, l] = useState([]),
    [u, d] = useState(true),
    [f, p] = useState(null),
    [m, h] = useState(``),
    [g, _] = useState(false),
    [v, y] = useState(false),
    [b, x] = useState(EMPTY_PRODUCT),
    [S, C] = useState(``),
    [T, E] = useState(false),
    [D, O] = useState(null),
    [k, A] = useState(null),
    [j, M] = useState(null),
    [N, ee] = useState(null);
  useEffect(() => {
    isSupabaseConfigured ? P() : d(false);
  }, []);
  async function P() {
    (d(true), p(null));
    let [e, t, n] = await Promise.all([
        supabase.from(`products`).select(`*`).order(`name`),
        supabase.from(`product_categories`).select(`*`).order(`name`),
        supabase.from(`suppliers`).select(`*`).order(`name`),
      ]),
      r = [e, t, n].find((e) => e.error);
    (r?.error && p(r.error.message), a(e.data ?? []), s(t.data ?? []), l(n.data ?? []), d(false));
  }
  let te = useMemo(() => new Map(o.map((e) => [e.id, e])), [o]),
    F = useMemo(
      () =>
        i.filter((e) => {
          if (g && e.quantity_available > e.minimum_stock) return false;
          if (!m.trim()) return true;
          let t = m.toLowerCase();
          return (
            e.name.toLowerCase().includes(t) ||
            (e.sku ?? ``).toLowerCase().includes(t) ||
            (e.compatible_models ?? ``).toLowerCase().includes(t)
          );
        }),
      [i, m, g],
    ),
    ne = useMemo(() => i.filter((e) => e.quantity_available <= e.minimum_stock).length, [i]);
  function re() {
    (M(null), x(EMPTY_PRODUCT), C(``), O(null), y(true));
  }
  function ie(e) {
    (M(e),
      x({
        sku: e.sku ?? ``,
        name: e.name,
        category_id: e.category_id,
        compatible_brand: e.compatible_brand ?? ``,
        compatible_models: e.compatible_models ?? ``,
        description: e.description ?? ``,
        main_supplier_id: e.main_supplier_id,
        unit_cost: e.unit_cost,
        sale_price: e.sale_price,
        quantity_available: e.quantity_available,
        minimum_stock: e.minimum_stock,
        location: e.location ?? ``,
        status: e.status,
      }),
      C(``),
      O(null),
      y(true));
  }
  async function ae(e) {
    let { error: t } = await supabase.from(`products`).delete().eq(`id`, e.id);
    if (t)
      throw t.message.toLowerCase().includes(`foreign key`) || t.code === `23503`
        ? Error(
            `Não é possível excluir: esta peça já foi usada em uma OS, compra ou movimentação de estoque. Marque como "Inativo" em vez de excluir.`,
          )
        : Error(t.message);
    (ee(null), P());
  }
  async function oe(t) {
    if ((t.preventDefault(), !b.name.trim())) {
      O(`Informe o nome da peça/produto.`);
      return;
    }
    (E(true), O(null));
    let n = b.category_id;
    if (S.trim()) {
      let { data: e, error: t } = await supabase
        .from(`product_categories`)
        .insert([
          {
            name: S.trim(),
          },
        ])
        .select(`*`)
        .single();
      if (t || !e) {
        (E(false), O(t?.message ?? `Erro ao criar categoria.`));
        return;
      }
      n = e.id;
    }
    if (j) {
      let { error: e } = await supabase
        .from(`products`)
        .update({
          sku: b.sku,
          name: b.name,
          category_id: n,
          compatible_brand: b.compatible_brand,
          compatible_models: b.compatible_models,
          description: b.description,
          main_supplier_id: b.main_supplier_id,
          unit_cost: b.unit_cost,
          sale_price: b.sale_price,
          minimum_stock: b.minimum_stock,
          location: b.location,
          status: b.status,
        })
        .eq(`id`, j.id);
      if ((E(false), e)) {
        O(e.message);
        return;
      }
      (y(false), P());
      return;
    }
    let r = {
        ...b,
        category_id: n,
      },
      { data: i, error: a } = await supabase.from(`products`).insert([r]).select(`id`).single();
    a || !i
      ? (E(false), O(a?.message ?? `Erro ao salvar o produto.`))
      : (b.quantity_available &&
          b.quantity_available > 0 &&
          (await supabase.from(`stock_movements`).insert([
            {
              product_id: i.id,
              movement_type: `ajuste_inventario`,
              quantity: b.quantity_available,
              unit_cost: b.unit_cost,
              reason: `Estoque inicial no cadastro`,
              created_by: e?.id ?? null,
            },
          ])),
        E(false),
        y(false),
        P());
  }
  return isSupabaseConfigured ? (
    <div>
      <PageHeader
        title="Estoque"
        description="Peças e produtos, com controle de quantidade e alerta de estoque mínimo."
        action={
          r ? (
            <button
              onClick={re}
              className="flex items-center gap-1.5 text-sm bg-accent-500 text-base-950 font-medium px-3 py-1.5 rounded-lg hover:bg-accent-400 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              {' Nova peça/produto'}
            </button>
          ) : undefined
        }
      />
      {ne > 0 && !u && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning flex items-center justify-between">
          <span>
            {ne} {ne === 1 ? `item está` : `itens estão`}
            {' no estoque mínimo ou abaixo dele.'}
          </span>
          <button onClick={() => _(true)} className="underline hover:no-underline">
            Ver apenas estes
          </button>
        </div>
      )}
      <div className="flex gap-2 mb-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="w-4 h-4 text-base-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={m}
            onChange={(e) => h(e.target.value)}
            placeholder="Buscar por nome, SKU, modelo compatível..."
            className="w-full bg-base-900 border border-base-800 rounded-lg pl-9 pr-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500/50"
          />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-base-400 cursor-pointer">
          <input type="checkbox" checked={g} onChange={(e) => _(e.target.checked)} />
          Só estoque baixo
        </label>
      </div>
      {f && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {f}
        </div>
      )}
      <div className="bg-base-900 border border-base-800 rounded-xl overflow-x-auto">
        {u ? (
          <div className="p-6 text-sm text-base-500">Carregando…</div>
        ) : F.length === 0 ? (
          <EmptyState
            icon={PackageIcon}
            title="Nenhuma peça ou produto cadastrado"
            description="Cadastre a primeira peça usando o botão acima."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-base-500 border-b border-base-800">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium">Custo</th>
                <th className="px-4 py-3 font-medium">Venda</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {r && <th className="px-4 py-3 font-medium" />}
              </tr>
            </thead>
            <tbody>
              {F.map((e) => {
                let t = e.quantity_available <= e.minimum_stock;
                return (
                  <tr
                    className="border-b border-base-800/60 last:border-0 hover:bg-base-850/50"
                    key={e.id}
                  >
                    <td className="px-4 py-3">
                      <p className="text-base-100 font-medium">{e.name}</p>
                      {e.sku && <p className="text-xs text-base-500 font-mono">{e.sku}</p>}
                    </td>
                    <td className="px-4 py-3 text-base-400">
                      {e.category_id ? (te.get(e.category_id)?.name ?? `—`) : `—`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={t ? `danger` : `default`}>
                        {e.quantity_available} {t && `· mínimo`}
                      </Badge>
                      <span className="text-xs text-base-500 ml-1">
                        {'mín. '}
                        {e.minimum_stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-base-300">{formatCurrency(e.unit_cost)}</td>
                    <td className="px-4 py-3 text-base-300">
                      {e.sale_price == null ? `—` : formatCurrency(e.sale_price)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={e.status === `ativo` ? `success` : `default`}>{e.status}</Badge>
                    </td>
                    {r && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => A(e)}
                            title="Ajustar estoque"
                            className="inline-flex items-center gap-1 text-xs text-base-400 hover:text-accent-400"
                          >
                            <SlidersHorizontalIcon className="w-3.5 h-3.5" />
                            {' Ajustar'}
                          </button>
                          <button
                            onClick={() => ie(e)}
                            title="Editar"
                            className="w-7 h-7 flex items-center justify-center rounded-md text-base-500 hover:text-accent-400 hover:bg-base-850"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => ee(e)}
                            title="Excluir"
                            className="w-7 h-7 flex items-center justify-center rounded-md text-base-500 hover:text-danger hover:bg-base-850"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <Modal
        open={v}
        onClose={() => y(false)}
        title={j ? `Editar ${j.name}` : `Nova peça/produto`}
        width="xl"
      >
        <form onSubmit={oe} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome">
              <input
                required
                value={b.name}
                onChange={(e) =>
                  x({
                    ...b,
                    name: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="SKU / código">
              <input
                value={b.sku ?? ``}
                onChange={(e) =>
                  x({
                    ...b,
                    sku: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria existente">
              <select
                value={b.category_id ?? ``}
                onChange={(e) =>
                  x({
                    ...b,
                    category_id: e.target.value || null,
                  })
                }
                className={inputClass}
              >
                <option value="">Sem categoria</option>
                {o.map((e) => (
                  <option value={e.id} key={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ou criar nova categoria">
              <input
                placeholder="Ex: Telas, Baterias..."
                value={S}
                onChange={(e) => C(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca compatível">
              <input
                value={b.compatible_brand ?? ``}
                onChange={(e) =>
                  x({
                    ...b,
                    compatible_brand: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Modelos compatíveis">
              <input
                placeholder="Ex: iPhone 13, 13 Pro"
                value={b.compatible_models ?? ``}
                onChange={(e) =>
                  x({
                    ...b,
                    compatible_models: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Fornecedor principal">
            <select
              value={b.main_supplier_id ?? ``}
              onChange={(e) =>
                x({
                  ...b,
                  main_supplier_id: e.target.value || null,
                })
              }
              className={inputClass}
            >
              <option value="">Não definido</option>
              {c.map((e) => (
                <option value={e.id} key={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Custo unitário (R$)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={b.unit_cost}
                onChange={(e) =>
                  x({
                    ...b,
                    unit_cost: Number(e.target.value) || 0,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Preço de venda (R$)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={b.sale_price ?? ``}
                onChange={(e) =>
                  x({
                    ...b,
                    sale_price: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label={j ? `Estoque atual (use "Ajustar")` : `Estoque inicial`}>
              <input
                type="number"
                min={0}
                step="0.01"
                disabled={!!j}
                value={b.quantity_available}
                onChange={(e) =>
                  x({
                    ...b,
                    quantity_available: Number(e.target.value) || 0,
                  })
                }
                className={inputClass + (j ? ` opacity-50 cursor-not-allowed` : ``)}
              />
            </Field>
            <Field label="Estoque mínimo">
              <input
                type="number"
                min={0}
                step="0.01"
                value={b.minimum_stock}
                onChange={(e) =>
                  x({
                    ...b,
                    minimum_stock: Number(e.target.value) || 0,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Localização">
              <input
                placeholder="Gaveta, prateleira..."
                value={b.location ?? ``}
                onChange={(e) =>
                  x({
                    ...b,
                    location: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Status">
            <select
              value={b.status}
              onChange={(e) =>
                x({
                  ...b,
                  status: e.target.value,
                })
              }
              className={inputClass}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </Field>
          <Field label="Descrição">
            <textarea
              value={b.description ?? ``}
              onChange={(e) =>
                x({
                  ...b,
                  description: e.target.value,
                })
              }
              className={inputClass + ` min-h-[50px]`}
            />
          </Field>
          {D && <p className="text-sm text-danger">{D}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => y(false)}
              className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={T}
              className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
            >
              {T ? `Salvando…` : `Salvar`}
            </button>
          </div>
        </form>
      </Modal>
      {k && <AdjustStockModal product={k} onClose={() => A(null)} onChanged={() => P()} />}
      <ConfirmDialog
        open={!!N}
        title="Excluir peça/produto"
        description={`Tem certeza que deseja excluir "${N?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onClose={() => ee(null)}
        onConfirm={() => {
          if (N) return ae(N);
        }}
      />
    </div>
  ) : (
    <div>
      <PageHeader title="Estoque" />
      <EmptyState
        icon={TriangleAlertIcon}
        title="Conecte o Supabase para usar este módulo"
        description="Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env."
      />
    </div>
  );
}
export function AdjustStockModal({ product: e, onClose: t, onChanged: n }) {
  let { user: r } = useAuth(),
    [i, a] = useState(0),
    [o, s] = useState(``),
    [c, l] = useState(false),
    [u, d] = useState(null),
    [f, p] = useState([]),
    [m, h] = useState(true);
  useEffect(() => {
    supabase
      .from(`stock_movements`)
      .select(`id, quantity, reason, created_at`)
      .eq(`product_id`, e.id)
      .order(`created_at`, {
        ascending: false,
      })
      .limit(10)
      .then(({ data: e }) => {
        (p(e ?? []), h(false));
      });
  }, [e.id]);
  let g = e.quantity_available + i;
  async function _(a) {
    if ((a.preventDefault(), i === 0)) {
      d(`Informe uma quantidade diferente de zero.`);
      return;
    }
    if (!o.trim()) {
      d(`Descreva o motivo do ajuste.`);
      return;
    }
    (l(true), d(null));
    let { error: s } = await supabase
      .from(`products`)
      .update({
        quantity_available: g,
      })
      .eq(`id`, e.id);
    if (s) {
      (l(false), d(s.message));
      return;
    }
    let { error: c } = await supabase.from(`stock_movements`).insert([
      {
        product_id: e.id,
        movement_type: `ajuste_inventario`,
        quantity: i,
        unit_cost: e.unit_cost,
        reason: o,
        created_by: r?.id ?? null,
      },
    ]);
    c
      ? (l(false),
        d(`Estoque atualizado, mas houve erro ao registrar o histórico: ${c.message}`),
        n())
      : (l(false), n(), t());
  }
  return (
    <Modal open onClose={t} title={`Ajustar estoque — ${e.name}`} width="md">
      <form onSubmit={_} className="space-y-3">
        <p className="text-sm text-base-400">
          {'Estoque atual: '}
          <span className="text-base-100 font-medium">{e.quantity_available}</span>
        </p>
        <Field label="Quantidade (use negativo para dar baixa)">
          <input
            type="number"
            step="0.01"
            value={i}
            onChange={(e) => a(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </Field>
        <p className="text-xs text-base-500">
          {'Estoque após o ajuste: '}
          <span className={g < 0 ? `text-danger` : `text-base-300`}>{g}</span>
        </p>
        <Field label="Motivo">
          <input
            required
            placeholder="Ex: contagem de inventário, peça com defeito, devolução..."
            value={o}
            onChange={(e) => s(e.target.value)}
            className={inputClass}
          />
        </Field>
        {u && <p className="text-sm text-danger">{u}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={t}
            className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={c}
            className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
          >
            {c ? `Salvando…` : `Confirmar ajuste`}
          </button>
        </div>
        <div className="pt-3 border-t border-base-800">
          <p className="text-xs font-medium text-base-400 mb-2">Últimas movimentações</p>
          {m ? (
            <p className="text-xs text-base-500">Carregando…</p>
          ) : f.length === 0 ? (
            <p className="text-xs text-base-500">Nenhuma movimentação registrada ainda.</p>
          ) : (
            <div className="space-y-1">
              {f.map((e) => (
                <div className="text-xs text-base-500 flex justify-between" key={e.id}>
                  <span>
                    {formatDateTime(e.created_at)} {e.reason && `— ${e.reason}`}
                  </span>
                  <span className={e.quantity < 0 ? `text-danger` : `text-success`}>
                    {e.quantity > 0 ? `+` : ``}
                    {e.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
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
