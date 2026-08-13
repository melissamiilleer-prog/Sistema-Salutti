// src/services/licitacaoService.ts
//
// Camada isolada de acesso a dados de Licitações — segue exatamente o
// mesmo espírito de `authService.ts` / `clienteService.ts` /
// `funcionarioService.ts`: hoje lê/escreve em `localStorage` a partir do
// mock em `data/mockLicitacoes.ts`; no futuro, ESTE é o único arquivo que
// precisa mudar para integrar com Supabase/PostgreSQL (ver comentários
// "SUPABASE:" abaixo em cada função).
//
// Nenhuma tela deve importar `mockLicitacoes.ts` diretamente — sempre
// passe por este service, para a troca futura ser transparente.

import { Licitacao, LicitacaoFormData } from '../types/licitacao';
import { mockLicitacoes } from '../data/mockLicitacoes';

const STORAGE_KEY = 'salutti:licitacoes';

function lerStorage(): Licitacao[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockLicitacoes));
    return mockLicitacoes;
  }
  try {
    return JSON.parse(raw) as Licitacao[];
  } catch {
    return mockLicitacoes;
  }
}

function salvarStorage(licitacoes: Licitacao[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(licitacoes));
}

function gerarId(): string {
  return `lic-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function simularLatencia<T>(valor: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), ms));
}

export interface FiltroLicitacoes {
  busca?: string; // número do pregão, órgão ou objeto
  status?: string;
  page?: number;
  pageSize?: number;
  // Permissões granulares (ver src/hooks/usePermissoes.ts): quando informados,
  // restringe às licitações desses clientes OU explicitamente atribuídas.
  // Deixar undefined = sem restrição (comportamento atual, usado por admins
  // e por funcionários com modoAcesso 'total').
  clienteIds?: string[];
  licitacaoIds?: string[];
}

function aplicarRestricaoPermissao(
  itens: Licitacao[],
  clienteIds?: string[],
  licitacaoIds?: string[]
): Licitacao[] {
  if (!clienteIds && !licitacaoIds) return itens;
  return itens.filter(
    (l) => (clienteIds?.includes(l.clienteId) ?? false) || (licitacaoIds?.includes(l.id) ?? false)
  );
}

export interface ResultadoPaginado<T> {
  itens: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const licitacaoService = {
  // SUPABASE: trocar por
  //   supabase.from('licitacoes').select('*, cliente:clientes(*)')
  //   com .ilike / .eq para busca e filtro, e .range() para paginação.
  async listar(filtro: FiltroLicitacoes = {}): Promise<ResultadoPaginado<Licitacao>> {
    const { busca = '', status = '', page = 1, pageSize = 10, clienteIds, licitacaoIds } = filtro;
    let itens = lerStorage();
    itens = aplicarRestricaoPermissao(itens, clienteIds, licitacaoIds);

    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      itens = itens.filter(
        (l) =>
          l.numeroPregao.toLowerCase().includes(termo) ||
          l.orgao.toLowerCase().includes(termo) ||
          l.objeto.toLowerCase().includes(termo)
      );
    }

    if (status) {
      itens = itens.filter((l) => l.status === status);
    }

    itens = [...itens].sort(
      (a, b) => new Date(a.dataLicitacao).getTime() - new Date(b.dataLicitacao).getTime()
    );

    const total = itens.length;
    const start = (page - 1) * pageSize;
    const pagina = itens.slice(start, start + pageSize);

    return simularLatencia({ itens: pagina, total, page, pageSize });
  },

  // Usado pelo Portal do Cliente: todas as licitações de um cliente
  // específico, sem paginação, mais recentes primeiro.
  // SUPABASE: trocar por supabase.from('licitacoes').select('*').eq('cliente_id', clienteId)
  async listarPorCliente(clienteId: string): Promise<Licitacao[]> {
    const itens = lerStorage().filter((l) => l.clienteId === clienteId);
    return simularLatencia(
      [...itens].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
    );
  },

  // Todas as licitações ainda em andamento (exclui 'ganho'/'perdido'), sem
  // paginação, ordenadas pela sessão mais próxima primeiro.
  // SUPABASE: trocar por
  //   supabase.from('licitacoes').select('*').not('status', 'in', '(ganho,perdido)')
  async listarAtivas(restricao: { clienteIds?: string[]; licitacaoIds?: string[] } = {}): Promise<Licitacao[]> {
    let itens = lerStorage().filter((l) => l.status !== 'ganho' && l.status !== 'perdido');
    itens = aplicarRestricaoPermissao(itens, restricao.clienteIds, restricao.licitacaoIds);
    return simularLatencia(
      [...itens].sort((a, b) => new Date(a.dataLicitacao).getTime() - new Date(b.dataLicitacao).getTime())
    );
  },

  // SUPABASE: trocar por supabase.from('licitacoes').select('*').eq('id', id).single()
  async buscarPorId(id: string): Promise<Licitacao | null> {
    const itens = lerStorage();
    return simularLatencia(itens.find((l) => l.id === id) ?? null);
  },

  // SUPABASE: trocar por supabase.from('licitacoes').insert(payload).select().single()
  async criar(dados: LicitacaoFormData, usuario: string): Promise<Licitacao> {
    const itens = lerStorage();
    const agora = new Date().toISOString();

    const nova: Licitacao = {
      ...dados,
      id: gerarId(),
      historico: [
        { id: `h-${Date.now()}`, data: agora, usuario, acao: 'Licitação cadastrada no sistema' },
      ],
      criadoEm: agora,
      atualizadoEm: agora,
    };

    const atualizado = [...itens, nova];
    salvarStorage(atualizado);
    return simularLatencia(nova);
  },

  // SUPABASE: trocar por supabase.from('licitacoes').update(payload).eq('id', id).select().single()
  async atualizar(id: string, dados: Partial<LicitacaoFormData>, usuario: string): Promise<Licitacao> {
    const itens = lerStorage();
    const index = itens.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Licitação não encontrada');

    const agora = new Date().toISOString();
    const anterior = itens[index];
    const atualizada: Licitacao = {
      ...anterior,
      ...dados,
      historico: [
        ...anterior.historico,
        { id: `h-${Date.now()}`, data: agora, usuario, acao: 'Dados da licitação atualizados' },
      ],
      atualizadoEm: agora,
    };

    itens[index] = atualizada;
    salvarStorage(itens);
    return simularLatencia(atualizada);
  },

  // SUPABASE: trocar por supabase.from('licitacoes').update({ status }).eq('id', id)
  async atualizarStatus(id: string, status: Licitacao['status'], usuario: string): Promise<Licitacao> {
    return this.atualizar(id, { status }, usuario);
  },

  // SUPABASE: trocar por supabase.from('licitacoes').update({ decisao_cliente, motivo_recusa_cliente, cobrar_frete, percentual_frete }).eq('id', id)
  // Chamado pelo Portal do Cliente (spec 2.3 / 6.2 — botões "Quero Participar" / "Não vou participar").
  async registrarDecisaoCliente(
    id: string,
    decisao: 'participar' | 'recusar',
    nomeCliente: string,
    opcoes: { motivoRecusa?: string; cobrarFrete?: boolean; percentualFrete?: number } = {}
  ): Promise<Licitacao> {
    const agora = new Date().toISOString();
    const acao =
      decisao === 'participar'
        ? 'Cliente confirmou participação nesta licitação'
        : `Cliente recusou participar${opcoes.motivoRecusa ? ` — motivo: ${opcoes.motivoRecusa}` : ''}`;

    const atualizada = await this.atualizar(
      id,
      {
        decisaoCliente: decisao,
        decisaoClienteEm: agora,
        motivoRecusaCliente: decisao === 'recusar' ? opcoes.motivoRecusa : undefined,
        cobrarFrete: opcoes.cobrarFrete ?? false,
        percentualFrete: opcoes.cobrarFrete ? opcoes.percentualFrete : undefined,
      },
      nomeCliente
    );

    // sobrescreve a última entrada genérica do histórico ("Dados da licitação
    // atualizados") com uma mensagem mais clara para essa ação específica
    const itens = lerStorage();
    const index = itens.findIndex((l) => l.id === id);
    if (index !== -1) {
      const historico = [...itens[index].historico];
      historico[historico.length - 1] = { ...historico[historico.length - 1], acao };
      itens[index] = { ...itens[index], historico };
      salvarStorage(itens);
      return itens[index];
    }
    return atualizada;
  },

  // SUPABASE: trocar por supabase.from('licitacoes').delete().eq('id', id)
  async excluir(id: string): Promise<void> {
    const itens = lerStorage().filter((l) => l.id !== id);
    salvarStorage(itens);
    return simularLatencia(undefined);
  },
};
