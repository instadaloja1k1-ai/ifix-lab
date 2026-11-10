// Link público de acompanhamento da OS e mensagens de WhatsApp para o cliente.
import { onlyDigits } from './cpf';
import { formatCurrency } from './format';

export function trackingUrl(publicToken: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}acompanhar/${publicToken}`;
}

/** Texto curto e amigável de cada status, do ponto de vista do cliente. */
export const CLIENT_STATUS_TEXT: Record<string, string> = {
  recebido: 'Recebemos seu aparelho e ele já está na fila do laboratório.',
  em_triagem: 'Seu aparelho está passando pela triagem inicial.',
  em_diagnostico: 'Nossos técnicos estão diagnosticando o defeito.',
  aguardando_orcamento: 'O diagnóstico foi feito e estamos preparando o orçamento.',
  aguardando_aprovacao: 'O orçamento está pronto e aguarda a sua aprovação.',
  aguardando_pecas: 'Estamos aguardando a chegada das peças para o reparo.',
  aprovado_reparo: 'Orçamento aprovado! O reparo vai começar em breve.',
  em_reparo: 'Seu aparelho está em reparo neste momento.',
  em_testes: 'O reparo foi feito e o aparelho está em testes finais de qualidade.',
  pronto_retirada: 'Seu aparelho está pronto e pode ser retirado.',
  aguardando_entrega: 'Seu aparelho está separado aguardando a entrega.',
  entregue: 'Aparelho entregue. Obrigado pela confiança!',
  sem_reparo: 'Não será feito reparo neste aparelho. Ele está disponível para devolução.',
  cancelado: 'Esta ordem de serviço foi cancelada.',
  em_garantia: 'Seu aparelho voltou em garantia e está sendo analisado.',
};

/** Mensagem pronta de WhatsApp para cada status. */
export function whatsappMessage(opts: {
  status: string;
  clientName?: string | null;
  orderNumber: number;
  deviceLabel?: string | null;
  totalValue?: number | null;
  link: string;
}): string {
  const first = (opts.clientName ?? '').trim().split(/\s+/)[0];
  const hello = first ? `Olá, ${first}!` : 'Olá!';
  const device = opts.deviceLabel ? `seu ${opts.deviceLabel}` : 'seu aparelho';
  const os = `OS #${opts.orderNumber}`;
  const value = opts.totalValue ? formatCurrency(opts.totalValue) : '';
  let body: string;
  switch (opts.status) {
    case 'recebido':
    case 'em_triagem':
      body = `Recebemos ${device} aqui na iFix Lab (${os}). Vamos te avisando cada etapa do reparo.`;
      break;
    case 'em_diagnostico':
      body = `${device[0].toUpperCase() + device.slice(1)} (${os}) está em diagnóstico. Em breve enviamos o orçamento.`;
      break;
    case 'aguardando_orcamento':
      body = `O diagnóstico do ${device.replace('seu ', '')} (${os}) foi concluído e estamos fechando o orçamento.`;
      break;
    case 'aguardando_aprovacao':
      body = `O orçamento do ${device.replace('seu ', '')} (${os}) está pronto${value ? `: ${value}` : ''}. Você pode ver os detalhes e aprovar direto pelo link abaixo.`;
      break;
    case 'aguardando_pecas':
      body = `Estamos aguardando a chegada das peças para o reparo do ${device.replace('seu ', '')} (${os}). Avisamos assim que chegarem.`;
      break;
    case 'aprovado_reparo':
    case 'em_reparo':
      body = `${device[0].toUpperCase() + device.slice(1)} (${os}) está em reparo.`;
      break;
    case 'em_testes':
      body = `O reparo do ${device.replace('seu ', '')} (${os}) foi concluído e estamos fazendo os testes finais.`;
      break;
    case 'pronto_retirada':
    case 'aguardando_entrega':
      body = `${device[0].toUpperCase() + device.slice(1)} (${os}) está PRONTO para retirada${value ? `. Valor: ${value}` : ''}.`;
      break;
    case 'entregue':
      body = `Obrigado por confiar na iFix Lab! A garantia do reparo (${os}) pode ser consultada pelo link abaixo.`;
      break;
    case 'sem_reparo':
      body = `Sobre ${device} (${os}): não será feito o reparo. O aparelho está disponível para retirada.`;
      break;
    case 'em_garantia':
      body = `Recebemos ${device} em garantia (${os}) e já estamos analisando.`;
      break;
    default:
      body = `Atualização da ${os}.`;
  }
  return `${hello} ${body}\n\nAcompanhe aqui: ${opts.link}\n\n— iFix Lab`;
}

/** Link wa.me. Sem telefone, abre o WhatsApp para escolher o contato. */
export function whatsappUrl(phone: string | null | undefined, text: string): string {
  let digits = onlyDigits(phone ?? '');
  if (digits.length === 10 || digits.length === 11) digits = '55' + digits;
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}
