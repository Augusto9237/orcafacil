'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import type { Orcamento, Usuario } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DownloadOrcamentoButton } from '@/components/PDFDownloadButtons';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  CheckCircle2, 
  XCircle, 
  CalendarClock, 
  FileText, 
  Info,
  DollarSign,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function OrcamentoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const { usuario } = useAuth();
  
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [empresa, setEmpresa] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const orcamentoId = params?.id as string;

  useEffect(() => {
    async function loadData() {
      if (!orcamentoId) return;

      try {
        setLoading(true);
        // Load proposal
        const docRef = doc(db, 'orcamentos', orcamentoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Orcamento;
          setOrcamento(data);

          // Load corresponding organization meta profile
          if (data.usuarioId) {
            const userRef = doc(db, 'usuarios', data.usuarioId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setEmpresa({ id: userSnap.id, ...userSnap.data() } as Usuario);
            }
          }
        } else {
          toast.error('Orçamento não encontrado.');
        }
      } catch (err) {
        console.error('Erro ao buscar orçamento:', err);
        toast.error('Ocorreu um erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [orcamentoId]);

  // Handle Interactive Status updates
  const handleUpdateStatus = async (newStatus: Orcamento['status']) => {
    if (!orcamento) return;
    try {
      setUpdating(true);
      const docRef = doc(db, 'orcamentos', orcamento.id);
      await updateDoc(docRef, { status: newStatus });
      
      setOrcamento(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Status atualizado para: ${newStatus}`);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status do orçamento.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto" />
        <h3 className="text-xl font-bold tracking-tight">Proposta Comercial Não Encontrada</h3>
        <p className="text-muted-foreground text-sm">Este ID de orçamento está incorreto ou foi excluído do sistema.</p>
        <Button onClick={() => router.push('/orcamentos')}>Módulo de Orçamentos</Button>
      </div>
    );
  }

  // Render Date safely
  const dataCriacao = orcamento.criadoEm 
    ? (orcamento.criadoEm instanceof Date 
        ? orcamento.criadoEm 
        : (orcamento.criadoEm as any).toDate?.() || new Date(orcamento.criadoEm as any))
    : new Date();

  const formattedDate = dataCriacao.toLocaleDateString('pt-BR');
  
  // Calculate validity date
  const dataValidade = new Date(dataCriacao);
  dataValidade.setDate(dataValidade.getDate() + (orcamento.validadeDias || 15));
  const isExpired = new Date() > dataValidade;
  const formattedValidade = dataValidade.toLocaleDateString('pt-BR');

  // Format status badge styles
  const statusStyles: Record<Orcamento['status'], string> = {
    rascunho: 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
    enviado: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
    aprovado: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    recusado: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
    expirado: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/orcamentos')}
            className="rounded-full shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100">
                {orcamento.numero}
              </h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[orcamento.status]}`}>
                {orcamento.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Emitido em {formattedDate} • Válido por {orcamento.validadeDias || 15} dias
            </p>
          </div>
        </div>

        {/* Action Panel: PDF Exporter integrated dynamically */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action buttons list */}
          <div className="flex items-center gap-1.5 mr-2">
            {orcamento.status === 'rascunho' && (
              <Button 
                variant="outline" 
                size="sm" 
                disabled={updating}
                onClick={() => handleUpdateStatus('enviado')}
              >
                Marcar como Enviado
              </Button>
            )}
            {orcamento.status !== 'aprovado' && orcamento.status !== 'recusado' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/45"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('aprovado')}
                >
                  Aprovar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/45"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('recusado')}
                >
                  Recusar
                </Button>
              </>
            )}
          </div>

          <DownloadOrcamentoButton orcamento={orcamento} empresa={empresa} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Workspace Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* client details card */}
          <div className="bg-white rounded-xl border p-6 shadow-xs dark:bg-zinc-950 space-y-4">
            <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Informações do Cliente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Nome completo / Razão Social</p>
                <p className="font-semibold text-gray-900 dark:text-zinc-100">{orcamento.cliente.nome}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CPF / CNPJ</p>
                <p className="font-medium font-mono text-gray-900 dark:text-zinc-200">{orcamento.cliente.cpfCnpj || 'Não Informado'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-medium text-gray-900 dark:text-zinc-200">{orcamento.cliente.email || 'Não Informado'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="font-medium text-gray-900 dark:text-zinc-200">{orcamento.cliente.telefone}</p>
              </div>
              {orcamento.cliente.endereco && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Endereço Completo</p>
                  <p className="font-medium text-gray-900 dark:text-zinc-200">{orcamento.cliente.endereco}</p>
                </div>
              )}
            </div>
          </div>

          {/* items table list card */}
          <div className="bg-white rounded-xl border shadow-xs dark:bg-zinc-950 overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Especificação de Produtos & Serviços
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b bg-muted/30 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-6">Item</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4 text-center">Unidade</th>
                    <th className="py-3 px-4 text-right">Qtd</th>
                    <th className="py-3 px-4 text-right">Unitário</th>
                    <th className="py-3 px-6 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px] text-gray-800 dark:text-zinc-200">
                  {orcamento.itens && orcamento.itens.length > 0 ? (
                    orcamento.itens.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-6 font-semibold max-w-xs truncate" title={item.descricao}>
                          {item.descricao}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest ${
                            item.tipo === 'produto'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          }`}>
                            {item.tipo === 'produto' ? 'PROD' : 'SERV'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground">{item.unidade || 'UN'}</td>
                        <td className="py-3 px-4 text-right font-medium">{item.quantidade}</td>
                        <td className="py-3 px-4 text-right font-mono">R$ {Number(item.precoUnitario).toFixed(2)}</td>
                        <td className="py-3 px-6 text-right font-mono font-bold">R$ {Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum item adicionado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* observacoes and instructions cards */}
          {(orcamento.observacoes || orcamento.condicoesPagamento) && (
            <div className="bg-white rounded-xl border p-6 shadow-xs dark:bg-zinc-950 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Termos & Instruções</h3>
              
              {orcamento.condicoesPagamento && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Condição de Pagamento</p>
                  <p className="text-xs text-gray-700 dark:text-zinc-200 mt-1 font-medium">{orcamento.condicoesPagamento}</p>
                </div>
              )}
              {orcamento.observacoes && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground">Observações Adicionais</p>
                  <p className="text-xs text-gray-600 dark:text-zinc-300 mt-1 leading-relaxed whitespace-pre-line">{orcamento.observacoes}</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Sidebar Summary Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6 shadow-xs dark:bg-zinc-950 space-y-6">
            <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-zinc-100 pb-3 border-b">
              Estrutura Financeira
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex justify-between items-center text-muted-foreground font-sans">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800 dark:text-zinc-200">R$ {orcamento.subtotal.toFixed(2)}</span>
              </div>

              {orcamento.desconto > 0 && (
                <div className="flex justify-between items-center text-rose-600 font-sans">
                  <span>Desconto ({orcamento.descontoTipo === 'percentual' ? `${orcamento.desconto}%` : 'Absoluto'})</span>
                  <span className="font-semibold">
                    - R$ {
                      orcamento.descontoTipo === 'percentual' 
                        ? ((orcamento.subtotal * orcamento.desconto) / 100).toFixed(2)
                        : orcamento.desconto.toFixed(2)
                    }
                  </span>
                </div>
              )}

              {orcamento.impostos > 0 && (
                <div className="flex justify-between items-center text-orange-600 font-sans">
                  <span>Impostos e acréscimos</span>
                  <span className="font-semibold">+ R$ {orcamento.impostos.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t text-foreground font-sans font-bold text-sm">
                <span>Total Líquido</span>
                <span className="text-base font-black text-blue-600 font-mono">
                  R$ {orcamento.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Validity tracker card */}
          <div className="bg-muted/10 rounded-xl border p-6 dark:bg-zinc-900/10 space-y-4">
            <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" />
              Rastreamento de Validade
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emitido em:</span>
                <span className="font-semibold">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vence em:</span>
                <span className="font-semibold">{formattedValidade}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                <span className="text-muted-foreground">Status do prazo:</span>
                {isExpired ? (
                  <span className="text-rose-600 font-bold">Proposta Expirada</span>
                ) : (
                  <span className="text-emerald-600 font-semibold font-sans">No prazo de validade</span>
                )}
              </div>
            </div>
          </div>

          {/* Company profile info sidebar banner */}
          {empresa && (
            <div className="bg-slate-50/50 rounded-xl border p-6 dark:bg-zinc-950 space-y-4 text-xs">
              <h4 className="font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 uppercase font-sans tracking-wide">
                <Info className="h-4 w-4 text-slate-500" />
                Dados do Emitente
              </h4>
              <div className="space-y-1.5 text-muted-foreground text-[11px] leading-relaxed">
                <p className="font-semibold text-gray-900 dark:text-zinc-200 text-xs">{empresa.empresa}</p>
                {empresa.cnpjCpf && <p>CNPJ: {empresa.cnpjCpf}</p>}
                {empresa.telefone && <p>WhatsApp/Tel: {empresa.telefone}</p>}
                {empresa.endereco && <p className="truncate" title={empresa.endereco}>Endereço: {empresa.endereco}</p>}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
