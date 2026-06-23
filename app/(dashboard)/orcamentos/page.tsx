'use client';
import { useState } from 'react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Eye, Pencil, Trash2, Search, Check, X, Send, Ban, ExternalLink, CalendarClock, User, MapPin } from 'lucide-react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function OrcamentosPage() {
  const { orcamentos, carregando } = useOrcamentos();
  const [busca, setBusca] = useState('');
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [deletandoNumero, setDeletandoNumero] = useState<string>('');
  const [visualizarOrcamentoId, setVisualizarOrcamentoId] = useState<string | null>(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  const selectedOrcamento = orcamentos.find(o => o.id === visualizarOrcamentoId);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setAtualizandoStatus(true);
      const docRef = doc(db, 'orcamentos', id);
      await updateDoc(docRef, { status: newStatus });
      toast.success(`Status atualizado com sucesso!`);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status do orçamento.');
    } finally {
      setAtualizandoStatus(false);
    }
  };

  const orcamentosFiltrados = orcamentos.filter((orcamento) => {
    const termo = busca.toLowerCase();
    const numero = orcamento.numero || '';
    const clienteNome = orcamento.cliente?.nome || '';
    const clienteCpfCnpj = orcamento.cliente?.cpfCnpj || '';
    const status = orcamento.status || '';
    
    return (
      numero.toLowerCase().includes(termo) ||
      clienteNome.toLowerCase().includes(termo) ||
      clienteCpfCnpj.toLowerCase().includes(termo) ||
      status.toLowerCase().includes(termo)
    );
  });

  const handleDelete = (id: string, numero: string) => {
    setDeletandoId(id);
    setDeletandoNumero(numero);
  };

  const confirmDelete = async () => {
    if (!deletandoId) return;
    try {
      await deleteDoc(doc(db, 'orcamentos', deletandoId));
      toast.success('Orçamento excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir orçamento:', err);
      toast.error('Erro ao excluir orçamento.');
    } finally {
      setDeletandoId(null);
      setDeletandoNumero('');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; classes: string }> = {
      rascunho: { label: 'Rascunho', classes: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' },
      enviado: { label: 'Enviado', classes: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/30' },
      aprovado: { label: 'Aprovado', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-950/30' },
      rejeitado: { label: 'Rejeitado', classes: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50 dark:border-rose-950/30' },
      cancelado: { label: 'Cancelado', classes: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-950/30' },
    };
    const config = configs[status] || { label: status, classes: 'bg-zinc-100 text-zinc-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (criadoEm: any) => {
    if (!criadoEm) return '-';
    if (criadoEm.seconds) {
      return new Date(criadoEm.seconds * 1000).toLocaleDateString('pt-BR');
    }
    return new Date(criadoEm).toLocaleDateString('pt-BR');
  };

  if (carregando) {
    return <div className="space-y-4"><Skeleton className="h-[400px] w-full rounded-xl" /></div>;
  }

  return (
    <div id="orcamentos-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Orçamentos</h2>
          <p className="text-muted-foreground">Gerencie seus orçamentos e propostas comerciais.</p>
        </div>
        <Link href="/orcamentos/novo">
          <Button className="font-semibold">Novo Orçamento</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar orçamento por número, cliente ou status..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9 max-w-sm bg-white dark:bg-zinc-950"
        />
      </div>

      <div className="rounded-md border bg-white shadow-sm dark:bg-zinc-950 overflow-hidden">
        {orcamentos.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum orçamento criado.</p>
        ) : orcamentosFiltrados.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum orçamento encontrado para "{busca}".</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] font-semibold">Número</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold">CPF/CNPJ</TableHead>
                <TableHead className="font-semibold">Data</TableHead>
                <TableHead className="font-semibold">Total</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orcamentosFiltrados.map((orcamento) => (
                <TableRow key={orcamento.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                  <TableCell className="font-mono font-medium text-blue-600 dark:text-blue-400">
                    {orcamento.numero}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    {orcamento.cliente.nome}
                  </TableCell>
                  <TableCell className="text-zinc-550 dark:text-zinc-400 font-mono text-xs">
                    {orcamento.cliente.cpfCnpj || '—'}
                  </TableCell>
                  <TableCell className="text-zinc-550 dark:text-zinc-400">
                    {formatDate(orcamento.criadoEm)}
                  </TableCell>
                  <TableCell className="font-medium font-mono text-zinc-900 dark:text-zinc-100">
                    R$ {orcamento.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(orcamento.status)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Visualizar Orçamento"
                        onClick={() => setVisualizarOrcamentoId(orcamento.id)}
                        className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Button>
                      
                      <Link href={`/orcamentos/novo?edit=${orcamento.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar Orçamento"
                          className="h-8 w-8 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Deletar Orçamento"
                        onClick={() => handleDelete(orcamento.id, orcamento.numero)}
                        className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={!!deletandoId} onOpenChange={(open) => !open && setDeletandoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Orçamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento <strong className="font-semibold text-zinc-900 dark:text-zinc-50">{deletandoNumero}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-650 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700">
              Excluir Orçamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!visualizarOrcamentoId} onOpenChange={(open) => !open && setVisualizarOrcamentoId(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span>Orçamento {selectedOrcamento?.numero}</span>
                {selectedOrcamento && getStatusBadge(selectedOrcamento.status)}
              </div>
            </DialogTitle>
            <DialogDescription className="pt-1">
              Visualize os dados completos do orçamento e gerencie o status da proposta comercial.
            </DialogDescription>
          </DialogHeader>

          {selectedOrcamento ? (
            <div className="space-y-6 py-2">
              {/* Cliente e Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="space-y-2">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    Dados do Cliente
                  </h4>
                  <p className="font-semibold text-zinc-950 dark:text-zinc-50 text-[13px]">{selectedOrcamento.cliente?.nome}</p>
                  {selectedOrcamento.cliente?.cpfCnpj && (
                    <p className="text-zinc-500 font-mono">CPF/CNPJ: {selectedOrcamento.cliente.cpfCnpj}</p>
                  )}
                  {selectedOrcamento.cliente?.email && (
                    <p className="text-zinc-500">Email: {selectedOrcamento.cliente.email}</p>
                  )}
                  <p className="text-zinc-500">Tel: {selectedOrcamento.cliente?.telefone}</p>
                </div>

                <div className="space-y-2 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-2 md:pt-0 md:pl-4">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5 text-primary" />
                    Prazos e Validade
                  </h4>
                  <p><span className="text-zinc-500 dark:text-zinc-400">Emissão:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatDate(selectedOrcamento.criadoEm)}</span></p>
                  <p><span className="text-zinc-500 dark:text-zinc-400">Validade:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedOrcamento.validadeDias || 15} dias</span></p>
                  {selectedOrcamento.condicoesPagamento && (
                    <p className="truncate" title={selectedOrcamento.condicoesPagamento}>
                      <span className="text-zinc-500 dark:text-zinc-400">Pagamento:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedOrcamento.condicoesPagamento}</span>
                    </p>
                  )}
                </div>

                {selectedOrcamento.cliente?.endereco && (
                  <div className="col-span-1 md:col-span-2 border-t border-zinc-200 dark:border-zinc-800 pt-2 text-zinc-500 dark:text-zinc-400">
                    <p className="flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{selectedOrcamento.cliente.endereco}</span>
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
                      {selectedOrcamento.itens && selectedOrcamento.itens.length > 0 ? (
                        selectedOrcamento.itens.map((item, idx) => (
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
                  <span className="font-mono">R$ {Number(selectedOrcamento.subtotal || 0).toFixed(2)}</span>
                </div>
                {(selectedOrcamento.desconto || 0) > 0 && (
                  <div className="flex justify-between w-full max-w-[240px] text-rose-600">
                    <span>Desconto ({selectedOrcamento.descontoTipo === 'percentual' ? `${selectedOrcamento.desconto}%` : 'R$'}):</span>
                    <span className="font-mono">
                      - R$ {
                        selectedOrcamento.descontoTipo === 'percentual'
                          ? ((Number(selectedOrcamento.subtotal || 0) * Number(selectedOrcamento.desconto || 0)) / 100).toFixed(2)
                          : Number(selectedOrcamento.desconto || 0).toFixed(2)
                      }
                    </span>
                  </div>
                )}
                {(selectedOrcamento.impostos || 0) > 0 && (
                  <div className="flex justify-between w-full max-w-[240px] text-orange-600">
                    <span>Impostos/Acréscimos:</span>
                    <span className="font-mono">+ R$ {Number(selectedOrcamento.impostos || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between w-full max-w-[240px] font-bold text-[14px] text-zinc-900 dark:text-zinc-50 pt-1.5 border-t border-dashed">
                  <span>Total Geral:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 text-[15px]">R$ {Number(selectedOrcamento.total || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Observações adicionais */}
              {selectedOrcamento.observacoes && (
                <div className="space-y-1">
                  <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Observações</h4>
                  <p className="text-xs bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded border leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap max-h-[80px] overflow-y-auto">
                    {selectedOrcamento.observacoes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 border-t pt-4">
                <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  Gerenciar Status da Proposta
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={atualizandoStatus || selectedOrcamento.status === 'enviado'}
                    onClick={() => handleUpdateStatus(selectedOrcamento.id, 'enviado')}
                    className="h-8 text-xs flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Enviar Proposta
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={atualizandoStatus || selectedOrcamento.status === 'aprovado'}
                    onClick={() => handleUpdateStatus(selectedOrcamento.id, 'aprovado')}
                    className="h-8 text-xs flex items-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 font-semibold"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Aprovar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={atualizandoStatus || selectedOrcamento.status === 'recusado'}
                    onClick={() => handleUpdateStatus(selectedOrcamento.id, 'recusado')}
                    className="h-8 text-xs flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400"
                  >
                    <X className="h-3.5 w-3.5" />
                    Recusar / Rejeitar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={atualizandoStatus || selectedOrcamento.status === 'expirado'}
                    onClick={() => handleUpdateStatus(selectedOrcamento.id, 'expirado')}
                    className="h-8 text-xs flex items-center gap-1 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Expirar Proposta
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-xs">Carregando dados...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
