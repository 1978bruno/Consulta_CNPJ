import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CnpjData, ApiErrorResponse } from './types/cnpj';
import {
  formatCnpj,
  cleanDigits,
  isValidCnpj,
  countFilledFields,
} from './utils/formatters';
import { SAMPLE_PRESETS, DEFAULT_SAMPLE_DATA } from './data/mockData';
import { CnpjSummaryCard } from './components/CnpjSummaryCard';
import { DynamicJsonViewer } from './components/DynamicJsonViewer';
import { RawJsonModal } from './components/RawJsonModal';
import {
  SearchIcon,
  BuildingIcon,
  CodeIcon,
  CopyIcon,
  CheckIcon,
  AlertTriangleIcon,
  ClockIcon,
  RefreshCwIcon,
  HashIcon,
  XIcon,
} from './components/icons';

const CACHE_KEY = 'cnpj_consultas_cache_v1';
const HISTORY_KEY = 'cnpj_consultas_history_v1';

export default function App() {
  const [cnpjInput, setCnpjInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [data, setData] = useState<CnpjData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [rateLimitTimer, setRateLimitTimer] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history on startup
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        setRecentSearches(JSON.parse(savedHistory));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Handle countdown for rate limit
  useEffect(() => {
    if (rateLimitTimer === null || rateLimitTimer <= 0) return;

    const interval = setInterval(() => {
      setRateLimitTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitTimer]);

  // Clean raw digits
  const rawDigits = cleanDigits(cnpjInput);
  const isInputComplete = rawDigits.length === 14;
  const isCnpjMathematicallyValid = isInputComplete && isValidCnpj(rawDigits);

  // Calculate filled fields count
  const fieldStats = useMemo(() => {
    if (!data) return { totalFilled: 0, totalLeaves: 0 };
    return countFilledFields(data);
  }, [data]);

  // Save to history & cache
  const saveToLocalCache = (cnpj: string, payload: CnpjData) => {
    try {
      const cacheStr = localStorage.getItem(CACHE_KEY);
      const cache = cacheStr ? JSON.parse(cacheStr) : {};
      cache[cnpj] = payload;
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

      const updatedHistory = [cnpj, ...recentSearches.filter((c) => c !== cnpj)].slice(0, 6);
      setRecentSearches(updatedHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch {
      // Ignore cache write issues
    }
  };

  // Get from cache
  const getFromLocalCache = (cnpj: string): CnpjData | null => {
    try {
      const cacheStr = localStorage.getItem(CACHE_KEY);
      if (!cacheStr) return null;
      const cache = JSON.parse(cacheStr);
      return cache[cnpj] || null;
    } catch {
      return null;
    }
  };

  // Input change handler with auto-masking
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = cleanDigits(e.target.value).slice(0, 14);
    setCnpjInput(formatCnpj(raw));
    if (error) {
      setError(null);
      setErrorDetails(null);
    }
  };

  // Perform CNPJ query
  const handleConsultar = async (targetCnpj?: string, bypassCache = false) => {
    const searchTarget = targetCnpj ? cleanDigits(targetCnpj) : rawDigits;

    if (!searchTarget || searchTarget.length !== 14) {
      setError('Informe um CNPJ válido com 14 dígitos.');
      return;
    }

    // Check if mathematically valid
    if (!isValidCnpj(searchTarget)) {
      setError('CNPJ inválido: os dígitos verificadores informados não conferem.');
      return;
    }

    // Check cache first (unless bypassed)
    if (!bypassCache) {
      const cached = getFromLocalCache(searchTarget);
      if (cached) {
        setData(cached);
        setError(null);
        setErrorDetails(null);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setErrorDetails(null);

    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${searchTarget}`);
      const json = await response.json();

      if (!response.ok) {
        const errorJson = json as ApiErrorResponse;

        if (response.status === 429) {
          setError(
            'Limite de requisições atingido (3 consultas por minuto na API gratuita pública).'
          );
          setErrorDetails(
            errorJson.detalhes ||
              'Aguarde cerca de 60 segundos antes de realizar uma nova consulta na API.'
          );
          setRateLimitTimer(60);
          return;
        }

        if (response.status === 404) {
          setError('CNPJ não encontrado na base pública.');
          setErrorDetails(
            errorJson.detalhes || 'Verifique se os dígitos do CNPJ foram digitados corretamente.'
          );
          return;
        }

        setError(errorJson.titulo || `Erro ${response.status} ao consultar o CNPJ`);
        setErrorDetails(
          errorJson.detalhes ||
            (errorJson.validacao && errorJson.validacao.length > 0
              ? errorJson.validacao.map((v) => `${v.campo}: ${v.mensagem}`).join(', ')
              : 'Não foi possível obter os dados da empresa.')
        );
        return;
      }

      // Successful result
      const cnpjResult = json as CnpjData;
      setData(cnpjResult);
      saveToLocalCache(searchTarget, cnpjResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('Erro de conexão ou bloqueio de rede ao acessar a API publica.cnpj.ws.');
      setErrorDetails(`Detalhes técnicos: ${msg}.`);
    } finally {
      setLoading(false);
    }
  };

  // Quick preset click
  const handleSelectPreset = (presetCnpj: string) => {
    const formatted = formatCnpj(presetCnpj);
    setCnpjInput(formatted);
    const clean = cleanDigits(presetCnpj);

    // If it's Banco do Brasil (00000000000191) and we have pre-packaged data, load or query
    if (clean === '00000000000191' && !getFromLocalCache(clean)) {
      setData(DEFAULT_SAMPLE_DATA);
      saveToLocalCache(clean, DEFAULT_SAMPLE_DATA);
      setError(null);
      setErrorDetails(null);
      return;
    }

    handleConsultar(presetCnpj);
  };

  // Load sample demo data immediately
  const handleLoadDemoData = () => {
    setCnpjInput(formatCnpj('00000000000191'));
    setData(DEFAULT_SAMPLE_DATA);
    saveToLocalCache('00000000000191', DEFAULT_SAMPLE_DATA);
    setError(null);
    setErrorDetails(null);
  };

  // Copy full JSON to clipboard
  const handleCopyFullJson = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <BuildingIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">
                  Consulta CNPJ
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  API publica.cnpj.ws
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Consulta cadastral corporativa e inspeção de dados em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data && (
              <button
                id="btn-view-raw-json-top"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
              >
                <CodeIcon size={14} />
                <span className="hidden sm:inline">Ver</span> JSON Bruto
              </button>
            )}

            <a
              href="https://publica.cnpj.ws"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Documentação da API
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search & Action Card */}
        <section
          id="search-card"
          className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8"
        >
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Consultar Empresa por CNPJ
              </h2>
              <p className="text-sm text-slate-500">
                Digite os 14 dígitos do CNPJ para obter o resumo cadastral e todos os dados fiscais
              </p>
            </div>

            {/* Input and Action Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConsultar();
              }}
              className="space-y-3"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <SearchIcon size={20} />
                  </div>
                  <input
                    ref={inputRef}
                    id="input-cnpj"
                    type="text"
                    value={cnpjInput}
                    onChange={handleInputChange}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    autoComplete="off"
                    className="w-full pl-11 pr-10 py-3.5 bg-slate-50/70 border border-slate-300 rounded-xl text-base sm:text-lg font-mono tracking-wide placeholder:font-sans placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white transition-all shadow-2xs"
                  />
                  {cnpjInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setCnpjInput('');
                        setError(null);
                        inputRef.current?.focus();
                      }}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      title="Limpar campo"
                    >
                      <XIcon size={18} />
                    </button>
                  )}
                </div>

                <button
                  id="btn-consultar"
                  type="submit"
                  disabled={loading || rawDigits.length < 14}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-semibold text-base shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCwIcon size={20} className="animate-spin text-white" />
                      <span>Consultando...</span>
                    </>
                  ) : (
                    <>
                      <SearchIcon size={20} />
                      <span>Consultar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Real-time input status indicator */}
              <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                <span>
                  Dígitos:{' '}
                  <span className="font-mono font-semibold text-slate-700">
                    {rawDigits.length}/14
                  </span>
                </span>
                {isInputComplete && (
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      isCnpjMathematicallyValid ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {isCnpjMathematicallyValid
                      ? '✓ Dígitos verificadores válidos'
                      : '⚠ Formato com 14 dígitos (dígitos verificadores suspeitos)'}
                  </span>
                )}
              </div>
            </form>

            {/* Quick Demo & Presets */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">
                Exemplos rápidos:
              </span>
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.cnpj}
                  type="button"
                  onClick={() => handleSelectPreset(p.cnpj)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/80 transition-colors"
                  title={`${p.name} - ${p.description}`}
                >
                  <BuildingIcon size={12} className="text-slate-400" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                <span className="text-slate-400">Recentes:</span>
                {recentSearches.map((rec) => (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => handleConsultar(rec)}
                    className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    {formatCnpj(rec)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Error Alert Box */}
        {error && (
          <div
            id="error-alert-box"
            className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3 animate-fade-in"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                <AlertTriangleIcon size={22} />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-bold text-base text-rose-900">{error}</h3>
                {errorDetails && (
                  <p className="text-sm text-rose-700 leading-relaxed">
                    {errorDetails}
                  </p>
                )}

                {rateLimitTimer !== null && (
                  <div className="mt-2 p-2.5 rounded-lg bg-rose-100/70 border border-rose-200/80 flex items-center gap-2 text-xs font-medium text-rose-800">
                    <ClockIcon size={16} />
                    <span>
                      Tempo estimado para liberação da quota pública:{' '}
                      <strong className="font-mono text-sm">{rateLimitTimer}s</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Helpful fallback button if rate-limited */}
            <div className="pt-2 border-t border-rose-200/60 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleLoadDemoData}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors"
              >
                Carregar Exemplo Pré-Carregado (Banco do Brasil)
              </button>
              <button
                type="button"
                onClick={() => handleConsultar(rawDigits, true)}
                disabled={rateLimitTimer !== null && rateLimitTimer > 0}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div
            id="loading-skeleton"
            className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 animate-pulse"
          >
            <div className="h-24 bg-slate-200 rounded-xl w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="h-20 bg-slate-100 rounded-xl" />
              <div className="h-20 bg-slate-100 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-36 bg-slate-100 rounded-xl" />
              <div className="h-36 bg-slate-100 rounded-xl" />
            </div>
            <div className="flex items-center justify-center py-4 text-slate-500 gap-2 text-sm">
              <RefreshCwIcon size={18} className="animate-spin text-indigo-600" />
              <span>Buscando dados na API pública...</span>
            </div>
          </div>
        )}

        {/* Loaded Data View */}
        {data && !loading && (
          <div className="space-y-8 animate-fade-in">
            {/* Toolbar: Filled fields counter & Action buttons */}
            <div
              id="stats-toolbar"
              className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Counter of filled fields */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <HashIcon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                      Contador de Campos Preenchidos:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                      {fieldStats.totalFilled} campos preenchidos
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total de {fieldStats.totalLeaves} propriedades inspecionadas no payload desta consulta
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  id="btn-copy-json-toolbar"
                  onClick={handleCopyFullJson}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                  title="Copiar JSON completo para a área de transferência"
                >
                  {copySuccess ? (
                    <>
                      <CheckIcon size={16} className="text-emerald-600" />
                      <span className="text-emerald-700">JSON Copiado!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={16} />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-view-raw-json-toolbar"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                >
                  <CodeIcon size={16} />
                  <span>Ver JSON Bruto</span>
                </button>
              </div>
            </div>

            {/* 1. Resumo Cadastral Bonito */}
            <CnpjSummaryCard data={data} />

            {/* 2. Seção Dinâmica com TODOS os dados */}
            <DynamicJsonViewer data={data as unknown as Record<string, unknown>} />
          </div>
        )}
      </main>

      {/* Raw JSON Modal */}
      <RawJsonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={data}
        cnpjNumber={rawDigits || 'consulta'}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Consulta CNPJ desenvolvida com React e Tailwind CSS • Dados fornecidos pela{' '}
            <a
              href="https://publica.cnpj.ws"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline font-medium"
            >
              API pública CNPJ.ws
            </a>
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                inputRef.current?.focus();
              }}
              className="hover:text-slate-800 transition-colors"
            >
              Voltar ao topo ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
