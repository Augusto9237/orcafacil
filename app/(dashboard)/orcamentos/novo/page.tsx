'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useClientes } from '@/hooks/useClientes';
import { useServicos } from '@/hooks/useServicos';
import { BuscarProdutoDialog } from '@/components/orcamentos/BuscarProdutoDialog';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { addDoc, collection, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash, 
  Search, 
  ChevronRight, 
  Percent, 
  DollarSign, 
  ArrowLeft,
  FileText,
  Badge,
  Package,
  Wrench,
  Loader2,
User
} from 'lucide-react';
import type { ItemOrcamento, Cliente } from '@/types';

function NovoOrcamentoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const { usuario } = useAuth();
  const { clientes, carregando: loadingClientes } = useClientes();
  const { servicos, carregando: loadingServicos } = useServicos();
  const { orcamentos } = useOrcamentos();

  const [clienteId, setClienteId] = useState<string>('');
  const [validadDias, setValidadDias] = useState<number>(15);
  const [condicoesPagamento, setCondicoesPagamento] = useState<string>('À vista');
  const [observacoes, setObservacoes] = useState<string>('');
  const [status, setStatus] = useState<'rascunho' | 'enviado'>('rascunho');

  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [desconto, setDesconto] = useState<number>(0);
  const [descontoTipo, setDescontoTipo] = useState<'percentual' | 'valor'>('valor');
  const [impostos, setImpostos] = useState<number>(0);
  const [numero, setNumero] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for search dialogs
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

  const [serviceSearch, setServiceSearch] = useState('');

  const [selectedService, setSelectedService] = useState<any | null>(null);

  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);
  const [priceToAdd, setPriceToAdd] = useState<number>(0);

  // Suggested proposal number
  const suggestedNumber = useMemo(() => {
    const nextSeq = orcamentos.length > 0 ? orcamentos.length + 1 : 1;
    return `ORC-${1000 + nextSeq}`;
  }, [orcamentos]);

  const displayNumero = editId ? (numero || '...') : suggestedNumber;

  useEffect(() => {
    if (!editId) return;
    async function loadOrcamento() {
      try {
        const docRef = doc(db, 'orcamentos', editId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setClienteId(data.clienteId || '');
          setValidadDias(data.validadeDias || 15);
          setCondicoesPagamento(data.condicoesPagamento || 'À vista');
          setObservacoes(data.observacoes || '');
          setStatus(data.status || 'rascunho');
          setItens(data.itens || []);
          setDesconto(data.desconto || 0);
          setDescontoTipo(data.descontoTipo || 'valor');
          setImpostos(data.impostos || 0);
          setNumero(data.numero || '');
        }
      } catch (err) {
        console.error('Erro ao carregar orçamento:', err);
        toast.error('Erro ao carregar dados do orçamento.');
      }
    }
    loadOrcamento();
  }, [editId]);

  // Client list search
  const [clientSearch, setClientSearch] = useState('');
  const filteredClientes = useMemo(() => {
    return clientes.filter(c => 
      c.nome.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.cpfCnpj && c.cpfCnpj.toLowerCase().includes(clientSearch.toLowerCase()))
    );
  }, [clientes, clientSearch]);

  const selectedCliente = useMemo(() => {
    return clientes.find(c => c.id === clienteId);
  }, [clientes, clienteId]);

  // Dialog Search filters
  const filteredServices = useMemo(() => {
    return servicos.filter(s => 
      s.nome.toLowerCase().includes(serviceSearch.toLowerCase()) || 
      (s.codigoInterno && s.codigoInterno.toLowerCase().includes(serviceSearch.toLowerCase()))
    );
  }, [servicos, serviceSearch]);

  // Calculations
  const subtotal = useMemo(() => {
    return itens.reduce((sum, item) => sum + item.subtotal, 0);
  }, [itens]);

  const discountAmount = useMemo(() => {
    if (descontoTipo === 'percentual') {
      return (subtotal * desconto) / 100;
    }
    return desconto;
  }, [subtotal, desconto, descontoTipo]);

  const total = useMemo(() => {
    const result = subtotal - discountAmount + impostos;
    return result > 0 ? result : 0;
  }, [subtotal, discountAmount, impostos]);

  // Add Item actions
  const handleSelectServiceForAdding = (serv: any) => {
    setSelectedService(serv);
    setPriceToAdd(serv.precoUnitario);
    setQuantityToAdd(1);
  };

  const handleAddServiceToItems = () => {
    if (!selectedService) return;

    const newItem: ItemOrcamento = {
      tipo: 'servico',
      referenciaId: selectedService.id,
      descricao: selectedService.nome,
      unidade: selectedService.unidade || 'H',
      quantidade: quantityToAdd,
      precoUnitario: priceToAdd,
      subtotal: quantityToAdd * priceToAdd,
      codigo: selectedService.codigoInterno || '',
    };

    setItens(prev => [...prev, newItem]);
    setIsServiceDialogOpen(false);

    // reset state
    setSelectedService(null);
    setServiceSearch('');
    toast.success('Serviço adicionado ao orçamento');
  };

  const removeItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
    toast.info('Item removido');
  };

  const handleCreateOrcamento = async () => {
    if (!usuario) {
      toast.error('Você deve estar logado para salvar um orçamento.');
      return;
    }
    if (!clienteId || !selectedCliente) {
      toast.error('Por favor, selecione um cliente.');
      return;
    }
    if (itens.length === 0) {
      toast.error('Adicione pelo menos um produto ou serviço ao orçamento.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build graceful Address string representing the client address snapshot safely
      let addressSnapshot = '';
      if (selectedCliente.endereco) {
        if (typeof selectedCliente.endereco === 'string') {
          addressSnapshot = selectedCliente.endereco;
        } else {
          const { logradouro, numero, CEP, cidade, uf } = selectedCliente.endereco as any;
          addressSnapshot = [logradouro, numero, CEP, cidade, uf].filter(Boolean).join(', ');
        }
      }

      if (editId) {
        await updateDoc(doc(db, 'orcamentos', editId), {
          clienteId: clienteId,
          cliente: {
            nome: selectedCliente.nome,
            email: selectedCliente.email || '',
            telefone: selectedCliente.telefone,
            cpfCnpj: selectedCliente.cpfCnpj || '',
            endereco: addressSnapshot,
          },
          status: status,
          itens: itens,
          subtotal: subtotal,
          desconto: desconto,
          descontoTipo: descontoTipo,
          impostos: impostos,
          total: total,
          validadeDias: validadDias,
          condicoesPagamento: condicoesPagamento,
          observacoes: observacoes,
          atualizadoEm: serverTimestamp(),
        });
        toast.success('Orçamento atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'orcamentos'), {
          usuarioId: usuario.uid,
          numero: suggestedNumber,
          clienteId: clienteId,
          cliente: {
            nome: selectedCliente.nome,
            email: selectedCliente.email || '',
            telefone: selectedCliente.telefone,
            cpfCnpj: selectedCliente.cpfCnpj || '',
            endereco: addressSnapshot,
          },
          status: status,
          itens: itens,
          subtotal: subtotal,
          desconto: desconto,
          descontoTipo: descontoTipo,
          impostos: impostos,
          total: total,
          validadeDias: validadDias,
          condicoesPagamento: condicoesPagamento,
          observacoes: observacoes,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        });
        toast.success('Orçamento gerado e salvo com sucesso!');
      }

      router.push('/orcamentos');
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast.error('Erro ao salvar orçamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 overflow-hidden max-h-screen min-h-0 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ">
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
            <h2 className="text-2xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-550">
              {editId ? `Editar Orçamento` : 'Novo Orçamento'}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {editId ? 'Atualize as informações desta proposta comercial.' : 'Crie uma proposta comercial de alto padrão para seu cliente.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/orcamentos')}>
            Cancelar
          </Button>
          <Button onClick={handleCreateOrcamento} disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 max-h-[100dvh]">
        
        {/* Left / Central Workspace: Details and items */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto">
          
          {/* Section: Cliente Selection & General Info */}
          <div className="bg-white rounded-xl border dark:bg-zinc-950 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Cliente
              </h3>
              <h4 className="font-mono text-xs md:text-sm font-bold bg-neutral-100 dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400 px-3 py-1.5 rounded-lg border border-dashed">
                {suggestedNumber}
              </h4>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Cliente
              </label>
              {loadingClientes ? (
                <div className="h-10 animate-pulse bg-muted rounded-md" />
              ) : (
                <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between font-normal text-left h-10 px-3 bg-white hover:bg-neutral-50 border border-input dark:bg-zinc-950"
                    >
                      <span className="truncate">
                        {selectedCliente ? selectedCliente.nome : 'Selecionar um cliente cadastrado...'}
                      </span>
                      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-zinc-700" />
                        Buscar e Selecionar Cliente
                      </DialogTitle>
                      <DialogDescription>
                        Filtre seus clientes por nome ou CPF/CNPJ e selecione o desejado para o orçamento.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Buscar cliente por nome ou CPF / CNPJ..." 
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      <div className="border rounded-md max-h-64 overflow-y-auto divide-y bg-background">
                        {filteredClientes.length === 0 ? (
                          <div className="p-4 text-center text-xs text-muted-foreground">Nenhum cliente correspondente.</div>
                        ) : (
                          filteredClientes.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setClienteId(c.id);
                                setIsClientDialogOpen(false);
                                setClientSearch('');
                                toast.success(`Cliente "${c.nome}" selecionado`);
                              }}
                              className={`w-full text-left p-3 text-xs flex justify-between items-center transition-all hover:bg-neutral-50 ${
                                clienteId === c.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-foreground">{c.nome}</p>
                                <p className="text-muted-foreground mt-0.5">
                                  {c.telefone ? `Tel: ${c.telefone} • ` : ''}Tipo: {c.tipo === 'pessoa_fisica' ? 'Física' : 'Jurídica'}
                                </p>
                              </div>
                              {c.cpfCnpj && (
                                <div className="text-right text-muted-foreground font-mono">
                                  {c.cpfCnpj}
                                </div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Client Snapshot display when selected */}
            {selectedCliente && (
              <div className="bg-muted/50 rounded-lg p-4 text-xs space-y-2 border border-dashed text-muted-foreground transition-all duration-300">
                <p className="font-semibold text-foreground text-sm">{selectedCliente.nome}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <p><strong>Telefone:</strong> {selectedCliente.telefone}</p>
                  <p><strong>E-mail:</strong> {selectedCliente.email || 'Não informado'}</p>
                  {selectedCliente.cpfCnpj && <p><strong>CPF/CNPJ:</strong> {selectedCliente.cpfCnpj}</p>}
                  {selectedCliente.endereco && (
                    <p className="sm:col-span-2">
                      <strong>Endereço:</strong> {typeof selectedCliente.endereco === 'string' ? selectedCliente.endereco : 'Formato de objeto'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section: Budget Items */}
          <div className="bg-white rounded-xl border dark:bg-zinc-950 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Produtos & Serviços
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Adicione e configure o escopo de itens para esta proposta.
                </p>
              </div>

              {/* Multi action triggers */}
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="h-9 gap-1 hover:bg-neutral-50"
                  onClick={() => setIsProductDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Buscar Produtos
                </Button>

                <BuscarProdutoDialog
                  open={isProductDialogOpen}
                  onOpenChange={setIsProductDialogOpen}
                  onAddProduct={(item) => {
                    setItens(prev => [...prev, item]);
                    toast.success('Produto adicionado ao orçamento');
                  }}
                />

                {/* Service search dialog trigger */}
                <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-1 hover:bg-neutral-50">
                      <Plus className="h-4 w-4" />
                      Buscar Serviços
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-zinc-700" />
                        Buscar e Adicionar Serviço
                      </DialogTitle>
                      <DialogDescription>
                        Consulte seu portfólio de serviços cadastrados para adicionar.
                      </DialogDescription>
                    </DialogHeader>

                    {/* Integrated search and listing setup */}
                    <div className="space-y-4 pt-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Buscar serviço por nome ou código..." 
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      {/* Items match scroll collection */}
                      <div className="border rounded-md max-h-48 overflow-y-auto divide-y bg-background">
                        {loadingServicos ? (
                          <div className="p-4 text-center text-xs text-muted-foreground">Carregando catálogo...</div>
                        ) : filteredServices.length === 0 ? (
                          <div className="p-4 text-center text-xs text-muted-foreground">Nenhum serviço correspondente.</div>
                        ) : (
                          filteredServices.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleSelectServiceForAdding(s)}
                              className={`w-full text-left p-3 text-xs flex justify-between items-center transition-all hover:bg-neutral-50 ${
                                selectedService?.id === s.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-foreground">{s.nome}</p>
                                <p className="text-muted-foreground mt-0.5">
                                  {s.codigoInterno ? `ID: ${s.codigoInterno} • ` : ''}Cobrança: {s.unidade}
                                </p>
                              </div>
                              <div className="text-right font-medium">
                                R$ {Number(s.precoUnitario).toFixed(2)}
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      {/* Modify fields on selection */}
                      {selectedService && (
                        <div className="border border-primary/20 bg-primary/5 rounded-lg p-4 space-y-4 animate-scale-in">
                          <p className="text-xs font-semibold uppercase text-primary/80">Configure o serviço:</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-muted-foreground">Quantidade / Horas</label>
                              <Input 
                                type="number" 
                                min="1" 
                                value={quantityToAdd} 
                                onChange={(e) => setQuantityToAdd(Number(e.target.value))} 
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-muted-foreground">Valor Cobrado (R$)</label>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                value={priceToAdd} 
                                onChange={(e) => setPriceToAdd(Number(e.target.value))} 
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center bg-background p-2.5 rounded-md border text-xs">
                            <span className="text-muted-foreground">Subtotal Calculado:</span>
                            <span className="font-mono font-bold text-base text-foreground">
                              R$ {(quantityToAdd * priceToAdd).toFixed(2)}
                            </span>
                          </div>
                          <Button onClick={handleAddServiceToItems} className="w-full">
                            Confirmar & Adicionar
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* List and table of added Items */}
            {itens.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center space-y-1 bg-muted/20 text-muted-foreground">
                <ChevronRight className="h-6 w-6 text-muted-foreground/60 mx-auto rotate-90" />
                <p className="text-sm font-semibold">Nenhum item adicionado</p>
                <p className="text-xs max-w-sm mx-auto">Utilize os botões acima para buscar produtos ou serviços no seu catálogo e adicioná-los.</p>
              </div>
            ) : (
              <div className="rounded-md border bg-white shadow-sm dark:bg-zinc-950 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[110px] font-semibold">Cod.</TableHead>
                      <TableHead className="font-semibold">Item</TableHead>
                      <TableHead className="font-semibold">Tipo</TableHead>
                      <TableHead className="text-center font-semibold">Unidade</TableHead>
                      <TableHead className="text-right font-semibold">Qtd</TableHead>
                      <TableHead className="text-right font-semibold">Preço Unit.</TableHead>
                      <TableHead className="text-right font-semibold">Subtotal</TableHead>
                      <TableHead className="text-center font-semibold pr-4">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item, index) => (
                      <TableRow key={index} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                        <TableCell className="font-mono text-xs text-zinc-500">
                          {item.codigo || '-'}
                        </TableCell>
                        <TableCell className="font-medium text-zinc-900 dark:text-zinc-100 max-w-xs truncate" title={item.descricao}>
                          {item.descricao}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            item.tipo === 'produto' 
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' 
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                          }`}>
                            {item.tipo === 'produto' ? 'Produto' : 'Serviço'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-zinc-500 dark:text-zinc-400 font-mono">
                          {item.unidade}
                        </TableCell>
                        <TableCell className="text-right font-medium text-zinc-900 dark:text-zinc-100">
                          {item.quantidade}
                        </TableCell>
                        <TableCell className="text-right font-mono text-zinc-900 dark:text-zinc-100">
                          R$ {Number(item.precoUnitario).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          R$ {Number(item.subtotal).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center pr-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Remarks Section */}
          <div className="bg-white rounded-xl border dark:bg-zinc-950 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Observações & Anotações</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Observações adicionais para o cliente</label>
              <Textarea 
                placeholder="Insira notas de envio, garantia, observações adicionais..." 
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

        </div>

        {/* Right Sidebar: Summary and calculations */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border dark:bg-zinc-950 p-6 shadow-xs space-y-6 sticky top-6">
            <h3 className="font-heading text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-100 pb-4 border-b">
              Resumo Operacional
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Subtotal dos Itens</span>
                <span className="font-mono font-medium text-foreground">R$ {subtotal.toFixed(2)}</span>
              </div>

              {/* Discount inputs */}
              <div className="space-y-2 pt-2 border-t border-dashed">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs font-medium">Aplicar Desconto</span>
                  
                  {/* Selector tab value or percentual */}
                  <div className="flex rounded-md border p-0.5 bg-neutral-50/50">
                    <button
                      type="button"
                      onClick={() => setDescontoTipo('valor')}
                      className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-sm transition-all ${
                        descontoTipo === 'valor' ? 'bg-white shadow-xs text-foreground font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      $ Real
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescontoTipo('percentual')}
                      className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-sm transition-all ${
                        descontoTipo === 'percentual' ? 'bg-white shadow-xs text-foreground font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      % Porc.
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    {descontoTipo === 'valor' ? (
                      <DollarSign className="h-4 w-4" />
                    ) : (
                      <Percent className="h-4 w-4" />
                    )}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={desconto || ''}
                    onChange={(e) => setDesconto(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Impostos static value */}
              <div className="space-y-1.5 pt-2 border-t border-dashed">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs font-medium">Impostos / Outros Adicionais (R$)</span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={impostos || ''}
                    onChange={(e) => setImpostos(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Condições de Pagamento */}
              <div className="space-y-1.5 pt-2 border-t border-dashed">
                <label className="text-xs font-semibold text-muted-foreground">Condições de Pagamento</label>
                <Select value={condicoesPagamento} onValueChange={setCondicoesPagamento}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Selecione as condições de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="À vista">À vista</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Inicial */}
              <div className="space-y-1.5 pt-2 border-t border-dashed">
                <label className="text-xs font-semibold text-muted-foreground">Status Inicial</label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho (Default)</SelectItem>
                    <SelectItem value="enviado">Enviado (Aguardando cliente)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center pt-4 border-t text-foreground font-semibold text-base">
                <span>Total Líquido</span>
                <span className="font-mono text-xl font-black text-primary">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={handleCreateOrcamento} disabled={isSubmitting} className="w-full h-11 text-sm font-semibold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  editId ? 'Salvar Alterações' : 'Gerar Proposta Comercial'
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-3">
                Os dados estarão disponíveis para envio e exportação em PDF imediatamente.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function NovoOrcamentoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Carregando formulário de orçamento...</p>
        </div>
      </div>
    }>
      <NovoOrcamentoPageContent />
    </Suspense>
  );
}
