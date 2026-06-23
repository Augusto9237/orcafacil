'use client';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useOrdensDeServico } from '@/hooks/useOrdensDeServico';
import { useClientes } from '@/hooks/useClientes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, ClipboardList, TrendingUp, FilePlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const { orcamentos, carregando: cOrçamentos } = useOrcamentos();
  const { ordensDeServico, carregando: cOS } = useOrdensDeServico();
  const { clientes, carregando: cClientes } = useClientes();

  const loading = cOrçamentos || cOS || cClientes;

  const totalOrcamentosAprovados = orcamentos.filter(o => o.status === 'aprovado').reduce((acc, curr) => acc + (curr.total || 0), 0);
  const osAbertas = ordensDeServico.filter(o => o.status === 'aberta' || o.status === 'em_andamento').length;

  // Helper robusto para extrair objetos de data do Firestore (Timestamp ou Date ou ISO)
  const obterData = (criadoEm: any): Date => {
    try {
      if (!criadoEm) return new Date();
      if (typeof criadoEm.toDate === 'function') return criadoEm.toDate();
      if (criadoEm instanceof Date) return criadoEm;
      if (criadoEm && typeof criadoEm === 'object' && 'seconds' in criadoEm) {
        return new Date(criadoEm.seconds * 1000);
      }
      const dataParseada = new Date(criadoEm);
      if (!isNaN(dataParseada.getTime())) return dataParseada;
      return new Date();
    } catch {
      return new Date();
    }
  };

  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Orçamentos ativos: não recusados e não expirados (rascunho, enviado, aprovado)
  const orcamentosAtivos = orcamentos.filter(
    o => o.status === 'aprovado' || o.status === 'enviado' || o.status === 'rascunho'
  );

  const anoAtual = new Date().getFullYear();

  const dadosGrafico = nomesMeses.map((nome, index) => {
    // Soma o total dos orçamentos ativos criados no respectivo mês do ano corrente
    const totalMes = orcamentosAtivos
      .filter(o => {
        const data = obterData(o.criadoEm);
        return data.getMonth() === index && data.getFullYear() === anoAtual;
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      name: nome,
      total: totalMes,
    };
  });

  const aprovadosCount = orcamentos.filter(o => o.status === 'aprovado').length;
  const aprovadosTotal = orcamentos.filter(o => o.status === 'aprovado').reduce((acc, curr) => acc + (curr.total || 0), 0);

  const enviadosCount = orcamentos.filter(o => o.status === 'enviado').length;
  const enviadosTotal = orcamentos.filter(o => o.status === 'enviado').reduce((acc, curr) => acc + (curr.total || 0), 0);

  const rascunhosCount = orcamentos.filter(o => o.status === 'rascunho').length;
  const rascunhosTotal = orcamentos.filter(o => o.status === 'rascunho').reduce((acc, curr) => acc + (curr.total || 0), 0);

  const totalAtivo = aprovadosTotal + enviadosTotal + rascunhosTotal;

  if (loading) {
     return <div className="space-y-4"><Skeleton className="h-[125px] w-full rounded-xl" /></div>;
  }

  return (
    <div className="flex-1 space-y-6 h-full p-0.5 pt-12 pb-10">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Ações Rápidas de Acesso */}
      <Card className="border border-primary/60 dark:border-primary/30 bg-gradient-to-r from-primary/40 via-background/50 dark:from-primary/15 dark:via-zinc-950/10 dark:to-indigo-950/15 shadow-sm">
        <CardContent className="">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 font-sans">
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Acesso Rápido</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Atalhos para as operações mais recorrentes do seu dia a dia.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/orcamentos/novo" className="w-full sm:w-auto">
                <Button>
                  <FilePlus className="h-4.5 w-4.5" />
                  Novo Orçamento
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento (Aprovados)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalOrcamentosAprovados.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{orcamentos.length}</div>
            <p className="text-xs text-muted-foreground">Total de orçamentos criados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OS em Andamento</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{osAbertas}</div>
            <p className="text-xs text-muted-foreground">Ordens de serviço abertas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{clientes.length}</div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados na base</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral de Orçamentos</CardTitle>
            <CardDescription className="text-xs">Valor mensal acumulado de orçamentos ativos (rascunhos, enviados e aprovados)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `R$ ${value}`} 
                />
                <Tooltip 
                  formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Total Orçado']}
                  labelFormatter={(label) => `Mês: ${label}`}
                  contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '6px' }}
                />
                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Resumo por Categoria</CardTitle>
            <CardDescription className="text-xs">Distribuição financeira por situação dos orçamentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Aprovados ({aprovadosCount})</span>
                <span className="font-mono font-bold text-zinc-950 dark:text-zinc-50">R$ {aprovadosTotal.toFixed(2)}</span>
              </div>
              <Progress 
                value={totalAtivo > 0 ? (aprovadosTotal / totalAtivo) * 100 : 0} 
                indicatorClassName="bg-emerald-600 dark:bg-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-primary dark:text-primary">Enviados ({enviadosCount})</span>
                <span className="font-mono font-bold text-zinc-950 dark:text-zinc-50">R$ {enviadosTotal.toFixed(2)}</span>
              </div>
              <Progress 
                value={totalAtivo > 0 ? (enviadosTotal / totalAtivo) * 100 : 0} 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Rascunhos ({rascunhosCount})</span>
                <span className="font-mono font-bold">R$ {rascunhosTotal.toFixed(2)}</span>
              </div>
              <Progress 
                value={totalAtivo > 0 ? (rascunhosTotal / totalAtivo) * 100 : 0} 
                indicatorClassName="bg-zinc-400 dark:bg-zinc-500"
              />
            </div>

            <div className="pt-2 border-t border-dashed flex justify-between items-center text-xs text-muted-foreground">
              <span>Potencial de Faturamento Ativo:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">R$ {totalAtivo.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
