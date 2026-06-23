'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SeedPage() {
  const { usuario } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!usuario) {
      toast.error('Você precisa estar logado para popular o banco de dados.');
      return;
    }

    setIsSeeding(true);
    try {
      const batch = writeBatch(db);

      // Seed Clientes
      const clientesSeed = [
        {
          usuarioId: usuario.uid,
          nome: 'João Silva',
          email: 'joao.silva@exemplo.com',
          telefone: '(11) 99999-1111',
          cpfCnpj: '111.222.333-44',
          tipo: 'pessoa_fisica',
          endereco: 'Rua das Flores, 123, São Paulo, SP, 01000-000',
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        },
        {
          usuarioId: usuario.uid,
          nome: 'Tech Solutions LTDA',
          email: 'contato@techsolutions.com',
          telefone: '(11) 3333-2222',
          cpfCnpj: '12.345.678/0001-99',
          tipo: 'pessoa_juridica',
          endereco: 'Av. Paulista, 1000, Sala 101, São Paulo, SP, 01310-100',
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        }
      ];

      for (const cliente of clientesSeed) {
        const docRef = doc(collection(db, 'clientes'));
        batch.set(docRef, cliente);
      }

      // Seed Produtos
      const produtosSeed = [
        {
          usuarioId: usuario.uid,
          nome: 'Cabo de Rede CAT6',
          descricao: 'Cabo de rede trançado para instalações',
          unidade: 'M',
          precoUnitario: 3.50,
          codigoInterno: 'PROD-001',
          estoque: 500,
          ativo: true,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        },
        {
          usuarioId: usuario.uid,
          nome: 'Roteador Wi-Fi 6',
          descricao: 'Roteador Mesh Gigabit',
          unidade: 'UN',
          precoUnitario: 350.00,
          codigoInterno: 'PROD-002',
          estoque: 15,
          ativo: true,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        }
      ];

      for (const produto of produtosSeed) {
        const docRef = doc(collection(db, 'produtos'));
        batch.set(docRef, produto);
      }

      // Seed Servicos
      const servicosSeed = [
        {
          usuarioId: usuario.uid,
          nome: 'Instalação de Rede',
          descricao: 'Passagem e crimpagem de cabos de rede',
          unidade: 'H',
          precoUnitario: 120.00,
          codigoInterno: 'SERV-001',
          ativo: true,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        },
        {
          usuarioId: usuario.uid,
          nome: 'Manutenção de Computador',
          descricao: 'Limpeza, troca de pasta térmica e formatação',
          unidade: 'UN',
          precoUnitario: 250.00,
          codigoInterno: 'SERV-002',
          ativo: true,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        }
      ];

      for (const servico of servicosSeed) {
        const docRef = doc(collection(db, 'servicos'));
        batch.set(docRef, servico);
      }

      await batch.commit();

      setIsSeeding(false);
      toast.success('Banco de dados populado com sucesso com dados da conta!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao popular o banco de dados.');
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Base de Dados (Seed)</h1>
      <p className="text-muted-foreground">
        Clique no botão abaixo para popular sua conta atual com clientes, produtos e serviços de teste. Isso irá inserir dados fictícios.
      </p>
      <Button onClick={handleSeed} disabled={isSeeding || !usuario}>
        {isSeeding ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
        Popular Dados Iniciais
      </Button>
    </div>
  );
}
