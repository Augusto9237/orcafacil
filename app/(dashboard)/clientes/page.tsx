'use client';
import { useState } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { NovoClienteSheet } from '@/components/clientes/NovoClienteSheet';
import { EditarClienteSheet } from '@/components/clientes/EditarClienteSheet';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Search, Eye, Pencil, Trash2, Plus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import type { Cliente } from '@/types';

const renderEnderecoVal = (endereco?: Cliente['endereco'] | string) => {
  if (!endereco) return 'Não informado';
  if (typeof endereco === 'string') return endereco;
  const { logradouro, numero, complemento, bairro, cidade, estado, cep } = endereco;
  const parts = [
    logradouro ? `${logradouro}${numero ? `, ${numero}` : ''}` : '',
    complemento,
    bairro,
    cidade ? `${cidade}${estado ? ` - ${estado}` : ''}` : '',
    cep ? `CEP: ${cep}` : '',
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Não informado';
};

export default function ClientesPage() {
  const { clientes, carregando } = useClientes();
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  
  // States for Edit / Delete / View operations
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (carregando) {
    return <div className="space-y-4"><Skeleton className="h-[400px] w-full rounded-xl" /></div>;
  }

  const clientesFiltrados = clientes.filter(cliente => {
    const matchesBusca = cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (cliente.cpfCnpj && cliente.cpfCnpj.toLowerCase().includes(busca.toLowerCase()));
    const matchesTipo = filtroTipo === 'todos' || cliente.tipo === filtroTipo;
    return matchesBusca && matchesTipo;
  });

  const iniciarVisualizacao = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDetailsOpen(true);
  };

  const iniciarEdicao = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsEditOpen(true);
  };

  const iniciarExclusao = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteOpen(true);
  };

  const confirmarExclusao = async () => {
    if (!selectedCliente) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'clientes', selectedCliente.id));
      toast.success('Cliente excluído com sucesso!');
      setIsDeleteOpen(false);
      setSelectedCliente(null);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir cliente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 flex-1 h-full py-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground text-sm">Gerencie seus clientes.</p>
        </div>
        <NovoClienteSheet>
          <Button>
          <UserPlus />
          Novo Cliente</Button>
        </NovoClienteSheet>
      </div>

      <div className="flex items-center w-full justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes por nome ou CPF/CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-full bg-white dark:bg-zinc-950">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
              <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm dark:bg-zinc-950 overflow-hidden">
        {clientes.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum cliente cadastrado.</p>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum cliente encontrado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">CPF/CNPJ</TableHead>
                <TableHead className="font-semibold">E-mail</TableHead>
                <TableHead className="font-semibold">Telefone</TableHead>
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="text-right font-semibold pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    {cliente.nome}
                  </TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                    {cliente.cpfCnpj || '—'}
                  </TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400">
                    {cliente.email ? (
                      <a
                        id={`client-email-link-${cliente.id}`}
                        href={`mailto:${cliente.email}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        {cliente.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400">
                    {cliente.telefone || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cliente.tipo === 'pessoa_juridica' ? 'default' : 'secondary'}>
                      {cliente.tipo === 'pessoa_juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        id={`details-btn-${cliente.id}`}
                        variant="ghost"
                        size="icon"
                        title="Visualizar Detalhes"
                        onClick={() => iniciarVisualizacao(cliente)}
                        className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar Cliente"
                        onClick={() => iniciarEdicao(cliente)}
                        className="h-8 w-8 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir Cliente"
                        onClick={() => iniciarExclusao(cliente)}
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

      {/* Edit Sheet */}
      <EditarClienteSheet
        cliente={selectedCliente}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Detail Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Dados completos de cadastro do cliente.
            </DialogDescription>
          </DialogHeader>
          {selectedCliente && (
            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-3 items-start gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="font-semibold text-zinc-500">Nome:</span>
                <span className="col-span-2 text-zinc-900 dark:text-zinc-100 font-medium">
                  {selectedCliente.nome}
                </span>
              </div>
              <div className="grid grid-cols-3 items-start gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="font-semibold text-zinc-500">Tipo:</span>
                <span className="col-span-2 text-zinc-900 dark:text-zinc-100">
                  {selectedCliente.tipo === 'pessoa_juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                </span>
              </div>
              <div className="grid grid-cols-3 items-start gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="font-semibold text-zinc-500">CPF/CNPJ:</span>
                <span className="col-span-2 text-zinc-900 dark:text-zinc-100 font-mono">
                  {selectedCliente.cpfCnpj || 'Não informado'}
                </span>
              </div>
              <div className="grid grid-cols-3 items-start gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="font-semibold text-zinc-500">E-mail:</span>
                <span className="col-span-2 text-zinc-900 dark:text-zinc-100">
                  {selectedCliente.email ? (
                    <a
                      id={`detail-email-link-${selectedCliente.id}`}
                      href={`mailto:${selectedCliente.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      {selectedCliente.email}
                    </a>
                  ) : (
                    'Não informado'
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 items-start gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="font-semibold text-zinc-500">Telefone:</span>
                <span className="col-span-2 text-zinc-900 dark:text-zinc-100 font-mono">
                  {selectedCliente.telefone}
                </span>
              </div>
              <div className="grid grid-cols-3 items-start gap-4 pb-1">
                <span className="font-semibold text-zinc-500">Endereço:</span>
                <span className="col-span-2 text-zinc-900 dark:text-zinc-100">
                  {renderEnderecoVal(selectedCliente.endereco)}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setIsDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Deletion Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o cliente
              <strong className="text-zinc-900 dark:text-zinc-100"> {selectedCliente?.nome}</strong> e removerá todos os seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                confirmarExclusao();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Sim, excluir cliente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

