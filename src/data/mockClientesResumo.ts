// src/data/mockClientesResumo.ts
//
// Lista mínima de clientes, só para popular o select "Cliente Vinculado" no
// formulário de Licitações — o mesmo padrão que o README descreve para
// `mockLicitacoesResumo.ts` no módulo de Funcionários.
//
// IMPORTANTE: se o módulo de Clientes já expõe algo como
// `mockClientes.ts` / `clienteService.ts`, prefira importar de lá (basta
// mapear para este formato reduzido) em vez de manter esta lista separada.

export interface ClienteResumo {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
}

export const mockClientesResumo: ClienteResumo[] = [
  { id: 'cli-001', razaoSocial: 'Construtora Horizonte Ltda', nomeFantasia: 'Horizonte Engenharia' },
  { id: 'cli-002', razaoSocial: 'Alfa Serviços Gerais Ltda', nomeFantasia: 'Alfa Serviços' },
  { id: 'cli-003', razaoSocial: 'Nova Era Alimentos S.A.', nomeFantasia: 'Nova Era Alimentos' },
  { id: 'cli-004', razaoSocial: 'TechLimp Higienização Ltda', nomeFantasia: 'TechLimp' },
  { id: 'cli-005', razaoSocial: 'Vetor Segurança Patrimonial Ltda', nomeFantasia: 'Vetor Segurança' },
];
