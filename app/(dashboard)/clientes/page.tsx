'use client';
import { useState } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { NovoClienteSheet } from '@/components/clientes/NovoClienteSheet';
import { Search, Eye } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function ClientesPage() {
  const { clientes, carregando } = useClientes();
  const [busca, setBusca] = useState('');

  if (carregando) {
    return <div className="space-y-4"><Skeleton className="h-[400px] w-full rounded-xl" /></div>;
  }

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground text-xs">Gerencie seus clientes.</p>
        </div>
        <NovoClienteSheet>
          <Button>Novo Cliente</Button>
        </NovoClienteSheet>
      </div>

      <div className="max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border bg-white shadow-sm dark:bg-zinc-950 overflow-hidden">
        {clientes.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum cliente cadastrado.</p>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum cliente encontrado para "{busca}".</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Nome</TableHead>
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
                  <TableCell className="text-zinc-500 dark:text-zinc-400">
                    {cliente.email || '-'}
                  </TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400">
                    {cliente.telefone || '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      cliente.tipo === 'pessoa_juridica'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {cliente.tipo === 'pessoa_juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/clientes/${cliente.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Visualizar Detalhes"
                          className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
