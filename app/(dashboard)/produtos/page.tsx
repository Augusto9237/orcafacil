'use client';
import { useState } from 'react';
import { useProdutos } from '@/hooks/useProdutos';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Pencil, Trash2, Info, Layers, DollarSign, Calendar, Tag, FileText, CheckCircle2, XCircle, Package, PackagePlus, Plus } from 'lucide-react';
import { NovoProdutoSheet } from '@/components/produtos/NovoProdutoSheet';
import { EditarProdutoSheet } from '@/components/produtos/EditarProdutoSheet';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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

export default function ProdutosPage() {
  const { produtos, carregando } = useProdutos();
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');

  // State for View Details
  const [detalhesProduto, setDetalhesProduto] = useState<any>(null);

  // State for Edit Product
  const [editandoProduto, setEditandoProduto] = useState<any>(null);

  // State for Delete Product
  const [excluindoProduto, setExcluindoProduto] = useState<any>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!excluindoProduto) return;
    setExcluindo(true);
    try {
      const docRef = doc(db, 'produtos', excluindoProduto.id);
      await deleteDoc(docRef);
      toast.success('Produto excluído com sucesso!');
      setExcluindoProduto(null);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir o produto.');
    } finally {
      setExcluindo(false);
    }
  };

  // State and Handler for Toggle Status (Ativar / Inativar)
  const [atualizandoStatusId, setAtualizandoStatusId] = useState<string | null>(null);

  const handleToggleStatus = async (produtoId: string, novoStatus: boolean, nomeProduto: string) => {
    setAtualizandoStatusId(produtoId);
    try {
      const docRef = doc(db, 'produtos', produtoId);
      await updateDoc(docRef, {
        ativo: novoStatus,
        atualizadoEm: serverTimestamp(),
      });
      toast.success(`Produto "${nomeProduto}" ${novoStatus ? 'ativado' : 'inativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar status do produto:', error);
      toast.error('Erro ao alterar o status do produto.');
    } finally {
      setAtualizandoStatusId(null);
    }
  };

  // Helper to format currency in Real (BRL) using native JS Intl API
  const formatarMoedaBRL = (valor: number | string) => {
    const num = typeof valor === 'number' ? valor : parseFloat(String(valor)) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  // Format date helper
  const formatDate = (criadoEm: any) => {
    if (!criadoEm) return '-';
    if (criadoEm.seconds) {
      return new Date(criadoEm.seconds * 1000).toLocaleDateString('pt-BR') + ' às ' + new Date(criadoEm.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(criadoEm).toLocaleDateString('pt-BR');
  };

  if (carregando) {
    return <div className="space-y-4"><Skeleton className="h-[400px] w-full rounded-xl" /></div>;
  }

  const produtosFiltrados = produtos.filter(produto => {
    const atendeBusca = produto.nome.toLowerCase().includes(busca.toLowerCase());
    const isAtivo = produto.ativo !== false;
    const atendeStatus =
      statusFiltro === 'todos' ||
      (statusFiltro === 'ativos' && isAtivo) ||
      (statusFiltro === 'inativos' && !isAtivo);
    return atendeBusca && atendeStatus;
  });

  return (
    <div className="space-y-6 max-sm:pt-16 pt-12 w-full">
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="w-full sm:w-auto">
          <h2 className="text-2xl max-sm:text-xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground text-xs">Gerencie seu catálogo de produtos.</p>
        </div>
        <NovoProdutoSheet>
          <Button className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="max-sm:hidden">
            Novo Produto
            </span>
          </Button>
        </NovoProdutoSheet>
      </div>

      <div className="flex gap-4 items-center justify-between w-full">
        <div className="w-full sm:max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="buscar-produtos"
            placeholder="Buscar produtos por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        <div className="w-20  sm:w-48">
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger id="status-filtro-produtos" className="w-full">
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

      <div className="rounded-md border bg-white shadow-sm dark:bg-zinc-950 overflow-x-auto w-full">
        {produtos.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum produto cadastrado.</p>
        ) : produtosFiltrados.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {busca 
              ? `Nenhum produto encontrado para "${busca}".` 
              : 'Nenhum produto encontrado com as opções de filtro selecionadas.'}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] font-semibold">Imagem</TableHead>
                <TableHead className="w-[150px] font-semibold">Código</TableHead>
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">Preço Unitário</TableHead>
                <TableHead className="font-semibold">Unidade</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosFiltrados.map((produto) => (
                <TableRow key={produto.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                  <TableCell className="w-[80px]">
                    {produto.imageUrl ? (
                      <div className="h-10 w-10 rounded-md border bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img
                          src={produto.imageUrl}
                          alt={produto.nome}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-md border bg-zinc-50 dark:bg-zinc-900 flex-shrink-0 flex items-center justify-center text-zinc-400">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-500 text-xs">
                    {produto.codigoInterno || '-'}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    {produto.nome}
                  </TableCell>
                  <TableCell className="font-medium font-mono text-zinc-900 dark:text-zinc-100">
                    {formatarMoedaBRL(produto.precoUnitario)}
                  </TableCell>
                  <TableCell className="text-zinc-550 dark:text-zinc-400">
                    {produto.unidade}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Switch
                        id={`switch-status-${produto.id}`}
                        checked={produto.ativo !== false}
                        disabled={atualizandoStatusId === produto.id}
                        onCheckedChange={(checked) => handleToggleStatus(produto.id, checked, produto.nome)}
                        aria-label={`Ativar ou inativar ${produto.nome}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6" id={`produto-actions-${produto.id}`}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Detalhes do Produto"
                        onClick={() => setDetalhesProduto(produto)}
                        className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Detalhes</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar Produto"
                        onClick={() => setEditandoProduto(produto)}
                        className="h-8 w-8 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir Produto"
                        onClick={() => setExcluindoProduto(produto)}
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

      {/* Detalhes do Produto Dialog */}
      <Dialog open={!!detalhesProduto} onOpenChange={(open) => !open && setDetalhesProduto(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <span>Detalhes do Produto</span>
            </DialogTitle>
            <DialogDescription>
              Informações completas do produto cadastrado.
            </DialogDescription>
          </DialogHeader>

          {detalhesProduto && (
            <div className="space-y-4 py-2">
              {detalhesProduto.imageUrl && (
                <div className="w-full h-44 rounded-lg border overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                  <img
                    src={detalhesProduto.imageUrl}
                    alt={detalhesProduto.nome}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Código / SKU</span>
                  <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded border border-zinc-200/50 dark:border-zinc-800/50 inline-block">
                    {detalhesProduto.codigoInterno || '-'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Status</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                    detalhesProduto.ativo !== false
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50'
                      : 'bg-zinc-100 text-zinc-550 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50'
                  }`}>
                    {detalhesProduto.ativo !== false ? (
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
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Nome do Produto</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">
                  {detalhesProduto.nome}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-3 border-zinc-100 dark:border-zinc-900">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Preço Unitário</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    R$ {Number(detalhesProduto.precoUnitario || 0).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Unidade de Medida</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {detalhesProduto.unidade}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-3 border-zinc-100 dark:border-zinc-900">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Estoque</span>
                  <span className={`text-sm font-semibold ${
                    (detalhesProduto.estoque || 0) === 0 
                      ? 'text-rose-500 font-bold' 
                      : (detalhesProduto.estoque || 0) < 5 
                        ? 'text-amber-500' 
                        : 'text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {detalhesProduto.estoque ?? 0}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Valor em Estoque</span>
                  <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                    R$ {((detalhesProduto.estoque ?? 0) * (detalhesProduto.precoUnitario || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1 border-t pt-3 border-zinc-100 dark:border-zinc-900">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Descrição / Notas</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-450 bg-zinc-50 dark:bg-zinc-900/40 p-2 rounded border border-zinc-100 dark:border-zinc-900/60 leading-relaxed whitespace-pre-wrap">
                  {detalhesProduto.descricao || 'Sem descrição cadastrada.'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Editar Produto Sheet */}
      <EditarProdutoSheet
        produto={editandoProduto}
        open={!!editandoProduto}
        onOpenChange={(open) => !open && setEditandoProduto(null)}
      />

      {/* Excluir Produto Confirmation Dialog */}
      <AlertDialog open={!!excluindoProduto} onOpenChange={(open) => !open && setExcluindoProduto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
              <span>Confirmar Exclusão</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400 mt-2">
              Tem certeza que deseja excluir o produto <strong className="text-zinc-900 dark:text-zinc-100">"{excluindoProduto?.nome}"</strong>?
              <br />
              Esta ação é permanente e removerá o produto de todo o catálogo.
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
