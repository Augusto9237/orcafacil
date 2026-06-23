'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
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
import { toast } from 'sonner';
import type { Cliente } from '@/types';

const formSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().min(8, 'Telefone é obrigatório'),
  tipo: z.enum(['pessoa_fisica', 'pessoa_juridica']),
  endereco: z.string().min(2, 'O endereço deve ter pelo menos 2 caracteres'),
  cpfCnpj: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditarClienteSheetProps {
  cliente: Cliente | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarClienteSheet({ cliente, open, onOpenChange }: EditarClienteSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      tipo: 'pessoa_fisica',
      endereco: '',
      cpfCnpj: '',
    },
  });

  // Load client data when chosen/loaded
  useEffect(() => {
    if (cliente) {
      let endStr = '';
      if (typeof cliente.endereco === 'string') {
        endStr = cliente.endereco;
      } else if (cliente.endereco) {
        const { logradouro, numero, bairro, cidade, estado, cep } = cliente.endereco as any;
        endStr = [logradouro, numero, bairro, cidade, estado, cep].filter(Boolean).join(', ');
      }

      form.reset({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        tipo: cliente.tipo || 'pessoa_fisica',
        endereco: endStr,
        cpfCnpj: cliente.cpfCnpj || '',
      });
    }
  }, [cliente, form]);

  async function onSubmit(values: FormValues) {
    if (!cliente) return;

    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'clientes', cliente.id);
      await updateDoc(docRef, {
        ...values,
        atualizadoEm: serverTimestamp(),
      });

      toast.success('Cliente atualizado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar cliente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto px-5 gap-0">
        <SheetHeader className="px-0">
          <SheetTitle>Editar Cliente</SheetTitle>
          <SheetDescription>
            Atualize as informações do cliente abaixo. Clique em salvar quando terminar.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pessoa</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                      <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo ou Razão Social" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpfCnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF / CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua B, número 0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
