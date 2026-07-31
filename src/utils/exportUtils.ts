// src/utils/exportUtils.ts
//
// Funções genéricas de exportação, reaproveitáveis por qualquer relatório
// (Licitações, Propostas, Disputas, e futuros).
//
// Dependências necessárias (ver COMO_INTEGRAR.md):
//   npm install xlsx jspdf jspdf-autotable

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ColunaRelatorio {
  chave: string;
  titulo: string;
}

/**
 * Exporta uma lista de linhas (já formatadas como string/número — ver cada
 * página de relatório para o mapeamento) para um arquivo .xlsx, baixado
 * diretamente pelo navegador.
 */
export function exportarParaExcel(
  colunas: ColunaRelatorio[],
  linhas: Record<string, string | number>[],
  nomeArquivo: string,
  nomeAba = 'Relatório'
): void {
  const dadosFormatados = linhas.map((linha) => {
    const objeto: Record<string, string | number> = {};
    colunas.forEach((coluna) => {
      objeto[coluna.titulo] = linha[coluna.chave] ?? '';
    });
    return objeto;
  });

  const planilha = XLSX.utils.json_to_sheet(dadosFormatados);
  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, planilha, nomeAba);
  XLSX.writeFile(livro, `${nomeArquivo}.xlsx`);
}

/**
 * Exporta a mesma lista de linhas para um arquivo .pdf, em formato de
 * tabela, baixado diretamente pelo navegador.
 */
export function exportarParaPDF(
  colunas: ColunaRelatorio[],
  linhas: Record<string, string | number>[],
  nomeArquivo: string,
  titulo: string
): void {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(14);
  doc.text(titulo, 14, 15);
  doc.setFontSize(9);
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 21);

  autoTable(doc, {
    startY: 26,
    head: [colunas.map((c) => c.titulo)],
    body: linhas.map((linha) => colunas.map((c) => String(linha[c.chave] ?? ''))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [11, 92, 60] }, // forest (#0B5C3C)
  });

  doc.save(`${nomeArquivo}.pdf`);
}
