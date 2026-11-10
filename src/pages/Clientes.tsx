// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import {
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  StoreIcon,
  TrashIcon,
  TriangleAlertIcon,
  UsersIcon,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/format';
import { canEdit } from '../lib/permissions';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const inputClass = `w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500 transition-colors`;
export const EMPTY_CLIENT = {
  kind: `final`,
  name: ``,
  phone: ``,
  whatsapp: ``,
  email: ``,
  document: ``,
  notes: ``,
  status: `ativo`,
  company_name: ``,
  responsible_name: ``,
  payment_terms_days: null,
  credit_limit: null,
  commercial_condition: ``,
  address_line: ``,
  city: ``,
  state: ``,
  zip_code: ``,
};
export function ClientesPage() {
  let { profile: e, configError: t } = useAuth(),
    n = t || !e || canEdit(e.role, `clientes`),
    [r, i] = useState([]),
    [a, o] = useState(true),
    [s, c] = useState(null),
    [l, u] = useState(``),
    [d, f] = useState(`todos`),
    [p, m] = useState(false),
    [h, g] = useState(EMPTY_CLIENT),
    [_, v] = useState(false),
    [y, b] = useState(null),
    [x, S] = useState(null),
    [C, T] = useState(null);
  useEffect(() => {
    isSupabaseConfigured ? E() : o(false);
  }, []);
  async function E() {
    (o(true), c(null));
    let { data: e, error: t } = await supabase.from(`clients`).select(`*`).order(`created_at`, {
      ascending: false,
    });
    (t ? c(t.message) : i(e ?? []), o(false));
  }
  let D = useMemo(
    () =>
      r.filter((e) => {
        if (d !== `todos` && e.kind !== d) return false;
        if (!l.trim()) return true;
        let t = l.toLowerCase();
        return (
          e.name.toLowerCase().includes(t) ||
          (e.phone ?? ``).includes(t) ||
          (e.document ?? ``).includes(t) ||
          (e.company_name ?? ``).toLowerCase().includes(t)
        );
      }),
    [r, l, d],
  );
  function O(e) {
    (S(null),
      g({
        ...EMPTY_CLIENT,
        kind: e,
      }),
      b(null),
      m(true));
  }
  function k(e) {
    (S(e.id),
      g({
        kind: e.kind,
        name: e.name,
        phone: e.phone ?? ``,
        whatsapp: e.whatsapp ?? ``,
        email: e.email ?? ``,
        document: e.document ?? ``,
        notes: e.notes ?? ``,
        status: e.status,
        company_name: e.company_name ?? ``,
        responsible_name: e.responsible_name ?? ``,
        payment_terms_days: e.payment_terms_days,
        credit_limit: e.credit_limit,
        commercial_condition: e.commercial_condition ?? ``,
        address_line: e.address_line ?? ``,
        city: e.city ?? ``,
        state: e.state ?? ``,
        zip_code: e.zip_code ?? ``,
      }),
      b(null),
      m(true));
  }
  async function A(e) {
    if ((e.preventDefault(), !h.name.trim())) {
      b(`Informe o nome.`);
      return;
    }
    (v(true), b(null));
    let { error: t } = x
      ? await supabase.from(`clients`).update(h).eq(`id`, x)
      : await supabase.from(`clients`).insert([h]);
    (v(false), t ? b(t.message) : (m(false), E()));
  }
  async function j(e) {
    let { error: t } = await supabase.from(`clients`).delete().eq(`id`, e.id);
    if (t)
      throw t.message.toLowerCase().includes(`foreign key`) || t.code === `23503`
        ? Error(
            `Não é possível excluir: este cliente tem aparelhos, ordens de serviço ou lançamentos financeiros vinculados. Marque como "Inativo" ou "Bloqueado" em vez de excluir.`,
          )
        : Error(t.message);
    (T(null), E());
  }
  return isSupabaseConfigured ? (
    <div>
      <PageHeader
        title="Clientes e Lojistas"
        description="Lojistas parceiros (B2B) e clientes finais (B2C)."
        action={
          n ? (
            <div className="flex gap-2">
              <button
                onClick={() => O(`lojista`)}
                className="flex items-center gap-1.5 text-sm bg-base-850 border border-base-700 text-base-200 px-3 py-1.5 rounded-lg hover:border-accent-500/50 transition-colors"
              >
                <StoreIcon className="w-4 h-4" />
                {' Novo lojista'}
              </button>
              <button
                onClick={() => O(`final`)}
                className="flex items-center gap-1.5 text-sm bg-accent-500 text-base-950 font-medium px-3 py-1.5 rounded-lg hover:bg-accent-400 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                {' Novo cliente'}
              </button>
            </div>
          ) : undefined
        }
      />
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="w-4 h-4 text-base-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={l}
            onChange={(e) => u(e.target.value)}
            placeholder="Buscar por nome, telefone, CPF/CNPJ..."
            className="w-full bg-base-900 border border-base-800 rounded-lg pl-9 pr-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500/50"
          />
        </div>
        <select
          value={d}
          onChange={(e) => f(e.target.value)}
          className="bg-base-900 border border-base-800 rounded-lg px-3 py-2 text-sm text-base-200 outline-none"
        >
          <option value="todos">Todos</option>
          <option value="lojista">Lojistas</option>
          <option value="final">Clientes finais</option>
        </select>
      </div>
      {s && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {s}
        </div>
      )}
      <div className="bg-base-900 border border-base-800 rounded-xl overflow-hidden">
        {a ? (
          <div className="p-6 text-sm text-base-500">Carregando…</div>
        ) : D.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Nenhum cliente cadastrado"
            description="Cadastre o primeiro lojista ou cliente final usando os botões acima."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-base-500 border-b border-base-800">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Cadastrado em</th>
                {n && <th className="px-4 py-3 font-medium" />}
              </tr>
            </thead>
            <tbody>
              {D.map((e) => (
                <tr
                  className="border-b border-base-800/60 last:border-0 hover:bg-base-850/50"
                  key={e.id}
                >
                  <td className="px-4 py-3">
                    <p className="text-base-100 font-medium">{e.name}</p>
                    {e.company_name && <p className="text-xs text-base-500">{e.company_name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={e.kind === `lojista` ? `accent` : `default`}>
                      {e.kind === `lojista` ? `Lojista (B2B)` : `Cliente final`}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-base-300">
                    <div className="flex items-center gap-1.5">
                      <PhoneIcon className="w-3.5 h-3.5 text-base-500" />
                      {e.whatsapp || e.phone || `—`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        e.status === `ativo`
                          ? `success`
                          : e.status === `bloqueado`
                            ? `danger`
                            : `default`
                      }
                    >
                      {e.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-base-400">{formatDate(e.created_at)}</td>
                  {n && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => k(e)}
                          title="Editar"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-base-500 hover:text-accent-400 hover:bg-base-850"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => T(e)}
                          title="Excluir"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-base-500 hover:text-danger hover:bg-base-850"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal
        open={p}
        onClose={() => m(false)}
        title={
          x
            ? h.kind === `lojista`
              ? `Editar lojista parceiro`
              : `Editar cliente final`
            : h.kind === `lojista`
              ? `Novo lojista parceiro`
              : `Novo cliente final`
        }
      >
        <form onSubmit={A} className="space-y-3">
          <Field label={h.kind === `lojista` ? `Nome da loja` : `Nome completo`}>
            <input
              required
              value={h.name}
              onChange={(e) =>
                g({
                  ...h,
                  name: e.target.value,
                })
              }
              className={inputClass}
            />
          </Field>
          {h.kind === `lojista` && (
            <>
              <Field label="Razão social">
                <input
                  value={h.company_name ?? ``}
                  onChange={(e) =>
                    g({
                      ...h,
                      company_name: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Responsável">
                <input
                  value={h.responsible_name ?? ``}
                  onChange={(e) =>
                    g({
                      ...h,
                      responsible_name: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </Field>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefone">
              <input
                value={h.phone ?? ``}
                onChange={(e) =>
                  g({
                    ...h,
                    phone: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="WhatsApp">
              <input
                value={h.whatsapp ?? ``}
                onChange={(e) =>
                  g({
                    ...h,
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
                value={h.email ?? ``}
                onChange={(e) =>
                  g({
                    ...h,
                    email: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label={h.kind === `lojista` ? `CNPJ` : `CPF (opcional)`}>
              <input
                value={h.document ?? ``}
                onChange={(e) =>
                  g({
                    ...h,
                    document: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
          {h.kind === `lojista` && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prazo de pagamento (dias)">
                <input
                  type="number"
                  value={h.payment_terms_days ?? ``}
                  onChange={(e) =>
                    g({
                      ...h,
                      payment_terms_days: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Limite de crédito (R$)">
                <input
                  type="number"
                  step="0.01"
                  value={h.credit_limit ?? ``}
                  onChange={(e) =>
                    g({
                      ...h,
                      credit_limit: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className={inputClass}
                />
              </Field>
            </div>
          )}
          {x && (
            <Field label="Status">
              <select
                value={h.status}
                onChange={(e) =>
                  g({
                    ...h,
                    status: e.target.value,
                  })
                }
                className={inputClass}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </Field>
          )}
          <Field label="Observações">
            <textarea
              value={h.notes ?? ``}
              onChange={(e) =>
                g({
                  ...h,
                  notes: e.target.value,
                })
              }
              className={inputClass + ` min-h-[60px]`}
            />
          </Field>
          {y && <p className="text-sm text-danger">{y}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => m(false)}
              className="text-sm px-3 py-2 rounded-lg text-base-400 hover:text-base-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={_}
              className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
            >
              {_ ? `Salvando…` : `Salvar`}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!C}
        title="Excluir cliente"
        description={`Tem certeza que deseja excluir "${C?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onClose={() => T(null)}
        onConfirm={() => {
          if (C) return j(C);
        }}
      />
    </div>
  ) : (
    <div>
      <PageHeader title="Clientes e Lojistas" />
      <EmptyState
        icon={TriangleAlertIcon}
        title="Conecte o Supabase para usar este módulo"
        description="Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env."
      />
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
