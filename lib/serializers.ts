import type {
  Cliente as PrismaCliente,
  Orcamento as PrismaOrcamento,
  OrdemServico as PrismaOrdemServico,
  Produto as PrismaProduto,
  Servico as PrismaServico,
  Usuario as PrismaUsuario,
} from '@/generated/prisma/client'
import type { Cliente, ItemOrcamento, Orcamento, OrdemServico, Produto, Servico, Usuario } from '@/types';

function money(value: { toNumber?: () => number } | number | string): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  if (value && typeof value.toNumber === 'function') return value.toNumber();
  return Number(value);
}

function snapshotCliente(row: {
  clienteNome: string;
  clienteEmail: string | null;
  clienteTelefone: string;
  clienteCpfCnpj: string | null;
  clienteEndereco: string | null;
}) {
  return {
    nome: row.clienteNome,
    email: row.clienteEmail ?? undefined,
    telefone: row.clienteTelefone,
    cpfCnpj: row.clienteCpfCnpj ?? undefined,
    endereco: row.clienteEndereco ?? undefined,
  };
}

export function serializeUsuario(row: PrismaUsuario): Usuario {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    empresa: row.empresa,
    cnpjCpf: row.cnpjCpf ?? undefined,
    telefone: row.telefone ?? undefined,
    endereco: row.endereco ?? undefined,
    logoUrl: row.logoUrl ?? undefined,
    corTema: row.corTema ?? undefined,
    criadoEm: row.criadoEm,
  };
}

export function serializeCliente(row: PrismaCliente): Cliente {
  return {
    id: row.id,
    usuarioId: row.usuarioId,
    nome: row.nome,
    email: row.email ?? undefined,
    telefone: row.telefone,
    cpfCnpj: row.cpfCnpj ?? undefined,
    tipo: row.tipo,
    endereco: row.endereco ?? undefined,
    observacoes: row.observacoes ?? undefined,
    criadoEm: row.criadoEm,
    atualizadoEm: row.atualizadoEm,
  };
}

export function serializeProduto(row: PrismaProduto): Produto {
  return {
    id: row.id,
    usuarioId: row.usuarioId,
    nome: row.nome,
    descricao: row.descricao ?? undefined,
    unidade: row.unidade,
    precoUnitario: money(row.precoUnitario),
    codigoInterno: row.codigoInterno ?? undefined,
    estoque: row.estoque,
    ativo: row.ativo,
    imageUrl: row.imageUrl ?? undefined,
    criadoEm: row.criadoEm,
    atualizadoEm: row.atualizadoEm,
  };
}

export function serializeServico(row: PrismaServico): Servico {
  return {
    id: row.id,
    usuarioId: row.usuarioId,
    nome: row.nome,
    descricao: row.descricao ?? undefined,
    unidade: row.unidade,
    precoUnitario: money(row.precoUnitario),
    codigoInterno: row.codigoInterno ?? undefined,
    ativo: row.ativo,
    criadoEm: row.criadoEm,
    atualizadoEm: row.atualizadoEm,
  };
}

export function serializeOrcamento(row: PrismaOrcamento): Orcamento {
  return {
    id: row.id,
    usuarioId: row.usuarioId,
    numero: row.numero,
    clienteId: row.clienteId,
    cliente: snapshotCliente(row),
    status: row.status,
    itens: (row.itens ?? []) as ItemOrcamento[],
    subtotal: money(row.subtotal),
    desconto: money(row.desconto),
    descontoTipo: row.descontoTipo,
    impostos: money(row.impostos),
    total: money(row.total),
    validadeDias: row.validadeDias,
    condicoesPagamento: row.condicoesPagamento ?? undefined,
    observacoes: row.observacoes ?? undefined,
    criadoEm: row.criadoEm,
    atualizadoEm: row.atualizadoEm,
  };
}

export function serializeOrdemServico(row: PrismaOrdemServico): OrdemServico {
  return {
    id: row.id,
    usuarioId: row.usuarioId,
    numero: row.numero,
    orcamentoId: row.orcamentoId ?? undefined,
    clienteId: row.clienteId,
    cliente: snapshotCliente(row),
    status: row.status,
    prioridade: row.prioridade,
    itens: (row.itens ?? []) as ItemOrcamento[],
    subtotal: money(row.subtotal),
    desconto: money(row.desconto),
    descontoTipo: row.descontoTipo,
    impostos: money(row.impostos),
    total: money(row.total),
    dataAbertura: row.dataAbertura,
    dataPrevisao: row.dataPrevisao ?? undefined,
    dataConclusao: row.dataConclusao ?? undefined,
    tecnicoResponsavel: row.tecnicoResponsavel ?? undefined,
    condicoesPagamento: row.condicoesPagamento ?? undefined,
    observacoes: row.observacoes ?? undefined,
    assinaturaClienteUrl: row.assinaturaClienteUrl ?? undefined,
    criadoEm: row.criadoEm,
    atualizadoEm: row.atualizadoEm,
  };
}

export function emptyToNull(value?: string | null) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
