import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2Icon,
  CircleIcon,
  ShieldCheckIcon,
  WrenchIcon,
  XCircleIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDate, formatDateTime } from '../lib/format';
import { CLIENT_STATUS_TEXT } from '../lib/tracking';
import { OS_STATUS_LABELS } from './OrdensServico';
import { PHOTO_BUCKET, PHOTO_STAGE_LABELS } from './Aparelhos';

interface PublicOrder {
  order_number: number;
  status: string;
  created_at: string;
  due_at: string | null;
  reported_defect: string | null;
  diagnosis: string | null;
  labor_value: number;
  parts_value: number;
  discount_value: number;
  total_value: number;
  client_response: 'aprovado' | 'recusado' | null;
  client_response_at: string | null;
  client_response_name: string | null;
  client_first_name: string;
  device: {
    brand: string;
    model: string;
    color: string | null;
    storage_capacity: string | null;
    imei_end: string;
    client_visible_notes: string | null;
  } | null;
  items: { description: string; item_type: string; quantity: number; unit_price: number }[];
  history: { status: string; at: string }[];
  photos: { path: string; stage: string }[];
  warranty: {
    starts_at: string;
    ends_at: string;
    days: number;
    covered_service: string | null;
    coverage_terms: string | null;
  } | null;
}

const STEPS: { label: string; statuses: string[] }[] = [
  { label: 'Recebido', statuses: ['recebido', 'em_triagem'] },
  { label: 'Diagnóstico', statuses: ['em_diagnostico', 'aguardando_orcamento'] },
  { label: 'Orçamento', statuses: ['aguardando_aprovacao'] },
  { label: 'Reparo', statuses: ['aprovado_reparo', 'aguardando_pecas', 'em_reparo', 'em_testes'] },
  { label: 'Pronto', statuses: ['pronto_retirada', 'aguardando_entrega'] },
  { label: 'Entregue', statuses: ['entregue'] },
];

function stepIndex(status: string): number {
  return STEPS.findIndex((s) => s.statuses.includes(status));
}

export function AcompanharPage() {
  const { token } = useParams();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const valid = /^[0-9a-f-]{36}$/i.test(token ?? '');
      const { data, error } = valid
        ? await supabase.rpc('public_get_order', { p_token: token })
        : { data: null, error: null };
      if (error || !data) setNotFound(true);
      else setOrder(data as PublicOrder);
      setLoading(false);
    })();
  }, [token]);

  return (
    <div className="min-h-screen bg-base-950 px-4 py-6 sm:py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-accent-500/10 border border-accent-500/30 flex items-center justify-center">
            <WrenchIcon className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-base-100 leading-none">iFix Lab</p>
            <p className="text-[11px] text-base-500 leading-none mt-1">Acompanhamento do reparo</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-base-700 border-t-accent-400 rounded-full animate-spin" />
          </div>
        ) : notFound || !order ? (
          <div className="bg-base-900 border border-base-800 rounded-xl p-6 text-center">
            <p className="text-sm text-base-200 font-medium">Ordem de serviço não encontrada</p>
            <p className="text-sm text-base-500 mt-1">
              Confira se o link está completo ou peça um novo link para a iFix Lab.
            </p>
          </div>
        ) : (
          <OrderView order={order} token={token!} onUpdated={setOrder} />
        )}
      </div>
    </div>
  );
}

function OrderView({
  order,
  token,
  onUpdated,
}: {
  order: PublicOrder;
  token: string;
  onUpdated: (o: PublicOrder) => void;
}) {
  const current = stepIndex(order.status);
  const special = current === -1;
  const deviceLabel = order.device
    ? [order.device.model, order.device.storage_capacity, order.device.color]
        .filter(Boolean)
        .join(' · ')
    : 'Aparelho';

  return (
    <div className="space-y-4">
      <div className="bg-base-900 border border-base-800 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-base-500">
              {order.client_first_name ? `Olá, ${order.client_first_name}!` : 'Olá!'} · OS #
              {order.order_number}
            </p>
            <h1 className="text-lg font-semibold text-base-100 mt-1">{deviceLabel}</h1>
            {order.device?.imei_end && (
              <p className="text-xs text-base-500 mt-0.5">
                IMEI/série final {order.device.imei_end}
              </p>
            )}
          </div>
          <span
            className={clsx(
              'shrink-0 text-xs font-medium rounded-md border px-2 py-1',
              order.status === 'entregue'
                ? 'text-success bg-success/10 border-success/20'
                : ['cancelado', 'sem_reparo'].includes(order.status)
                  ? 'text-danger bg-danger/10 border-danger/20'
                  : 'text-accent-400 bg-accent-500/10 border-accent-500/20',
            )}
          >
            {OS_STATUS_LABELS[order.status as keyof typeof OS_STATUS_LABELS] ?? order.status}
          </span>
        </div>
        <p className="text-sm text-base-300 mt-4">{CLIENT_STATUS_TEXT[order.status] ?? ''}</p>

        {!special && (
          <ol className="mt-5 grid grid-cols-6 gap-1 items-start">
            {STEPS.map((s, i) => (
              <li key={s.label} className="flex flex-col items-center text-center gap-1.5">
                <div
                  className={clsx(
                    'h-1.5 w-full rounded-full',
                    i <= current ? 'bg-accent-500' : 'bg-base-800',
                  )}
                />
                <span
                  className={clsx(
                    'text-[10px] sm:text-xs leading-tight',
                    i === current
                      ? 'text-accent-300 font-medium'
                      : i < current
                        ? 'text-base-300'
                        : 'text-base-600',
                    i !== current && 'hidden sm:block',
                  )}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
          <div>
            <p className="text-xs text-base-500">Entrada</p>
            <p className="text-base-200">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-base-500">Previsão</p>
            <p className="text-base-200">{order.due_at ? formatDate(order.due_at) : 'A definir'}</p>
          </div>
        </div>
      </div>

      {(order.reported_defect || order.diagnosis || order.device?.client_visible_notes) && (
        <div className="bg-base-900 border border-base-800 rounded-xl p-5 space-y-3 text-sm">
          {order.reported_defect && (
            <div>
              <p className="text-xs text-base-500">Defeito relatado</p>
              <p className="text-base-200">{order.reported_defect}</p>
            </div>
          )}
          {order.diagnosis && (
            <div>
              <p className="text-xs text-base-500">Diagnóstico</p>
              <p className="text-base-200">{order.diagnosis}</p>
            </div>
          )}
          {order.device?.client_visible_notes && (
            <div>
              <p className="text-xs text-base-500">Observações</p>
              <p className="text-base-200">{order.device.client_visible_notes}</p>
            </div>
          )}
        </div>
      )}

      <Quote order={order} token={token} onUpdated={onUpdated} />

      {order.warranty && (
        <div className="bg-base-900 border border-base-800 rounded-xl p-5">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-success" />
            <p className="text-sm font-medium text-base-100">
              Garantia de {order.warranty.days} dias
            </p>
          </div>
          <p className="text-sm text-base-300 mt-2">
            Válida até{' '}
            <strong className="text-base-100">{formatDate(order.warranty.ends_at)}</strong>
            {new Date(order.warranty.ends_at) < new Date() && ' (vencida)'}.
          </p>
          {order.warranty.covered_service && (
            <p className="text-xs text-base-500 mt-1">Cobre: {order.warranty.covered_service}</p>
          )}
          {order.warranty.coverage_terms && (
            <p className="text-xs text-base-500 mt-1 whitespace-pre-line">
              {order.warranty.coverage_terms}
            </p>
          )}
        </div>
      )}

      {order.photos.length > 0 && (
        <div className="bg-base-900 border border-base-800 rounded-xl p-5">
          <p className="text-sm font-medium text-base-100 mb-3">Fotos do aparelho</p>
          <div className="grid grid-cols-3 gap-2">
            {order.photos.map((p) => {
              const url = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(p.path).data.publicUrl;
              return (
                <a key={p.path} href={url} target="_blank" rel="noreferrer" className="block">
                  <img
                    src={url}
                    alt={PHOTO_STAGE_LABELS[p.stage as keyof typeof PHOTO_STAGE_LABELS] ?? p.stage}
                    loading="lazy"
                    className="aspect-square w-full object-cover rounded-lg border border-base-800"
                  />
                  <span className="block text-[10px] text-base-500 mt-1 text-center">
                    {PHOTO_STAGE_LABELS[p.stage as keyof typeof PHOTO_STAGE_LABELS] ?? p.stage}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {order.history.length > 0 && (
        <div className="bg-base-900 border border-base-800 rounded-xl p-5">
          <p className="text-sm font-medium text-base-100 mb-3">Histórico</p>
          <ol className="space-y-2.5">
            {[...order.history].reverse().map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                {i === 0 ? (
                  <CheckCircle2Icon className="w-4 h-4 text-accent-400 mt-0.5 shrink-0" />
                ) : (
                  <CircleIcon className="w-4 h-4 text-base-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className={i === 0 ? 'text-base-100' : 'text-base-400'}>
                    {OS_STATUS_LABELS[h.status as keyof typeof OS_STATUS_LABELS] ?? h.status}
                  </p>
                  <p className="text-xs text-base-500">{formatDateTime(h.at)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="text-center text-xs text-base-600 pt-2">
        iFix Lab · laboratório especializado em iPhone
      </p>
    </div>
  );
}

function Quote({
  order,
  token,
  onUpdated,
}: {
  order: PublicOrder;
  token: string;
  onUpdated: (o: PublicOrder) => void;
}) {
  const [name, setName] = useState('');
  const [confirming, setConfirming] = useState<null | 'aprovar' | 'recusar'>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const awaiting = order.status === 'aguardando_aprovacao';
  if (order.items.length === 0 && !awaiting) return null;

  async function respond(approve: boolean) {
    setError(null);
    if (!name.trim()) {
      setError('Digite seu nome para confirmar.');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.rpc('public_respond_quote', {
      p_token: token,
      p_approve: approve,
      p_name: name.trim(),
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setConfirming(null);
    onUpdated(data as PublicOrder);
  }

  return (
    <div
      className={clsx(
        'bg-base-900 border rounded-xl p-5',
        awaiting ? 'border-accent-500/40' : 'border-base-800',
      )}
    >
      <p className="text-sm font-medium text-base-100 mb-3">Orçamento</p>
      {order.items.length > 0 ? (
        <div className="space-y-2 text-sm">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-start justify-between gap-3">
              <span className="text-base-300">
                {it.description}
                {Number(it.quantity) !== 1 && (
                  <span className="text-base-500"> × {it.quantity}</span>
                )}
              </span>
              <span className="text-base-200 whitespace-nowrap">
                {formatCurrency(Number(it.quantity) * Number(it.unit_price))}
              </span>
            </div>
          ))}
          {Number(order.discount_value) > 0 && (
            <div className="flex justify-between text-success">
              <span>Desconto</span>
              <span>− {formatCurrency(order.discount_value)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-base-800 pt-2 mt-2 text-base font-semibold">
            <span className="text-base-100">Total</span>
            <span className="text-accent-300">{formatCurrency(order.total_value)}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-base-500">Os itens do orçamento ainda não foram lançados.</p>
      )}

      {order.client_response && (
        <div
          className={clsx(
            'mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
            order.client_response === 'aprovado'
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-danger/30 bg-danger/10 text-danger',
          )}
        >
          {order.client_response === 'aprovado' ? (
            <CheckCircle2Icon className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <XCircleIcon className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>
            Orçamento {order.client_response === 'aprovado' ? 'aprovado' : 'recusado'} por{' '}
            {order.client_response_name} em {formatDateTime(order.client_response_at)}.
          </span>
        </div>
      )}

      {awaiting && order.items.length > 0 && (
        <div className="mt-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-base-400 mb-1.5" htmlFor="nome">
              Seu nome (para registrar a resposta)
            </label>
            <input
              id="nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-base-850 border border-base-700 px-3 py-2.5 text-sm text-base-100 outline-none focus:border-accent-500"
              placeholder="Nome completo"
            />
          </div>
          {confirming ? (
            <div className="rounded-lg border border-base-700 bg-base-850 p-3 space-y-3">
              <p className="text-sm text-base-200">
                {confirming === 'aprovar'
                  ? `Confirma a aprovação do orçamento de ${formatCurrency(order.total_value)}?`
                  : 'Confirma que NÃO quer fazer o reparo? O aparelho será devolvido sem reparo.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirming(null)}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-base-700 py-2.5 text-sm text-base-300"
                >
                  Voltar
                </button>
                <button
                  onClick={() => respond(confirming === 'aprovar')}
                  disabled={saving}
                  className={clsx(
                    'flex-1 rounded-lg py-2.5 text-sm font-medium disabled:opacity-50',
                    confirming === 'aprovar' ? 'bg-success text-base-950' : 'bg-danger text-white',
                  )}
                >
                  {saving ? 'Enviando…' : 'Confirmar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming('recusar')}
                className="flex-1 rounded-lg border border-base-700 py-2.5 text-sm text-base-300 hover:border-danger/50 hover:text-danger"
              >
                Recusar
              </button>
              <button
                onClick={() => setConfirming('aprovar')}
                className="flex-[2] rounded-lg bg-accent-500 py-2.5 text-sm font-medium text-base-950 hover:bg-accent-400"
              >
                Aprovar orçamento
              </button>
            </div>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
