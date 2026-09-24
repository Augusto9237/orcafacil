'use server';

import { prisma } from '@/lib/prisma';
import { emptyToNull, serializeCliente } from '@/lib/serializers';
import type { Cliente } from '@/types';

export type ClienteInput = {
  nome: string;
  email?: string;
  telefone: string;
  cpfCnpj?: string;
  tipo: Cliente['tipo'];
  endereco?: string;
  observacoes?: string;
};

export async function listarClientes(usuarioId: string): Promise<Cliente[]> {
  const clientes = await prisma.cliente.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: 'desc' },
  });
  return clientes.map(serializeCliente);
}

export async function criarCliente(
  usuarioId: string,
  dados: ClienteInput
): Promise<{ ok: true; data: Cliente } | { ok: false; error: string }> {
  try {
    const cliente = await prisma.cliente.create({
      data: {
        usuarioId,
        nome: dados.nome,
        email: emptyToNull(dados.email),
        telefone: dados.telefone,
        cpfCnpj: emptyToNull(dados.cpfCnpj),
        tipo: dados.tipo,
        endereco: emptyToNull(dados.endereco),
        observacoes: emptyToNull(dados.observacoes),
      },
    });
    return { ok: true, data: serializeCliente(cliente) };
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return { ok: false, error: 'Erro ao cadastrar cliente.' };
  }
}

export async function atualizarCliente(
  id: string,
  dados: ClienteInput
): Promise<{ ok: true; data: Cliente } | { ok: false; error: string }> {
  try {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: dados.nome,
        email: emptyToNull(dados.email),
        telefone: dados.telefone,
        cpfCnpj: emptyToNull(dados.cpfCnpj),
        tipo: dados.tipo,
        endereco: emptyToNull(dados.endereco),
        observacoes: emptyToNull(dados.observacoes),
      },
    });
    return { ok: true, data: serializeCliente(cliente) };
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return { ok: false, error: 'Erro ao atualizar cliente.' };
  }
}

export async function excluirCliente(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.cliente.delete({ where: { id } });
    return { ok: true };
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return { ok: false, error: 'Erro ao excluir cliente. Verifique se ele não está vinculado a orçamentos.' };
  }
}
