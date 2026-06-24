'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle2, XCircle, Calendar, Tag, DollarSign, Layers } from 'lucide-react';
import Link from 'next/link';

export default function ServicoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const [servico, setServico] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchServico() {
      if (!params?.id) return;
      try {
        const docRef = doc(db, 'servicos', params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setServico({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do serviço:', error);
      } finally {
        setCarregando(false);
      }
    }
    fetchServico();
  }, [params?.id]);

  if (carregando) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-12">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </div>
    );
  }

  if (!servico) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Serviço não encontrado</h2>
        <p className="text-muted-foreground text-sm">O serviço solicitado não existe ou foi removido.</p>
        <Link href="/servicos">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Serviços
          </Button>
        </Link>
      </div>
    );
  }

  // Format date helper
  const formatDate = (criadoEm: any) => {
    if (!criadoEm) return '-';
    if (criadoEm.seconds) {
      return new Date(criadoEm.seconds * 1000).toLocaleDateString('pt-BR') + ' às ' + new Date(criadoEm.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(criadoEm).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 -ml-2 text-zinc-500 hover:text-zinc-950">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">{servico.nome}</h2>
          </div>
          <p className="text-muted-foreground text-xs pl-8">ID do Serviço: {servico.id}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm dark:bg-zinc-950 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1 bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-150/40 dark:border-zinc-850/50">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
              <Tag className="h-3.5 w-3.5 text-blue-500" />
              <span>Código / Referência</span>
            </div>
            <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100 font-semibold">
              {servico.codigoInterno || 'Sem Código'}
            </span>
          </div>

          <div className="space-y-1 bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-150/40 dark:border-zinc-850/50">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span>Status</span>
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              servico.ativo !== false
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50'
                : 'bg-zinc-100 text-zinc-550 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50'
            }`}>
              {servico.ativo !== false ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Ativo</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Inativo</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-5 border-zinc-100 dark:border-zinc-900">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              <span>Preço Unitário</span>
            </div>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              R$ {Number(servico.precoUnitario || 0).toFixed(2)}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
              <Layers className="h-3.5 w-3.5 text-amber-500" />
              <span>Cobrança / Unidade</span>
            </div>
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {servico.unidade === 'H' ? 'H (Hora)' : 
               servico.unidade === 'UN' ? 'UN (Unidade/Fixo)' :
               servico.unidade === 'DIA' ? 'DIA (Diária)' :
               servico.unidade === 'MES' ? 'MÊS (Mensalidade)' :
               servico.unidade === 'M' ? 'M (Metro linear)' :
               servico.unidade === 'M2' ? 'M² (Metro quadrado)' :
               servico.unidade === 'KM' ? 'KM (Quilômetro)' :
               servico.unidade === 'VIS' ? 'VIS (Visita técnica)' :
               servico.unidade || '-'}
            </span>
          </div>
        </div>

        {servico.criadoEm && (
          <div className="space-y-1 border-t pt-5 border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              <span>Data de Cadastro</span>
            </div>
            <span className="text-xs text-zinc-650 dark:text-zinc-350">
              {formatDate(servico.criadoEm)}
            </span>
          </div>
        )}

        <div className="space-y-2 border-t pt-5 border-zinc-100 dark:border-zinc-900">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Descrição / Notas</span>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900/60 leading-relaxed whitespace-pre-wrap">
            {servico.descricao || 'Sem descrição cadastrada.'}
          </p>
        </div>
      </div>
    </div>
  );
}
