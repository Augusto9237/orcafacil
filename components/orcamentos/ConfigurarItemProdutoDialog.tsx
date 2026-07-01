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
import { Settings2 } from 'lucide-react';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.codigoInterno} - {product.nome}
          </DialogTitle>
  
        </DialogHeader>
        <div className="space-y-4">
          {product.imageUrl && (
            <div className="w-full h-28 rounded-lg border overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
              <img
                src={product.imageUrl}
                alt={product.nome}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}
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
