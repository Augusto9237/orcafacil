'use client';
import { useState } from 'react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useAuth } from '@/hooks/useAuth';
import { useDataRefresh } from '@/lib/data-refresh';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Eye, Pencil, Trash2, Search, Plus } from 'lucide-react';
import { atualizarStatusOrcamento, excluirOrcamento } from '@/actions/orcamentos';
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
import { VisualizarOrcamentoDialog } from '@/components/orcamentos/VisualizarOrcamentoDialog';

export default function OrcamentosPage() {
  const { orcamentos, carregando } = useOrcamentos();
  const { perfil } = useAuth();
  const { refresh } = useDataRefresh();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [deletandoNumero, setDeletandoNumero] = useState<string>('');
  const [visualizarOrcamentoId, setVisualizarOrcamentoId] = useState<string | null>(null);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  const selectedOrcamento = orcamentos.find(o => o.id === visualizarOrcamentoId);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setAtualizandoStatus(true);
      const resultado = await atualizarStatusOrcamento(id, newStatus as any);
      if (resultado.ok === false) {
        toast.error(resultado.error);
        return;
      }
      toast.success(`Status atualizado com sucesso!`);
      refresh();
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
    
    const atendeBusca = (
      numero.toLowerCase().includes(termo) ||
      clienteNome.toLowerCase().includes(termo) ||
      clienteCpfCnpj.toLowerCase().includes(termo) ||
      status.toLowerCase().includes(termo)
    );

    const atendeStatus = filtroStatus === 'todos' || status === filtroStatus;

    return atendeBusca && atendeStatus;
  });

  const handleDelete = (id: string, numero: string) => {
    setDeletandoId(id);
    setDeletandoNumero(numero);
  };

  const confirmDelete = async () => {
    if (!deletandoId) return;
    try {
      const resultado = await excluirOrcamento(deletandoId);
      if (resultado.ok === false) {
        toast.error(resultado.error);
        return;
      }
      toast.success('Orçamento excluído com sucesso!');
      refresh();
    } catch (err) {
      console.error('Erro ao excluir orçamento:', err);
      toast.error('Erro ao excluir orçamento.');
    } finally {
      setDeletandoId(null);
      setDeletandoNumero('');
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "ghost" }> = {
      rascunho: { label: 'Rascunho', variant: 'secondary' },
      enviado: { label: 'Enviado', variant: 'outline' },
      aprovado: { label: 'Aprovado', variant: 'default' },
      rejeitado: { label: 'Rejeitado', variant: 'destructive' },
      recusado: { label: 'Recusado', variant: 'destructive' },
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
    <div id="orcamentos-container" className="space-y-6 pt-12 max-sm:pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl max-sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Orçamentos</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Gerencie seus orçamentos.</p>
        </div>
        <Link href="/orcamentos/novo">
          <Button className="font-semibold">
          <Plus/>
          <span className="max-sm:hidden">Novo Orçamento</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar orçamento por número ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-950 w-full"
          />
        </div>

        <div className="w-full sm:w-[200px]">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-full bg-white dark:bg-zinc-950">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="recusado">Recusado</SelectItem>
              <SelectItem value="rejeitado">Rejeitado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="expirado">Expirado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm dark:bg-zinc-950 overflow-hidden">
        {orcamentos.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum orçamento criado.</p>
        ) : orcamentosFiltrados.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum orçamento encontrado com os filtros aplicados.</p>
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
                    {formatCurrency(orcamento.total)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(orcamento.status)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Visualizar Orçamento"
                        onClick={() => setVisualizarOrcamentoId(orcamento.id)}
                        className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        id={`btn-ver-orcamento-${orcamento.id}`}
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
                          id={`btn-editar-orcamento-${orcamento.id}`}
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
                        id={`btn-excluir-orcamento-${orcamento.id}`}
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

      <VisualizarOrcamentoDialog
        orcamento={selectedOrcamento}
        isOpen={!!visualizarOrcamentoId}
        onOpenChange={(open) => !open && setVisualizarOrcamentoId(null)}
        onUpdateStatus={handleUpdateStatus}
        atualizandoStatus={atualizandoStatus}
      />
    </div>
  );
}
