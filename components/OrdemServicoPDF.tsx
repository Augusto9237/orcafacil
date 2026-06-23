'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { OrdemServico, Usuario } from '@/types';

// Define layout styles (matching the polished estimates template branding for client cohesion)
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    padding: 40,
    color: '#1f2937',
  },
  // Header Section
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 20,
    marginBottom: 20,
  },
  companyDetails: {
    width: '60%',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  companySub: {
    fontSize: 9,
    color: '#4b5563',
    marginTop: 2,
  },
  documentMeta: {
    width: '40%',
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981', // green for active operational OS
  },
  documentNumber: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#0f172a',
  },
  documentDate: {
    fontSize: 9,
    color: '#4b5563',
    marginTop: 2,
  },
  // Info sections
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBlock: {
    width: '48%',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  infoTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 2,
  },
  infoText: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 3,
  },
  infoTextBold: {
    fontWeight: 'bold',
    color: '#111827',
  },
  // Item List Table
  table: {
    marginTop: 10,
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 0,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  colDesc: { width: '45%' },
  colTipo: { width: '15%', textTransform: 'capitalize' },
  colUn: { width: '10%', textAlign: 'center' },
  colQtd: { width: '10%', textAlign: 'right' },
  colVlUnit: { width: '10%', textAlign: 'right' },
  colSub: { width: '10%', textAlign: 'right' },
  
  colTextHead: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  colText: {
    fontSize: 8.5,
    color: '#374151',
  },
  colTextBold: {
    fontWeight: 'bold',
  },
  // Totals calculations summary
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 30,
  },
  totalsBlock: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalRowBig: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 9,
    color: '#4b5563',
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalLabelBig: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  totalValueBig: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10b981',
  },
  // Notes / Terms
  bottomSection: {
    marginTop: 'auto',
  },
  notesBlock: {
    borderLeftWidth: 2,
    borderLeftColor: '#10b981',
    paddingLeft: 10,
    marginTop: 10,
    marginBottom: 40,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  notesBody: {
    fontSize: 8.5,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  // Signatures
  signaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  signatureLine: {
    width: '40%',
    borderTopWidth: 1,
    borderTopColor: '#9ca3af',
    alignItems: 'center',
    paddingTop: 6,
  },
  signatureText: {
    fontSize: 8,
    color: '#6b7280',
  }
});

interface OrdemServicoPDFProps {
  ordemServico: OrdemServico;
  empresa: Usuario | null;
}

export function OrdemServicoPDF({ ordemServico, empresa }: OrdemServicoPDFProps) {
  // Opening date safely typed
  const dataAbertura = ordemServico.dataAbertura 
    ? (ordemServico.dataAbertura instanceof Date 
        ? ordemServico.dataAbertura 
        : (ordemServico.dataAbertura as any).toDate?.() || new Date(ordemServico.dataAbertura as any))
    : new Date();

  // Delivery forecast safely typed
  const dataPrevisao = ordemServico.dataPrevisao
    ? (ordemServico.dataPrevisao instanceof Date
        ? ordemServico.dataPrevisao
        : (ordemServico.dataPrevisao as any).toDate?.() || new Date(ordemServico.dataPrevisao as any))
    : null;

  const formattedAbertura = dataAbertura.toLocaleDateString('pt-BR');
  const formattedPrevisao = dataPrevisao ? dataPrevisao.toLocaleDateString('pt-BR') : 'Não informada';

  const printDesconto = () => {
    if (ordemServico.desconto <= 0) return 'R$ 0,00';
    if (ordemServico.descontoTipo === 'percentual') {
      const valorDesconto = (ordemServico.subtotal * ordemServico.desconto) / 100;
      return `- R$ ${valorDesconto.toFixed(2)} (${ordemServico.desconto}%)`;
    }
    return `- R$ ${ordemServico.desconto.toFixed(2)}`;
  };

  const getPriorityLabel = (prio: string) => {
    const labels: Record<string, string> = {
      baixa: 'Baixa',
      normal: 'Normal',
      alta: 'Alta',
      urgente: 'Urgente',
    };
    return labels[prio] || prio;
  };

  const getStatusLabel = (st: string) => {
    const labels: Record<string, string> = {
      aberta: 'Aberta',
      em_andamento: 'Em Andamento',
      pausada: 'Pausada',
      concluida: 'Concluída',
      cancelada: 'Cancelada',
    };
    return labels[st] || st;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>{empresa?.empresa || 'Minha Empresa'}</Text>
            {empresa?.cnpjCpf && <Text style={styles.companySub}>CNPJ/CPF: {empresa.cnpjCpf}</Text>}
            {empresa?.telefone && <Text style={styles.companySub}>Telefone: {empresa.telefone}</Text>}
            <Text style={styles.companySub}>E-mail: {empresa?.email || ordemServico.cliente.email}</Text>
            {empresa?.endereco && <Text style={styles.companySub}>Endereço: {empresa.endereco}</Text>}
          </View>
          <View style={styles.documentMeta}>
            <Text style={styles.documentTitle}>ORDEM DE SERVIÇO</Text>
            <Text style={styles.documentNumber}>O.S. Nº: {ordemServico.numero}</Text>
            <Text style={styles.documentDate}>Data de Entrada: {formattedAbertura}</Text>
            <Text style={styles.documentDate}>Previsão de Entrega: {formattedPrevisao}</Text>
          </View>
        </View>

        {/* Client & OS parameters */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>CLIENTE</Text>
            <Text style={[styles.infoText, styles.infoTextBold]}>{ordemServico.cliente.nome}</Text>
            {ordemServico.cliente.cpfCnpj && <Text style={styles.infoText}>CPF/CNPJ: {ordemServico.cliente.cpfCnpj}</Text>}
            {ordemServico.cliente.telefone && <Text style={styles.infoText}>Telefone: {ordemServico.cliente.telefone}</Text>}
            {ordemServico.cliente.email && <Text style={styles.infoText}>E-mail: {ordemServico.cliente.email}</Text>}
            {ordemServico.cliente.endereco && <Text style={styles.infoText}>Endereço: {ordemServico.cliente.endereco}</Text>}
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>DADOS DETALHADOS DA O.S.</Text>
            <Text style={styles.infoText}>Status operacional: <Text style={styles.infoTextBold}>{getStatusLabel(ordemServico.status).toUpperCase()}</Text></Text>
            <Text style={styles.infoText}>Prioridade: <Text style={styles.infoTextBold}>{getPriorityLabel(ordemServico.prioridade)}</Text></Text>
            {ordemServico.tecnicoResponsavel && <Text style={styles.infoText}>Técnico Responsável: <Text style={styles.infoTextBold}>{ordemServico.tecnicoResponsavel}</Text></Text>}
            {ordemServico.condicoesPagamento && <Text style={styles.infoText}>Condição de pagamento: {ordemServico.condicoesPagamento}</Text>}
          </View>
        </View>

        {/* Table Items */}
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.colDesc, styles.colTextHead]}>Descrição do Serviço ou Peça</Text>
            <Text style={[styles.colTipo, styles.colTextHead]}>Tipo</Text>
            <Text style={[styles.colUn, styles.colTextHead]}>Unidade</Text>
            <Text style={[styles.colQtd, styles.colTextHead, { textAlign: 'right' }]}>Qtd</Text>
            <Text style={[styles.colVlUnit, styles.colTextHead, { textAlign: 'right' }]}>Valor Unit.</Text>
            <Text style={[styles.colSub, styles.colTextHead, { textAlign: 'right' }]}>Total</Text>
          </View>

          {ordemServico.itens && ordemServico.itens.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.colDesc, styles.colText]}>{item.descricao}</Text>
              <Text style={[styles.colTipo, styles.colText]}>{item.tipo === 'produto' ? 'Peça / Insumo' : 'Serviço / Mão de Obra'}</Text>
              <Text style={[styles.colUn, styles.colText]}>{item.unidade || 'UN'}</Text>
              <Text style={[styles.colQtd, styles.colText, { textAlign: 'right' }]}>{item.quantidade}</Text>
              <Text style={[styles.colVlUnit, styles.colText, { textAlign: 'right' }]}>R$ {Number(item.precoUnitario).toFixed(2)}</Text>
              <Text style={[styles.colSub, styles.colText, styles.colTextBold, { textAlign: 'right' }]}>R$ {Number(item.subtotal).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Banner */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>R$ {Number(ordemServico.subtotal).toFixed(2)}</Text>
            </View>
            {ordemServico.desconto > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Desconto</Text>
                <Text style={styles.totalValue}>{printDesconto()}</Text>
              </View>
            )}
            {ordemServico.impostos > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Impostos/Taxas</Text>
                <Text style={styles.totalValue}>+ R$ {Number(ordemServico.impostos).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRowBig}>
              <Text style={styles.totalLabelBig}>VALOR TOTAL DA OS</Text>
              <Text style={styles.totalValueBig}>R$ {Number(ordemServico.total).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes and signature panels */}
        <View style={styles.bottomSection}>
          {ordemServico.observacoes && (
            <View style={styles.notesBlock}>
              <Text style={styles.notesTitle}>OBSERVAÇÕES E DIAGNÓSTICO TÉCNICO</Text>
              <Text style={styles.notesBody}>{ordemServico.observacoes}</Text>
            </View>
          )}

          {/* Legal / operational clauses */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 7, color: '#9ca3af', lineHeight: 1.3 }}>
              Declaro que os serviços e materiais descritos acima foram executados/entregues em perfeitas condições. 
              As condições de garantia de peças de reposição e de mão de obra seguem as descritas no código de defesa do consumidor.
            </Text>
          </View>

          {/* Signatures */}
          <View style={styles.signaturesContainer}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>{empresa?.nome || 'Prestador de Serviço'}</Text>
              <Text style={[styles.signatureText, { fontSize: 7, color: '#9ca3af', marginTop: 2 }]}>Técnico Responsável</Text>
            </View>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>{ordemServico.cliente.nome}</Text>
              <Text style={[styles.signatureText, { fontSize: 7, color: '#9ca3af', marginTop: 2 }]}>Firma do Cliente (Autorização/Recebimento)</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
