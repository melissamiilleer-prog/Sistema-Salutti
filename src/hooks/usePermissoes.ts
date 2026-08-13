// src/hooks/usePermissoes.ts
//
// Ponte entre o usuário logado (useAuth) e as permissões granulares do seu
// cadastro de funcionário (funcionarioService). Centraliza a regra "admin
// sempre tem acesso total" para que nenhuma página/rota precise repeti-la.
//
// SUPABASE: quando a migração acontecer, troca-se apenas a chamada a
// funcionarioService.getById abaixo — o restante do app depende só do
// contrato deste hook.

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { funcionarioService } from '@/services/funcionarioService'
import type { AcaoPermissao, FuncionarioPermissoes, ModuloPermissao } from '@/types/funcionario'
import { clienteIdsPermitidos, temAcaoNoModulo } from '@/utils/permissoes'

/** Restrição de dados pronta para ser espalhada nos filtros de
 *  licitacaoService.listar/listarAtivas. `undefined` = sem restrição
 *  (admin, ou funcionário com modoAcesso 'total'). */
export interface RestricaoDados {
  clienteIds?: string[]
  licitacaoIds?: string[]
}

export function usePermissoes() {
  const { user } = useAuth()
  const [permissoes, setPermissoes] = useState<FuncionarioPermissoes | null>(null)
  const [carregando, setCarregando] = useState(true)

  const ehAdmin = user?.role === 'admin'

  useEffect(() => {
    let ativo = true

    if (!user || user.role !== 'funcionario' || !user.funcionarioId) {
      setPermissoes(null)
      setCarregando(false)
      return
    }

    setCarregando(true)
    funcionarioService.getById(user.funcionarioId).then((funcionario) => {
      if (!ativo) return
      setPermissoes(funcionario?.permissoes ?? null)
      setCarregando(false)
    })

    return () => {
      ativo = false
    }
  }, [user])

  function podeAcessarModulo(modulo: ModuloPermissao, acao: AcaoPermissao = 'visualizar'): boolean {
    if (ehAdmin) return true
    if (!permissoes) return false
    return temAcaoNoModulo(permissoes, modulo, acao)
  }

  /** Pronta para espalhar em licitacaoService.listar({ ...filtros, ...restricaoDados }). */
  const restricaoDados = useMemo<RestricaoDados | undefined>(() => {
    if (ehAdmin || !permissoes) return undefined
    const clienteIds = clienteIdsPermitidos(permissoes)
    if (clienteIds === null) return undefined // modoAcesso 'total'
    return { clienteIds, licitacaoIds: permissoes.licitacoesAtribuidas }
  }, [ehAdmin, permissoes])

  return { permissoes, carregando, ehAdmin, podeAcessarModulo, restricaoDados }
}
