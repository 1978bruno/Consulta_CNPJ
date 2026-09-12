import React, { useState } from 'react';
import { CnpjData } from '../types/cnpj';
import {
  formatCnpj,
  formatCep,
  formatCurrencyBRL,
  formatDate,
  formatPhone,
} from '../utils/formatters';
import {
  BuildingIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  DollarIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  CheckIcon,
} from './icons';

interface CnpjSummaryCardProps {
  data: CnpjData;
}

export const CnpjSummaryCard: React.FC<CnpjSummaryCardProps> = ({ data }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecondaryCnaes, setShowSecondaryCnaes] = useState(false);

  const est = data.estabelecimento;
  const situacao = est?.situacao_cadastral || 'Não informada';
  const isAtiva = situacao.toLowerCase() === 'ativa';

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Address assembly
  const logradouroParts = [
    est?.tipo_logradouro,
    est?.logradouro,
    est?.numero ? `nº ${est.numero}` : null,
    est?.complemento,
  ]
    .filter(Boolean)
    .join(' ');

  const bairroCidadeUf = [
    est?.bairro,
    est?.cidade?.nome || est?.municipio?.nome,
    est?.estado?.sigla,
  ]
    .filter(Boolean)
    .join(' - ');

  const fullAddress = [
    logradouroParts || 'Logradouro não informado',
    bairroCidadeUf,
    est?.cep ? `CEP ${formatCep(est.cep)}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  // Phones
  const phone1 = formatPhone(est?.ddd1, est?.telefone1);
  const phone2 = formatPhone(est?.ddd2, est?.telefone2);
  const phones = [phone1, phone2].filter(Boolean);

  // CNAE Principal
  const cnaePrincipal = est?.atividade_principal || est?.cnae_fiscal_principal;
  const cnaesSecundarios = est?.atividades_secundarias || est?.cnaes_secundarios || [];

  return (
    <div
      id="cnpj-summary-card"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
    >
      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-slate-200 backdrop-blur-xs">
                <BuildingIcon size={14} className="text-indigo-300" />
                {est?.tipo || 'Matriz'}
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isAtiva
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {isAtiva ? (
                  <CheckCircleIcon size={14} className="text-emerald-400" />
                ) : (
                  <AlertTriangleIcon size={14} className="text-rose-400" />
                )}
                Situação: {situacao}
              </span>

              {est?.data_situacao_cadastral && (
                <span className="text-xs text-slate-300">
                  desde {formatDate(est.data_situacao_cadastral)}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white break-words">
              {data.razao_social || 'Razão Social Não Informada'}
            </h1>

            {est?.nome_fantasia && (
              <p className="text-base text-indigo-200 font-medium flex items-center gap-2">
                <span className="text-slate-400 text-sm font-normal">Nome Fantasia:</span>{' '}
                {est.nome_fantasia}
              </p>
            )}
          </div>

          {/* CNPJ Box */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[240px]">
            <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider">
              CNPJ
            </p>
            <div className="flex items-center justify-between gap-3 mt-1">
              <span className="font-mono text-lg font-bold tracking-tight text-white">
                {formatCnpj(est?.cnpj || data.cnpj_raiz)}
              </span>
              <button
                id="btn-copy-cnpj"
                onClick={() =>
                  copyToClipboard(
                    formatCnpj(est?.cnpj || data.cnpj_raiz),
                    'cnpj'
                  )
                }
                title="Copiar CNPJ"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
              >
                {copiedKey === 'cnpj' ? (
                  <CheckIcon size={16} className="text-emerald-400" />
                ) : (
                  <CopyIcon size={16} />
                )}
              </button>
            </div>
            {data.porte?.descricao && (
              <p className="text-xs text-slate-300 mt-2">
                Porte: <span className="font-medium text-white">{data.porte.descricao}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Row 1: Core Corporate Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Capital Social
            </span>
            <div className="flex items-center gap-2 mt-1">
              <DollarIcon size={18} className="text-emerald-600 shrink-0" />
              <span className="text-base font-bold text-slate-900 break-words">
                {formatCurrencyBRL(data.capital_social)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Abertura da Atividade
            </span>
            <div className="flex items-center gap-2 mt-1">
              <CalendarIcon size={18} className="text-blue-600 shrink-0" />
              <span className="text-base font-semibold text-slate-900">
                {est?.data_inicio_atividade
                  ? formatDate(est.data_inicio_atividade)
                  : 'Não informada'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Natureza Jurídica
            </span>
            <p className="text-sm font-semibold text-slate-900 mt-1 line-clamp-2" title={data.natureza_juridica?.descricao}>
              {data.natureza_juridica?.descricao || 'Não informada'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Simples Nacional
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                  data.simples?.simples === 'Sim' || data.simples?.simples === true
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {data.simples?.simples === 'Sim' || data.simples?.simples === true
                  ? 'Optante'
                  : 'Não Optante'}
              </span>
              {data.simples?.mei === 'Sim' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  MEI
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Address & Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Address Box */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <MapPinIcon size={18} className="text-indigo-600" />
                <span>Localização e Endereço</span>
              </div>
              <button
                id="btn-copy-address"
                onClick={() => copyToClipboard(fullAddress, 'address')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                title="Copiar endereço completo"
              >
                {copiedKey === 'address' ? (
                  <>
                    <CheckIcon size={14} className="text-emerald-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <CopyIcon size={14} />
                    Copiar
                  </>
                )}
              </button>
            </div>

            <div className="text-sm space-y-1 text-slate-700">
              <p className="font-medium text-slate-900">
                {logradouroParts || 'Logradouro não informado'}
              </p>
              <p className="text-slate-600">
                {bairroCidadeUf || 'Bairro e Cidade não informados'}
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs">
                <div>
                  <span className="text-slate-400">CEP: </span>
                  <span className="font-mono font-medium text-slate-900">
                    {est?.cep ? formatCep(est.cep) : 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Município / UF: </span>
                  <span className="font-semibold text-slate-900">
                    {est?.cidade?.nome || est?.municipio?.nome || 'N/I'} -{' '}
                    {est?.estado?.sigla || 'N/I'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <PhoneIcon size={18} className="text-indigo-600" />
              <span>Canais de Contato</span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MailIcon size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-slate-500 block">E-mail</span>
                  {est?.email ? (
                    <a
                      href={`mailto:${est.email}`}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium break-all"
                    >
                      {est.email.toLowerCase()}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Não informado</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneIcon size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-500 block">Telefones</span>
                  {phones.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {phones.map((p, idx) => (
                        <a
                          key={idx}
                          href={`tel:${p.replace(/\D/g, '')}`}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-semibold transition-colors"
                        >
                          {p}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Não informado</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: CNAE & Inscrições Estaduais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CNAE Principal & Secundários */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <FileTextIcon size={18} className="text-indigo-600" />
              <span>Atividade Econômica (CNAE)</span>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Atividade Principal
              </span>
              {cnaePrincipal ? (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="inline-block font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 mb-1">
                    {cnaePrincipal.subclasse || cnaePrincipal.id}
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {cnaePrincipal.descricao}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Não informada</p>
              )}
            </div>

            {/* Atividades secundárias */}
            {cnaesSecundarios.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  id="btn-toggle-cnaes"
                  onClick={() => setShowSecondaryCnaes(!showSecondaryCnaes)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-indigo-600 py-1"
                >
                  <span>
                    Atividades Secundárias ({cnaesSecundarios.length})
                  </span>
                  {showSecondaryCnaes ? (
                    <ChevronDownIcon size={16} />
                  ) : (
                    <ChevronRightIcon size={16} />
                  )}
                </button>

                {showSecondaryCnaes && (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
                    {cnaesSecundarios.map((cnae, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-md bg-slate-50 border border-slate-200/60 text-xs"
                      >
                        <span className="font-mono font-bold text-slate-700 mr-2">
                          {cnae.subclasse || cnae.id}:
                        </span>
                        <span className="text-slate-600">{cnae.descricao}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Inscrições Estaduais */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <BuildingIcon size={18} className="text-indigo-600" />
                <span>Inscrições Estaduais</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {est?.inscricoes_estaduais?.length || 0} registrada(s)
              </span>
            </div>

            {est?.inscricoes_estaduais && est.inscricoes_estaduais.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {est.inscricoes_estaduais.map((ie, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {ie.estado?.sigla || 'UF'}:
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {ie.inscricao_estadual}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {ie.estado?.nome}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        ie.ativo
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ie.ativo ? (
                        <CheckCircleIcon size={12} className="text-emerald-600" />
                      ) : (
                        <AlertTriangleIcon size={12} className="text-rose-600" />
                      )}
                      {ie.ativo ? 'Habilitada / Ativa' : 'Inativa'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic py-2">
                Nenhuma inscrição estadual informada ou cadastrada nesta consulta.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
