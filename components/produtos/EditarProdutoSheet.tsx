'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const formSchema = z.object({
  nome: z.string().min(2, 'O nome do produto deve ter pelo menos 2 caracteres'),
  codigoInterno: z.string().optional(),
  unidade: z.string().min(1, 'Selecione ou insira uma unidade de medida'),
  precoUnitario: z.coerce.number().min(0.01, 'O preço deve ser maior que zero'),
  estoque: z.coerce.number().optional().default(0),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

interface EditarProdutoSheetProps {
  produto: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarProdutoSheet({ produto, open, onOpenChange }: EditarProdutoSheetProps) {
  const { usuario } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      nome: '',
      codigoInterno: '',
      unidade: 'UN',
      precoUnitario: 0,
      estoque: 0,
      descricao: '',
      ativo: true,
    },
  });

  // Populate form values when product data is received
  useEffect(() => {
    if (produto) {
      form.reset({
        nome: produto.nome || '',
        codigoInterno: produto.codigoInterno || '',
        unidade: produto.unidade || 'UN',
        precoUnitario: produto.precoUnitario || 0,
        estoque: produto.estoque ?? 0,
        descricao: produto.descricao || '',
        ativo: produto.ativo !== false,
      });
    }
  }, [produto, form, open]);

  async function onSubmit(values: any) {
    if (!usuario || !produto) return;

    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'produtos', produto.id);
      await updateDoc(docRef, {
        ...values,
        atualizadoEm: serverTimestamp(),
      });

      toast.success('Produto atualizado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar produto.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto px-5 gap-0">
        <SheetHeader className="px-0">
          <SheetTitle>Editar Produto</SheetTitle>
          <SheetDescription>
            Altere os dados do produto. Clique em salvar quando terminar.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cimento CP-II 50kg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigoInterno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código / SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: PROD001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UN">UN (Unidade)</SelectItem>
                        <SelectItem value="KG">KG (Quilograma)</SelectItem>
                        <SelectItem value="M">M (Metro)</SelectItem>
                        <SelectItem value="M2">M² (Metro Quadrado)</SelectItem>
                        <SelectItem value="M3">M³ (Metro Cúbico)</SelectItem>
                        <SelectItem value="L">L (Litro)</SelectItem>
                        <SelectItem value="CX">CX (Caixa)</SelectItem>
                        <SelectItem value="PCT">PCT (Pacote)</SelectItem>
                        <SelectItem value="PAR">PAR (Par)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precoUnitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estoque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes adicionais sobre o produto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-850 dark:bg-zinc-900"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal cursor-pointer select-none text-zinc-900 dark:text-zinc-100">
                      Produto Ativo
                    </FormLabel>
                    <p className="text-[11px] text-zinc-500">
                      Disponível para novos orçamentos e propostas.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
