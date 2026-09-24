'use server';

import { prisma } from '@/lib/prisma';
import { serializeOrdemServico } from '@/lib/serializers';
import type { OrdemServico } from '@/types';

export async function listarOrdensDeServico(usuarioId: string): Promise<OrdemServico[]> {
  const ordens = await prisma.ordemServico.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: 'desc' },
  });
  return ordens.map(serializeOrdemServico);
}
