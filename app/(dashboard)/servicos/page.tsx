'use client';
import { useState } from 'react';
import { useServicos } from '@/hooks/useServicos';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';
import { NovoServicoSheet } from '@/components/servicos/NovoServicoSheet';
import Link from 'next/link';
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

  if (carregando) {
    return <div className="space-y-4"><Skeleton className="h-[400px] w-full rounded-xl" /></div>;
  }

  const servicosFiltrados = servicos.filter(servico =>
    servico.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
          <p className="text-muted-foreground text-xs">Gerencie seus serviços prestados.</p>
        </div>
        <NovoServicoSheet>
          <Button>Novo Serviço</Button>
        </NovoServicoSheet>
      </div>

      <div className="max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border bg-white shadow-sm dark:bg-zinc-950 overflow-hidden">
        {servicos.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum serviço cadastrado.</p>
        ) : servicosFiltrados.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum serviço encontrado para "{busca}".</p>
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
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/servicos/${servico.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Visualizar Serviço"
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
