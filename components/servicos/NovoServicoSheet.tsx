'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { criarServico } from '@/actions/servicos';
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
  nome: z.string().min(2, 'O nome do serviço deve ter pelo menos 2 caracteres'),
  codigoInterno: z.string().optional(),
  unidade: z.string().min(1, 'Selecione ou insira uma unidade de medida'),
  precoUnitario: z.coerce.number().min(0.01, 'O preço deve ser maior que zero'),
  descricao: z.string().optional(),
});

export function NovoServicoSheet({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const { refresh } = useDataRefresh();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      nome: '',
      codigoInterno: '',
      unidade: 'H',
      precoUnitario: 0,
      descricao: '',
    },
  });

  async function onSubmit(values: any) {
    if (!usuario) return;

    setIsSubmitting(true);
    try {
      const resultado = await criarServico(usuario.id, { ...values, ativo: true });
      if (resultado.ok === false) {
        toast.error(resultado.error);
        return;
      }

      toast.success('Serviço cadastrado com sucesso!');
      refresh();
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao cadastrar serviço.');
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
          <SheetTitle>Novo Serviço</SheetTitle>
          <SheetDescription>
            Insira os dados do serviço. Clique em salvar quando terminar.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mão de obra de alvenaria" {...field} />
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
                    <FormLabel>Código / Ref</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SERV001" {...field} />
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
                    <FormLabel>Cobrança / Unidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="H">H (Hora)</SelectItem>
                        <SelectItem value="UN">UN (Unidade/Fixo)</SelectItem>
                        <SelectItem value="DIA">DIA (Diária)</SelectItem>
                        <SelectItem value="MES">MÊS (Mensalidade)</SelectItem>
                        <SelectItem value="M">M (Metro linear)</SelectItem>
                        <SelectItem value="M2">M² (Metro quadrado)</SelectItem>
                        <SelectItem value="KM">KM (Quilômetro)</SelectItem>
                        <SelectItem value="VIS">VIS (Visita técnica)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes adicionais sobre o serviço prestado..." {...field} />
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
