'use client';

import { useEffect, useState, use } from 'react';
import { buscarOrcamentoPublico } from '@/actions/orcamentos';
import type { Orcamento, Usuario } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  User,
  CalendarClock,
  MapPin,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  Download,
  MessageCircle,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { DownloadOrcamentoButton } from '@/components/PDFDownloadButtons';
import { getWhatsAppShareUrl } from '@/lib/whatsapp';

interface OrcamentoPublicoPageProps {
  params: Promise<{ id: string }>;
}

export default function OrcamentoPublicoPage({ params }: OrcamentoPublicoPageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [empresa, setEmpresa] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarOrcamento() {
      if (!id) return;
      try {
        setCarregando(true);
        setErro(null);

        const resultado = await buscarOrcamentoPublico(id);

        if (!resultado) {
          setErro('Orçamento não encontrado ou link expirado.');
          return;
        }

        setOrcamento(resultado.orcamento);
        setEmpresa(resultado.empresa);
      } catch (err: any) {
        console.error('Erro ao buscar orçamento:', err);
        setErro('Ocorreu um erro ao carregar este orçamento.');
      } finally {
        setCarregando(false);
      }
    }

    carregarOrcamento();
  }, [id]);

  const formatDate = (criadoEm: any) => {
    if (!criadoEm) return '-';
    if (criadoEm.seconds) {
      return new Date(criadoEm.seconds * 1000).toLocaleDateString('pt-BR');
    }
    return new Date(criadoEm).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; classes: string }> = {
      rascunho: { label: 'Rascunho', classes: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' },
      enviado: { label: 'Proposta Enviada', classes: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50' },
      aprovado: { label: 'Aprovado', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50' },
      recusado: { label: 'Recusado', classes: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50' },
      rejeitado: { label: 'Rejeitado', classes: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50' },
      cancelado: { label: 'Cancelado', classes: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50' },
      expirado: { label: 'Expirado', classes: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200/50' },
    };
    const config = configs[status] || { label: status, classes: 'bg-zinc-100 text-zinc-800' };
    return (
      <Badge className={config.classes}>
        {config.label}
      </Badge>
    );
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Carregando proposta comercial...</p>
        </div>
      </div>
    );
  }

  if (erro || !orcamento) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-zinc-200 dark:border-zinc-800 shadow-md text-center p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Orçamento Indisponível</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {erro || 'Não foi possível encontrar as informações deste orçamento.'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const empresaNome = empresa?.empresa || empresa?.nome || 'Prestador de Serviços';
  const whatsappEmpresaUrl = empresa?.telefone 
    ? getWhatsAppShareUrl(
        empresa.telefone,
        `Olá! Estou visualizando a proposta do orçamento *${orcamento.numero}* e gostaria de falar a respeito.`
      )
    : null;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 py-6 sm:py-10 px-3 sm:px-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Top Header Card */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="bg-emerald-600 h-2 w-full" />
          <CardContent className="p-6 sm:p-8 space-y-6">
            
            {/* Header: Company & Proposal Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {empresaNome}
                  </h1>
                </div>
                {empresa?.cnpjCpf && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">CNPJ/CPF: {empresa.cnpjCpf}</p>
                )}
                {empresa?.email && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" /> {empresa.email}
                  </p>
                )}
                {empresa?.telefone && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" /> {empresa.telefone}
                  </p>
                )}
              </div>

              <div className="sm:text-right space-y-2 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex sm:justify-end items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proposta</span>
                  {getStatusBadge(orcamento.status)}
                </div>
                <div className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {orcamento.numero}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-0.5">
                  <p>Emissão: <strong className="text-zinc-800 dark:text-zinc-200">{formatDate(orcamento.criadoEm)}</strong></p>
                  <p>Validade: <strong className="text-zinc-800 dark:text-zinc-200">{orcamento.validadeDias || 15} dias</strong></p>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 sm:p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <User className="h-4 w-4 text-emerald-600" />
                Dados do Cliente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Nome:</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{orcamento.cliente.nome}</p>
                </div>
                {orcamento.cliente.cpfCnpj && (
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">CPF/CNPJ:</p>
                    <p className="font-mono text-zinc-900 dark:text-zinc-100">{orcamento.cliente.cpfCnpj}</p>
                  </div>
                )}
                {orcamento.cliente.telefone && (
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">Telefone:</p>
                    <p className="text-zinc-900 dark:text-zinc-100">{orcamento.cliente.telefone}</p>
                  </div>
                )}
                {orcamento.cliente.email && (
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">E-mail:</p>
                    <p className="text-zinc-900 dark:text-zinc-100">{orcamento.cliente.email}</p>
                  </div>
                )}
                {orcamento.cliente.endereco && (
                  <div className="sm:col-span-2">
                    <p className="text-zinc-500 dark:text-zinc-400">Endereço:</p>
                    <p className="text-zinc-900 dark:text-zinc-100">{orcamento.cliente.endereco}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-600" />
                Itens da Proposta
              </h3>
              <div className="border rounded-xl overflow-hidden border-zinc-200 dark:border-zinc-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300">
                      <tr>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-3 text-center w-[80px]">Tipo</th>
                        <th className="py-3 px-3 text-right w-[70px]">Qtd</th>
                        <th className="py-3 px-4 text-right w-[110px]">Unitário</th>
                        <th className="py-3 px-4 text-right w-[120px]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                      {orcamento.itens && orcamento.itens.length > 0 ? (
                        orcamento.itens.map((item, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                            <td className="py-3 px-4 font-medium">
                              <div>{item.descricao}</div>
                              {item.unidade && (
                                <span className="text-[10px] text-muted-foreground">Un: {item.unidade}</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                item.tipo === 'produto'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                              }`}>
                                {item.tipo === 'produto' ? 'PROD' : 'SERV'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono">{item.quantidade}</td>
                            <td className="py-3 px-4 text-right font-mono">{formatCurrency(item.precoUnitario)}</td>
                            <td className="py-3 px-4 text-right font-mono font-semibold">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground">
                            Nenhum item listado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col items-end space-y-1.5 text-xs pt-3">
              <div className="flex justify-between w-full max-w-[280px] text-zinc-600 dark:text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">{formatCurrency(orcamento.subtotal)}</span>
              </div>

              {(orcamento.desconto || 0) > 0 && (
                <div className="flex justify-between w-full max-w-[280px] text-rose-600 dark:text-rose-400">
                  <span>Desconto ({orcamento.descontoTipo === 'percentual' ? `${orcamento.desconto}%` : 'R$'}):</span>
                  <span className="font-mono">
                    - {formatCurrency(
                      orcamento.descontoTipo === 'percentual'
                        ? (orcamento.subtotal * orcamento.desconto) / 100
                        : orcamento.desconto
                    )}
                  </span>
                </div>
              )}

              {(orcamento.impostos || 0) > 0 && (
                <div className="flex justify-between w-full max-w-[280px] text-orange-600 dark:text-orange-400">
                  <span>Acréscimos/Impostos:</span>
                  <span className="font-mono">+ {formatCurrency(orcamento.impostos)}</span>
                </div>
              )}

              <div className="flex justify-between w-full max-w-[280px] pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                <span>Valor Total:</span>
                <span className="font-mono text-base text-emerald-600 dark:text-emerald-400 font-black">
                  {formatCurrency(orcamento.total)}
                </span>
              </div>
            </div>

            {/* Conditions & Observations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              {orcamento.condicoesPagamento && (
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
                  <h4 className="font-bold text-zinc-700 dark:text-zinc-300">Condições de Pagamento:</h4>
                  <p className="text-zinc-600 dark:text-zinc-400">{orcamento.condicoesPagamento}</p>
                </div>
              )}

              {orcamento.observacoes && (
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 space-y-1 sm:col-span-2">
                  <h4 className="font-bold text-zinc-700 dark:text-zinc-300">Observações Gerais:</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">{orcamento.observacoes}</p>
                </div>
              )}
            </div>

            {/* Action Bar for Customer */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                Proposta válida por {orcamento.validadeDias || 15} dias a partir da data de emissão.
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                <DownloadOrcamentoButton orcamento={orcamento} empresa={empresa} />

                {whatsappEmpresaUrl && (
                  <Button
                    asChild
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-sm"
                  >
                    <a href={whatsappEmpresaUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Falar no WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
