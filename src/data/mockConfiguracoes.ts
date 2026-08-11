// src/data/mockConfiguracoes.ts
import { ConfiguracoesSistema } from '../types/configuracoes';

export const mockConfiguracoes: ConfiguracoesSistema = {
  dadosEmpresa: {
    razaoSocial: 'Salutti Licitações Ltda',
    nomeFantasia: 'Salutti',
    cnpj: '00.000.000/0001-00',
    endereco: 'Av. Exemplo, 1000 — Osasco/SP',
    telefone: '(11) 0000-0000',
    email: 'contato@salutti.com.br',
  },
  regraPrazoInterno: {
    diasUteisAntes: 3,
    horario: '18:00',
  },
  linksRapidos: [
    { id: 'link-1', label: 'ComprasNet', url: 'https://www.gov.br/compras/pt-br' },
    { id: 'link-2', label: 'BEC/SP', url: 'https://www.bec.sp.gov.br' },
    { id: 'link-3', label: 'Licitações-e (BB)', url: 'https://www.licitacoes-e.com.br' },
    { id: 'link-4', label: 'PNCP', url: 'https://www.gov.br/pncp' },
    {
      id: 'link-5',
      label: 'Tesouro Transparente (CAPAG)',
      url: 'https://www.tesourotransparente.gov.br/temas/estados-e-municipios/capacidade-de-pagamento-capag/',
    },
    { id: 'link-6', label: 'SIGA Pregão', url: 'https://app.sigapregao.com.br/' },
  ],
  atualizadoEm: new Date().toISOString(),
};
