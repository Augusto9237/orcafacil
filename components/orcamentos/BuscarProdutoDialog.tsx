'use client';

import { useState, useMemo, useEffect } from 'react';
import { useProdutos } from '@/hooks/useProdutos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Package, Search } from 'lucide-react';
import type { ItemOrcamento } from '@/types';
import { ConfigurarItemProdutoDialog } from './ConfigurarItemProdutoDialog';

interface BuscarProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (item: ItemOrcamento) => void;
}

export function BuscarProdutoDialog({
  open,
  onOpenChange,
  onAddProduct,
}: BuscarProdutoDialogProps) {
  const { produtos, carregando: loadingProdutos } = useProdutos();
  
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Clear state when dialog closes
  useEffect(() => {
    if (!open) {
      setProductSearch('');
      setSelectedProduct(null);
      setIsConfigOpen(false);
    }
  }, [open]);

  // Dialog Search filters
  const filteredProducts = useMemo(() => {
    return produtos.filter(p => 
      p.nome.toLowerCase().includes(productSearch.toLowerCase()) || 
      (p.codigoInterno && p.codigoInterno.toLowerCase().includes(productSearch.toLowerCase()))
    );
  }, [produtos, productSearch]);

  const handleSelectProductForAdding = (prod: any) => {
    setSelectedProduct(prod);
    setIsConfigOpen(true);
  };

  const handleConfigConfirm = (quantity: number, price: number) => {
    if (!selectedProduct) return;

    const newItem: ItemOrcamento = {
      tipo: 'produto',
      referenciaId: selectedProduct.id,
      descricao: selectedProduct.nome,
      unidade: selectedProduct.unidade || 'UN',
      quantidade: quantity,
      precoUnitario: price,
      subtotal: quantity * price,
      codigo: selectedProduct.codigoInterno || '',
    };

    onAddProduct(newItem);
    setIsConfigOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Buscar Produto
          </DialogTitle>
          <DialogDescription className="text-xs">
            Filtre seu catálogo e selecione o produto para incluir na proposta.
          </DialogDescription>
        </DialogHeader>

        {/* Integrated list and search component */}
        <div className="space-y-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar produto por nome ou código..." 
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Items matching container */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {loadingProdutos ? (
              <div className="p-4 text-center text-xs text-muted-foreground">Carregando catálogo...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">Nenhum produto correspondente.</div>
            ) : (
              filteredProducts.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProductForAdding(p)}
                  className={`w-full text-left p-3 text-xs rounded-md flex justify-between items-center gap-3 transition-all hover:bg-neutral-50 ${
                    selectedProduct?.id === p.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {p.imageUrl ? (
                      <div className="h-8 w-8 rounded border bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img
                          src={p.imageUrl}
                          alt={p.nome}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded border bg-zinc-50 dark:bg-zinc-900 flex-shrink-0 flex items-center justify-center text-zinc-400">
                        <Package className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{p.nome}</p>
                      <p className="text-muted-foreground mt-0.5 truncate">
                        {p.codigoInterno ? `Código: ${p.codigoInterno} • ` : ''}Unidade: {p.unidade}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-medium flex-shrink-0">
                    R$ {Number(p.precoUnitario).toFixed(2)}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Configurator Dialog */}
          <ConfigurarItemProdutoDialog
            open={isConfigOpen}
            onOpenChange={setIsConfigOpen}
            product={selectedProduct}
            onConfirm={handleConfigConfirm}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
