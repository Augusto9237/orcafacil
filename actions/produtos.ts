'use server';

import { prisma } from '@/lib/prisma';
import { emptyToNull, serializeProduto } from '@/lib/serializers';
import type { Produto } from '@/types';

export type ProdutoInput = {
  nome: string;
  descricao?: string;
  unidade: string;
  precoUnitario: number;
  codigoInterno?: string;
  estoque?: number;
  imageUrl?: string;
  ativo?: boolean;
};

export async function listarProdutos(usuarioId: string): Promise<Produto[]> {
  const produtos = await prisma.produto.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: 'desc' },
  });
  return produtos.map(serializeProduto);
}

export async function criarProduto(
  usuarioId: string,
  dados: ProdutoInput
): Promise<{ ok: true; data: Produto } | { ok: false; error: string }> {
  try {
    const produto = await prisma.produto.create({
      data: {
        usuarioId,
        nome: dados.nome,
        descricao: emptyToNull(dados.descricao),
        unidade: dados.unidade,
        precoUnitario: dados.precoUnitario,
        codigoInterno: emptyToNull(dados.codigoInterno),
        estoque: dados.estoque ?? 0,
        imageUrl: emptyToNull(dados.imageUrl),
        ativo: dados.ativo ?? true,
      },
    });
    return { ok: true, data: serializeProduto(produto) };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return { ok: false, error: 'Erro ao cadastrar produto.' };
  }
}

export async function atualizarProduto(
  id: string,
  dados: ProdutoInput
): Promise<{ ok: true; data: Produto } | { ok: false; error: string }> {
  try {
    const produto = await prisma.produto.update({
      where: { id },
      data: {
        nome: dados.nome,
        descricao: emptyToNull(dados.descricao),
        unidade: dados.unidade,
        precoUnitario: dados.precoUnitario,
        codigoInterno: emptyToNull(dados.codigoInterno),
        estoque: dados.estoque ?? 0,
        imageUrl: emptyToNull(dados.imageUrl),
        ativo: dados.ativo,
      },
    });
    return { ok: true, data: serializeProduto(produto) };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return { ok: false, error: 'Erro ao atualizar produto.' };
  }
}

export async function atualizarStatusProduto(
  id: string,
  ativo: boolean
): Promise<{ ok: true; data: Produto } | { ok: false; error: string }> {
  try {
    const produto = await prisma.produto.update({
      where: { id },
      data: { ativo },
    });
    return { ok: true, data: serializeProduto(produto) };
  } catch (error) {
    console.error('Erro ao atualizar status do produto:', error);
    return { ok: false, error: 'Erro ao alterar o status do produto.' };
  }
}

export async function excluirProduto(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.produto.delete({ where: { id } });
    return { ok: true };
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return { ok: false, error: 'Erro ao excluir o produto.' };
  }
}
