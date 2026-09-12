import { CnpjData } from '../types/cnpj';

export interface SamplePreset {
  cnpj: string;
  name: string;
  category: string;
  description: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    cnpj: '00.000.000/0001-91',
    name: 'Banco do Brasil',
    category: 'Financeiro',
    description: 'Maior instituição bancária pública do país',
  },
  {
    cnpj: '33.000.167/0001-01',
    name: 'Petrobras',
    category: 'Energia',
    description: 'Petróleo Brasileiro S.A.',
  },
  {
    cnpj: '47.960.950/0001-21',
    name: 'Magazine Luiza',
    category: 'Varejo',
    description: 'Grande rede varejista e e-commerce',
  },
  {
    cnpj: '30.680.829/0001-43',
    name: 'Nubank (Nu Pagamentos)',
    category: 'Fintech',
    description: 'Instituição de pagamento digital',
  },
  {
    cnpj: '03.007.331/0001-41',
    name: 'Mercado Livre',
    category: 'E-commerce',
    description: 'Mercadolivre.com Atividades de Internet Ltda',
  },
];

export const DEFAULT_SAMPLE_DATA: CnpjData = {
  cnpj_raiz: '00000000',
  razao_social: 'BANCO DO BRASIL SA',
  capital_social: '120000000000.00',
  responsavel_federativo: '',
  atualizado_em: '2026-08-08T03:00:00.000Z',
  porte: {
    id: '05',
    descricao: 'Demais',
  },
  natureza_juridica: {
    id: '2038',
    descricao: 'Sociedade de Economia Mista',
  },
  qualificacao_do_responsavel: {
    id: 10,
    descricao: 'Diretor',
  },
  simples: {
    simples: 'Não',
    data_opcao_simples: '2007-07-01',
    data_exclusao_simples: null,
    mei: 'Não',
    data_opcao_mei: '2009-07-01',
    data_exclusao_mei: '2009-07-01',
    atualizado_em: '2026-08-08T03:00:00.000Z',
  },
  socios: [
    {
      cpf_cnpj_socio: '***355918**',
      nome: 'FRANCISCO AUGUSTO LASSALVIA',
      tipo: 'Pessoa Física',
      data_entrada: '2020-09-29',
      faixa_etaria: '41 a 50 anos',
      atualizado_em: '2026-08-08T03:00:00.000Z',
      qualificacao_socio: {
        id: 10,
        descricao: 'Diretor',
      },
      pais: {
        id: '1058',
        nome: 'Brasil',
        iso2: 'BR',
        iso3: 'BRA',
      },
    },
    {
      cpf_cnpj_socio: '***058029**',
      nome: 'JULIO CESAR VEZZARO',
      tipo: 'Pessoa Física',
      data_entrada: '2023-07-20',
      faixa_etaria: '41 a 50 anos',
      atualizado_em: '2026-08-08T03:00:00.000Z',
      qualificacao_socio: {
        id: 10,
        descricao: 'Diretor',
      },
      pais: {
        id: '1058',
        nome: 'Brasil',
        iso2: 'BR',
        iso3: 'BRA',
      },
    },
    {
      cpf_cnpj_socio: '***842999**',
      nome: 'ALBERTO MARTINHAGO VIEIRA',
      tipo: 'Pessoa Física',
      data_entrada: '2023-07-20',
      faixa_etaria: '41 a 50 anos',
      atualizado_em: '2026-08-08T03:00:00.000Z',
      qualificacao_socio: {
        id: 10,
        descricao: 'Diretor',
      },
      pais: {
        id: '1058',
        nome: 'Brasil',
        iso2: 'BR',
        iso3: 'BRA',
      },
    },
  ],
  estabelecimento: {
    cnpj: '00000000000191',
    cnpj_raiz: '00000000',
    cnpj_ordem: '0001',
    cnpj_digito_verificador: '91',
    tipo: 'Matriz',
    nome_fantasia: 'DIRECAO GERAL',
    situacao_cadastral: 'Ativa',
    data_situacao_cadastral: '2005-11-03',
    data_inicio_atividade: '1966-08-01',
    tipo_logradouro: 'QUADRA',
    logradouro: 'SAUN QUADRA 5 LOTE B',
    numero: 'SN',
    complemento: 'EDF CENTRAL TORRES A E C',
    bairro: 'ASA NORTE',
    cep: '70040912',
    ddd1: '61',
    telefone1: '34939002',
    ddd2: '61',
    telefone2: '34939025',
    email: 'gecom.df.copes@bb.com.br',
    atualizado_em: '2026-08-08T03:00:00.000Z',
    atividade_principal: {
      id: '6422100',
      secao: 'K',
      divisao: '64',
      grupo: '64.2',
      classe: '64.22-1',
      subclasse: '6422-1/00',
      descricao: 'Bancos múltiplos, com carteira comercial',
    },
    atividades_secundarias: [
      {
        id: '6424701',
        secao: 'K',
        divisao: '64',
        grupo: '64.2',
        classe: '64.24-7',
        subclasse: '6424-7/01',
        descricao: 'Bancos cooperativos',
      },
      {
        id: '6499999',
        secao: 'K',
        divisao: '64',
        grupo: '64.9',
        classe: '64.99-9',
        subclasse: '6499-9/99',
        descricao: 'Outras atividades de serviços financeiros não especificadas anteriormente',
      },
    ],
    pais: {
      id: '1058',
      nome: 'Brasil',
      iso2: 'BR',
      iso3: 'BRA',
    },
    estado: {
      id: 7,
      nome: 'Distrito Federal',
      sigla: 'DF',
      ibge_id: 53,
    },
    cidade: {
      id: 5570,
      nome: 'Brasília',
      ibge_id: 5300108,
      siafi_id: '9701',
    },
    inscricoes_estaduais: [
      {
        inscricao_estadual: '0809427800174',
        ativo: true,
        atualizado_em: '2025-10-10T13:40:01.080Z',
        estado: {
          id: 7,
          nome: 'Distrito Federal',
          sigla: 'DF',
          ibge_id: 53,
        },
      },
    ],
  },
};
