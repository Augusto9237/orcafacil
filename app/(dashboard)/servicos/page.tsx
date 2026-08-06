'use client';
import { useState } from 'react';
import { useServicos } from '@/hooks/useServicos';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, Eye, Pencil, Trash2, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { NovoServicoSheet } from '@/components/servicos/NovoServicoSheet';
import { EditarServicoSheet } from '@/components/servicos/EditarServicoSheet';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function ServicosPage() {
  const { servicos, carregando } = useServicos();
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');

  // State for View Details
  const [detalhesServico, setDetalhesServico] = useState<any>(null);

  // State for Edit Service
  const [editandoServico, setEditandoServico] = useState<any>(null);

  // State for Delete Service
  const [excluindoServico, setExcluindoServico] = useState<any>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!excluindoServico) return;
    setExcluindo(true);
    try {
      const docRef = doc(db, 'servicos', excluindoServico.id);
      await deleteDoc(docRef);
      toast.success('Serviço excluído com sucesso!');
      setExcluindoServico(null);
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast.error('Erro ao excluir o serviço.');
    } finally {
      setExcluindo(false);
    }
  };

  if (carregando) {
    return <div className="space-y-4"><Skeleton className="h-[400px] w-full rounded-xl" /></div>;
  }

  const servicosFiltrados = servicos.filter(servico => {
    const atendeBusca = servico.nome.toLowerCase().includes(busca.toLowerCase());
    const isAtivo = servico.ativo !== false;
    const atendeStatus =
      statusFiltro === 'todos' ||
      (statusFiltro === 'ativos' && isAtivo) ||
      (statusFiltro === 'inativos' && !isAtivo);
    return atendeBusca && atendeStatus;
  });

  return (
    <div className="space-y-6 py-12 max-sm:pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl max-sm:text-xl font-bold tracking-tight">Serviços</h2>
          <p className="text-muted-foreground text-xs">Gerencie seus serviços prestados.</p>
        </div>
        <NovoServicoSheet>
          <Button>
          <Plus/>
          <span className="max-sm:hidden">Novo Serviço</span>
          </Button>
        </NovoServicoSheet>
      </div>

      <div className="flex gap-4 items-center justify-between">
        <div className="max-w-md w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="buscar-servicos"
            placeholder="Buscar serviços por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="w-20 sm:w-48">
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger id="status-filtro-select" className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="filtro-todos" value="todos">Todos os Status</SelectItem>
              <SelectItem id="filtro-ativos" value="ativos">Apenas Ativos</SelectItem>
              <SelectItem id="filtro-inativos" value="inativos">Apenas Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm dark:bg-zinc-950 overflow-hidden">
        {servicos.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum serviço cadastrado.</p>
        ) : servicosFiltrados.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {busca 
              ? `Nenhum serviço encontrado para "${busca}".` 
              : 'Nenhum serviço encontrado com as opções de filtro selecionadas.'}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] font-semibold">Código</TableHead>
                <TableHead className="font-semibold">Nome/Descrição</TableHead>
                <TableHead className="font-semibold">Preço Unitário</TableHead>
                <TableHead className="font-semibold">Unidade</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicosFiltrados.map((servico) => (
                <TableRow key={servico.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                  <TableCell className="font-mono text-zinc-500 text-xs">
                    {servico.codigoInterno || '-'}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    {servico.nome}
                  </TableCell>
                  <TableCell className="font-medium font-mono text-zinc-900 dark:text-zinc-100">
                    R$ {servico.precoUnitario.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-zinc-550 dark:text-zinc-400">
                    {servico.unidade}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      servico.ativo !== false
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {servico.ativo !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6" id={`servico-actions-${servico.id}`}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Detalhes do Serviço"
                        onClick={() => setDetalhesServico(servico)}
                        className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Detalhes</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar Serviço"
                        onClick={() => setEditandoServico(servico)}
                        className="h-8 w-8 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir Serviço"
                        onClick={() => setExcluindoServico(servico)}
                        className="h-8 w-8 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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

      {/* Detalhes do Serviço Dialog */}
      <Dialog open={!!detalhesServico} onOpenChange={(open) => !open && setDetalhesServico(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <span>Detalhes do Serviço</span>
            </DialogTitle>
            <DialogDescription>
              Informações completas do serviço cadastrado.
            </DialogDescription>
          </DialogHeader>

          {detalhesServico && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Código / Ref</span>
                  <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded border border-zinc-200/50 dark:border-zinc-800/50 inline-block">
                    {detalhesServico.codigoInterno || '-'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Status</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                    detalhesServico.ativo !== false
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50'
                      : 'bg-zinc-100 text-zinc-550 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50'
                  }`}>
                    {detalhesServico.ativo !== false ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Ativo</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        <span>Inativo</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-1 border-t pt-3 border-zinc-100 dark:border-zinc-900">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Nome do Serviço</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">
                  {detalhesServico.nome}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-3 border-zinc-100 dark:border-zinc-900">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Preço Unitário</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    R$ {Number(detalhesServico.precoUnitario || 0).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Cobrança / Unidade</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {detalhesServico.unidade === 'H' ? 'H (Hora)' : 
                     detalhesServico.unidade === 'UN' ? 'UN (Unidade/Fixo)' :
                     detalhesServico.unidade === 'DIA' ? 'DIA (Diária)' :
                     detalhesServico.unidade === 'MES' ? 'MÊS (Mensalidade)' :
                     detalhesServico.unidade === 'M' ? 'M (Metro linear)' :
                     detalhesServico.unidade === 'M2' ? 'M² (Metro quadrado)' :
                     detalhesServico.unidade === 'KM' ? 'KM (Quilômetro)' :
                     detalhesServico.unidade === 'VIS' ? 'VIS (Visita técnica)' :
                     detalhesServico.unidade || '-'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 border-t pt-3 border-zinc-100 dark:border-zinc-900">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Descrição / Notas</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-455 bg-zinc-50 dark:bg-zinc-900/40 p-2 rounded border border-zinc-100 dark:border-zinc-900/60 leading-relaxed whitespace-pre-wrap">
                  {detalhesServico.descricao || 'Sem descrição cadastrada.'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Editar Serviço Sheet */}
      <EditarServicoSheet
        servico={editandoServico}
        open={!!editandoServico}
        onOpenChange={(open) => !open && setEditandoServico(null)}
      />

      {/* Excluir Serviço Confirmation Dialog */}
      <AlertDialog open={!!excluindoServico} onOpenChange={(open) => !open && setExcluindoServico(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
              <span>Confirmar Exclusão</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400 mt-2">
              Tem certeza que deseja excluir o serviço <strong className="text-zinc-900 dark:text-zinc-100">"{excluindoServico?.nome}"</strong>?
              <br />
              Esta ação é permanente e removerá o serviço de todo o catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={excluindo}
              className="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-900 dark:hover:bg-rose-800"
            >
              {excluindo ? 'Excluindo...' : 'Confirmar Exclusão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
