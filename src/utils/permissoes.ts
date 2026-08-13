// src/utils/permissoes.ts
//
// Funções puras para aplicar as permissões granulares de um funcionário
// (src/types/funcionario.ts) — não dependem de React nem de estado, para
// serem testáveis isoladamente e reutilizáveis tanto em hooks quanto nos
// services. O Administrador NUNCA passa por aqui: ele tem acesso total por
// definição de perfil (checado antes, em usePermissoes/ProtectedRoute).

import type { AcaoPermissao, FuncionarioPermissoes, ModuloPermissao } from '@/types/funcionario'

/** Um funcionário tem a ação liberada em um módulo se ela estiver na lista
 *  daquele módulo. 'editar' concedido implica 'visualizar' (não faz sentido
 *  editar algo que não se pode ver). */
export function temAcaoNoModulo(
  permissoes: FuncionarioPermissoes,
  modulo: ModuloPermissao,
  acao: AcaoPermissao = 'visualizar'
): boolean {
  const acoes = permissoes.modulos[modulo]
  if (acoes.includes(acao)) return true
  if (acao === 'visualizar' && acoes.includes('editar')) return true
  return false
}

/** Ids de cliente que o funcionário pode enxergar. Em modo 'total' retorna
 *  `null`, que deve ser interpretado como "sem restrição" (todos). */
export function clienteIdsPermitidos(permissoes: FuncionarioPermissoes): string[] | null {
  if (permissoes.modoAcesso === 'total') return null
  return permissoes.clientesVinculados
}

/** Uma licitação é visível ao funcionário se o cliente dela estiver entre os
 *  clientes vinculados, OU se a própria licitação estiver diretamente
 *  atribuída (caso de exceção pontual, ex.: cobrir férias de um colega). */
export function licitacaoEhPermitida(
  permissoes: FuncionarioPermissoes,
  licitacao: { id: string; clienteId: string }
): boolean {
  if (permissoes.modoAcesso === 'total') return true
  return (
    permissoes.clientesVinculados.includes(licitacao.clienteId) ||
    permissoes.licitacoesAtribuidas.includes(licitacao.id)
  )
}

export function filtrarLicitacoesPorPermissao<T extends { id: string; clienteId: string }>(
  licitacoes: T[],
  permissoes: FuncionarioPermissoes
): T[] {
  if (permissoes.modoAcesso === 'total') return licitacoes
  return licitacoes.filter((l) => licitacaoEhPermitida(permissoes, l))
}
