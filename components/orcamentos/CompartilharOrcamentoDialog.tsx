'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Share2,
  MessageCircle,
  Mail,
  Phone,
  FileDown,
  FileText,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import type { Orcamento, Usuario } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  getWhatsAppShareUrl,
  buildWhatsAppPdfMessage,
  buildEmailSubject,
  buildEmailBody,
  getEmailMailtoUrl,
} from '@/lib/whatsapp';
import { BlobProvider } from '@react-pdf/renderer';
import { OrcamentoPDF } from '@/components/OrcamentoPDF';

export interface CompartilharOrcamentoDialogProps {
  orcamento: Orcamento | undefined;
  empresa: Usuario | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdated?: (id: string, newStatus: string) => Promise<void> | void;
  canalInicial?: 'whatsapp' | 'email';
}

export function CompartilharOrcamentoDialog({
  orcamento,
  empresa,
  isOpen,
  onOpenChange,
  onStatusUpdated,
  canalInicial = 'whatsapp',
}: CompartilharOrcamentoDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [canal, setCanal] = useState<'whatsapp' | 'email'>(canalInicial);
  const [telefone, setTelefone] = useState(orcamento?.cliente?.telefone || '');
  const [email, setEmail] = useState(orcamento?.cliente?.email || '');
  const [assuntoEmail, setAssuntoEmail] = useState('');
  const [mensagemWhatsApp, setMensagemWhatsApp] = useState('');
  const [mensagemEmail, setMensagemEmail] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync client data when orcamento changes
  useEffect(() => {
    if (orcamento) {
      setTelefone(orcamento.cliente?.telefone || '');
      setEmail(orcamento.cliente?.email || '');
      setAssuntoEmail(buildEmailSubject(orcamento, empresa));
      setMensagemEmail(buildEmailBody(orcamento, empresa));
    }
  }, [orcamento, empresa]);

  const nomeArquivo = `Orcamento-${orcamento?.numero || orcamento?.id || 'proposta'}.pdf`;

  const textoWhatsAppFormatado = useMemo(() => {
    if (!orcamento) return '';
    return buildWhatsAppPdfMessage(orcamento, empresa, mensagemWhatsApp);
  }, [orcamento, empresa, mensagemWhatsApp]);

  if (!orcamento || !mounted) return null;

  const handleShareWhatsApp = async (blob: Blob | null, url: string | null) => {
    if (!blob) {
      toast.error('O PDF ainda está sendo gerado. Por favor, aguarde um instante.');
      return;
    }

    try {
      setEnviando(true);
      const file = new File([blob], nomeArquivo, { type: 'application/pdf' });

      // Native Web Share API if supported
      const canShareFiles =
        typeof navigator !== 'undefined' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({
            title: `Orçamento ${orcamento.numero}`,
            text: textoWhatsAppFormatado,
            files: [file],
          });

          if (orcamento.status === 'rascunho' && onStatusUpdated) {
            await onStatusUpdated(orcamento.id, 'enviado');
          }

          toast.success('PDF compartilhado com sucesso!');
          onOpenChange(false);
          return;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            return;
          }
          console.warn('Fallback para download + WhatsApp Web:', shareErr);
        }
      }

      // Fallback: Download file + open WhatsApp
      const downloadUrl = url || URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const waUrl = getWhatsAppShareUrl(telefone, textoWhatsAppFormatado);
      window.open(waUrl, '_blank');

      if (orcamento.status === 'rascunho' && onStatusUpdated) {
        try {
          await onStatusUpdated(orcamento.id, 'enviado');
        } catch (err) {
          console.error('Erro ao atualizar status:', err);
        }
      }

      toast.success('PDF baixado! Anexe o arquivo na conversa do WhatsApp que foi aberta.', {
        duration: 5000,
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Erro ao compartilhar no WhatsApp:', err);
      toast.error('Não foi possível realizar o envio.');
    } finally {
      setEnviando(false);
    }
  };

  const handleShareEmail = async (blob: Blob | null, url: string | null) => {
    if (!blob) {
      toast.error('O PDF ainda está sendo gerado. Por favor, aguarde um instante.');
      return;
    }

    try {
      setEnviando(true);
      const file = new File([blob], nomeArquivo, { type: 'application/pdf' });

      // Native Web Share API if supported
      const canShareFiles =
        typeof navigator !== 'undefined' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({
            title: assuntoEmail,
            text: mensagemEmail,
            files: [file],
          });

          if (orcamento.status === 'rascunho' && onStatusUpdated) {
            await onStatusUpdated(orcamento.id, 'enviado');
          }

          toast.success('PDF compartilhado por e-mail com sucesso!');
          onOpenChange(false);
          return;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            return;
          }
          console.warn('Fallback para download + mailto:', shareErr);
        }
      }

      // Fallback: Download file + open default mail app
      const downloadUrl = url || URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const mailtoUrl = getEmailMailtoUrl(email, assuntoEmail, mensagemEmail);
      window.location.href = mailtoUrl;

      if (orcamento.status === 'rascunho' && onStatusUpdated) {
        try {
          await onStatusUpdated(orcamento.id, 'enviado');
        } catch (err) {
          console.error('Erro ao atualizar status:', err);
        }
      }

      toast.success('Software de e-mail aberto! O PDF do orçamento foi baixado para anexar.');
      onOpenChange(false);
    } catch (err) {
      console.error('Erro ao compartilhar por e-mail:', err);
      toast.error('Não foi possível preparar o e-mail.');
    } finally {
      setEnviando(false);
    }
  };

  const handleDownloadDirect = (blob: Blob | null, url: string | null) => {
    if (!blob) {
      toast.error('Gerando PDF, aguarde um segundo...');
      return;
    }
    const downloadUrl = url || URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('PDF baixado com sucesso!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        id="compartilhar-orcamento-dialog"
      >
        <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                Compartilhar Orçamento
                <span className="text-xs font-mono font-normal text-muted-foreground">({orcamento.numero})</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Envie o documento PDF oficial diretamente por WhatsApp ou E-mail.
              </DialogDescription>
        </DialogHeader>

        <BlobProvider document={<OrcamentoPDF orcamento={orcamento} empresa={empresa} />}>
          {({ blob, url, loading }) => (
            <div className="space-y-4 py-2 text-xs">
              
              {/* Card Resumo do PDF */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{nomeArquivo}</p>
                      <p className="text-[10px] text-muted-foreground">Documento PDF Oficial</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {loading ? 'Compilando...' : 'Pronto'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Cliente:</span>
                    <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{orcamento.cliente.nome}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor Total:</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(orcamento.total)}</p>
                  </div>
                </div>
              </div>

              {/* Seletor de Canal: WhatsApp ou E-mail */}
              <Tabs
                value={canal}
                onValueChange={(val) => setCanal(val as 'whatsapp' | 'email')}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full h-9">
                  <TabsTrigger
                    value="whatsapp"
                    className="text-xs flex items-center gap-1.5 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300"
                    id="tab-compartilhar-whatsapp"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="email"
                    className="text-xs flex items-center gap-1.5 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300"
                    id="tab-compartilhar-email"
                  >
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                    <span>E-mail</span>
                  </TabsTrigger>
                </TabsList>

                {/* ABA WHATSAPP */}
                <TabsContent value="whatsapp" className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="whatsapp-phone-dest" className="text-xs font-semibold flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" />
                      WhatsApp do Cliente
                    </Label>
                    <Input
                      id="whatsapp-phone-dest"
                      placeholder="(DDD) 99999-9999"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="text-xs bg-white dark:bg-zinc-950 font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Destinatário: <strong className="text-zinc-700 dark:text-zinc-300">{orcamento.cliente.nome}</strong>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="whatsapp-custom-msg" className="text-xs font-semibold">
                      Mensagem de Acompanhamento (Opcional)
                    </Label>
                    <Textarea
                      id="whatsapp-custom-msg"
                      placeholder="Ex: Olá! Segue a proposta comercial em PDF conforme conversamos..."
                      value={mensagemWhatsApp}
                      onChange={(e) => setMensagemWhatsApp(e.target.value)}
                      rows={2}
                      className="text-xs bg-white dark:bg-zinc-950 resize-none"
                    />
                  </div>
                </TabsContent>

                {/* ABA E-MAIL */}
                <TabsContent value="email" className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email-dest" className="text-xs font-semibold flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-blue-600" />
                      E-mail do Cliente
                    </Label>
                    <Input
                      id="email-dest"
                      type="email"
                      placeholder="cliente@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs bg-white dark:bg-zinc-950 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email-subject" className="text-xs font-semibold">
                      Assunto do E-mail
                    </Label>
                    <Input
                      id="email-subject"
                      value={assuntoEmail}
                      onChange={(e) => setAssuntoEmail(e.target.value)}
                      className="text-xs bg-white dark:bg-zinc-950"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email-body" className="text-xs font-semibold">
                      Mensagem do E-mail
                    </Label>
                    <Textarea
                      id="email-body"
                      value={mensagemEmail}
                      onChange={(e) => setMensagemEmail(e.target.value)}
                      rows={3}
                      className="text-xs bg-white dark:bg-zinc-950 resize-none"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Barra de Ações */}
              <div className="pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadDirect(blob, url)}
                  disabled={loading || enviando}
                  className="w-full sm:w-auto text-xs gap-1.5 border-zinc-200 dark:border-zinc-800"
                  id="btn-baixar-pdf-dialog"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileDown className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                  )}
                  <span>{loading ? 'Gerando...' : 'Baixar PDF'}</span>
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    disabled={enviando}
                    className="flex-1 sm:flex-none text-xs"
                  >
                    Cancelar
                  </Button>

                  {canal === 'whatsapp' ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleShareWhatsApp(blob, url)}
                      disabled={loading || enviando}
                      className="flex-1 sm:flex-none text-xs font-semibold gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white shadow-sm"
                      id="btn-enviar-pdf-whatsapp"
                    >
                      {loading || enviando ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>{loading ? 'Preparando...' : 'Enviando...'}</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4 fill-white" />
                          <span>Enviar no WhatsApp</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleShareEmail(blob, url)}
                      disabled={loading || enviando}
                      className="flex-1 sm:flex-none text-xs font-semibold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      id="btn-enviar-pdf-email"
                    >
                      {loading || enviando ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>{loading ? 'Preparando...' : 'Enviando...'}</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          <span>Enviar por E-mail</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

            </div>
          )}
        </BlobProvider>
      </DialogContent>
    </Dialog>
  );
}
