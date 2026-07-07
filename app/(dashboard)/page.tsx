'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useOrdensDeServico } from '@/hooks/useOrdensDeServico';
import { useClientes } from '@/hooks/useClientes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, ClipboardList, TrendingUp, FilePlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const [filtro, setFiltro] = useState<'semanal' | 'mensal' | 'anual'>('mensal');

  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Orçamentos ativos: não recusados e não expirados (rascunho, enviado, aprovado)
  const orcamentosAtivos = orcamentos.filter(
    o => o.status === 'aprovado' || o.status === 'enviado' || o.status === 'rascunho'
  );

  const anoAtual = new Date().getFullYear();

  // 1. Semanal (Segunda a Domingo da semana atual)
  const obterDiasSemanaAtual = () => {
    const hoje = new Date();
    const diaAtual = hoje.getDay(); // 0 (Domingo) a 6 (Sábado)
    const dif = hoje.getDate() - diaAtual + (diaAtual === 0 ? -6 : 1);
    const segunda = new Date(hoje.setDate(dif));
    segunda.setHours(0, 0, 0, 0);

    const dias = [];
    for (let i = 0; i < 7; i++) {
      const data = new Date(segunda);
      data.setDate(segunda.getDate() + i);
      dias.push(data);
    }
    return dias;
  };

  const diasSemanaNomes = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const diasAtual = obterDiasSemanaAtual();

  const dadosSemanais = diasSemanaNomes.map((nome, index) => {
    const dataDia = diasAtual[index];
    const totalDia = orcamentosAtivos
      .filter(o => {
        const data = obterData(o.criadoEm);
        return data.getDate() === dataDia.getDate() &&
               data.getMonth() === dataDia.getMonth() &&
               data.getFullYear() === dataDia.getFullYear();
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      name: nome,
      total: totalDia,
    };
  });

  // 2. Mensal (Semanas do mês atual)
  const dadosMensais = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'].map((nome, index) => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtualVal = hoje.getFullYear();

    const diaInicio = index * 7 + 1;
    const diaFim = index === 4 ? 31 : (index + 1) * 7;

    const totalSemana = orcamentosAtivos
      .filter(o => {
        const data = obterData(o.criadoEm);
        if (data.getMonth() !== mesAtual || data.getFullYear() !== anoAtualVal) return false;
        const dia = data.getDate();
        return dia >= diaInicio && dia <= diaFim;
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      name: nome,
      total: totalSemana,
    };
  });

  // 3. Anual (Meses do ano corrente)
  const dadosGraficoAnual = nomesMeses.map((nome, index) => {
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

  const dadosGrafico = 
    filtro === 'semanal' ? dadosSemanais :
    filtro === 'mensal' ? dadosMensais :
    dadosGraficoAnual;

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
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
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
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Visão Geral de Orçamentos</CardTitle>
              <CardDescription className="text-xs">
                {filtro === 'semanal' && "Detalhamento diário dos orçamentos ativos na semana atual"}
                {filtro === 'mensal' && "Distribuição semanal dos orçamentos ativos no mês atual"}
                {filtro === 'anual' && "Valor mensal acumulado de orçamentos ativos no ano atual"}
              </CardDescription>
            </div>
            <CardAction className="self-start sm:self-center">
              {/* Desktop Filters (Toggle style buttons) */}
              <div className="hidden sm:flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-50 dark:bg-zinc-900/50">
                <button
                  onClick={() => setFiltro('semanal')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    filtro === 'semanal'
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-700 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  )}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setFiltro('mensal')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    filtro === 'mensal'
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-700 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  )}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setFiltro('anual')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    filtro === 'anual'
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-700 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  )}
                >
                  Anual
                </button>
              </div>

              {/* Mobile Filters (Select dropdown) */}
              <div className="flex sm:hidden">
                <Select value={filtro} onValueChange={(val) => setFiltro(val as 'semanal' | 'mensal' | 'anual')}>
                  <SelectTrigger className="w-28 text-xs h-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <SelectItem value="semanal" className="text-xs">Semanal</SelectItem>
                    <SelectItem value="mensal" className="text-xs">Mensal</SelectItem>
                    <SelectItem value="anual" className="text-xs">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardAction>
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
                  labelFormatter={(label) => {
                    if (filtro === 'semanal') return `Dia: ${label}`;
                    if (filtro === 'mensal') return `Período: ${label}`;
                    return `Mês: ${label}`;
                  }}
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
