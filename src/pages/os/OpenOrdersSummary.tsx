import { formatCurrency } from '../../lib/format';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Order = Record<string, any>;

export const CLOSED_STATUSES = ['entregue', 'sem_reparo', 'cancelado'];
const READY = ['pronto_retirada', 'aguardando_entrega'];
const APPROVAL = ['aguardando_aprovacao'];

function sum(list: Order[]) {
  return list.reduce((s, o) => s + Number(o.total_value || 0), 0);
}

/** Cartões com o valor somado das OS em aberto, no topo da tela de Ordens de Serviço. */
export function OpenOrdersSummary({ orders }: { orders: Order[] }) {
  const open = orders.filter((o) => !CLOSED_STATUSES.includes(o.status));
  const ready = open.filter((o) => READY.includes(o.status));
  const approval = open.filter((o) => APPROVAL.includes(o.status));
  const working = open.filter((o) => !READY.includes(o.status) && !APPROVAL.includes(o.status));
  const noQuote = open.filter((o) => !Number(o.total_value)).length;

  const cards = [
    { label: 'Total em aberto', list: open, tone: 'text-accent-300', strong: true },
    { label: 'Em andamento', list: working, tone: 'text-info' },
    { label: 'Aguardando aprovação', list: approval, tone: 'text-warning' },
    { label: 'Prontas para retirada', list: ready, tone: 'text-success' },
  ];

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border px-4 py-3 ${
              c.strong ? 'border-accent-500/40 bg-accent-500/5' : 'border-base-800 bg-base-900'
            }`}
          >
            <p className="text-xs text-base-400">{c.label}</p>
            <p className={`text-lg font-semibold mt-0.5 ${c.tone}`}>
              {formatCurrency(sum(c.list))}
            </p>
            <p className="text-[11px] text-base-500">{c.list.length} OS</p>
          </div>
        ))}
      </div>
      {noQuote > 0 && (
        <p className="text-[11px] text-base-500 mt-2">
          {noQuote} OS em aberto ainda sem valor lançado (não entram na soma).
        </p>
      )}
    </div>
  );
}
