'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, CalendarClock, MapPin, Share2 } from 'lucide-react';
import type { Orcamento } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { DownloadOrcamentoButton } from '@/components/PDFDownloadButtons';
import { CompartilharOrcamentoDialog } from '@/components/orcamentos/CompartilharOrcamentoDialog';

interface VisualizarOrcamentoDialogProps {
  orcamento: Orcamento | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (id: string, newStatus: string) => Promise<void>;
  atualizandoStatus: boolean;
}

export function VisualizarOrcamentoDialog({
  orcamento,
  isOpen,
  onOpenChange,
  onUpdateStatus,
  atualizandoStatus,
}: VisualizarOrcamentoDialogProps) {
  const { perfil } = useAuth();
  const [compartilharDialogOpen, setCompartilharDialogOpen] = useState(false);

  const formatDate = (criadoEm: any) => {
    if (!criadoEm) return '-';
    if (criadoEm.seconds) {
      return new Date(criadoEm.seconds * 1000).toLocaleDateString('pt-BR');
    }
    return new Date(criadoEm).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "ghost" }> = {
      rascunho: { label: 'Rascunho', variant: 'secondary' },
      enviado: { label: 'Enviado', variant: 'outline' },
      aprovado: { label: 'Aprovado', variant: 'default' },
      recusado: { label: 'Recusado', variant: 'destructive' },
      rejeitado: { label: 'Rejeitado', variant: 'destructive' },
      cancelado: { label: 'Cancelado', variant: 'ghost' },
      expirado: { label: 'Expirado', variant: 'outline' },
    };
    const config = configs[status] || { label: status, variant: 'secondary' };
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" id="visualizar-orcamento-dialog-content">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between gap-3" id="visualizar-orcamento-title">
              <div className="flex items-center gap-2">
                <span>Orçamento {orcamento?.numero}</span>
                {orcamento && getStatusBadge(orcamento.status)}
              </div>
            </DialogTitle>
            <DialogDescription className="pt-1">
              Visualize os dados completos do orçamento e gerencie o status da proposta comercial.
            </DialogDescription>
          </DialogHeader>

        {orcamento ? (
          <div className="space-y-6 py-2">
            {/* Cliente e Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="space-y-2">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Dados do Cliente
                </h4>
                <p className="font-semibold text-zinc-950 dark:text-zinc-50 text-[13px]">{orcamento.cliente?.nome}</p>
                {orcamento.cliente?.cpfCnpj && (
                  <p className="text-zinc-500 font-mono">CPF/CNPJ: {orcamento.cliente.cpfCnpj}</p>
                )}
                {orcamento.cliente?.email && (
                  <p className="text-zinc-500">Email: {orcamento.cliente.email}</p>
                )}
                <p className="text-zinc-500">Tel: {orcamento.cliente?.telefone}</p>
              </div>

              <div className="space-y-2 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-2 md:pt-0 md:pl-4">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5 text-primary" />
                  Prazos e Validade
                </h4>
                <p><span className="text-zinc-500 dark:text-zinc-400">Emissão:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatDate(orcamento.criadoEm)}</span></p>
                <p><span className="text-zinc-500 dark:text-zinc-400">Validade:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{orcamento.validadeDias || 15} dias</span></p>
                {orcamento.condicoesPagamento && (
                  <p className="truncate" title={orcamento.condicoesPagamento}>
                    <span className="text-zinc-500 dark:text-zinc-400">Pagamento:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{orcamento.condicoesPagamento}</span>
                  </p>
                )}
              </div>

              {orcamento.cliente?.endereco && (
                <div className="col-span-1 md:col-span-2 border-t border-zinc-200 dark:border-zinc-800 pt-2 text-zinc-500 dark:text-zinc-400">
                  <p className="flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>{orcamento.cliente.endereco}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Tabela de Itens */}
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Itens Adicionados</h4>
              <div className="border rounded-lg overflow-hidden max-h-[180px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/80 sticky top-0 border-b font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-center w-[80px]">Tipo</th>
                      <th className="py-2 px-3 text-right w-[60px]">Qtd</th>
                      <th className="py-2 px-3 text-right w-[100px]">Unitário</th>
                      <th className="py-2 px-3 text-right w-[110px]">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-[11px] text-zinc-700 dark:text-zinc-300">
                    {orcamento.itens && orcamento.itens.length > 0 ? (
                      orcamento.itens.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                          <td className="py-2 px-3 font-medium truncate max-w-[180px]" title={item.descricao}>
                            {item.descricao}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                              item.tipo === 'produto' 
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            }`}>
                              {item.tipo === 'produto' ? 'PROD' : 'SERV'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono">{item.quantidade}</td>
                          <td className="py-2 px-3 text-right font-mono">R$ {Number(item.precoUnitario || 0).toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold">R$ {Number(item.subtotal || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-muted-foreground">Nenhum item adicionado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totais */}
            <div className="flex flex-col items-end space-y-1 text-xs pt-2">
              <div className="flex justify-between w-full max-w-[240px] text-zinc-500">
                <span>Subtotal:</span>
                <span className="font-mono">R$ {Number(orcamento.subtotal || 0).toFixed(2)}</span>
              </div>
              {(orcamento.desconto || 0) > 0 && (
                <div className="flex justify-between w-full max-w-[240px] text-rose-600">
                  <span>Desconto ({orcamento.descontoTipo === 'percentual' ? `${orcamento.desconto}%` : 'R$'}):</span>
                  <span className="font-mono">
                    - R$ {
                      orcamento.descontoTipo === 'percentual'
                        ? ((Number(orcamento.subtotal || 0) * Number(orcamento.desconto || 0)) / 100).toFixed(2)
                        : Number(orcamento.desconto || 0).toFixed(2)
                    }
                  </span>
                </div>
              )}
              {(orcamento.impostos || 0) > 0 && (
                <div className="flex justify-between w-full max-w-[240px] text-orange-600">
                  <span>Impostos/Acréscimos:</span>
                  <span className="font-mono">+ R$ {Number(orcamento.impostos || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between w-full max-w-[240px] font-bold text-[14px] text-zinc-900 dark:text-zinc-50 pt-1.5 border-t border-dashed">
                <span>Total Geral:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-[15px]">R$ {Number(orcamento.total || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Observações adicionais */}
            {orcamento.observacoes && (
              <div className="space-y-1">
                <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Observações</h4>
                <p className="text-xs bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded border leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap max-h-[80px] overflow-y-auto">
                  {orcamento.observacoes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 border-t pt-4" id="orcamento-actions-section">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Ações do Orçamento
              </h4>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Status:</span>
                  <Select
                    value={orcamento.status}
                    disabled={atualizandoStatus}
                    onValueChange={(newStatus) => onUpdateStatus(orcamento.id, newStatus)}
                  >
                    <SelectTrigger className="h-8 text-xs w-[150px]" id="select-status-orcamento">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="enviado">Enviado</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="recusado">Recusado</SelectItem>
                      <SelectItem value="expirado">Expirado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    id="btn-compartilhar-orcamento"
                    onClick={() => setCompartilharDialogOpen(true)}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Compartilhar</span>
                  </Button>

                  <DownloadOrcamentoButton
                    orcamento={orcamento}
                    empresa={perfil}
                    variant="secondary"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-xs">Carregando dados...</div>
        )}
      </DialogContent>
      </Dialog>

      <CompartilharOrcamentoDialog
        orcamento={orcamento}
        empresa={perfil}
        isOpen={compartilharDialogOpen}
        onOpenChange={setCompartilharDialogOpen}
        onStatusUpdated={onUpdateStatus}
      />
    </>
  );
}

