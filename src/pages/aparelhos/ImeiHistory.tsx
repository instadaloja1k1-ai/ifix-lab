import { useEffect, useState, type FormEvent } from 'react';
import { HistoryIcon, SearchIcon, ShieldCheckIcon, ShieldOffIcon } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../lib/format';
import { OS_STATUS_LABELS, statusTone } from '../OrdensServico';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export function normalizeImei(value: string | null | undefined): string {
  return (value ?? '').replace(/[\s.-]/g, '').toUpperCase();
}

/** Aparelhos já cadastrados com o mesmo IMEI 1/2 ou número de série. */
export function findSameDevice(devices: Row[], form: Row, ignoreId?: string | null): Row[] {
  const keys = [form.imei1, form.imei2, form.serial_number]
    .map(normalizeImei)
    .filter((k) => k.length >= 5);
  if (keys.length === 0) return [];
  return devices.filter(
    (d) =>
      d.id !== ignoreId &&
      [d.imei1, d.imei2, d.serial_number]
        .map(normalizeImei)
        .some((k) => k.length >= 5 && keys.includes(k)),
  );
}

interface Result {
  device: Row;
  client: Row | null;
  orders: (Row & { warranty: Row | null })[];
}

/** Consulta tudo que já passou pelo laboratório com um IMEI ou número de série. */
export function ImeiHistoryModal({
  initialQuery = '',
  onClose,
}: {
  initialQuery?: string;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) search(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search(raw: string) {
    const q = normalizeImei(raw);
    setError(null);
    if (q.length < 5) {
      setError('Digite pelo menos 5 caracteres do IMEI ou número de série.');
      return;
    }
    setLoading(true);
    const pattern = `%${q}%`;
    const { data: devices, error: devErr } = await supabase
      .from('devices')
      .select('*')
      .or(`imei1.ilike.${pattern},imei2.ilike.${pattern},serial_number.ilike.${pattern}`)
      .order('entry_at', { ascending: false });
    if (devErr) {
      setLoading(false);
      setError(devErr.message);
      return;
    }
    const devs = (devices ?? []) as Row[];
    const deviceIds = devs.map((d) => d.id);
    const clientIds = [...new Set(devs.map((d) => d.client_id))];
    const [orders, clients] = await Promise.all([
      deviceIds.length
        ? supabase
            .from('service_orders')
            .select('*')
            .in('device_id', deviceIds)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] as Row[] }),
      clientIds.length
        ? supabase.from('clients').select('id,name,kind').in('id', clientIds)
        : Promise.resolve({ data: [] as Row[] }),
    ]);
    const orderRows = (orders.data ?? []) as Row[];
    const orderIds = orderRows.map((o) => o.id);
    const warranties = orderIds.length
      ? await supabase.from('service_warranties').select('*').in('service_order_id', orderIds)
      : { data: [] as Row[] };
    const warrantyByOrder = new Map(
      ((warranties.data ?? []) as Row[]).map((w) => [w.service_order_id, w]),
    );
    const clientById = new Map(((clients.data ?? []) as Row[]).map((c) => [c.id, c]));
    setResults(
      devs.map((d) => ({
        device: d,
        client: clientById.get(d.client_id) ?? null,
        orders: orderRows
          .filter((o) => o.device_id === d.id)
          .map((o) => ({ ...o, warranty: warrantyByOrder.get(o.id) ?? null })),
      })),
    );
    setLoading(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    search(query);
  }

  const now = new Date();
  const totalOrders = results?.reduce((s, r) => s + r.orders.length, 0) ?? 0;

  return (
    <Modal open onClose={onClose} title="Histórico por IMEI / número de série" width="2xl">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 text-base-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="IMEI ou número de série"
            className="w-full bg-base-850 border border-base-700 rounded-lg pl-9 pr-3 py-2 text-sm text-base-100 outline-none focus:border-accent-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="text-sm px-4 py-2 rounded-lg bg-accent-500 text-base-950 font-medium hover:bg-accent-400 disabled:opacity-50"
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>
      {error && <p className="text-sm text-danger mb-3">{error}</p>}
      {results &&
        (results.length === 0 ? (
          <p className="text-sm text-base-500 py-6 text-center">
            Nenhum aparelho com esse IMEI/série passou pelo laboratório.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-base-500">
              {results.length} cadastro(s) de aparelho · {totalOrders} ordem(ns) de serviço
            </p>
            {results.map(({ device: d, client, orders }) => (
              <div key={d.id} className="border border-base-800 rounded-lg overflow-hidden">
                <div className="px-3 py-2.5 bg-base-850/60 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-base-100 font-medium">
                      {d.model} {d.storage_capacity ?? ''} {d.color ? `· ${d.color}` : ''}
                    </p>
                    <p className="text-xs text-base-500">
                      {d.internal_code} · {client?.name ?? 'Cliente removido'} · entrada{' '}
                      {formatDate(d.entry_at)}
                    </p>
                  </div>
                  <p className="text-[11px] text-base-500 font-mono text-right">
                    {d.imei1 && <span className="block">IMEI {d.imei1}</span>}
                    {d.serial_number && <span className="block">S/N {d.serial_number}</span>}
                  </p>
                </div>
                {orders.length === 0 ? (
                  <p className="px-3 py-2.5 text-xs text-base-500">
                    Nenhuma OS aberta para este cadastro.
                  </p>
                ) : (
                  orders.map((o) => {
                    const w = o.warranty;
                    const active = w && new Date(w.ends_at) >= now;
                    return (
                      <div
                        key={o.id}
                        className="px-3 py-2.5 border-t border-base-800 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
                      >
                        <span className="text-base-200 font-medium">OS #{o.order_number}</span>
                        <Badge tone={statusTone(o.status)}>
                          {OS_STATUS_LABELS[o.status as keyof typeof OS_STATUS_LABELS] ?? o.status}
                        </Badge>
                        <span className="text-xs text-base-500">{formatDate(o.created_at)}</span>
                        <span className="text-xs text-base-400 flex-1 min-w-[160px] truncate">
                          {o.diagnosis || o.reported_defect || '—'}
                        </span>
                        <span className="text-base-300">{formatCurrency(o.total_value)}</span>
                        {w && (
                          <span
                            className={`inline-flex items-center gap-1 text-xs ${active ? 'text-success' : 'text-base-500'}`}
                            title={w.covered_service ?? undefined}
                          >
                            {active ? (
                              <ShieldCheckIcon className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldOffIcon className="w-3.5 h-3.5" />
                            )}
                            {active
                              ? `Garantia até ${formatDate(w.ends_at)}`
                              : `Garantia vencida em ${formatDate(w.ends_at)}`}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        ))}
    </Modal>
  );
}

/** Aviso no cadastro quando o IMEI/série já é conhecido. */
export function SameDeviceAlert({
  matches,
  onOpenHistory,
}: {
  matches: Row[];
  onOpenHistory: () => void;
}) {
  if (matches.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
      <HistoryIcon className="w-4 h-4 shrink-0" />
      <span className="flex-1">
        Este IMEI/número de série já passou pelo laboratório ({matches.length} cadastro
        {matches.length > 1 ? 's' : ''} anterior{matches.length > 1 ? 'es' : ''}).
      </span>
      <button
        type="button"
        onClick={onOpenHistory}
        className="text-xs underline hover:no-underline"
      >
        Ver histórico e garantia
      </button>
    </div>
  );
}
