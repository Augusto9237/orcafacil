import type { Orcamento, Usuario } from '@/types';
import { formatCurrency } from '@/lib/utils';

export interface WhatsAppMessageOptions {
  includeSummary?: boolean;
  includeLink?: boolean;
  includeItems?: boolean;
  customMessage?: string;
  baseUrl?: string;
}

/**
 * Cleans and formats phone number for WhatsApp wa.me link.
 * Expects Brazilian phone numbers or international. Adds '55' if only 10 or 11 digits.
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // If already starts with 55 and has 12 or 13 digits (e.g., 5511999998888)
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // If standard Brazilian local format (10 digits: DDD + 8, or 11 digits: DDD + 9)
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

/**
 * Builds a structured, professional WhatsApp message text for a budget.
 */
export function buildWhatsAppMessage(
  orcamento: Orcamento,
  empresa?: Usuario | null,
  options: WhatsAppMessageOptions = {}
): string {
  const {
    includeSummary = true,
    includeLink = true,
    includeItems = true,
    customMessage = '',
    baseUrl = typeof window !== 'undefined' ? window.location.origin : '',
  } = options;

  const lines: string[] = [];
  const empresaNome = empresa?.empresa || empresa?.nome || 'Nossa Empresa';

  // Greeting / Custom Message
  if (customMessage.trim()) {
    lines.push(customMessage.trim());
    lines.push('');
  } else {
    lines.push(`Olá, *${orcamento.cliente.nome}*! Tudo bem?`);
    lines.push(`Segue a proposta comercial do orçamento *${orcamento.numero}* gerada por *${empresaNome}*.`);
    lines.push('');
  }

  // Summary content
  if (includeSummary) {
    lines.push(`📄 *DETALHES DO ORÇAMENTO*`);
    lines.push(`• *Número:* ${orcamento.numero}`);
    lines.push(`• *Cliente:* ${orcamento.cliente.nome}`);
    
    if (orcamento.validadeDias) {
      lines.push(`• *Validade:* ${orcamento.validadeDias} dias`);
    }
    if (orcamento.condicoesPagamento) {
      lines.push(`• *Condições:* ${orcamento.condicoesPagamento}`);
    }
    lines.push('');

    // Items list
    if (includeItems && orcamento.itens && orcamento.itens.length > 0) {
      lines.push(`📦 *ITENS DA PROPOSTA:*`);
      orcamento.itens.forEach((item, index) => {
        const itemSubtotal = Number(item.subtotal || item.quantidade * item.precoUnitario);
        const itemType = item.tipo === 'servico' ? '🔧' : '📦';
        lines.push(`${itemType} ${item.quantidade}x *${item.descricao}* - ${formatCurrency(itemSubtotal)}`);
      });
      lines.push('');
    }

    // Totals
    lines.push(`💰 *VALORES:*`);
    lines.push(`• *Subtotal:* ${formatCurrency(orcamento.subtotal)}`);
    
    if (orcamento.desconto && orcamento.desconto > 0) {
      const valorDesconto = orcamento.descontoTipo === 'percentual'
        ? (orcamento.subtotal * orcamento.desconto) / 100
        : orcamento.desconto;
      lines.push(`• *Desconto:* - ${formatCurrency(valorDesconto)}`);
    }

    if (orcamento.impostos && orcamento.impostos > 0) {
      lines.push(`• *Acréscimos/Impostos:* + ${formatCurrency(orcamento.impostos)}`);
    }

    lines.push(`• *VALOR TOTAL: ${formatCurrency(orcamento.total)}*`);
    lines.push('');
  }

  // Observations
  if (orcamento.observacoes && includeSummary) {
    lines.push(`📝 *Observações:*`);
    lines.push(`${orcamento.observacoes}`);
    lines.push('');
  }

  // Direct Web link
  if (includeLink && baseUrl && orcamento.id) {
    const linkUrl = `${baseUrl}/orcamento/${orcamento.id}`;
    lines.push(`🔗 *Visualize a proposta completa online:*`);
    lines.push(linkUrl);
    lines.push('');
  }

  // Signature
  lines.push(`Ficamos à disposição para qualquer esclarecimento.`);
  lines.push(`_Atenciosamente, *${empresaNome}*_`);
  if (empresa?.telefone) {
    lines.push(`📞 Contato: ${empresa.telefone}`);
  }

  return lines.join('\n');
}

/**
 * Builds the accompanying WhatsApp message for PDF sharing.
 */
export function buildWhatsAppPdfMessage(
  orcamento: Orcamento,
  empresa?: Usuario | null,
  customMessage?: string
): string {
  const lines: string[] = [];
  const empresaNome = empresa?.empresa || empresa?.nome || 'Nossa Empresa';

  if (customMessage?.trim()) {
    lines.push(customMessage.trim());
    lines.push('');
  } else {
    lines.push(`Olá, *${orcamento.cliente.nome}*! Tudo bem?`);
    lines.push(`Segue em anexo o PDF oficial do orçamento *${orcamento.numero}* no valor de *${formatCurrency(orcamento.total)}*.`);
    lines.push('');
  }

  if (orcamento.validadeDias) {
    lines.push(`📅 *Validade:* ${orcamento.validadeDias} dias`);
  }
  if (orcamento.condicoesPagamento) {
    lines.push(`💳 *Condições de Pagamento:* ${orcamento.condicoesPagamento}`);
  }
  lines.push('');
  lines.push(`Ficamos à disposição para qualquer dúvida.`);
  lines.push(`_Atenciosamente, *${empresaNome}*_`);
  if (empresa?.telefone) {
    lines.push(`📞 Contato: ${empresa.telefone}`);
  }

  return lines.join('\n');
}

/**
 * Builds email subject for proposal sharing.
 */
export function buildEmailSubject(orcamento: Orcamento, empresa?: Usuario | null): string {
  const empresaNome = empresa?.empresa || empresa?.nome || 'Nossa Empresa';
  return `Orçamento Nº ${orcamento.numero} - ${empresaNome}`;
}

/**
 * Builds email body for proposal sharing.
 */
export function buildEmailBody(
  orcamento: Orcamento,
  empresa?: Usuario | null,
  customMessage?: string
): string {
  const empresaNome = empresa?.empresa || empresa?.nome || 'Nossa Empresa';
  if (customMessage?.trim()) {
    return customMessage.trim();
  }

  const lines = [
    `Olá, ${orcamento.cliente?.nome || 'Cliente'}!`,
    '',
    `Segue em anexo a proposta comercial em PDF referente ao orçamento nº ${orcamento.numero}, no valor total de ${formatCurrency(orcamento.total)}.`,
    '',
    orcamento.validadeDias ? `• Validade da proposta: ${orcamento.validadeDias} dias` : '',
    orcamento.condicoesPagamento ? `• Condições de Pagamento: ${orcamento.condicoesPagamento}` : '',
    '',
    'Ficamos à disposição para qualquer dúvida ou esclarecimento.',
    '',
    `Atenciosamente,`,
    `${empresaNome}`,
    empresa?.telefone ? `Telefone: ${empresa.telefone}` : '',
    empresa?.email ? `E-mail: ${empresa.email}` : '',
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Generates mailto link.
 */
export function getEmailMailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Creates the direct WhatsApp URL to open WhatsApp Web or App.
 */
export function getWhatsAppShareUrl(phone: string, text: string): string {
  const cleanPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(text);
  
  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
