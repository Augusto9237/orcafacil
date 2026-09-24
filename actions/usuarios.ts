'use server';

import { prisma } from '@/lib/prisma';
import { emptyToNull, serializeUsuario } from '@/lib/serializers';
import type { Usuario } from '@/types';

export async function garantirUsuario(input: {
  id: string;
  nome: string;
  email: string;
}): Promise<Usuario> {
  const usuario = await prisma.usuario.upsert({
    where: { id: input.id },
    update: {},
    create: {
      id: input.id,
      nome: input.nome,
      email: input.email,
      empresa: 'Minha Empresa',
    },
  });

  return serializeUsuario(usuario);
}

export async function buscarUsuario(id: string): Promise<Usuario | null> {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  return usuario ? serializeUsuario(usuario) : null;
}

export async function atualizarUsuario(
  id: string,
  dados: Partial<Pick<Usuario, 'empresa' | 'cnpjCpf' | 'telefone' | 'endereco' | 'logoUrl' | 'corTema' | 'nome'>>
): Promise<{ ok: true; data: Usuario } | { ok: false; error: string }> {
  try {
    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        ...(dados.nome !== undefined && { nome: dados.nome }),
        ...(dados.empresa !== undefined && { empresa: dados.empresa }),
        ...(dados.cnpjCpf !== undefined && { cnpjCpf: emptyToNull(dados.cnpjCpf) }),
        ...(dados.telefone !== undefined && { telefone: emptyToNull(dados.telefone) }),
        ...(dados.endereco !== undefined && { endereco: emptyToNull(dados.endereco) }),
        ...(dados.logoUrl !== undefined && { logoUrl: emptyToNull(dados.logoUrl) }),
        ...(dados.corTema !== undefined && { corTema: emptyToNull(dados.corTema) }),
      },
    });

    return { ok: true, data: serializeUsuario(usuario) };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return { ok: false, error: 'Erro ao salvar configurações.' };
  }
}
