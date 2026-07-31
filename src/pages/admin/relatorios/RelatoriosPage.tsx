// src/pages/admin/relatorios/RelatoriosPage.tsx
//
// Módulo de Relatórios (Cap. 5 e 9 do PRD — "relatórios simples" no MVP).
// Três abas: Licitações, Propostas, Disputas. Cada uma tem filtros básicos,
// indicadores-resumo e botões de exportação em Excel/PDF.

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { licitacaoService } from '../../../services/licitacaoService';
import { propostaService } from '../../../services/propostaService';
import { disputaService } from '../../../services/disputaService';
import { Licitacao, STATUS_LICITACAO_LABEL, MODALIDADE_LICITACAO_LABEL } from '../../../types/licitacao';
import { Proposta, STATUS_PROPOSTA_LABEL, calcularTotalProposta } from '../../../types/proposta';
import { Disputa, RESULTADO_DISPUTA_LABEL } from '../../../types/disputa';
import { mockClientesResumo } from '../../../data/mockClientesResumo';
import { formatarDataHora, formatarMoeda } from '../../../utils/prazoUtils';
import { exportarParaExcel, exportarParaPDF, ColunaRelatorio } from '../../../utils/exportUtils';

type AbaRelatorio = 'licitacoes' | 'propostas' | 'disputas';

const ABAS: { id: AbaRelatorio; label: string }[] = [
  { id: 'licitacoes', label: 'Licitações' },
  { id: 'propostas', label: 'Propostas' },
  { id: 'disputas', label: 'Disputas' },
];

function nomeCliente(clienteId: string): string {
  return mockClientesResumo.find((c) => c.id === clienteId)?.nomeFantasia ?? '—';
}

function dentroDoPeriodo(dataISO: string | undefined, de: string, ate: string): boolean {
  if (!dataISO) return !de && !ate; // sem data: só entra se não houver filtro de período
  const data = new Date(dataISO).getTime();
  if (de && data < new Date(de).getTime()) return false;
  if (ate && data > new Date(ate).getTime() + 24 * 60 * 60 * 1000 - 1) return false;
  return true;
}

interface CardResumoProps {
  label: string;
  valor: string;
  tone?: 'default' | 'success' | 'danger';
}

function CardResumo({ label, valor, tone = 'default' }: CardResumoProps) {
  const cores = {
    default: 'bg-white text-ink',
    success: 'bg-forest-mist text-forest-deep',
    danger: 'bg-red-50 text-red-700',
  } as const;
  return (
    <div className={`rounded-xl border border-charcoal-3/10 px-5 py-4 shadow-soft ${cores[tone]}`}>
      <p className="font-body text-xs uppercase tracking-wide opacity-70">{label}</p>
      <p className="font-display text-2xl">{valor}</p>
    </div>
  );
}

export function RelatoriosPage() {
  const [aba, setAba] = useState<AbaRelatorio>('licitacoes');
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [disputas, setDisputas] = useState<Disputa[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [statusFiltro, setStatusFiltro] = useState('');
  const [dataDe, setDataDe] = useState('');
  const [dataAte, setDataAte] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [resLicitacoes, resPropostas, resDisputas] = await Promise.all([
      licitacaoService.listar({ pageSize: 1000 }),
      propostaService.listarTodas(),
      disputaService.listarTodas(),
    ]);
    setLicitacoes(resLicitacoes.itens);
    setPropostas(resPropostas);
    setDisputas(resDisputas);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Reseta o filtro de status ao trocar de aba, pois as opções são diferentes
  useEffect(() => {
    setStatusFiltro('');
  }, [aba]);

  const licitacoesFiltradas = useMemo(
    () =>
      licitacoes.filter((l) => {
        if (statusFiltro && l.status !== statusFiltro) return false;
        return dentroDoPeriodo(l.dataPublicacao, dataDe, dataAte);
      }),
    [licitacoes, statusFiltro, dataDe, dataAte]
  );

  const propostasFiltradas = useMemo(
    () =>
      propostas.filter((p) => {
        if (statusFiltro && p.status !== statusFiltro) return false;
        return dentroDoPeriodo(p.dataEnvio, dataDe, dataAte);
      }),
    [propostas, statusFiltro, dataDe, dataAte]
  );

  const disputasFiltradas = useMemo(
    () =>
      disputas.filter((d) => {
        if (statusFiltro && d.resultado !== statusFiltro) return false;
        return dentroDoPeriodo(d.dataSessaoRealizada, dataDe, dataAte);
      }),
    [disputas, statusFiltro, dataDe, dataAte]
  );

  // ---- Indicadores-resumo por aba ----
  const indicadores = useMemo(() => {
    if (aba === 'licitacoes') {
      const total = licitacoesFiltradas.length;
      const valorTotal = licitacoesFiltradas.reduce((s, l) => s + l.valorEstimado, 0);
      const ganhas = licitacoesFiltradas.filter((l) => l.status === 'ganho').length;
      return [
        { label: 'Total de licitações', valor: String(total) },
        { label: 'Valor estimado total', valor: formatarMoeda(valorTotal) },
        { label: 'Ganhas', valor: String(ganhas), tone: 'success' as const },
      ];
    }
    if (aba === 'propostas') {
      const total = propostasFiltradas.length;
      const valorTotal = propostasFiltradas.reduce((s, p) => s + calcularTotalProposta(p.itens), 0);
      const aceitas = propostasFiltradas.filter((p) => p.status === 'aceita').length;
      return [
        { label: 'Total de propostas', valor: String(total) },
        { label: 'Valor total ofertado', valor: formatarMoeda(valorTotal) },
        { label: 'Aceitas', valor: String(aceitas), tone: 'success' as const },
      ];
    }
    const total = disputasFiltradas.length;
    const ganhas = disputasFiltradas.filter((d) => d.resultado === 'ganho').length;
    const perdidas = disputasFiltradas.filter((d) => d.resultado === 'perdido').length;
    const taxaSucesso = ganhas + perdidas > 0 ? Math.round((ganhas / (ganhas + perdidas)) * 100) : 0;
    return [
      { label: 'Total de disputas', valor: String(total) },
      { label: 'Ganhas', valor: String(ganhas), tone: 'success' as const },
      { label: 'Perdidas', valor: String(perdidas), tone: 'danger' as const },
      { label: 'Taxa de sucesso', valor: `${taxaSucesso}%` },
    ];
  }, [aba, licitacoesFiltradas, propostasFiltradas, disputasFiltradas]);

  // ---- Colunas e linhas para exportação/tabela, por aba ----
  const { colunas, linhas } = useMemo((): {
    colunas: ColunaRelatorio[];
    linhas: Record<string, string | number>[];
  } => {
    if (aba === 'licitacoes') {
      return {
        colunas: [
          { chave: 'numeroEdital', titulo: 'Edital' },
          { chave: 'orgao', titulo: 'Órgão' },
          { chave: 'modalidade', titulo: 'Modalidade' },
          { chave: 'cliente', titulo: 'Cliente' },
          { chave: 'valorEstimado', titulo: 'Valor Estimado' },
          { chave: 'dataAberturaSessao', titulo: 'Sessão' },
          { chave: 'status', titulo: 'Status' },
        ],
        linhas: licitacoesFiltradas.map((l) => ({
          numeroEdital: l.numeroEdital,
          orgao: l.orgao,
          modalidade: MODALIDADE_LICITACAO_LABEL[l.modalidade],
          cliente: nomeCliente(l.clienteId),
          valorEstimado: formatarMoeda(l.valorEstimado),
          dataAberturaSessao: formatarDataHora(l.dataAberturaSessao),
          status: STATUS_LICITACAO_LABEL[l.status],
        })),
      };
    }

    if (aba === 'propostas') {
      const licitacaoPorId = new Map(licitacoes.map((l) => [l.id, l]));
      return {
        colunas: [
          { chave: 'edital', titulo: 'Edital' },
          { chave: 'valorTotal', titulo: 'Valor Total' },
          { chave: 'validade', titulo: 'Validade (dias)' },
          { chave: 'dataEnvio', titulo: 'Enviada em' },
          { chave: 'status', titulo: 'Status' },
        ],
        linhas: propostasFiltradas.map((p) => ({
          edital: licitacaoPorId.get(p.licitacaoId)?.numeroEdital ?? '—',
          valorTotal: formatarMoeda(calcularTotalProposta(p.itens)),
          validade: p.validadeDias,
          dataEnvio: p.dataEnvio ? formatarDataHora(p.dataEnvio) : '—',
          status: STATUS_PROPOSTA_LABEL[p.status],
        })),
      };
    }

    const licitacaoPorId = new Map(licitacoes.map((l) => [l.id, l]));
    return {
      colunas: [
        { chave: 'edital', titulo: 'Edital' },
        { chave: 'sessao', titulo: 'Sessão Realizada' },
        { chave: 'nossaOferta', titulo: 'Nossa Oferta' },
        { chave: 'valorVencedor', titulo: 'Valor Vencedor' },
        { chave: 'vencedor', titulo: 'Vencedor' },
        { chave: 'resultado', titulo: 'Resultado' },
      ],
      linhas: disputasFiltradas.map((d) => ({
        edital: licitacaoPorId.get(d.licitacaoId)?.numeroEdital ?? '—',
        sessao: d.dataSessaoRealizada ? formatarDataHora(d.dataSessaoRealizada) : '—',
        nossaOferta: d.valorNossaOfertaFinal ? formatarMoeda(d.valorNossaOfertaFinal) : '—',
        valorVencedor: d.valorVencedor ? formatarMoeda(d.valorVencedor) : '—',
        vencedor: d.nomeVencedor || '—',
        resultado: RESULTADO_DISPUTA_LABEL[d.resultado],
      })),
    };
  }, [aba, licitacoesFiltradas, propostasFiltradas, disputasFiltradas, licitacoes]);

  const opcoesStatus = useMemo(() => {
    if (aba === 'licitacoes') return Object.entries(STATUS_LICITACAO_LABEL);
    if (aba === 'propostas') return Object.entries(STATUS_PROPOSTA_LABEL);
    return Object.entries(RESULTADO_DISPUTA_LABEL);
  }, [aba]);

  const tituloRelatorio = ABAS.find((a) => a.id === aba)?.label ?? '';

  function exportarExcel() {
    exportarParaExcel(colunas, linhas, `relatorio-${aba}-salutti`, tituloRelatorio);
  }

  function exportarPDF() {
    exportarParaPDF(colunas, linhas, `relatorio-${aba}-salutti`, `Relatório de ${tituloRelatorio} — Salutti`);
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-ink">Relatórios</h1>
        <p className="font-body text-sm text-ink-soft">
          Acompanhamento consolidado de licitações, propostas e disputas.
        </p>
      </header>

      {/* Abas */}
      <div className="mb-5 flex gap-1 border-b border-charcoal-3/15 font-body">
        {ABAS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAba(tab.id)}
            className={`relative px-4 py-2.5 text-sm font-medium ${
              aba === tab.id ? 'text-forest-deep' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {tab.label}
            {aba === tab.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brass" />}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="mb-5 flex flex-wrap items-end gap-3 font-body text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">Status</label>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="rounded-md border border-charcoal-3/20 bg-white px-3 py-2 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          >
            <option value="">Todos</option>
            {opcoesStatus.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">Período de</label>
          <input
            type="date"
            value={dataDe}
            onChange={(e) => setDataDe(e.target.value)}
            className="rounded-md border border-charcoal-3/20 bg-white px-3 py-2 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">até</label>
          <input
            type="date"
            value={dataAte}
            onChange={(e) => setDataAte(e.target.value)}
            className="rounded-md border border-charcoal-3/20 bg-white px-3 py-2 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        </div>

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={exportarExcel}
            disabled={linhas.length === 0}
            className="rounded-md border border-forest/40 px-4 py-2 font-medium text-forest-deep hover:bg-forest-mist disabled:cursor-not-allowed disabled:opacity-40"
          >
            Exportar Excel
          </button>
          <button
            type="button"
            onClick={exportarPDF}
            disabled={linhas.length === 0}
            className="rounded-md bg-forest px-4 py-2 font-medium text-paper hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Indicadores-resumo */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {indicadores.map((ind) => (
          <CardResumo key={ind.label} label={ind.label} valor={ind.valor} tone={(ind as any).tone} />
        ))}
      </div>

      {/* Tabela de pré-visualização */}
      <div className="overflow-hidden rounded-xl border border-charcoal-3/10 bg-white shadow-soft">
        <table className="w-full font-body text-sm">
          <thead className="bg-paper-2 text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              {colunas.map((c) => (
                <th key={c.chave} className="px-4 py-3">
                  {c.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-3/10">
            {carregando && (
              <tr>
                <td colSpan={colunas.length} className="px-4 py-8 text-center text-ink-soft">
                  Carregando dados...
                </td>
              </tr>
            )}
            {!carregando && linhas.length === 0 && (
              <tr>
                <td colSpan={colunas.length} className="px-4 py-8 text-center text-ink-soft">
                  Nenhum registro para os filtros selecionados.
                </td>
              </tr>
            )}
            {!carregando &&
              linhas.map((linha, i) => (
                <tr key={i} className="hover:bg-paper-2/60">
                  {colunas.map((c) => (
                    <td key={c.chave} className="px-4 py-3 text-ink-soft">
                      {linha[c.chave]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
