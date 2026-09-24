'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { criarProduto } from '@/actions/produtos';
import { useAuth } from '@/hooks/useAuth';
import { useDataRefresh } from '@/lib/data-refresh';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
  imageUrl: z.string().optional(),
  descricao: z.string().optional(),
});

export function NovoProdutoSheet({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const { refresh } = useDataRefresh();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      nome: '',
      codigoInterno: '',
      unidade: 'UN',
      precoUnitario: 0,
      estoque: 0,
      imageUrl: '',
      descricao: '',
    },
  });

  async function onSubmit(values: any) {
    if (!usuario) return;

    setIsSubmitting(true);
    try {
      const resultado = await criarProduto(usuario.id, { ...values, ativo: true });
      if (resultado.ok === false) {
        toast.error(resultado.error);
        return;
      }

      toast.success('Produto cadastrado com sucesso!');
      refresh();
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cadastrar produto.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto px-5 gap-0">
        <SheetHeader className="px-0">
          <SheetTitle>Novo Produto</SheetTitle>
          <SheetDescription className="text-xs">
            Insira os dados do produto. Clique em salvar quando terminar.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormLabel>Estoque Inicial</FormLabel>
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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input placeholder="Ex: https://exemplo.com/imagem.jpg" {...field} />
                      {field.value && (
                        <div className="relative h-20 w-20 rounded border overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                          <img
                            src={field.value}
                            alt="Visualização do produto"
                            className="object-cover h-full w-full"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
