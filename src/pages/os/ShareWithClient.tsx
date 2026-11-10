import { useState } from 'react';
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  MessageCircleIcon,
  XCircleIcon,
  CheckCircle2Icon,
} from 'lucide-react';
import { formatDateTime } from '../../lib/format';
import { trackingUrl, whatsappMessage, whatsappUrl } from '../../lib/tracking';

interface Props {
  order: {
    order_number: number;
    status: string;
    total_value: number;
    public_token?: string | null;
    client_response?: 'aprovado' | 'recusado' | null;
    client_response_at?: string | null;
    client_response_name?: string | null;
  };
  client?: { name?: string | null; whatsapp?: string | null; phone?: string | null } | null;
  device?: { model?: string | null } | null;
}

/** Barra na OS: link de acompanhamento + mensagem pronta de WhatsApp. */
export function ShareWithClient({ order, client, device }: Props) {
  const [copied, setCopied] = useState(false);
  if (!order.public_token) return null;
  const link = trackingUrl(order.public_token);
  const phone = client?.whatsapp || client?.phone || '';
  const message = whatsappMessage({
    status: order.status,
    clientName: client?.name,
    orderNumber: order.order_number,
    deviceLabel: device?.model,
    totalValue: order.total_value,
    link,
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copie o link:', link);
    }
  }

  return (
    <div className="space-y-2">
      {order.client_response && (
        <div
          className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
            order.client_response === 'aprovado'
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-danger/30 bg-danger/10 text-danger'
          }`}
        >
          {order.client_response === 'aprovado' ? (
            <CheckCircle2Icon className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <XCircleIcon className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>
            Cliente {order.client_response === 'aprovado' ? 'APROVOU' : 'RECUSOU'} o orçamento pelo
            link
            {order.client_response_name ? ` (${order.client_response_name})` : ''} em{' '}
            {formatDateTime(order.client_response_at)}.
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-base-800 bg-base-850/60 px-3 py-2.5">
        <p className="text-xs text-base-400 mr-auto">
          {order.status === 'aguardando_aprovacao'
            ? 'Envie o orçamento: o cliente aprova pelo link.'
            : 'Avise o cliente sobre esta etapa.'}
        </p>
        <a
          href={whatsappUrl(phone, message)}
          target="_blank"
          rel="noreferrer"
          title={
            phone ? `Enviar para ${phone}` : 'Cliente sem WhatsApp cadastrado: escolha o contato'
          }
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-success/15 text-success border border-success/30 hover:bg-success/25"
        >
          <MessageCircleIcon className="w-3.5 h-3.5" />
          WhatsApp
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-base-700 text-base-300 hover:text-accent-300"
        >
          {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar link'}
        </button>
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          title="Ver como o cliente vê"
          className="inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border border-base-700 text-base-400 hover:text-accent-300"
        >
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
