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
import { Package, Wrench } from 'lucide-react';
import type { ItemOrcamento } from '@/types';

interface EditarItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemOrcamento | null;
  onConfirm: (quantity: number, price: number) => void;
}

export function EditarItemDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: EditarItemDialogProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);

  // Pre-populate form values when item changes or dialog opens
  useEffect(() => {
    if (item) {
      setPrice(Number(item.precoUnitario || 0));
      setQuantity(Number(item.quantidade || 1));
    }
  }, [item, open]);

  if (!item) return null;

  const handleConfirm = () => {
    onConfirm(quantity, price);
    onOpenChange(false);
  };

  const subtotal = quantity * price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col gap-4">
        <div className="w-full h-32 rounded-lg border overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center relative">
          <div className="flex items-center justify-center text-zinc-400">
            {item.tipo === 'produto' ? (
              <Package className="h-12 w-12 text-blue-500/70" />
            ) : (
              <Wrench className="h-12 w-12 text-indigo-500/70" />
            )}
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar {item.tipo === 'produto' ? 'Produto' : 'Serviço'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Altere a quantidade e o preço para este item na proposta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1 bg-zinc-50 dark:bg-zinc-900/45 p-3 rounded-lg border">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Descrição do Item</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block truncate" title={item.descricao}>
              {item.descricao}
            </span>
            {item.codigo && (
              <span className="font-mono text-[10px] text-zinc-500 mt-1 block">
                Cód: {item.codigo}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Quantidade ({item.unidade || 'UN'})</label>
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
          <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
