'use client';

import { useState, useMemo, useEffect } from 'react';
import { useServicos } from '@/hooks/useServicos';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Wrench, Search } from 'lucide-react';
import type { ItemOrcamento } from '@/types';
import { ConfigurarItemServicoDialog } from './ConfigurarItemServicoDialog';

interface BuscarServicoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddService: (item: ItemOrcamento) => void;
}

export function BuscarServicoDialog({
  open,
  onOpenChange,
  onAddService,
}: BuscarServicoDialogProps) {
  const { servicos, carregando: loadingServicos } = useServicos();

  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Clear state when dialog closes
  useEffect(() => {
    if (!open) {
      setServiceSearch('');
      setSelectedService(null);
      setIsConfigOpen(false);
    }
  }, [open]);

  // Dialog Search filters
  const filteredServices = useMemo(() => {
    return servicos.filter(s =>
      s.nome.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      (s.codigoInterno && s.codigoInterno.toLowerCase().includes(serviceSearch.toLowerCase()))
    );
  }, [servicos, serviceSearch]);

  const handleSelectServiceForAdding = (serv: any) => {
    setSelectedService(serv);
    setIsConfigOpen(true);
  };

  const handleConfigConfirm = (quantity: number, price: number) => {
    if (!selectedService) return;

    const newItem: ItemOrcamento = {
      tipo: 'servico',
      referenciaId: selectedService.id,
      descricao: selectedService.nome,
      unidade: selectedService.unidade || 'H',
      quantidade: quantity,
      precoUnitario: price,
      subtotal: quantity * price,
      codigo: selectedService.codigoInterno || '',
    };

    onAddService(newItem);
    setIsConfigOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Buscar Serviço
          </DialogTitle>
          <DialogDescription className="text-xs">
            Filtre seu catálogo e selecione o serviço para incluir na proposta.
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
          <div className="max-h-48 overflow-y-auto space-y-2">
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
                  className={`w-full text-left p-3 text-xs rounded-md flex justify-between items-center gap-3 transition-all hover:bg-neutral-50 dark:hover:bg-zinc-900/40 ${
                    selectedService?.id === s.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded border bg-zinc-50 dark:bg-zinc-900 flex-shrink-0 flex items-center justify-center text-zinc-400">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{s.nome}</p>
                      <p className="text-muted-foreground mt-0.5 truncate">
                        {s.codigoInterno ? `ID: ${s.codigoInterno} • ` : ''}Cobrança: {s.unidade}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-medium flex-shrink-0">
                    R$ {Number(s.precoUnitario).toFixed(2)}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Configurator Dialog */}
          <ConfigurarItemServicoDialog
            open={isConfigOpen}
            onOpenChange={setIsConfigOpen}
            service={selectedService}
            onConfirm={handleConfigConfirm}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
