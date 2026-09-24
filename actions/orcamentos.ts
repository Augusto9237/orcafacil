'use server';

import { prisma } from '@/lib/prisma';
import { emptyToNull, serializeOrcamento, serializeUsuario } from '@/lib/serializers';
import type { ClienteSnapshot, ItemOrcamento, Orcamento, Usuario } from '@/types';

export type OrcamentoInput = {
  clienteId: string;
  cliente: ClienteSnapshot;
  status: Orcamento['status'];
  itens: ItemOrcamento[];
  subtotal: number;
  desconto: number;
  descontoTipo: Orcamento['descontoTipo'];
  impostos: number;
  total: number;
  validadeDias: number;
  condicoesPagamento?: string;
  observacoes?: string;
};

function snapshotData(cliente: ClienteSnapshot) {
  return {
    clienteNome: cliente.nome,
    clienteEmail: emptyToNull(cliente.email),
    clienteTelefone: cliente.telefone,
    clienteCpfCnpj: emptyToNull(cliente.cpfCnpj),
    clienteEndereco: emptyToNull(cliente.endereco),
  };
}

async function proximoNumeroOrcamento(usuarioId: string): Promise<string> {
  const ano = new Date().getFullYear();

  const contador = await prisma.contador.upsert({
    where: { usuarioId },
    update: { seqOrcamento: { increment: 1 } },
    create: { usuarioId, seqOrcamento: 1, seqOs: 0 },
  });

  return `ORC-${ano}-${String(contador.seqOrcamento).padStart(4, '0')}`;
}

export async function listarOrcamentos(usuarioId: string): Promise<Orcamento[]> {
  const orcamentos = await prisma.orcamento.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: 'desc' },
  });
  return orcamentos.map(serializeOrcamento);
}

export async function buscarOrcamento(id: string): Promise<Orcamento | null> {
  const orcamento = await prisma.orcamento.findUnique({ where: { id } });
  return orcamento ? serializeOrcamento(orcamento) : null;
}

export async function buscarOrcamentoPublico(
  id: string
): Promise<{ orcamento: Orcamento; empresa: Usuario | null } | null> {
  const orcamento = await prisma.orcamento.findUnique({ where: { id } });
  if (!orcamento) return null;

  const empresa = await prisma.usuario.findUnique({ where: { id: orcamento.usuarioId } });

  return {
    orcamento: serializeOrcamento(orcamento),
    empresa: empresa ? serializeUsuario(empresa) : null,
  };
}

export async function criarOrcamento(
  usuarioId: string,
  dados: OrcamentoInput
): Promise<{ ok: true; data: Orcamento } | { ok: false; error: string }> {
  try {
    const numero = await proximoNumeroOrcamento(usuarioId);
    const orcamento = await prisma.orcamento.create({
      data: {
        usuarioId,
        numero,
        clienteId: dados.clienteId,
        ...snapshotData(dados.cliente),
        status: dados.status,
        itens: dados.itens,
        subtotal: dados.subtotal,
        desconto: dados.desconto,
        descontoTipo: dados.descontoTipo,
        impostos: dados.impostos,
        total: dados.total,
        validadeDias: dados.validadeDias,
        condicoesPagamento: emptyToNull(dados.condicoesPagamento),
        observacoes: emptyToNull(dados.observacoes),
      },
    });
    return { ok: true, data: serializeOrcamento(orcamento) };
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    return { ok: false, error: 'Erro ao salvar orçamento.' };
  }
}

export async function atualizarOrcamento(
  id: string,
  dados: OrcamentoInput
): Promise<{ ok: true; data: Orcamento } | { ok: false; error: string }> {
  try {
    const orcamento = await prisma.orcamento.update({
      where: { id },
      data: {
        clienteId: dados.clienteId,
        ...snapshotData(dados.cliente),
        status: dados.status,
        itens: dados.itens,
        subtotal: dados.subtotal,
        desconto: dados.desconto,
        descontoTipo: dados.descontoTipo,
        impostos: dados.impostos,
        total: dados.total,
        validadeDias: dados.validadeDias,
        condicoesPagamento: emptyToNull(dados.condicoesPagamento),
        observacoes: emptyToNull(dados.observacoes),
      },
    });
    return { ok: true, data: serializeOrcamento(orcamento) };
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    return { ok: false, error: 'Erro ao salvar orçamento.' };
  }
}

export async function atualizarStatusOrcamento(
  id: string,
  status: Orcamento['status']
): Promise<{ ok: true; data: Orcamento } | { ok: false; error: string }> {
  try {
    const orcamento = await prisma.orcamento.update({
      where: { id },
      data: { status },
    });
    return { ok: true, data: serializeOrcamento(orcamento) };
  } catch (error) {
    console.error('Erro ao atualizar status do orçamento:', error);
    return { ok: false, error: 'Erro ao atualizar status do orçamento.' };
  }
}

export async function excluirOrcamento(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.orcamento.delete({ where: { id } });
    return { ok: true };
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    return { ok: false, error: 'Erro ao excluir orçamento.' };
  }
}
