/**
 * Types for the publica.cnpj.ws public API response
 */

export interface Porte {
  id: string | number;
  descricao: string;
}

export interface NaturezaJuridica {
  id: string | number;
  descricao: string;
}

export interface Qualificacao {
  id: string | number;
  descricao: string;
}

export interface Pais {
  id: string | number;
  iso2?: string;
  iso3?: string;
  nome: string;
  comex_id?: string;
}

export interface Estado {
  id: number;
  nome: string;
  sigla: string;
  ibge_id?: number;
}

export interface Municipio {
  id: number;
  nome: string;
  ibge_id: number;
  siafi_id?: string;
}

export interface Cnae {
  id: string;
  secao?: string;
  divisao?: string;
  grupo?: string;
  classe?: string;
  subclasse?: string;
  descricao: string;
}

export interface InscricaoEstadual {
  inscricao_estadual: string;
  ativo: boolean;
  atualizado_em?: string;
  estado: {
    id: number;
    nome: string;
    sigla: string;
    ibge_id?: number;
  };
}

export interface Socio {
  cpf_cnpj_socio?: string;
  nome: string;
  tipo: string;
  data_entrada: string;
  cpf_representante_legal?: string;
  nome_representante?: string | null;
  faixa_etaria?: string;
  atualizado_em?: string;
  pais_id?: string;
  qualificacao_socio?: Qualificacao;
  qualificacao_representante?: Qualificacao | null;
  pais?: Pais | null;
}

export interface SimplesNacional {
  simples: string | boolean | null;
  data_opcao_simples: string | null;
  data_exclusao_simples: string | null;
  mei: string | boolean | null;
  data_opcao_mei: string | null;
  data_exclusao_mei: string | null;
  atualizado_em: string | null;
}

export interface Estabelecimento {
  cnpj: string;
  cnpj_raiz?: string;
  cnpj_ordem?: string;
  cnpj_digito_verificador?: string;
  tipo?: string;
  nome_fantasia: string | null;
  situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral?: {
    id: number;
    descricao: string;
  } | string | null;
  nome_cidade_exterior?: string | null;
  data_inicio_atividade: string;
  tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cep: string;
  ddd1: string | null;
  telefone1: string | null;
  ddd2?: string | null;
  telefone2?: string | null;
  ddd_fax?: string | null;
  fax?: string | null;
  email: string | null;
  situacao_especial?: string | null;
  data_situacao_especial?: string | null;
  atividade_principal?: Cnae;
  cnae_fiscal_principal?: Cnae;
  atividades_secundarias?: Cnae[];
  cnaes_secundarios?: Cnae[];
  inscricoes_estaduais?: InscricaoEstadual[];
  pais?: Pais;
  estado?: Estado;
  municipio?: Municipio;
  cidade?: Municipio;
  atualizado_em?: string;
  [key: string]: unknown;
}

export interface CnpjData {
  cnpj_raiz: string;
  razao_social: string;
  capital_social: string | number;
  responsavel_federativo?: string | null;
  atualizado_em?: string;
  porte?: Porte;
  natureza_juridica?: NaturezaJuridica;
  qualificacao_do_responsavel?: Qualificacao;
  socios?: Socio[];
  simples?: SimplesNacional | null;
  estabelecimento?: Estabelecimento;
  // Allow dynamic / arbitrary fields returned by API
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  status?: number;
  titulo?: string;
  detalhes?: string;
  validacao?: Array<{ campo: string; mensagem: string }>;
  message?: string;
}
