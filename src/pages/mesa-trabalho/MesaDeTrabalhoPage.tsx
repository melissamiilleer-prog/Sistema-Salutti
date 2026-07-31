// src/pages/mesa-trabalho/MesaDeTrabalhoPage.tsx
//
// Mesa de Trabalho (Cap. 3 e 5 do PRD): tela principal do analista, reúne
// tudo em um só lugar — alertas de prazo, links rápidos para os portais,
// e um board das licitações em andamento agrupadas por status.
//
// Rota sugerida: `/mesa-trabalho` (ou `/funcionario`, se for a home do
// perfil funcionário/analista — ajuste conforme suas rotas reais).

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { licitacaoService } from '../../services/licitacaoService';
import {
  Licitacao,
  StatusLicitacao,
  STATUS_LICITACAO_LABEL,
  MODALIDADE_LICITACAO_LABEL,
} from '../../types/licitacao';
import { mockClientesResumo } from '../../data/mockClientesResumo';
import { formatarDataHora, formatarMoeda, classificarUrgenciaPrazo } from '../../utils/prazoUtils';
import { LicitacaoFormModal } from '../admin/licitacoes/LicitacaoFormModal';
import type { LicitacaoFormData } from '../../types/licitacao';

// Troque por `useAuth()` real (ver COMO_INTEGRAR.md) para saber o nome do
// analista logado e filtrar a "carteira própria" automaticamente.
const usuarioAtual = 'Ana';

const COLUNAS: { status: StatusLicitacao; titulo: string }[] = [
  { status: 'pendente', titulo: 'Pendente' },
  { status: 'em_analise', titulo: 'Em Análise' },
  { status: 'enviado', titulo: 'Enviado' },
];

const LINKS_RAPIDOS = [
  { label: 'ComprasNet', url: 'https://www.gov.br/compras/pt-br' },
  { label: 'BEC/SP', url: 'https://www.bec.sp.gov.br' },
  { label: 'Licitações-e (BB)', url: 'https://www.licitacoes-e.com.br' },
  { label: 'PNCP', url: 'https://www.gov.br/pncp' },
  {
    label: 'Tesouro Transparente (CAPAG)',
    url: 'https://www.tesourotransparente.gov.br/temas/estados-e-municipios/capacidade-de-pagamento-capag/',
  },
  { label: 'SIGA Pregão', url: 'https://app.sigapregao.com.br/' },
];

function nomeCliente(clienteId: string): string {
  return mockClientesResumo.find((c) => c.id === clienteId)?.nomeFantasia ?? '—';
}

function progressoChecklist(licitacao: Licitacao): { concluidas: number; total: number } {
  const concluidas = licitacao.checklist.filter((c) => c.concluido).length;
  return { concluidas, total: licitacao.checklist.length };
}

export function MesaDeTrabalhoPage() {
  const [todas, setTodas] = useState<Licitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [apenasMinhas, setApenasMinhas] = useState(true);
  const [licitacaoSelecionada, setLicitacaoSelecionada] = useState<Licitacao | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const itens = await licitacaoService.listarAtivas(apenasMinhas ? usuarioAtual : undefined);
    setTodas(itens);
    setCarregando(false);
  }, [apenasMinhas]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const alertas = useMemo(
    () =>
      todas
        .map((l) => ({ licitacao: l, urgencia: classificarUrgenciaPrazo(l.dataAberturaSessao) }))
        .filter((x) => x.urgencia !== 'ok')
        .sort((a, b) => (a.urgencia === 'vencido' ? -1 : 1)),
    [todas]
  );

  function abrirLicitacao(licitacao: Licitacao) {
    setLicitacaoSelecionada(licitacao);
    setModalAberto(true);
  }

  async function salvar(dados: LicitacaoFormData) {
    if (licitacaoSelecionada) {
      await licitacaoService.atualizar(licitacaoSelecionada.id, dados, usuarioAtual);
    }
    await carregar();
  }

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-paper p-8">
      <header className="mb-6">
        <p className="font-body text-sm capitalize text-ink-soft">{hoje}</p>
        <h1 className="font-display text-2xl text-ink">Mesa de Trabalho</h1>
        <p className="font-body text-sm text-ink-soft">
          Tudo que você precisa para tocar suas licitações, em um só lugar.
        </p>
      </header>

      {/* Alertas de prazo */}
      {alertas.length > 0 && (
        <section className="mb-6 rounded-xl border border-brass/30 bg-brass-pale/60 p-4 shadow-soft">
          <h2 className="mb-3 font-display text-base text-ink">
            ⚠ {alertas.length} licitaç{alertas.length > 1 ? 'ões' : 'ão'} precisando de atenção
          </h2>
          <ul className="space-y-2 font-body text-sm">
            {alertas.map(({ licitacao, urgencia }) => (
              <li
                key={licitacao.id}
                onClick={() => abrirLicitacao(licitacao)}
                className="flex cursor-pointer items-center justify-between rounded-lg bg-white/70 px-3 py-2 hover:bg-white"
              >
                <span>
                  <strong className="text-ink">{licitacao.numeroEdital}</strong>{' '}
                  <span className="text-ink-soft">— {licitacao.orgao}</span>
                </span>
                <span className={urgencia === 'vencido' ? 'font-medium text-red-600' : 'font-medium text-brass'}>
                  {urgencia === 'vencido' ? 'Prazo vencido' : 'Prazo próximo'} · sessão em{' '}
                  {formatarDataHora(licitacao.dataAberturaSessao)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-6 grid grid-cols-3 gap-6">
        {/* Links rápidos */}
        <section className="col-span-1 rounded-xl border border-charcoal-3/10 bg-white p-4 shadow-soft">
          <h2 className="mb-3 font-display text-base text-ink">Links rápidos</h2>
          <ul className="space-y-2 font-body text-sm">
            {LINKS_RAPIDOS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-ink-soft hover:bg-paper-2 hover:text-forest-deep"
                >
                  {link.label}
                  <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Filtro carteira própria */}
        <section className="col-span-2 flex items-center justify-between rounded-xl border border-charcoal-3/10 bg-white p-4 shadow-soft font-body text-sm">
          <div>
            <p className="font-medium text-ink">Visualizando: {apenasMinhas ? `carteira de ${usuarioAtual}` : 'todas as licitações ativas'}</p>
            <p className="text-ink-soft">{todas.length} licitação(ões) em andamento (exclui ganhas/perdidas)</p>
          </div>
          <div className="flex overflow-hidden rounded-md border border-charcoal-3/20">
            <button
              type="button"
              onClick={() => setApenasMinhas(true)}
              className={`px-3 py-1.5 ${apenasMinhas ? 'bg-forest text-paper' : 'bg-white text-ink-soft'}`}
            >
              Minha carteira
            </button>
            <button
              type="button"
              onClick={() => setApenasMinhas(false)}
              className={`px-3 py-1.5 ${!apenasMinhas ? 'bg-forest text-paper' : 'bg-white text-ink-soft'}`}
            >
              Todas
            </button>
          </div>
        </section>
      </div>

      {/* Board por status */}
      {carregando ? (
        <p className="font-body text-sm text-ink-soft">Carregando licitações...</p>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {COLUNAS.map((coluna) => {
            const licitacoesDaColuna = todas.filter((l) => l.status === coluna.status);
            return (
              <div key={coluna.status} className="rounded-xl bg-paper-2/60 p-3">
                <h3 className="mb-3 flex items-center justify-between font-display text-sm text-ink">
                  {coluna.titulo}
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-body text-ink-soft">
                    {licitacoesDaColuna.length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {licitacoesDaColuna.length === 0 && (
                    <p className="rounded-lg border border-dashed border-charcoal-3/20 p-3 text-center font-body text-xs text-ink-soft">
                      Nada por aqui
                    </p>
                  )}
                  {licitacoesDaColuna.map((licitacao) => {
                    const { concluidas, total } = progressoChecklist(licitacao);
                    const urgencia = classificarUrgenciaPrazo(licitacao.dataAberturaSessao);
                    return (
                      <button
                        key={licitacao.id}
                        type="button"
                        onClick={() => abrirLicitacao(licitacao)}
                        className="block w-full rounded-lg border border-charcoal-3/10 bg-white p-3 text-left shadow-soft hover:shadow-card"
                      >
                        <p className="font-body text-sm font-medium text-ink">{licitacao.numeroEdital}</p>
                        <p className="mb-2 font-body text-xs text-ink-soft">
                          {MODALIDADE_LICITACAO_LABEL[licitacao.modalidade]} · {nomeCliente(licitacao.clienteId)}
                        </p>
                        <p className="font-body text-xs text-ink-soft">{formatarMoeda(licitacao.valorEstimado)}</p>
                        <p
                          className={`mt-1 font-body text-xs ${
                            urgencia === 'vencido'
                              ? 'font-medium text-red-600'
                              : urgencia === 'atencao'
                              ? 'font-medium text-brass'
                              : 'text-ink-soft'
                          }`}
                        >
                          Sessão: {formatarDataHora(licitacao.dataAberturaSessao)}
                        </p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-charcoal-3/10">
                          <div
                            className="h-full rounded-full bg-forest"
                            style={{ width: `${total ? (concluidas / total) * 100 : 0}%` }}
                          />
                        </div>
                        <p className="mt-1 font-body text-xs text-ink-soft">
                          Checklist: {concluidas}/{total}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LicitacaoFormModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={salvar}
        licitacaoEmEdicao={licitacaoSelecionada}
      />
    </div>
  );
}
