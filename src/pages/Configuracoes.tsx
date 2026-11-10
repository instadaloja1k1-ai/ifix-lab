// @ts-nocheck
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  KeyRoundIcon,
  LockIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  UserPlusIcon,
  UsersIcon,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { formatCpf } from '../lib/cpf';
import { formatDateTime } from '../lib/format';
import {
  MODULES,
  MODULE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
} from '../lib/permissions';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { NewUserModal, UserAccessModal } from './configuracoes/UserAccessModals';

export const ROLES = [`administrador`, `tecnico`, `atendente`, `financeiro`, `estoquista`];
export const ENTITY_LABELS = {
  clients: `Clientes / Lojistas`,
  devices: `Aparelhos`,
  service_orders: `Ordens de serviço`,
  service_order_items: `Itens de OS`,
  service_warranties: `Garantias`,
  suppliers: `Fornecedores`,
  products: `Estoque (produtos)`,
  purchases: `Compras`,
  accounts_payable: `Contas a pagar`,
  accounts_receivable: `Contas a receber`,
  payments: `Pagamentos / Recebimentos`,
};
export const ACTION_LABELS = {
  criado: `Criado`,
  atualizado: `Atualizado`,
  excluido: `Excluído`,
};
export const ACTION_TONES = {
  criado: `success`,
  atualizado: `info`,
  excluido: `danger`,
};
export const AUDIT_PAGE_SIZE = 50;
export function ConfiguracoesPage() {
  let { profile: e } = useAuth(),
    [t, n] = useState(`usuarios`);
  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Usuários e acesso por CPF + PIN, permissões por perfil e trilha de auditoria."
      />
      <div className="flex gap-1 mb-4 border-b border-base-800">
        <TabButton
          active={t === `usuarios`}
          onClick={() => n(`usuarios`)}
          icon={UsersIcon}
          label="Usuários"
        />
        <TabButton
          active={t === `permissoes`}
          onClick={() => n(`permissoes`)}
          icon={ShieldCheckIcon}
          label="Permissões"
        />
        <TabButton
          active={t === `auditoria`}
          onClick={() => n(`auditoria`)}
          icon={ScrollTextIcon}
          label="Auditoria"
        />
      </div>
      {isSupabaseConfigured ? (
        t === `usuarios` ? (
          <UsersTab myProfileId={e?.id ?? null} />
        ) : t === `permissoes` ? (
          <PermissionsTab />
        ) : (
          <AuditTab />
        )
      ) : (
        <EmptyState
          icon={TriangleAlertIcon}
          title="Conecte o Supabase para usar este módulo"
          description="Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env."
        />
      )}
    </div>
  );
}
export function TabButton({ active: e, onClick: t, icon: CompN, label: r }) {
  return (
    <button
      onClick={t}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${e ? `border-accent-500 text-accent-400` : `border-transparent text-base-400 hover:text-base-200`}`}
    >
      <CompN className="w-3.5 h-3.5" />
      {r}
    </button>
  );
}
export function UsersTab({ myProfileId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [showNewUser, setShowNewUser] = useState(false);
  const [accessUser, setAccessUser] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from(`profiles`).select(`*`).order(`full_name`);
    if (error) setError(error.message);
    setUsers(data ?? []);
    setLoading(false);
  }

  function flashSaved(id) {
    setSavedId(id);
    setTimeout(() => setSavedId((cur) => (cur === id ? null : cur)), 1500);
  }

  async function update(id, changes) {
    setSavingId(id);
    setError(null);
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...changes } : u)));
    const { error } = await supabase.from(`profiles`).update(changes).eq(`id`, id);
    if (error) {
      setError(
        error.message.includes(`Só um administrador`)
          ? error.message
          : `Não foi possível salvar: ${error.message}`,
      );
      load();
    } else flashSaved(id);
    setSavingId(null);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="text-sm text-base-500">
          Cada pessoa entra no sistema com{' '}
          <strong className="text-base-300">CPF + PIN de 4 números</strong>. Mudar o perfil ou
          desativar um usuário tem efeito imediato. Toda alteração aqui é registrada na aba
          "Auditoria".
        </p>
        <button
          onClick={() => setShowNewUser(true)}
          className="shrink-0 inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400"
        >
          <UserPlusIcon className="w-4 h-4" />
          Novo usuário
        </button>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      <div className="bg-base-900 border border-base-800 rounded-xl overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm text-base-500">Carregando…</div>
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="Nenhum usuário encontrado" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-base-500 border-b border-base-800">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">CPF (login)</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Ativo</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.id === myProfileId;
                return (
                  <tr
                    className="border-b border-base-800/60 last:border-0 hover:bg-base-850/50"
                    key={u.id}
                  >
                    <td className="px-4 py-3">
                      <p className="text-base-100 font-medium">{u.full_name}</p>
                      {Number(u.commission_percent) > 0 && (
                        <p className="text-xs text-base-500">
                          Comissão {Number(u.commission_percent)}%
                        </p>
                      )}
                      {isMe && <p className="text-xs text-base-500">Você</p>}
                    </td>
                    <td className="px-4 py-3">
                      {u.cpf ? (
                        <span className="text-base-300 font-mono text-xs">{formatCpf(u.cpf)}</span>
                      ) : (
                        <Badge tone="warning">Sem CPF</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-base-400">{u.phone || `—`}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isMe || savingId === u.id}
                        onChange={(e) => update(u.id, { role: e.target.value })}
                        title={
                          isMe
                            ? `Você não pode alterar o próprio perfil (evita se trancar fora por engano).`
                            : undefined
                        }
                        className="bg-base-850 border border-base-700 rounded-lg px-2.5 py-1.5 text-sm text-base-200 outline-none focus:border-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {ROLES.map((r) => (
                          <option value={r} key={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <label
                        className={`inline-flex items-center gap-2 ${isMe ? `cursor-not-allowed opacity-50` : `cursor-pointer`}`}
                        title={isMe ? `Você não pode desativar a própria conta.` : undefined}
                      >
                        <input
                          type="checkbox"
                          checked={u.active}
                          disabled={isMe || savingId === u.id}
                          onChange={(e) => update(u.id, { active: e.target.checked })}
                        />
                        <Badge tone={u.active ? `success` : `default`}>
                          {u.active ? `Ativo` : `Inativo`}
                        </Badge>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {savingId === u.id && (
                        <span className="text-xs text-base-500 mr-2">Salvando…</span>
                      )}
                      {savedId === u.id && (
                        <span className="inline-flex items-center gap-1 text-xs text-success mr-2">
                          <CheckIcon className="w-3.5 h-3.5" /> Salvo
                        </span>
                      )}
                      <button
                        onClick={() => setAccessUser(u)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-base-700 text-base-300 hover:border-accent-500/50 hover:text-accent-300"
                      >
                        <KeyRoundIcon className="w-3.5 h-3.5" />
                        {u.cpf ? `Editar` : `Definir acesso`}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {showNewUser && (
        <NewUserModal
          onClose={() => setShowNewUser(false)}
          onSaved={() => {
            setShowNewUser(false);
            load();
          }}
        />
      )}
      {accessUser && (
        <UserAccessModal
          user={accessUser}
          onClose={() => setAccessUser(null)}
          onSaved={() => {
            const id = accessUser.id;
            setAccessUser(null);
            load().then(() => flashSaved(id));
          }}
        />
      )}
    </div>
  );
}

export function PermissionsTab() {
  return (
    <div>
      <p className="text-sm text-base-500 mb-4">
        O que cada perfil pode acessar. "Completo" permite criar, editar e excluir; "Consulta" só
        permite ver; "—" esconde o módulo por completo. Essas regras já são aplicadas no menu e nas
        telas — e o banco de dados tem uma segunda trava independente da interface (veja{' '}
        <code className="text-xs bg-base-850 border border-base-800 rounded px-1 py-0.5">
          supabase/migrations/0003_permissoes_auditoria.sql
        </code>
        ).
      </p>
      <div className="space-y-3 mb-6">
        {ROLES.map((e) => (
          <div className="bg-base-900 border border-base-800 rounded-xl px-4 py-3" key={e}>
            <p className="text-sm font-medium text-base-200">{ROLE_LABELS[e]}</p>
            <p className="text-xs text-base-500 mt-0.5">{ROLE_DESCRIPTIONS[e]}</p>
          </div>
        ))}
      </div>
      <div className="bg-base-900 border border-base-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-base-500 border-b border-base-800">
              <th className="px-4 py-3 font-medium">Módulo</th>
              {ROLES.map((e) => (
                <th className="px-4 py-3 font-medium text-center whitespace-nowrap" key={e}>
                  {ROLE_LABELS[e]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((e) => (
              <tr className="border-b border-base-800/60 last:border-0" key={e}>
                <td className="px-4 py-3 text-base-200 font-medium whitespace-nowrap">
                  {MODULE_LABELS[e]}
                </td>
                {ROLES.map((t) => {
                  let n = ROLE_PERMISSIONS[t][e];
                  return (
                    <td className="px-4 py-3 text-center" key={t}>
                      {n === `full` ? (
                        <Badge tone="success">Completo</Badge>
                      ) : n === `view` ? (
                        <Badge tone="warning">Consulta</Badge>
                      ) : (
                        <span className="text-base-600">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export function AuditTab() {
  let [e, t] = useState([]),
    [n, r] = useState([]),
    [i, a] = useState(true),
    [o, s] = useState(false),
    [c, l] = useState(null),
    [u, d] = useState(true),
    [f, p] = useState(null),
    [m, h] = useState(`todos`),
    [g, _] = useState(`todos`),
    [v, y] = useState(``),
    [b, x] = useState(``);
  useEffect(() => {
    supabase
      .from(`profiles`)
      .select(`*`)
      .then(({ data: e }) => t(e ?? []));
  }, []);
  let S = useMemo(() => new Map(e.map((e) => [e.id, e])), [e]);
  useEffect(() => {
    C(0, true);
  }, [m, g, v, b]);
  async function C(e, t) {
    (t ? (a(true), p(null)) : s(true), l(null));
    let n = supabase
      .from(`audit_logs`)
      .select(`*`)
      .order(`created_at`, {
        ascending: false,
      })
      .range(e, e + AUDIT_PAGE_SIZE - 1);
    (m !== `todos` && (n = n.eq(`entity`, m)),
      g !== `todos` && (n = n.eq(`actor_id`, g)),
      v && (n = n.gte(`created_at`, `${v}T00:00:00`)),
      b && (n = n.lte(`created_at`, `${b}T23:59:59`)));
    let { data: i, error: o } = await n;
    o && l(o.message);
    let c = i ?? [];
    (r((e) => (t ? c : [...e, ...c])), d(c.length === AUDIT_PAGE_SIZE), a(false), s(false));
  }
  function T(e) {
    return e ? (S.get(e)?.full_name ?? `Usuário removido`) : `Sistema`;
  }
  let E = `bg-base-900 border border-base-800 rounded-lg px-3 py-2 text-sm text-base-200 outline-none focus:border-accent-500/50`;
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-xs text-base-500">
        <LockIcon className="w-3.5 h-3.5" />
        Registro automático e somente leitura — ninguém, nem administrador, pode editar ou apagar um
        evento aqui.
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={m} onChange={(e) => h(e.target.value)} className={E}>
          <option value="todos">Todas as áreas</option>
          {Object.entries(ENTITY_LABELS).map(([e, t]) => (
            <option value={e} key={e}>
              {t}
            </option>
          ))}
        </select>
        <select value={g} onChange={(e) => _(e.target.value)} className={E}>
          <option value="todos">Todos os usuários</option>
          {e.map((e) => (
            <option value={e.id} key={e.id}>
              {e.full_name}
            </option>
          ))}
        </select>
        <input type="date" value={v} onChange={(e) => y(e.target.value)} className={E} title="De" />
        <input
          type="date"
          value={b}
          onChange={(e) => x(e.target.value)}
          className={E}
          title="Até"
        />
      </div>
      {c && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {c}
        </div>
      )}
      <div className="bg-base-900 border border-base-800 rounded-xl overflow-x-auto">
        {i ? (
          <div className="p-6 text-sm text-base-500">Carregando…</div>
        ) : n.length === 0 ? (
          <EmptyState
            icon={ScrollTextIcon}
            title="Nenhum evento encontrado"
            description="Ajuste os filtros acima, ou aguarde a primeira alteração ser registrada."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-base-500 border-b border-base-800">
                <th className="px-4 py-3 font-medium" />
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Área</th>
                <th className="px-4 py-3 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {n.map((e) => {
                let t = f === e.id;
                return (
                  <Fragment key={e.id}>
                    <tr
                      onClick={() => p(t ? null : e.id)}
                      className="border-b border-base-800/60 last:border-0 hover:bg-base-850/50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-base-500">
                        {t ? (
                          <ChevronDownIcon className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRightIcon className="w-3.5 h-3.5" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-base-400 whitespace-nowrap">
                        {formatDateTime(e.created_at)}
                      </td>
                      <td className="px-4 py-3 text-base-200">{T(e.actor_id)}</td>
                      <td className="px-4 py-3 text-base-300">
                        {ENTITY_LABELS[e.entity] ?? e.entity}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={ACTION_TONES[e.action]}>{ACTION_LABELS[e.action]}</Badge>
                      </td>
                    </tr>
                    {t && (
                      <tr className="border-b border-base-800/60 last:border-0 bg-base-950/60">
                        <td />
                        <td colSpan={4} className="px-4 py-3">
                          <p className="text-xs text-base-500 mb-1.5">
                            {'Registro: '}
                            <span className="font-mono text-base-400">{e.entity_id ?? `—`}</span>
                          </p>
                          <pre className="text-xs text-base-300 bg-base-900 border border-base-800 rounded-lg p-3 overflow-x-auto max-h-64">
                            {JSON.stringify(e.diff, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {u && !i && n.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => C(n.length, false)}
            disabled={o}
            className="text-sm text-base-300 bg-base-900 border border-base-800 px-4 py-2 rounded-lg hover:border-accent-500/50 transition-colors disabled:opacity-50"
          >
            {o ? `Carregando…` : `Carregar mais`}
          </button>
        </div>
      )}
    </div>
  );
}
