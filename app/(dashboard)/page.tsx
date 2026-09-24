'use client';
import { useState, useMemo } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useOrdensDeServico } from '@/hooks/useOrdensDeServico';
import { useClientes } from '@/hooks/useClientes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, TrendingUp, FilePlus, RotateCcw, CheckCircle2, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DateRangePicker,
  DashboardDateFilter,
  PRESET_OPTIONS,
} from '@/components/dashboard/DateRangePicker';
import {
  format,
  differenceInCalendarDays,
  addDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const { orcamentos, carregando: cOrçamentos } = useOrcamentos();
  const { ordensDeServico, carregando: cOS } = useOrdensDeServico();
  const { clientes, carregando: cClientes } = useClientes();

  const loading = cOrçamentos || cOS || cClientes;

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

  // Estado do filtro de data (padrão: últimos 30 dias)
  const [filtroData, setFiltroData] = useState<DashboardDateFilter>(() => {
    const preset = PRESET_OPTIONS.find((p) => p.key === 'ultimos_30_dias')!;
    const { from, to } = preset.getRange();
    return {
      key: 'ultimos_30_dias',
      label: preset.label,
      from,
      to,
    };
  });

  // Filtragem dos orçamentos com base no intervalo de datas selecionado
  const orcamentosFiltrados = useMemo(() => {
    if (!filtroData.from && !filtroData.to) return orcamentos;
    return orcamentos.filter((o) => {
      const data = obterData(o.criadoEm);
      if (filtroData.from && data < filtroData.from) return false;
      if (filtroData.to && data > filtroData.to) return false;
      return true;
    });
  }, [orcamentos, filtroData]);

  // Orçamentos ativos filtrados (aprovados, enviados ou rascunhos)
  const orcamentosAtivos = useMemo(() => {
    return orcamentosFiltrados.filter(
      (o) => o.status === 'aprovado' || o.status === 'enviado' || o.status === 'rascunho'
    );
  }, [orcamentosFiltrados]);

  // Cálculos financeiros e de métricas do período selecionado
  const totalOrcamentosAprovados = useMemo(() => {
    return orcamentosFiltrados
      .filter((o) => o.status === 'aprovado')
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
  }, [orcamentosFiltrados]);

  const aprovadosCount = orcamentosFiltrados.filter((o) => o.status === 'aprovado').length;
  const enviadosCount = orcamentosFiltrados.filter((o) => o.status === 'enviado').length;
  const enviadosTotal = orcamentosFiltrados
    .filter((o) => o.status === 'enviado')
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

  const rascunhosCount = orcamentosFiltrados.filter((o) => o.status === 'rascunho').length;
  const rascunhosTotal = orcamentosFiltrados
    .filter((o) => o.status === 'rascunho')
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

  const recusadosCount = orcamentosFiltrados.filter(
    (o) => o.status === 'recusado' || o.status === 'expirado'
  ).length;

  const totalAtivo = totalOrcamentosAprovados + enviadosTotal + rascunhosTotal;
  const taxaConversao =
    orcamentosFiltrados.length > 0 ? (aprovadosCount / orcamentosFiltrados.length) * 100 : 0;
  const ticketMedio = aprovadosCount > 0 ? totalOrcamentosAprovados / aprovadosCount : 0;

  // Clientes com orçamentos no período
  const clientesNoPeriodoCount = useMemo(() => {
    const ids = new Set(
      orcamentosFiltrados
        .map((o) => o.clienteId || o.cliente?.cpfCnpj || o.cliente?.nome)
        .filter(Boolean)
    );
    return ids.size;
  }, [orcamentosFiltrados]);

  // Gerador dinâmico dos dados do gráfico com base na amplitude do período selecionado
  const dadosGrafico = useMemo(() => {
    if (!filtroData.from || !filtroData.to) {
      // Todo o período: agrupar por mês do ano corrente
      const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const anoAtual = new Date().getFullYear();
      return nomesMeses.map((nome, index) => {
        const totalMes = orcamentosAtivos
          .filter((o) => {
            const d = obterData(o.criadoEm);
            return d.getMonth() === index && d.getFullYear() === anoAtual;
          })
          .reduce((sum, o) => sum + (o.total || 0), 0);

        const aprovadoMes = orcamentosFiltrados
          .filter((o) => {
            const d = obterData(o.criadoEm);
            return d.getMonth() === index && d.getFullYear() === anoAtual && o.status === 'aprovado';
          })
          .reduce((sum, o) => sum + (o.total || 0), 0);

        return {
          name: nome,
          total: totalMes,
          aprovado: aprovadoMes,
        };
      });
    }

    const diffDias = differenceInCalendarDays(filtroData.to, filtroData.from);

    // Caso 1: Apenas 1 dia ("Hoje" ou range de 1 dia)
    if (diffDias <= 1) {
      const slots = [
        { label: '00h - 06h', start: 0, end: 6 },
        { label: '06h - 10h', start: 6, end: 10 },
        { label: '10h - 14h', start: 10, end: 14 },
        { label: '14h - 18h', start: 14, end: 18 },
        { label: '18h - 22h', start: 18, end: 22 },
        { label: '22h - 24h', start: 22, end: 24 },
      ];

      return slots.map((slot) => {
        const total = orcamentosAtivos
          .filter((o) => {
            const d = obterData(o.criadoEm);
            const hour = d.getHours();
            return hour >= slot.start && hour < slot.end;
          })
          .reduce((sum, o) => sum + (o.total || 0), 0);

        const aprovado = orcamentosFiltrados
          .filter((o) => {
            const d = obterData(o.criadoEm);
            const hour = d.getHours();
            return hour >= slot.start && hour < slot.end && o.status === 'aprovado';
          })
          .reduce((sum, o) => sum + (o.total || 0), 0);

        return {
          name: slot.label,
          total,
          aprovado,
        };
      });
    }

    // Caso 2: Até 14 dias (ex: "Últimos 7 dias" ou intervalo curto) -> 1 barra por dia
    if (diffDias <= 14) {
      const dias = eachDayOfInterval({ start: filtroData.from, end: filtroData.to });
      return dias.map((dia) => {
        const nomeDia = format(dia, 'EEE dd/MM', { locale: ptBR });
        const totalDia = orcamentosAtivos
          .filter((o) => isSameDay(obterData(o.criadoEm), dia))
          .reduce((sum, o) => sum + (o.total || 0), 0);

        const aprovadoDia = orcamentosFiltrados
          .filter((o) => isSameDay(obterData(o.criadoEm), dia) && o.status === 'aprovado')
          .reduce((sum, o) => sum + (o.total || 0), 0);

        return {
          name: nomeDia,
          total: totalDia,
          aprovado: aprovadoDia,
        };
      });
    }

    // Caso 3: Entre 15 e 60 dias (ex: "Últimos 30 dias", "Este mês", "Mês passado") -> Agrupar em intervalos de 5 a 7 dias
    if (diffDias <= 60) {
      const numSlices = Math.min(6, Math.ceil(diffDias / 6));
      const sliceSize = Math.ceil(diffDias / numSlices);
      const buckets = [];

      for (let i = 0; i < numSlices; i++) {
        const sliceStart = addDays(filtroData.from, i * sliceSize);
        let sliceEnd = addDays(sliceStart, sliceSize - 1);
        if (sliceEnd > filtroData.to || i === numSlices - 1) {
          sliceEnd = filtroData.to;
        }

        const label = `${format(sliceStart, 'dd/MM')} - ${format(sliceEnd, 'dd/MM')}`;
        const total = orcamentosAtivos
          .filter((o) => {
            const d = obterData(o.criadoEm);
            return d >= startOfDay(sliceStart) && d <= endOfDay(sliceEnd);
          })
          .reduce((sum, o) => sum + (o.total || 0), 0);

        const aprovado = orcamentosFiltrados
          .filter((o) => {
            const d = obterData(o.criadoEm);
            return d >= startOfDay(sliceStart) && d <= endOfDay(sliceEnd) && o.status === 'aprovado';
          })
          .reduce((sum, o) => sum + (o.total || 0), 0);

        buckets.push({
          name: label,
          total,
          aprovado,
        });

        if (sliceEnd >= filtroData.to) break;
      }
      return buckets;
    }

    // Caso 4: Mais de 60 dias (ex: "Este ano", "Todo o período" ou período longo) -> Agrupar por meses
    const meses = eachMonthOfInterval({ start: filtroData.from, end: filtroData.to });
    return meses.map((mes) => {
      const nomeMes = format(mes, 'MMM/yy', { locale: ptBR });
      const totalMes = orcamentosAtivos
        .filter((o) => isSameMonth(obterData(o.criadoEm), mes))
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const aprovadoMes = orcamentosFiltrados
        .filter((o) => isSameMonth(obterData(o.criadoEm), mes) && o.status === 'aprovado')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      return {
        name: nomeMes,
        total: totalMes,
        aprovado: aprovadoMes,
      };
    });
  }, [filtroData, orcamentosAtivos, orcamentosFiltrados]);

  // Função para resetar para os últimos 30 dias
  const resetarFiltro = () => {
    const preset = PRESET_OPTIONS.find((p) => p.key === 'ultimos_30_dias')!;
    const { from, to } = preset.getRange();
    setFiltroData({
      key: 'ultimos_30_dias',
      label: preset.label,
      from,
      to,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 pt-12">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 h-full p-0.5 pt-12 max-sm:pt-16 pb-10">
      {/* Header com Título e Filtro de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visão geral de orçamentos, faturamento e desempenho comercial.
          </p>
        </div>

        {/* Date Range Picker Component */}
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePicker
            value={filtroData}
            onChange={setFiltroData}
          />
          {filtroData.key !== 'ultimos_30_dias' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetarFiltro}
              title="Restaurar filtro padrão (Últimos 30 dias)"
              className="h-9 px-2 text-xs text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Ações Rápidas de Acesso */}
      <Card className="border border-primary/40 dark:border-primary/20 bg-gradient-to-r from-primary/10 via-background to-emerald-500/5 dark:from-primary/10 dark:via-zinc-950/20 dark:to-emerald-950/10 shadow-xs">
        <CardContent className="py-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div className="space-y-0.5 font-sans w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Acesso Rápido
                </h3>
                <Badge variant="outline" className="text-[10px] font-normal py-0 h-4 border-primary/30 text-primary">
                  Período: {filtroData.label}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Atalhos para as operações mais recorrentes do seu dia a dia.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <Link href="/orcamentos/novo" className="w-full sm:w-auto">
                <Button size="sm" className="w-full sm:w-auto h-9 font-semibold gap-1.5 shadow-xs">
                  <FilePlus className="h-4 w-4" />
                  Novo Orçamento
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Métricas Principais (Filtrados por Data) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Faturamento Aprovado */}
        <Card className="shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Faturamento (Aprovados)
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50 font-mono">
              {formatCurrency(totalOrcamentosAprovados)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>{aprovadosCount} orçamento(s) aprovado(s)</span>
            </p>
          </CardContent>
        </Card>

        {/* 2. Orçamentos no Período */}
        <Card className="shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Orçamentos no Período
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
              {orcamentosFiltrados.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {orcamentosAtivos.length} ativos ({enviadosCount} enviados, {rascunhosCount} rascunhos)
            </p>
          </CardContent>
        </Card>

        {/* 3. Taxa de Conversão */}
        <Card className="shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Taxa de Conversão
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
              {taxaConversao.toFixed(1)}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Ticket Médio: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{formatCurrency(ticketMedio)}</strong>
            </p>
          </CardContent>
        </Card>

        {/* 4. Clientes no Período */}
        <Card className="shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Clientes Atendidos
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
              {clientesNoPeriodoCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              De um total de {clientes.length} clientes na base
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Principal e Resumo por Categoria */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico de Evolução Orçada */}
        <Card className="col-span-4 max-md:col-span-2 shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Visão Geral de Orçamentos
              </CardTitle>
              <CardDescription className="text-xs">
                Valores orçados ao longo do período: <span className="font-medium text-zinc-700 dark:text-zinc-300">{filtroData.label}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-muted-foreground bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                Total Ativo: {formatCurrency(totalAtivo)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pl-1 pt-4">
            {dadosGrafico.length === 0 || totalAtivo === 0 ? (
              <div className="h-[320px] flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                <FileText className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                <p>Nenhum orçamento com valor encontrado no período selecionado.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => (value >= 1000 ? `R$ ${(value / 1000).toFixed(0)}k` : `R$ ${value}`)}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      formatCurrency(Number(value)),
                      name === 'aprovado' ? 'Aprovados' : 'Total Ativo (Orçado)',
                    ]}
                    labelFormatter={(label) => `Período: ${label}`}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="total"
                    name="total"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary/90 hover:fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Resumo por Categoria */}
        <Card className="col-span-3 max-md:col-span-2 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base font-semibold">
              Resumo por Situação
            </CardTitle>
            <CardDescription className="text-xs">
              Distribuição dos {orcamentosFiltrados.length} orçamento(s) no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Aprovados */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Aprovados ({aprovadosCount})
                </span>
                <span className="font-mono font-bold text-zinc-950 dark:text-zinc-50">
                  {formatCurrency(totalOrcamentosAprovados)}
                </span>
              </div>
              <Progress
                value={totalAtivo > 0 ? (totalOrcamentosAprovados / totalAtivo) * 100 : 0}
                indicatorClassName="bg-emerald-600 dark:bg-emerald-400"
              />
            </div>

            {/* Enviados */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-primary dark:text-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Enviados / Em Análise ({enviadosCount})
                </span>
                <span className="font-mono font-bold text-zinc-950 dark:text-zinc-50">
                  {formatCurrency(enviadosTotal)}
                </span>
              </div>
              <Progress
                value={totalAtivo > 0 ? (enviadosTotal / totalAtivo) * 100 : 0}
                indicatorClassName="bg-primary"
              />
            </div>

            {/* Rascunhos */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  Rascunhos ({rascunhosCount})
                </span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {formatCurrency(rascunhosTotal)}
                </span>
              </div>
              <Progress
                value={totalAtivo > 0 ? (rascunhosTotal / totalAtivo) * 100 : 0}
                indicatorClassName="bg-zinc-400 dark:bg-zinc-500"
              />
            </div>

            {/* Recusados / Cancelados (se houver) */}
            {recusadosCount > 0 && (
              <div className="space-y-1.5 opacity-75">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Recusados/Cancelados ({recusadosCount})
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {recusadosCount} un.
                  </span>
                </div>
              </div>
            )}

            {/* Resumo Rodapé */}
            <div className="pt-3 border-t border-dashed space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Potencial Ativo Total:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(totalAtivo)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span>Taxa de Fechamento:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {taxaConversao.toFixed(1)}% dos orçamentos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
