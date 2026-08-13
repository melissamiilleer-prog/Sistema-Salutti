import type { Funcionario } from '@/types/funcionario'

/**
 * Funcionários mockados para desenvolvimento do módulo, sem backend real.
 *
 * IMPORTANTE: este arquivo simula uma tabela de funcionários apenas para a
 * fase atual. Na integração futura com Supabase, ele deixa de ser
 * importado — `funcionarioService` passa a consultar a tabela
 * `funcionarios` (ver comentários em src/services/funcionarioService.ts).
 */
export const MOCK_FUNCIONARIOS: Funcionario[] = [
  {
    id: 'func-0001',
    pessoal: {
      nomeCompleto: 'Administrador Salutti',
      cpf: '123.456.789-09',
      dataNascimento: '1985-03-12',
      telefone: '(11) 3333-0001',
      whatsapp: '(11) 98888-0001',
      email: 'admin@salutti.com',
    },
    cargo: {
      cargo: 'Diretor Executivo',
      departamento: 'Diretoria',
      dataAdmissao: '2019-01-15',
      observacoes: 'Sócio-fundador da empresa.',
    },
    acesso: {
      emailLogin: 'admin@salutti.com',
      perfil: 'admin',
      status: 'ativo',
      forcarTrocaSenha: false,
    },
    permissoes: {
      // Administrador: 'modoAcesso'/'modulos' abaixo não têm efeito prático
      // (o perfil admin sempre tem acesso total — ver usePermissoes), mas
      // ficam preenchidos por consistência do cadastro.
      modoAcesso: 'total',
      clientesVinculados: ['cli-0001', 'cli-0002', 'cli-0003', 'cli-0004', 'cli-0005', 'cli-0006'],
      licitacoesAtribuidas: [],
      modulos: {
        clientes: ['visualizar', 'editar'],
        funcionarios: ['visualizar', 'editar'],
        licitacoes: ['visualizar', 'editar'],
        disputas: ['visualizar', 'editar'],
        relatorios: ['visualizar', 'editar'],
        configuracoes: ['visualizar', 'editar'],
      },
    },
    observacoesAdministrativas: '',
    historico: [
      {
        id: 'hist-0001-1',
        data: '2019-01-15T09:00:00.000Z',
        autor: 'Sistema',
        descricao: 'Cadastro inicial do funcionário.',
      },
    ],
    criadoEm: '2019-01-15T09:00:00.000Z',
    atualizadoEm: '2025-01-10T11:00:00.000Z',
  },
  {
    id: 'func-0002',
    pessoal: {
      nomeCompleto: 'Funcionário Salutti',
      cpf: '234.567.890-19',
      dataNascimento: '1992-07-24',
      telefone: '(11) 3333-0002',
      whatsapp: '(11) 97777-0002',
      email: 'funcionario@salutti.com',
    },
    cargo: {
      cargo: 'Analista de Licitações',
      departamento: 'Licitações',
      dataAdmissao: '2021-06-01',
      observacoes: '',
    },
    acesso: {
      emailLogin: 'funcionario@salutti.com',
      perfil: 'funcionario',
      status: 'ativo',
      forcarTrocaSenha: false,
    },
    permissoes: {
      // Exemplo de acesso RESTRITO: só enxerga licitações/disputas/relatórios
      // dos clientes cli-001 (Horizonte Engenharia) e cli-004 (TechLimp),
      // mais a licitação lic-002 (Vetor Segurança) atribuída pontualmente
      // fora da carteira vinculada. Faça login como funcionario@salutti.com
      // para ver o efeito (comparar com a carteira completa vista pelo
      // Administrador). IDs conferidos contra mockLicitacoes.ts/
      // mockClientesResumo.ts — que é a base real usada pelas telas de
      // Licitações/Disputas/Relatórios (não confundir com os ids de
      // mockClientes.ts, do módulo de Clientes, que usam outra numeração).
      modoAcesso: 'restrito',
      clientesVinculados: ['cli-001', 'cli-004'],
      licitacoesAtribuidas: ['lic-002'],
      modulos: {
        clientes: [],
        funcionarios: [],
        licitacoes: ['visualizar', 'editar'],
        disputas: ['visualizar', 'editar'],
        relatorios: ['visualizar'],
        configuracoes: [],
      },
    },
    observacoesAdministrativas: '',
    historico: [
      {
        id: 'hist-0002-1',
        data: '2021-06-01T09:00:00.000Z',
        autor: 'Administrador Salutti',
        descricao: 'Cadastro inicial do funcionário.',
      },
      {
        id: 'hist-0002-2',
        data: '2023-02-14T14:30:00.000Z',
        autor: 'Administrador Salutti',
        descricao: 'Vinculado à carteira de clientes do departamento de Licitações.',
      },
    ],
    criadoEm: '2021-06-01T09:00:00.000Z',
    atualizadoEm: '2025-08-05T16:15:00.000Z',
  },
  {
    id: 'func-0003',
    pessoal: {
      nomeCompleto: 'Beatriz Camargo Nogueira',
      cpf: '345.678.901-28',
      dataNascimento: '1990-11-02',
      telefone: '(11) 3333-0003',
      whatsapp: '(11) 96666-0003',
      email: 'beatriz.nogueira@salutti.com',
    },
    cargo: {
      cargo: 'Analista Financeira',
      departamento: 'Financeiro',
      dataAdmissao: '2022-03-10',
      observacoes: '',
    },
    acesso: {
      emailLogin: 'beatriz.nogueira@salutti.com',
      perfil: 'funcionario',
      status: 'ativo',
      forcarTrocaSenha: false,
    },
    permissoes: {
      modoAcesso: 'total',
      clientesVinculados: [],
      licitacoesAtribuidas: [],
      modulos: {
        clientes: [],
        funcionarios: [],
        licitacoes: ['visualizar'],
        disputas: [],
        relatorios: ['visualizar'],
        configuracoes: [],
      },
    },
    observacoesAdministrativas: '',
    historico: [
      {
        id: 'hist-0003-1',
        data: '2022-03-10T09:00:00.000Z',
        autor: 'Administrador Salutti',
        descricao: 'Cadastro inicial do funcionário.',
      },
    ],
    criadoEm: '2022-03-10T09:00:00.000Z',
    atualizadoEm: '2025-03-01T10:00:00.000Z',
  },
  {
    id: 'func-0004',
    pessoal: {
      nomeCompleto: 'Thiago Almeida Ferraz',
      cpf: '456.789.012-37',
      dataNascimento: '1988-05-19',
      telefone: '(11) 3333-0004',
      whatsapp: '(11) 95555-0004',
      email: 'thiago.ferraz@salutti.com',
    },
    cargo: {
      cargo: 'Advogado',
      departamento: 'Jurídico',
      dataAdmissao: '2020-09-21',
      observacoes: 'Responsável por recursos administrativos.',
    },
    acesso: {
      emailLogin: 'thiago.ferraz@salutti.com',
      perfil: 'funcionario',
      status: 'ativo',
      forcarTrocaSenha: true,
    },
    permissoes: {
      modoAcesso: 'total',
      clientesVinculados: ['cli-003'],
      licitacoesAtribuidas: ['lic-003'],
      modulos: {
        clientes: [],
        funcionarios: [],
        licitacoes: ['visualizar'],
        disputas: ['visualizar', 'editar'],
        relatorios: ['visualizar'],
        configuracoes: [],
      },
    },
    observacoesAdministrativas: 'Aguardando conclusão de curso de especialização em licitações.',
    historico: [
      {
        id: 'hist-0004-1',
        data: '2020-09-21T09:00:00.000Z',
        autor: 'Administrador Salutti',
        descricao: 'Cadastro inicial do funcionário.',
      },
      {
        id: 'hist-0004-2',
        data: '2024-10-30T13:20:00.000Z',
        autor: 'Administrador Salutti',
        descricao: 'Senha temporária redefinida a pedido do funcionário.',
      },
    ],
    criadoEm: '2020-09-21T09:00:00.000Z',
    atualizadoEm: '2025-10-30T13:20:00.000Z',
  },
  {
    id: 'func-0005',
    pessoal: {
      nomeCompleto: 'Renata Souza Cardoso',
      cpf: '567.890.123-46',
      dataNascimento: '1995-01-30',
      telefone: '',
      whatsapp: '(11) 94444-0005',
      email: 'renata.cardoso@salutti.com',
    },
    cargo: {
      cargo: 'Atendente',
      departamento: 'Atendimento ao Cliente',
      dataAdmissao: '2023-07-03',
      observacoes: '',
    },
    acesso: {
      emailLogin: 'renata.cardoso@salutti.com',
      perfil: 'funcionario',
      status: 'inativo',
      forcarTrocaSenha: false,
    },
    permissoes: {
      modoAcesso: 'total',
      clientesVinculados: [],
      licitacoesAtribuidas: [],
      modulos: {
        clientes: [],
        funcionarios: [],
        licitacoes: ['visualizar'],
        disputas: [],
        relatorios: [],
        configuracoes: [],
      },
    },
    observacoesAdministrativas: 'Desligada em novembro de 2025; acesso mantido inativo por 90 dias.',
    historico: [
      {
        id: 'hist-0005-1',
        data: '2023-07-03T09:00:00.000Z',
        autor: 'Administrador Salutti',
        descricao: 'Cadastro inicial do funcionário.',
      },
      {
        id: 'hist-0005-2',
        data: '2025-11-20T17:00:00.000Z',
        autor: 'Administrador Salutti',
        descricao: 'Status alterado para inativo (desligamento).',
      },
    ],
    criadoEm: '2023-07-03T09:00:00.000Z',
    atualizadoEm: '2025-11-20T17:00:00.000Z',
  },
]
