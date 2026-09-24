'use server';

import { prisma } from '@/lib/prisma';
import { emptyToNull, serializeServico } from '@/lib/serializers';
import type { Servico } from '@/types';

export type ServicoInput = {
  nome: string;
  descricao?: string;
  unidade: string;
  precoUnitario: number;
  codigoInterno?: string;
  ativo?: boolean;
};

export async function listarServicos(usuarioId: string): Promise<Servico[]> {
  const servicos = await prisma.servico.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: 'desc' },
  });
  return servicos.map(serializeServico);
}

export async function criarServico(
  usuarioId: string,
  dados: ServicoInput
): Promise<{ ok: true; data: Servico } | { ok: false; error: string }> {
  try {
    const servico = await prisma.servico.create({
      data: {
        usuarioId,
        nome: dados.nome,
        descricao: emptyToNull(dados.descricao),
        unidade: dados.unidade,
        precoUnitario: dados.precoUnitario,
        codigoInterno: emptyToNull(dados.codigoInterno),
        ativo: dados.ativo ?? true,
      },
    });
    return { ok: true, data: serializeServico(servico) };
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return { ok: false, error: 'Erro ao cadastrar serviço.' };
  }
}

export async function atualizarServico(
  id: string,
  dados: ServicoInput
): Promise<{ ok: true; data: Servico } | { ok: false; error: string }> {
  try {
    const servico = await prisma.servico.update({
      where: { id },
      data: {
        nome: dados.nome,
        descricao: emptyToNull(dados.descricao),
        unidade: dados.unidade,
        precoUnitario: dados.precoUnitario,
        codigoInterno: emptyToNull(dados.codigoInterno),
        ativo: dados.ativo,
      },
    });
    return { ok: true, data: serializeServico(servico) };
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return { ok: false, error: 'Erro ao atualizar serviço.' };
  }
}

export async function atualizarStatusServico(
  id: string,
  ativo: boolean
): Promise<{ ok: true; data: Servico } | { ok: false; error: string }> {
  try {
    const servico = await prisma.servico.update({
      where: { id },
      data: { ativo },
    });
    return { ok: true, data: serializeServico(servico) };
  } catch (error) {
    console.error('Erro ao atualizar status do serviço:', error);
    return { ok: false, error: 'Erro ao atualizar o status do serviço.' };
  }
}

export async function excluirServico(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.servico.delete({ where: { id } });
    return { ok: true };
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    return { ok: false, error: 'Erro ao excluir o serviço.' };
  }
}
