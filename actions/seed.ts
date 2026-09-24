'use server';

import { prisma } from '@/lib/prisma';

export async function popularDadosIniciais(
  usuarioId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.$transaction([
      prisma.cliente.createMany({
        data: [
          {
            usuarioId,
            nome: 'João Silva',
            email: 'joao.silva@exemplo.com',
            telefone: '(11) 99999-1111',
            cpfCnpj: '111.222.333-44',
            tipo: 'pessoa_fisica',
            endereco: 'Rua das Flores, 123, São Paulo, SP, 01000-000',
          },
          {
            usuarioId,
            nome: 'Tech Solutions LTDA',
            email: 'contato@techsolutions.com',
            telefone: '(11) 3333-2222',
            cpfCnpj: '12.345.678/0001-99',
            tipo: 'pessoa_juridica',
            endereco: 'Av. Paulista, 1000, Sala 101, São Paulo, SP, 01310-100',
          },
        ],
      }),
      prisma.produto.createMany({
        data: [
          {
            usuarioId,
            nome: 'Cabo de Rede CAT6',
            descricao: 'Cabo de rede trançado para instalações',
            unidade: 'M',
            precoUnitario: 3.5,
            codigoInterno: 'PROD-001',
            estoque: 500,
            ativo: true,
          },
          {
            usuarioId,
            nome: 'Roteador Wi-Fi 6',
            descricao: 'Roteador Mesh Gigabit',
            unidade: 'UN',
            precoUnitario: 350,
            codigoInterno: 'PROD-002',
            estoque: 15,
            ativo: true,
          },
        ],
      }),
      prisma.servico.createMany({
        data: [
          {
            usuarioId,
            nome: 'Instalação de Rede',
            descricao: 'Passagem e crimpagem de cabos de rede',
            unidade: 'H',
            precoUnitario: 120,
            codigoInterno: 'SERV-001',
            ativo: true,
          },
          {
            usuarioId,
            nome: 'Manutenção de Computador',
            descricao: 'Limpeza, troca de pasta térmica e formatação',
            unidade: 'UN',
            precoUnitario: 250,
            codigoInterno: 'SERV-002',
            ativo: true,
          },
        ],
      }),
    ]);

    return { ok: true };
  } catch (error) {
    console.error('Erro ao popular dados iniciais:', error);
    return { ok: false, error: 'Erro ao popular o banco de dados.' };
  }
}
