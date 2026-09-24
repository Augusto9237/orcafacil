-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('pessoa_fisica', 'pessoa_juridica');

-- CreateEnum
CREATE TYPE "StatusOrcamento" AS ENUM ('rascunho', 'enviado', 'aprovado', 'recusado', 'rejeitado', 'cancelado', 'expirado');

-- CreateEnum
CREATE TYPE "StatusOS" AS ENUM ('aberta', 'em_andamento', 'pausada', 'concluida', 'cancelada');

-- CreateEnum
CREATE TYPE "PrioridadeOS" AS ENUM ('baixa', 'normal', 'alta', 'urgente');

-- CreateEnum
CREATE TYPE "TipoDesconto" AS ENUM ('percentual', 'valor');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "empresa" TEXT NOT NULL DEFAULT 'Minha Empresa',
    "cnpjCpf" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "logoUrl" TEXT,
    "corTema" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contadores" (
    "usuarioId" TEXT NOT NULL,
    "seqOrcamento" INTEGER NOT NULL DEFAULT 0,
    "seqOs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "contadores_pkey" PRIMARY KEY ("usuarioId")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT NOT NULL,
    "cpfCnpj" TEXT,
    "tipo" "TipoPessoa" NOT NULL,
    "endereco" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "unidade" TEXT NOT NULL,
    "precoUnitario" DECIMAL(12,2) NOT NULL,
    "codigoInterno" TEXT,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "unidade" TEXT NOT NULL,
    "precoUnitario" DECIMAL(12,2) NOT NULL,
    "codigoInterno" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "clienteEmail" TEXT,
    "clienteTelefone" TEXT NOT NULL,
    "clienteCpfCnpj" TEXT,
    "clienteEndereco" TEXT,
    "status" "StatusOrcamento" NOT NULL DEFAULT 'rascunho',
    "itens" JSONB NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "desconto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "descontoTipo" "TipoDesconto" NOT NULL DEFAULT 'valor',
    "impostos" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "validadeDias" INTEGER NOT NULL DEFAULT 15,
    "condicoesPagamento" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordens_de_servico" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "orcamentoId" TEXT,
    "clienteId" TEXT NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "clienteEmail" TEXT,
    "clienteTelefone" TEXT NOT NULL,
    "clienteCpfCnpj" TEXT,
    "clienteEndereco" TEXT,
    "status" "StatusOS" NOT NULL DEFAULT 'aberta',
    "prioridade" "PrioridadeOS" NOT NULL DEFAULT 'normal',
    "itens" JSONB NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "desconto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "descontoTipo" "TipoDesconto" NOT NULL DEFAULT 'valor',
    "impostos" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "dataAbertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPrevisao" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "tecnicoResponsavel" TEXT,
    "condicoesPagamento" TEXT,
    "observacoes" TEXT,
    "assinaturaClienteUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordens_de_servico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clientes_usuarioId_criadoEm_idx" ON "clientes"("usuarioId", "criadoEm");

-- CreateIndex
CREATE INDEX "produtos_usuarioId_criadoEm_idx" ON "produtos"("usuarioId", "criadoEm");

-- CreateIndex
CREATE INDEX "servicos_usuarioId_criadoEm_idx" ON "servicos"("usuarioId", "criadoEm");

-- CreateIndex
CREATE INDEX "orcamentos_usuarioId_criadoEm_idx" ON "orcamentos"("usuarioId", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "orcamentos_usuarioId_numero_key" ON "orcamentos"("usuarioId", "numero");

-- CreateIndex
CREATE INDEX "ordens_de_servico_usuarioId_criadoEm_idx" ON "ordens_de_servico"("usuarioId", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_de_servico_usuarioId_numero_key" ON "ordens_de_servico"("usuarioId", "numero");

-- AddForeignKey
ALTER TABLE "contadores" ADD CONSTRAINT "contadores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_de_servico" ADD CONSTRAINT "ordens_de_servico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_de_servico" ADD CONSTRAINT "ordens_de_servico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
