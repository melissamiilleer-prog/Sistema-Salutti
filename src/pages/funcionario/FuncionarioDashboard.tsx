// src/pages/funcionario/FuncionarioDashboard.tsx
//
// Painel do Funcionário — visão de trabalho do dia a dia da equipe interna
// da Salutti (spec 2.2: cadastra licitações, acompanha prazos, altera a
// data de retorno do cliente). Mostra as licitações ativas (não
// finalizadas) de toda a carteira — diferente do Portal do Cliente, que só
// mostra as de um cliente — com destaque para prazos vencendo e decisões
// de cliente pendentes, e atalhos para os mesmos módulos operacionais que
// o Administrador usa (Licitações, Disputas, Relatórios — agora também
// liberados para o perfil Funcionário no App.tsx).
//
// NOTA DE ESCOPO: a spec também prevê que o admin possa restringir cada
// funcionário a clientes/permissões específicas ("acesso total ou
// restrito"), mas esse sistema de permissões granulares ainda não existe
// no cadastro de funcionários — por ora, todo funcionário vê a carteira
// inteira, igual ao administrador.

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardShell, StatCard } from '@/components/DashboardShell'
import { useAuth } from '@/context/AuthContext'
import { StatusPill, StatusTone } from '@/components/StatusPill'
import { licitacaoService } from '@/services/licitacaoService'
import {
  Licitacao,
  StatusLicitacao,
  STATUS_LICITACAO_LABEL,
  DECISAO_CLIENTE_LABEL,
} from '@/types/licitacao'
import { mockClientesResumo } from '@/data/mockClientesResumo'
import { formatarDataHora, classificarUrgenciaPrazo } from '@/utils/prazoUtils'

const STATUS_TONE: Record<StatusLicitacao, StatusTone> = {
  pendente: 'neutral',
  em_analise: 'info',
  enviado: 'warning',
  ganho: 'success',
  perdido: 'danger',
}

function nomeCliente(clienteId: string): string {
  return mockClientesResumo.find((c) => c.id === clienteId)?.nomeFantasia ?? '—'
}

export function FuncionarioDashboard() {
  const { user } = useAuth()
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    licitacaoService.listarAtivas().then((itens) => {
      if (ativo) {
        setLicitacoes(itens)
        setCarregando(false)
      }
    })
    return () => {
      ativo = false
    }
  }, [])

  const comPrazoUrgente = useMemo(
    () =>
      licitacoes.filter((l) => {
        const urgencia = classificarUrgenciaPrazo(l.dataEfetivaLicitacao || l.dataLicitacao)
        return urgencia === 'vencido' || urgencia === 'atencao'
      }),
    [licitacoes]
  )

  const aguardandoCliente = useMemo(
    () => licitacoes.filter((l) => l.decisaoCliente === 'pendente'),
    [licitacoes]
  )

  return (
    <DashboardShell
      title={`Olá, ${user?.name ?? 'Funcionário'}`}
      subtitle="Licitações ativas da carteira — acompanhe prazos e decisões pendentes dos clientes."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Licitações ativas" value={String(licitacoes.length)} />
        <StatCard
          label="Prazos vencidos ou próximos"
          value={String(comPrazoUrgente.length)}
          hint={comPrazoUrgente.length > 0 ? 'Confira a lista abaixo' : undefined}
        />
        <StatCard label="Aguardando decisão do cliente" value={String(aguardandoCliente.length)} />
      </div>

      <div className="mt-8 rounded-xl border border-ink-soft/10 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-forest-deep">Área do funcionário</h2>
        <p className="mt-2 font-body text-sm text-ink-soft">
          Cadastro de Clientes e de Funcionários são exclusivos do perfil <strong>Administrador</strong>.
          Licitações, Disputas e Relatórios você já pode acessar normalmente.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            to="/admin/licitacoes"
            className="inline-flex w-fit items-center gap-1.5 font-body text-sm font-semibold text-forest hover:underline"
          >
            Ir para Licitações →
          </Link>
          <Link
            to="/admin/disputas"
            className="inline-flex w-fit items-center gap-1.5 font-body text-sm font-semibold text-forest hover:underline"
          >
            Ir para Disputas →
          </Link>
          <Link
            to="/admin/relatorios"
            className="inline-flex w-fit items-center gap-1.5 font-body text-sm font-semibold text-forest hover:underline"
          >
            Ir para Relatórios →
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-forest-deep">Licitações ativas</h2>

        {carregando && (
          <div className="rounded-xl border border-ink-soft/10 bg-white p-6 text-center font-body text-sm text-ink-soft shadow-soft">
            Carregando...
          </div>
        )}

        {!carregando && licitacoes.length === 0 && (
          <div className="rounded-xl border border-ink-soft/10 bg-white p-6 text-center font-body text-sm text-ink-soft shadow-soft">
            Nenhuma licitação ativa no momento.
          </div>
        )}

        {!carregando && licitacoes.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-ink-soft/10 bg-white shadow-soft">
            <table className="w-full font-body text-sm">
              <thead className="bg-paper-2 text-left text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Pregão</th>
                  <th className="px-4 py-3">Órgão</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Sessão</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Decisão do cliente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-3/10">
                {licitacoes.map((licitacao) => {
                  const dataReferencia = licitacao.dataEfetivaLicitacao || licitacao.dataLicitacao
                  const urgencia = classificarUrgenciaPrazo(dataReferencia)
                  return (
                    <tr key={licitacao.id} className="hover:bg-paper-2/60">
                      <td className="px-4 py-3 font-medium text-ink">{licitacao.numeroPregao}</td>
                      <td className="px-4 py-3 text-ink-soft">{licitacao.orgao}</td>
                      <td className="px-4 py-3 text-ink-soft">{nomeCliente(licitacao.clienteId)}</td>
                      <td className="px-4 py-3 text-ink-soft">
                        {formatarDataHora(dataReferencia)}
                        {urgencia === 'vencido' && <span className="ml-2 text-xs font-medium text-red-600">⚠ vencido</span>}
                        {urgencia === 'atencao' && <span className="ml-2 text-xs font-medium text-brass">⚠ próximo</span>}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill label={STATUS_LICITACAO_LABEL[licitacao.status]} tone={STATUS_TONE[licitacao.status]} />
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{DECISAO_CLIENTE_LABEL[licitacao.decisaoCliente]}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
