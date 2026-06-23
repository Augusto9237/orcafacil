'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Orcamento, Usuario } from '@/types';

// Define PDF PDF layout style rules (clean, grid based corporate layout with responsive-like styles)
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
    color: '#2563eb',
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
  // Section Info columns
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
  // Table
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
  // Totals
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
    color: '#2563eb',
  },
  // Notes / Terms
  bottomSection: {
    marginTop: 'auto',
  },
  notesBlock: {
    borderLeftWidth: 2,
    borderLeftColor: '#2563eb',
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

interface OrcamentoPDFProps {
  orcamento: Orcamento;
  empresa: Usuario | null;
}

export function OrcamentoPDF({ orcamento, empresa }: OrcamentoPDFProps) {
  const dataCriacao = orcamento.criadoEm 
    ? (orcamento.criadoEm instanceof Date 
        ? orcamento.criadoEm 
        : (orcamento.criadoEm as any).toDate?.() || new Date(orcamento.criadoEm as any))
    : new Date();

  const formattedDate = dataCriacao.toLocaleDateString('pt-BR');
  
  // Format expiration / validity date
  const dataValidade = new Date(dataCriacao);
  dataValidade.setDate(dataValidade.getDate() + (orcamento.validadeDias || 15));
  const formattedValidade = dataValidade.toLocaleDateString('pt-BR');

  const printDesconto = () => {
    if (orcamento.desconto <= 0) return 'R$ 0,00';
    if (orcamento.descontoTipo === 'percentual') {
      const valorDesconto = (orcamento.subtotal * orcamento.desconto) / 100;
      return `- R$ ${valorDesconto.toFixed(2)} (${orcamento.desconto}%)`;
    }
    return `- R$ ${orcamento.desconto.toFixed(2)}`;
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
            <Text style={styles.companySub}>E-mail: {empresa?.email || orcamento.cliente.email}</Text>
            {empresa?.endereco && <Text style={styles.companySub}>Endereço: {empresa.endereco}</Text>}
          </View>
          <View style={styles.documentMeta}>
            <Text style={styles.documentTitle}>ORÇAMENTO</Text>
            <Text style={styles.documentNumber}>Número: {orcamento.numero}</Text>
            <Text style={styles.documentDate}>Data de Emissão: {formattedDate}</Text>
            <Text style={styles.documentDate}>Válido até: {formattedValidade}</Text>
          </View>
        </View>

        {/* Client & Conditions */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>CLIENTE</Text>
            <Text style={[styles.infoText, styles.infoTextBold]}>{orcamento.cliente.nome}</Text>
            {orcamento.cliente.cpfCnpj && <Text style={styles.infoText}>CPF/CNPJ: {orcamento.cliente.cpfCnpj}</Text>}
            {orcamento.cliente.telefone && <Text style={styles.infoText}>Telefone: {orcamento.cliente.telefone}</Text>}
            {orcamento.cliente.email && <Text style={styles.infoText}>E-mail: {orcamento.cliente.email}</Text>}
            {orcamento.cliente.endereco && <Text style={styles.infoText}>Endereço: {orcamento.cliente.endereco}</Text>}
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>CONDIÇÕES DE PAGAMENTO</Text>
            <Text style={styles.infoText}>Condição de pagamento: <Text style={styles.infoTextBold}>{orcamento.condicoesPagamento || 'À vista'}</Text></Text>
            <Text style={styles.infoText}>Prazo de Validade: {orcamento.validadeDias || 15} dias</Text>
            <Text style={styles.infoText}>Status da Proposta: <Text style={styles.infoTextBold}>{orcamento.status.toUpperCase()}</Text></Text>
          </View>
        </View>

        {/* Table Items */}
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.colDesc, styles.colTextHead]}>Item / Descrição</Text>
            <Text style={[styles.colTipo, styles.colTextHead]}>Tipo</Text>
            <Text style={[styles.colUn, styles.colTextHead]}>Unidade</Text>
            <Text style={[styles.colQtd, styles.colTextHead, { textAlign: 'right' }]}>Qtd</Text>
            <Text style={[styles.colVlUnit, styles.colTextHead, { textAlign: 'right' }]}>Preço Unit.</Text>
            <Text style={[styles.colSub, styles.colTextHead, { textAlign: 'right' }]}>Total</Text>
          </View>

          {orcamento.itens && orcamento.itens.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.colDesc, styles.colText]}>{item.descricao}</Text>
              <Text style={[styles.colTipo, styles.colText]}>{item.tipo === 'produto' ? 'Produto' : 'Serviço'}</Text>
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
              <Text style={styles.totalValue}>R$ {Number(orcamento.subtotal).toFixed(2)}</Text>
            </View>
            {orcamento.desconto > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Desconto</Text>
                <Text style={styles.totalValue}>{printDesconto()}</Text>
              </View>
            )}
            {orcamento.impostos > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Impostos/Outros</Text>
                <Text style={styles.totalValue}>+ R$ {Number(orcamento.impostos).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRowBig}>
              <Text style={styles.totalLabelBig}>VALOR TOTAL</Text>
              <Text style={styles.totalValueBig}>R$ {Number(orcamento.total).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes and signatures inside Bottom Area */}
        <View style={styles.bottomSection}>
          {orcamento.observacoes && (
            <View style={styles.notesBlock}>
              <Text style={styles.notesTitle}>OBSERVAÇÕES DO PROPONENTE</Text>
              <Text style={styles.notesBody}>{orcamento.observacoes}</Text>
            </View>
          )}

          {/* Signatures placeholder */}
          <View style={styles.signaturesContainer}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>{empresa?.empresa || 'Minha Empresa'}</Text>
              <Text style={[styles.signatureText, { fontSize: 7, color: '#9ca3af', marginTop: 2 }]}>Responsável Comercial</Text>
            </View>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>{orcamento.cliente.nome}</Text>
              <Text style={[styles.signatureText, { fontSize: 7, color: '#9ca3af', marginTop: 2 }]}>De acordo, Assinatura do Cliente</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
