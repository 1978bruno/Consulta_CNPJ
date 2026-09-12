/**
 * Formatters and validators for Brazilian corporate/fiscal data
 */

/**
 * Remove all non-numeric characters from a string
 */
export function cleanDigits(value: string | number | null | undefined): string {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
}

/**
 * Format a string of numbers to CNPJ mask: 00.000.000/0000-00
 */
export function formatCnpj(value: string | number | null | undefined): string {
  if (!value) return '';
  const digits = cleanDigits(value).slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Format a string of numbers to CPF mask: 000.000.000-00 or masked format
 */
export function formatCpf(value: string | number | null | undefined): string {
  if (!value) return '';
  const str = String(value).trim();
  // If it already has asterisks (e.g. ***355918**), preserve or format nicely
  if (str.includes('*')) return str;
  const digits = cleanDigits(str).slice(0, 11);
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  }
  return str;
}

/**
 * Validate CNPJ using official Brazilian check digits algorithm (modulo 11)
 */
export function isValidCnpj(cnpj: string | number | null | undefined): boolean {
  const digits = cleanDigits(cnpj);
  if (digits.length !== 14) return false;

  // Check known invalid repeating sequences
  if (/^(\d)\1{13}$/.test(digits)) return false;

  // Validate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += Number(digits[i]) * weights1[i];
  }
  const mod1 = sum1 % 11;
  const dv1 = mod1 < 2 ? 0 : 11 - mod1;
  if (Number(digits[12]) !== dv1) return false;

  // Validate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += Number(digits[i]) * weights2[i];
  }
  const mod2 = sum2 % 11;
  const dv2 = mod2 < 2 ? 0 : 11 - mod2;
  return Number(digits[13]) === dv2;
}

/**
 * Format CEP: 00000-000
 */
export function formatCep(value: string | number | null | undefined): string {
  if (!value) return '';
  const digits = cleanDigits(value).slice(0, 8);
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return String(value);
}

/**
 * Format currency to Brazilian Real: R$ 1.250.000,00
 */
export function formatCurrencyBRL(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'R$ 0,00';
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return String(value);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format date string to Brazilian standard DD/MM/YYYY
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const str = String(value).trim();

  // Handle YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split('-');
    return `${day}/${month}/${year}`;
  }

  // Handle ISO 8601 with time
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(d);
      }
    } catch {
      // fallback to original
    }
  }

  return str;
}

/**
 * Format phone number: (XX) XXXX-XXXX or (XX) XXXXX-XXXX
 */
export function formatPhone(ddd?: string | null, phone?: string | null): string {
  if (!phone) return '';
  const cleanPhone = cleanDigits(phone);
  const cleanDdd = ddd ? cleanDigits(ddd) : '';

  if (!cleanPhone) return '';

  if (cleanPhone.length === 8) {
    const formatted = `${cleanPhone.slice(0, 4)}-${cleanPhone.slice(4)}`;
    return cleanDdd ? `(${cleanDdd}) ${formatted}` : formatted;
  }
  if (cleanPhone.length === 9) {
    const formatted = `${cleanPhone.slice(0, 5)}-${cleanPhone.slice(5)}`;
    return cleanDdd ? `(${cleanDdd}) ${formatted}` : formatted;
  }
  // If whole phone includes DDD (10 or 11 digits)
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  }
  if (cleanPhone.length === 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
  }

  return cleanDdd ? `(${cleanDdd}) ${cleanPhone}` : cleanPhone;
}

/**
 * Format boolean to pt-BR label
 */
export function formatBoolean(value: unknown): string {
  if (value === true || value === 'true' || value === 'S' || value === 'SIM' || value === 'Sim') {
    return 'Sim';
  }
  if (value === false || value === 'false' || value === 'N' || value === 'NAO' || value === 'NÃO' || value === 'Não') {
    return 'Não';
  }
  return String(value);
}

/**
 * Checks if a value represents a boolean-like entity
 */
export function isBooleanLike(value: unknown): boolean {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    return ['true', 'false', 'sim', 'não', 'nao'].includes(lower);
  }
  return false;
}

/**
 * Detects if a string is an ISO or YYYY-MM-DD date
 */
export function isDateString(key: string, value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const str = value.trim();
  const lowerKey = key.toLowerCase();

  const isDateKey = lowerKey.includes('data') || lowerKey.includes('atualizado_em') || lowerKey.includes('criado_em');
  const matchesFormat = /^\d{4}-\d{2}-\d{2}/.test(str);

  return matchesFormat || (isDateKey && !isNaN(Date.parse(str)));
}

/**
 * Check if string looks like a CNPJ key or value
 */
export function isCnpjField(key: string, value: unknown): boolean {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('cnpj') && typeof value === 'string' && cleanDigits(value).length === 14) {
    return true;
  }
  return false;
}

/**
 * Check if string looks like a CEP
 */
export function isCepField(key: string, value: unknown): boolean {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('cep') && typeof value === 'string' && cleanDigits(value).length === 8) {
    return true;
  }
  return false;
}

/**
 * Check if field represents monetary capital social
 */
export function isCapitalSocialField(key: string, value: unknown): boolean {
  const lowerKey = key.toLowerCase();
  return lowerKey.includes('capital_social') && (typeof value === 'string' || typeof value === 'number');
}

/**
 * Recursively count all non-null, non-undefined, non-empty fields in the data structure
 */
export function countFilledFields(data: unknown): { totalFilled: number; totalLeaves: number } {
  let filled = 0;
  let total = 0;

  function traverse(item: unknown) {
    if (item === null || item === undefined) {
      total++;
      return;
    }

    if (Array.isArray(item)) {
      if (item.length === 0) {
        total++;
        return;
      }
      for (const element of item) {
        traverse(element);
      }
      return;
    }

    if (typeof item === 'object') {
      const entries = Object.entries(item as Record<string, unknown>);
      if (entries.length === 0) {
        total++;
        return;
      }
      for (const [, val] of entries) {
        traverse(val);
      }
      return;
    }

    // Primitive value
    total++;
    const str = String(item).trim();
    if (str !== '' && str !== 'null' && str !== 'undefined') {
      filled++;
    }
  }

  traverse(data);
  return { totalFilled: filled, totalLeaves: total };
}

/**
 * Convert technical snake_case keys into clean, readable Portuguese titles
 */
const KEY_DICTIONARY: Record<string, string> = {
  razao_social: 'Razão Social',
  cnpj_raiz: 'CNPJ Raiz',
  capital_social: 'Capital Social',
  responsavel_federativo: 'Responsável Federativo',
  atualizado_em: 'Atualizado Em',
  porte: 'Porte da Empresa',
  natureza_juridica: 'Natureza Jurídica',
  qualificacao_do_responsavel: 'Qualificação do Responsável',
  socios: 'Quadro de Sócios e Administradores (QSA)',
  simples: 'Simples Nacional & MEI',
  estabelecimento: 'Dados do Estabelecimento / Matriz',
  cnpj: 'CNPJ Completo',
  cnpj_ordem: 'Ordem do Estabelecimento',
  cnpj_digito_verificador: 'Dígito Verificador',
  tipo: 'Tipo de Estabelecimento',
  nome_fantasia: 'Nome Fantasia',
  situacao_cadastral: 'Situação Cadastral',
  data_situacao_cadastral: 'Data da Situação Cadastral',
  motivo_situacao_cadastral: 'Motivo da Situação Cadastral',
  data_inicio_atividade: 'Data de Início da Atividade',
  tipo_logradouro: 'Tipo de Logradouro',
  logradouro: 'Logradouro',
  numero: 'Número',
  complemento: 'Complemento',
  bairro: 'Bairro',
  cep: 'CEP',
  ddd1: 'DDD 1',
  telefone1: 'Telefone 1',
  ddd2: 'DDD 2',
  telefone2: 'Telefone 2',
  email: 'E-mail',
  cnae_fiscal_principal: 'CNAE Fiscal Principal',
  cnaes_secundarios: 'CNAEs Secundários',
  atividade_principal: 'Atividade Principal',
  atividades_secundarias: 'Atividades Secundárias',
  inscricoes_estaduais: 'Inscrições Estaduais',
  pais: 'País',
  estado: 'Estado (UF)',
  municipio: 'Município',
  cpf_cnpj_socio: 'CPF / CNPJ do Sócio',
  nome: 'Nome Completo',
  data_entrada: 'Data de Entrada na Sociedade',
  faixa_etaria: 'Faixa Etária',
  qualificacao_socio: 'Qualificação do Sócio',
  descricao: 'Descrição',
  sigla: 'Sigla',
  ibge_id: 'Código IBGE',
  ativo: 'Status Ativo',
  inscricao_estadual: 'Número da Inscrição Estadual',
  mei: 'Optante pelo MEI',
  data_opcao_simples: 'Data de Opção pelo Simples',
  data_exclusao_simples: 'Data de Exclusão do Simples',
  data_opcao_mei: 'Data de Opção pelo MEI',
  data_exclusao_mei: 'Data de Exclusão do MEI',
};

export function formatKeyLabel(key: string): string {
  if (KEY_DICTIONARY[key]) return KEY_DICTIONARY[key];

  // Fallback: replace underscores with spaces and capitalize each word
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
