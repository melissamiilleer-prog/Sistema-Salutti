// src/pages/admin/licitacoes/LicitacoesPage.tsx
//
// Tela principal do módulo de Licitações (/admin/licitacoes), no mesmo
// padrão de ClientesPage / FuncionariosPage: listagem com busca, filtro por
// status, paginação, e modal de formulário para criar/editar.
//
// Depende de `useAuth()` (de `AuthContext`, já existente no projeto) só
// para saber o nome do usuário logado e registrar no histórico.

import React, { useEffect, useState, useCallback } from 'react';
import { Pagination } from '../../../components/Pagination';
import { StatusBadge, StatusTone } from '../../../components/StatusBadge';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { LicitacaoFormModal } from './LicitacaoFormModal';
import {
  licitacaoService,
} from '../../../services/licitacaoService';
import {
  Licitacao,
  LicitacaoFormData,
  StatusLicitacao,
  STATUS_LICITACAO_LABEL,
  MODALIDADE_LICITACAO_LABEL,
} from '../../../types/licitacao';
import { mockClientesResumo } from '../../../data/mockClientesResumo';
import { formatarDataHora, formatarMoeda, classificarUrgenciaPrazo } from '../../../utils/prazoUtils';

// Se `useAuth` já existir em `src/context/AuthContext.tsx`, troque esta
// linha por: `import { useAuth } from '../../../context/AuthContext';`
// e substitua `usuarioAtual` abaixo por `useAuth().user?.nome`.
const usuarioAtual = 'Usuário atual';

const STATUS_TONE: Record<StatusLicitacao, StatusTone> = {
  pendente: 'neutral',
  em_analise: 'info',
  enviado: 'warning',
  ganho: 'success',
  perdido: 'danger',
};

const PAGE_SIZE = 8;

export function LicitacoesPage() {
  const [itens, setItens] = useState<Licitacao[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [licitacaoEmEdicao, setLicitacaoEmEdicao] = useState<Licitacao | null>(null);
  const [licitacaoParaExcluir, setLicitacaoParaExcluir] = useState<Licitacao | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const resultado = await licitacaoService.listar({
      busca,
      status: statusFiltro,
      page,
      pageSize: PAGE_SIZE,
    });
    setItens(resultado.itens);
    setTotal(resultado.total);
    setCarregando(false);
  }, [busca, statusFiltro, page]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function abrirNova() {
    setLicitacaoEmEdicao(null);
    setModalAberto(true);
  }

  function abrirEdicao(licitacao: Licitacao) {
    setLicitacaoEmEdicao(licitacao);
    setModalAberto(true);
  }

  async function salvar(dados: LicitacaoFormData) {
    if (licitacaoEmEdicao) {
      await licitacaoService.atualizar(licitacaoEmEdicao.id, dados, usuarioAtual);
    } else {
      await licitacaoService.criar(dados, usuarioAtual);
    }
    await carregar();
  }

  async function confirmarExclusao() {
    if (!licitacaoParaExcluir) return;
    await licitacaoService.excluir(licitacaoParaExcluir.id);
    setLicitacaoParaExcluir(null);
    await carregar();
  }

  function nomeCliente(clienteId: string): string {
    return mockClientesResumo.find((c) => c.id === clienteId)?.nomeFantasia ?? '—';
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Licitações</h1>
          <p className="font-body text-sm text-ink-soft">
            Cadastro e acompanhamento de todas as licitações em andamento.
          </p>
        </div>
        <button
          type="button"
          onClick={abrirNova}
          className="rounded-md bg-forest px-4 py-2.5 font-body text-sm font-medium text-paper shadow-soft hover:bg-forest-deep"
        >
          + Nova licitação
        </button>
      </header>

      <div className="mb-4 flex gap-3 font-body text-sm">
        <input
          value={busca}
          onChange={(e) => {
            setPage(1);
            setBusca(e.target.value);
          }}
          placeholder="Buscar por número do edital, órgão ou objeto..."
          className="flex-1 rounded-md border border-charcoal-3/20 bg-white px-3 py-2 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
        />
        <select
          value={statusFiltro}
          onChange={(e) => {
            setPage(1);
            setStatusFiltro(e.target.value);
          }}
          className="rounded-md border border-charcoal-3/20 bg-white px-3 py-2 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LICITACAO_LABEL).map(([value, label]) => (
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
              <th className="px-4 py-3">Edital</th>
              <th className="px-4 py-3">Órgão</th>
              <th className="px-4 py-3">Modalidade</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Sessão</th>
              <th className="px-4 py-3">Valor estimado</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-3/10">
            {carregando && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-ink-soft">
                  Carregando licitações...
                </td>
              </tr>
            )}

            {!carregando && itens.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-ink-soft">
                  Nenhuma licitação encontrada.
                </td>
              </tr>
            )}

            {!carregando &&
              itens.map((licitacao) => {
                const urgencia = classificarUrgenciaPrazo(licitacao.dataAberturaSessao);
                return (
                  <tr key={licitacao.id} className="hover:bg-paper-2/60">
                    <td className="px-4 py-3 font-medium text-ink">{licitacao.numeroEdital}</td>
                    <td className="px-4 py-3 text-ink-soft">{licitacao.orgao}</td>
                    <td className="px-4 py-3 text-ink-soft">{MODALIDADE_LICITACAO_LABEL[licitacao.modalidade]}</td>
                    <td className="px-4 py-3 text-ink-soft">{nomeCliente(licitacao.clienteId)}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {formatarDataHora(licitacao.dataAberturaSessao)}
                      {urgencia === 'vencido' && (
                        <span className="ml-2 text-xs font-medium text-red-600">⚠ vencido</span>
                      )}
                      {urgencia === 'atencao' && (
                        <span className="ml-2 text-xs font-medium text-brass">⚠ prazo próximo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{formatarMoeda(licitacao.valorEstimado)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={STATUS_LICITACAO_LABEL[licitacao.status]} tone={STATUS_TONE[licitacao.status]} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(licitacao)}
                        className="mr-3 text-forest-deep hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setLicitacaoParaExcluir(licitacao)}
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

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      </div>

      <LicitacaoFormModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={salvar}
        licitacaoEmEdicao={licitacaoEmEdicao}
      />

      <ConfirmDialog
        isOpen={!!licitacaoParaExcluir}
        title="Excluir licitação"
        message={`Tem certeza que deseja excluir a licitação "${licitacaoParaExcluir?.numeroEdital}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        onConfirm={confirmarExclusao}
        onCancel={() => setLicitacaoParaExcluir(null)}
      />
    </div>
  );
}
