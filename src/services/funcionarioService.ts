import { MOCK_FUNCIONARIOS } from '@/data/mockFuncionarios'
import type { Funcionario, FuncionarioFormData, FuncionarioStatus } from '@/types/funcionario'

/**
 * Camada de serviço do módulo de Funcionários.
 *
 * Segue exatamente o mesmo padrão de `src/services/clienteService.ts`: hoje
 * opera sobre um array em memória (`funcionarios`), simulando uma tabela de
 * banco de dados e uma latência de rede real.
 *
 * Futuramente (Supabase): trocar o corpo de cada método por chamadas ao
 * client do Supabase, mantendo a mesma assinatura:
 *   - list()   -> supabase.from('funcionarios').select('*', { count: 'exact' })
 *                  .ilike(...) .eq('acesso->>status', ...) .range(from, to)
 *   - getById() -> supabase.from('funcionarios').select('*').eq('id', id).single()
 *   - create() -> supabase.from('funcionarios').insert(...).select().single()
 *                  + supabase.auth.admin.createUser({ email, password })
 *                    para os campos da aba "Acesso ao Sistema"
 *   - update() -> supabase.from('funcionarios').update(...).eq('id', id)
 *   - remove() -> supabase.from('funcionarios').delete().eq('id', id)
 * Nenhum outro arquivo (página, tabela, formulário) precisa mudar, pois
 * todos dependem apenas dos tipos definidos em src/types/funcionario.ts.
 */

/** "Tabela" em memória — reinicia a cada reload da página. */
const funcionarios: Funcionario[] = [...MOCK_FUNCIONARIOS]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function gerarId(): string {
  return `func-${Math.random().toString(36).slice(2, 10)}`
}

export interface FuncionarioListParams {
  search?: string
  status?: FuncionarioStatus | 'todos'
  page: number
  pageSize: number
}

export interface FuncionarioListResult {
  data: Funcionario[]
  total: number
}

function correspondeABusca(funcionario: Funcionario, termoBusca: string): boolean {
  const termo = termoBusca.trim().toLowerCase()
  if (!termo) return true

  return (
    funcionario.pessoal.nomeCompleto.toLowerCase().includes(termo) ||
    funcionario.pessoal.email.toLowerCase().includes(termo) ||
    funcionario.cargo.cargo.toLowerCase().includes(termo)
  )
}

export const funcionarioService = {
  async list(params: FuncionarioListParams): Promise<FuncionarioListResult> {
    await delay(350)

    const { search = '', status = 'todos', page, pageSize } = params

    const filtrados = funcionarios.filter((funcionario) => {
      const statusOk = status === 'todos' || funcionario.acesso.status === status
      return statusOk && correspondeABusca(funcionario, search)
    })

    const ordenados = [...filtrados].sort((a, b) =>
      a.pessoal.nomeCompleto.localeCompare(b.pessoal.nomeCompleto, 'pt-BR')
    )

    const inicio = (page - 1) * pageSize
    const pagina = ordenados.slice(inicio, inicio + pageSize)

    return { data: pagina, total: filtrados.length }
  },

  async getById(id: string): Promise<Funcionario | null> {
    await delay(200)
    return funcionarios.find((f) => f.id === id) ?? null
  },

  async create(formData: FuncionarioFormData): Promise<Funcionario> {
    await delay(400)

    const agora = new Date().toISOString()
    const novoFuncionario: Funcionario = {
      id: gerarId(),
      pessoal: { ...formData.pessoal },
      cargo: { ...formData.cargo },
      acesso: { ...formData.acesso },
      permissoes: {
        modoAcesso: formData.permissoes.modoAcesso,
        clientesVinculados: [...formData.permissoes.clientesVinculados],
        licitacoesAtribuidas: [...formData.permissoes.licitacoesAtribuidas],
        modulos: {
          clientes: [...formData.permissoes.modulos.clientes],
          funcionarios: [...formData.permissoes.modulos.funcionarios],
          licitacoes: [...formData.permissoes.modulos.licitacoes],
          disputas: [...formData.permissoes.modulos.disputas],
          relatorios: [...formData.permissoes.modulos.relatorios],
          configuracoes: [...formData.permissoes.modulos.configuracoes],
        },
      },
      observacoesAdministrativas: formData.observacoesAdministrativas,
      historico: [
        {
          id: `hist-${Math.random().toString(36).slice(2, 10)}`,
          data: agora,
          autor: 'Administrador',
          descricao: 'Cadastro inicial do funcionário.',
        },
      ],
      criadoEm: agora,
      atualizadoEm: agora,
    }

    // NOTA (Supabase): aqui entraria supabase.auth.admin.createUser({
    //   email: formData.acesso.emailLogin, password: formData.senhaTemporaria,
    // }) antes de gravar o registro em `funcionarios`.
    funcionarios.unshift(novoFuncionario)
    return novoFuncionario
  },

  async update(id: string, formData: FuncionarioFormData): Promise<Funcionario> {
    await delay(400)

    const index = funcionarios.findIndex((f) => f.id === id)
    if (index === -1) {
      throw new Error('Funcionário não encontrado.')
    }

    const anterior = funcionarios[index]
    const novaEntradaHistorico = {
      id: `hist-${Math.random().toString(36).slice(2, 10)}`,
      data: new Date().toISOString(),
      autor: 'Administrador',
      descricao: formData.senhaTemporaria
        ? 'Dados atualizados e senha redefinida.'
        : 'Dados do cadastro atualizados.',
    }

    const atualizado: Funcionario = {
      ...anterior,
      pessoal: { ...formData.pessoal },
      cargo: { ...formData.cargo },
      acesso: { ...formData.acesso },
      permissoes: {
        modoAcesso: formData.permissoes.modoAcesso,
        clientesVinculados: [...formData.permissoes.clientesVinculados],
        licitacoesAtribuidas: [...formData.permissoes.licitacoesAtribuidas],
        modulos: {
          clientes: [...formData.permissoes.modulos.clientes],
          funcionarios: [...formData.permissoes.modulos.funcionarios],
          licitacoes: [...formData.permissoes.modulos.licitacoes],
          disputas: [...formData.permissoes.modulos.disputas],
          relatorios: [...formData.permissoes.modulos.relatorios],
          configuracoes: [...formData.permissoes.modulos.configuracoes],
        },
      },
      observacoesAdministrativas: formData.observacoesAdministrativas,
      historico: [...anterior.historico, novaEntradaHistorico],
      atualizadoEm: novaEntradaHistorico.data,
    }

    // NOTA (Supabase): se formData.senhaTemporaria vier preenchida aqui,
    // significa reset de senha -> supabase.auth.admin.updateUserById(...).
    funcionarios[index] = atualizado
    return atualizado
  },

  async remove(id: string): Promise<void> {
    await delay(300)
    const index = funcionarios.findIndex((f) => f.id === id)
    if (index !== -1) {
      funcionarios.splice(index, 1)
    }
  },

  /** Verifica se já existe outro funcionário com o mesmo e-mail de login
   *  (usado na validação do formulário, equivalente ao cnpjJaCadastrado de Clientes). */
  async emailLoginJaCadastrado(email: string, ignorarId?: string): Promise<boolean> {
    await delay(150)
    const alvo = email.trim().toLowerCase()
    return funcionarios.some(
      (f) => f.id !== ignorarId && f.acesso.emailLogin.trim().toLowerCase() === alvo
    )
  },
}
