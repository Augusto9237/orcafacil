'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Package } from 'lucide-react';

interface ConfigurarItemProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any | null;
  onConfirm: (quantity: number, price: number) => void;
}

export function ConfigurarItemProdutoDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
}: ConfigurarItemProdutoDialogProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);

  // Set default price when product changes or dialog opens
  useEffect(() => {
    if (product) {
      setPrice(Number(product.precoUnitario || 0));
      setQuantity(1);
    }
  }, [product, open]);

  if (!product) return null;

  const handleConfirm = () => {
    onConfirm(quantity, price);
    onOpenChange(false);
  };

  const subtotal = quantity * price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col gap-4">
        <div className="w-full h-48 rounded-lg border overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.nome}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  const fallback = parent.querySelector('.fallback-icon');
                  if (fallback) {
                    fallback.classList.remove('hidden');
                    fallback.classList.add('flex');
                  }
                }
              }}
            />
          ) : null}
          <div className={`fallback-icon items-center justify-center text-zinc-400 ${product.imageUrl ? 'hidden' : 'flex'}`}>
            <Package className="h-12 w-12" />
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.codigoInterno ? `${product.codigoInterno} - ` : ''}{product.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Quantidade ({product.unidade || 'UN'})</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Preço Unitário (R$)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border text-xs">
            <span className="text-muted-foreground font-medium">Subtotal Calculado:</span>
            <span className="font-mono font-bold text-base text-zinc-900 dark:text-zinc-100">
              R$ {subtotal.toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Adicionar ao Orçamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
