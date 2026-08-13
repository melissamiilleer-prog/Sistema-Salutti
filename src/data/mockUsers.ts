import type { MockCredential } from '@/types/auth'

/**
 * Usuários mockados para a fase atual do sistema (sem backend real).
 *
 * IMPORTANTE: isto simula uma tabela de usuários apenas para desenvolvimento.
 * Nunca usar senhas em texto plano fora de um mock como este.
 * Na integração futura, este arquivo é removido e a validação passa a ser
 * feita via supabase.auth.signInWithPassword (ver src/services/authService.ts).
 */
export const MOCK_USERS: MockCredential[] = [
  {
    id: 'usr-admin-1',
    name: 'Administrador Salutti',
    email: 'admin@salutti.com',
    password: '123456',
    role: 'admin',
  },
  {
    id: 'usr-func-1',
    name: 'Funcionário Salutti',
    email: 'funcionario@salutti.com',
    password: '123456',
    role: 'funcionario',
    // 'func-0002' em mockFuncionarios.ts — cadastrado com modoAcesso
    // 'restrito', ótimo login para testar as permissões granulares.
    funcionarioId: 'func-0002',
  },
  {
    id: 'usr-cli-1',
    name: 'Cliente Salutti',
    email: 'cliente@empresa.com',
    password: '123456',
    role: 'cliente',
    // 'cli-001' = Horizonte Engenharia, em mockClientesResumo.ts — troque
    // aqui se quiser testar o portal logado como outro cliente.
    clienteId: 'cli-001',
  },
]