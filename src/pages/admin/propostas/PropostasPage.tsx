// src/pages/admin/propostas/PropostasPage.tsx
//
// Tela de Orçamentos e Propostas (/admin/propostas). Lista todas as
// propostas do sistema, com filtro por licitação e status. Para abrir o
// formulário a partir de uma licitação específica, veja a seção
// "Ver propostas" sugerida em LicitacoesPage no COMO_INTEGRAR.md.

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StatusBadge, StatusTone } from '../../../components/StatusBadge';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { PropostaFormModal } from './PropostaFormModal';
import { propostaService } from '../../../services/propostaService';
import { licitacaoService } from '../../../services/licitacaoService';
import {
  Proposta,
  PropostaFormData,
  StatusProposta,
  STATUS_PROPOSTA_LABEL,
  calcularTotalProposta,
} from '../../../types/proposta';
import { Licitacao } from '../../../types/licitacao';
import { formatarMoeda, formatarDataHora } from '../../../utils/prazoUtils';

const STATUS_TONE: Record<StatusProposta, StatusTone> = {
  rascunho: 'neutral',
  enviada: 'info',
  aceita: 'success',
  recusada: 'danger',
};

export function PropostasPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroLicitacao, setFiltroLicitacao] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [propostaEmEdicao, setPropostaEmEdicao] = useState<Proposta | null>(null);
  const [licitacaoParaNovaProposta, setLicitacaoParaNovaProposta] = useState<Licitacao | null>(null);
  const [propostaParaExcluir, setPropostaParaExcluir] = useState<Proposta | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [todasPropostas, resultadoLicitacoes] = await Promise.all([
      propostaService.listarTodas(),
      licitacaoService.listar({ pageSize: 1000 }),
    ]);
    setPropostas(todasPropostas);
    setLicitacoes(resultadoLicitacoes.itens);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const licitacaoPorId = useMemo(() => {
    const mapa = new Map<string, Licitacao>();
    licitacoes.forEach((l) => mapa.set(l.id, l));
    return mapa;
  }, [licitacoes]);

  const propostasFiltradas = useMemo(
    () =>
      propostas.filter((p) => {
        if (filtroLicitacao && p.licitacaoId !== filtroLicitacao) return false;
        if (filtroStatus && p.status !== filtroStatus) return false;
        return true;
      }),
    [propostas, filtroLicitacao, filtroStatus]
  );

  function abrirNovaProposta() {
    if (!filtroLicitacao) return;
    const licitacao = licitacaoPorId.get(filtroLicitacao);
    if (!licitacao) return;
    setLicitacaoParaNovaProposta(licitacao);
    setPropostaEmEdicao(null);
    setModalAberto(true);
  }

  function abrirEdicao(proposta: Proposta) {
    const licitacao = licitacaoPorId.get(proposta.licitacaoId);
    if (!licitacao) return;
    setLicitacaoParaNovaProposta(licitacao);
    setPropostaEmEdicao(proposta);
    setModalAberto(true);
  }

  async function salvar(dados: PropostaFormData) {
    if (propostaEmEdicao) {
      await propostaService.atualizar(propostaEmEdicao.id, dados);
    } else {
      await propostaService.criar(dados);
    }
    await carregar();
  }

  async function confirmarExclusao() {
    if (!propostaParaExcluir) return;
    await propostaService.excluir(propostaParaExcluir.id);
    setPropostaParaExcluir(null);
    await carregar();
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Orçamentos e Propostas</h1>
          <p className="font-body text-sm text-ink-soft">
            Cada proposta pertence a uma licitação — selecione uma para criar ou editar.
          </p>
        </div>
        <button
          type="button"
          onClick={abrirNovaProposta}
          disabled={!filtroLicitacao}
          className="rounded-md bg-forest px-4 py-2.5 font-body text-sm font-medium text-paper shadow-soft hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
          title={!filtroLicitacao ? 'Selecione uma licitação no filtro para criar uma proposta' : undefined}
        >
          + Nova proposta
        </button>
      </header>

      <div className="mb-4 flex gap-3 font-body text-sm">
        <select
          value={filtroLicitacao}
          onChange={(e) => setFiltroLicitacao(e.target.value)}
          className="flex-1 rounded-md border border-charcoal-3/20 bg-white px-3 py-2 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
        >
          <option value="">Todas as licitações</option>
          {licitacoes.map((l) => (
            <option key={l.id} value={l.id}>
              {l.numeroEdital} — {l.orgao}
            </option>
          ))}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="rounded-md border border-charcoal-3/20 bg-white px-3 py-2 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_PROPOSTA_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-charcoal-3/10 bg-white shadow-soft">
        <table className="w-full font-body text-sm">
          <thead className="bg-paper-2 text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Licitação</th>
              <th className="px-4 py-3">Valor total</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3">Enviada em</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-3/10">
            {carregando && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                  Carregando propostas...
                </td>
              </tr>
            )}
            {!carregando && propostasFiltradas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                  Nenhuma proposta encontrada.
                </td>
              </tr>
            )}
            {!carregando &&
              propostasFiltradas.map((proposta) => {
                const licitacao = licitacaoPorId.get(proposta.licitacaoId);
                return (
                  <tr key={proposta.id} className="hover:bg-paper-2/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{licitacao?.numeroEdital ?? '—'}</p>
                      <p className="text-xs text-ink-soft">{licitacao?.orgao}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{formatarMoeda(calcularTotalProposta(proposta.itens))}</td>
                    <td className="px-4 py-3 text-ink-soft">{proposta.validadeDias} dias</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {proposta.dataEnvio ? formatarDataHora(proposta.dataEnvio) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={STATUS_PROPOSTA_LABEL[proposta.status]} tone={STATUS_TONE[proposta.status]} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(proposta)}
                        className="mr-3 text-forest-deep hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropostaParaExcluir(proposta)}
                        className="text-red-600 hover:underline"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {licitacaoParaNovaProposta && (
        <PropostaFormModal
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          onSave={salvar}
          licitacaoId={licitacaoParaNovaProposta.id}
          numeroEditalReferencia={licitacaoParaNovaProposta.numeroEdital}
          propostaEmEdicao={propostaEmEdicao}
        />
      )}

      <ConfirmDialog
        isOpen={!!propostaParaExcluir}
        title="Excluir proposta"
        message="Tem certeza que deseja excluir esta proposta? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={confirmarExclusao}
        onCancel={() => setPropostaParaExcluir(null)}
      />
    </div>
  );
}
