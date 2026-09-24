export type ClienteId = string;
export type ProdutoId = string;
export type ServicoId = string;
export type OrcamentoId = string;
export type OSId = string;
export type UsuarioId = string;

export interface Usuario {
  id: UsuarioId;
  nome: string;
  email: string;
  empresa: string;
  cnpjCpf?: string;
  telefone?: string;
  endereco?: string;
  logoUrl?: string;
  corTema?: string;
  criadoEm: Date;
}

export interface Cliente {
  id: ClienteId;
  usuarioId: UsuarioId;
  nome: string;
  email?: string;
  telefone: string;
  cpfCnpj?: string;
  tipo: 'pessoa_fisica' | 'pessoa_juridica';
  endereco?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  } | string;
  observacoes?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Produto {
  id: ProdutoId;
  usuarioId: UsuarioId;
  nome: string;
  descricao?: string;
  unidade: string;
  precoUnitario: number;
  codigoInterno?: string;
  estoque?: number;
  ativo: boolean;
  imageUrl?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Servico {
  id: ServicoId;
  usuarioId: UsuarioId;
  nome: string;
  descricao?: string;
  unidade: string;
  precoUnitario: number;
  codigoInterno?: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export type ClienteSnapshot = {
  nome: string;
  email?: string;
  telefone: string;
  cpfCnpj?: string;
  endereco?: string;
};

export type ItemOrcamento = {
  tipo: 'produto' | 'servico';
  referenciaId: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  codigo?: string;
};

export interface Orcamento {
  id: OrcamentoId;
  usuarioId: UsuarioId;
  numero: string;
  clienteId: ClienteId;
  cliente: ClienteSnapshot;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'rejeitado' | 'cancelado' | 'expirado';
  itens: ItemOrcamento[];
  subtotal: number;
  desconto: number;
  descontoTipo: 'percentual' | 'valor';
  impostos: number;
  total: number;
  validadeDias: number;
  condicoesPagamento?: string;
  observacoes?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface OrdemServico {
  id: OSId;
  usuarioId: UsuarioId;
  numero: string;
  orcamentoId?: string;
  clienteId: ClienteId;
  cliente: ClienteSnapshot;
  status: 'aberta' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  itens: ItemOrcamento[];
  subtotal: number;
  desconto: number;
  descontoTipo: 'percentual' | 'valor';
  impostos: number;
  total: number;
  dataAbertura: Date;
  dataPrevisao?: Date;
  dataConclusao?: Date;
  tecnicoResponsavel?: string;
  condicoesPagamento?: string;
  observacoes?: string;
  assinaturaClienteUrl?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
