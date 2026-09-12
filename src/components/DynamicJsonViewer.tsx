import React, { useState, useMemo } from 'react';
import {
  formatCnpj,
  formatCep,
  formatCurrencyBRL,
  formatDate,
  formatBoolean,
  isBooleanLike,
  isDateString,
  isCnpjField,
  isCepField,
  isCapitalSocialField,
  formatKeyLabel,
} from '../utils/formatters';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
  LayersIcon,
  CopyIcon,
  CheckIcon,
} from './icons';

interface DynamicJsonViewerProps {
  data: Record<string, unknown>;
}

// Render formatted primitive leaf value
const FormattedLeaf: React.FC<{
  keyName: string;
  value: unknown;
}> = ({ keyName, value }) => {
  const [copied, setCopied] = useState(false);

  if (value === null || value === undefined) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-slate-400 bg-slate-100 italic">
        nulo / não informado
      </span>
    );
  }

  const strVal = String(value);

  if (strVal.trim() === '') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-slate-400 bg-slate-100 italic">
        vazio
      </span>
    );
  }

  // Boolean detection
  if (isBooleanLike(value)) {
    const isTrue =
      value === true ||
      strVal.toLowerCase() === 'true' ||
      strVal.toLowerCase() === 'sim' ||
      strVal.toLowerCase() === 's';
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
          isTrue
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-slate-200 text-slate-700'
        }`}
      >
        {formatBoolean(value)}
      </span>
    );
  }

  // Capital Social or explicit currency
  if (isCapitalSocialField(keyName, value)) {
    return (
      <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 text-xs sm:text-sm">
        {formatCurrencyBRL(value as string | number)}
      </span>
    );
  }

  // CNPJ field
  if (isCnpjField(keyName, value)) {
    return (
      <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 text-xs sm:text-sm">
        {formatCnpj(strVal)}
      </span>
    );
  }

  // CEP field
  if (isCepField(keyName, value)) {
    return (
      <span className="font-mono font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs sm:text-sm">
        {formatCep(strVal)}
      </span>
    );
  }

  // Date field
  if (isDateString(keyName, value)) {
    return (
      <span className="font-mono text-slate-800 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded text-xs sm:text-sm">
        {formatDate(strVal)}
      </span>
    );
  }

  // General string or number
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(strVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span className="group/leaf inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-800 break-words">
      <span className="font-normal break-all">{strVal}</span>
      <button
        onClick={handleCopy}
        title="Copiar valor"
        className="opacity-0 group-hover/leaf:opacity-100 transition-opacity p-0.5 rounded text-slate-400 hover:text-slate-700"
      >
        {copied ? (
          <CheckIcon size={12} className="text-emerald-600" />
        ) : (
          <CopyIcon size={12} />
        )}
      </button>
    </span>
  );
};

// Recursive entry for a single key-value pair or container
const DynamicNode: React.FC<{
  nodeKey: string;
  data: unknown;
  depth?: number;
  initialExpanded?: boolean;
}> = ({ nodeKey, data, depth = 0, initialExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(
    depth < 2 ? initialExpanded : false
  );

  const label = formatKeyLabel(nodeKey);

  // If leaf primitive or null
  if (
    data === null ||
    data === undefined ||
    typeof data !== 'object'
  ) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-2 px-3 hover:bg-slate-50/80 rounded-lg transition-colors border-b border-slate-100 last:border-b-0">
        <span className="text-xs font-semibold text-slate-600 sm:w-1/3 shrink-0 break-words">
          {label}
        </span>
        <div className="sm:w-2/3 text-left sm:text-right">
          <FormattedLeaf keyName={nodeKey} value={data} />
        </div>
      </div>
    );
  }

  // If array
  if (Array.isArray(data)) {
    const itemCount = data.length;

    return (
      <div className="my-2 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3.5 bg-slate-50/90 hover:bg-slate-100/80 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-400">
              {isExpanded ? (
                <ChevronDownIcon size={16} />
              ) : (
                <ChevronRightIcon size={16} />
              )}
            </span>
            <span className="text-sm font-bold text-slate-800">{label}</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </span>
        </button>

        {isExpanded && (
          <div className="p-3 bg-white space-y-3">
            {itemCount === 0 ? (
              <p className="text-xs text-slate-400 italic p-2">Lista vazia</p>
            ) : (
              data.map((elem, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Item #{idx + 1}
                  </div>
                  {typeof elem === 'object' && elem !== null ? (
                    <div className="space-y-1">
                      {Object.entries(elem as Record<string, unknown>).map(
                        ([subKey, subVal]) => (
                          <DynamicNode
                            key={subKey}
                            nodeKey={subKey}
                            data={subVal}
                            depth={depth + 1}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <FormattedLeaf keyName={`${nodeKey}_${idx}`} value={elem} />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // If Object
  const entries = Object.entries(data as Record<string, unknown>);

  return (
    <div className="my-2 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 bg-slate-50/90 hover:bg-slate-100/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            {isExpanded ? (
              <ChevronDownIcon size={16} />
            ) : (
              <ChevronRightIcon size={16} />
            )}
          </span>
          <span className="text-sm font-bold text-slate-800">{label}</span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {entries.length} {entries.length === 1 ? 'campo' : 'campos'}
        </span>
      </button>

      {isExpanded && (
        <div className="p-3 bg-white space-y-1 divide-y divide-slate-100">
          {entries.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-2">Objeto vazio</p>
          ) : (
            entries.map(([subKey, subVal]) => (
              <DynamicNode
                key={subKey}
                nodeKey={subKey}
                data={subVal}
                depth={depth + 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const DynamicJsonViewer: React.FC<DynamicJsonViewerProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandAll, setExpandAll] = useState(true);

  // Filter top-level keys if user searches
  const filteredEntries = useMemo(() => {
    const entries = Object.entries(data);
    if (!searchTerm.trim()) return entries;

    const term = searchTerm.toLowerCase();

    return entries.filter(([key, val]) => {
      const matchKey =
        key.toLowerCase().includes(term) ||
        formatKeyLabel(key).toLowerCase().includes(term);
      const matchVal = JSON.stringify(val).toLowerCase().includes(term);
      return matchKey || matchVal;
    });
  }, [data, searchTerm]);

  return (
    <div
      id="dynamic-json-section"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
            <LayersIcon size={20} />
            <h2>Explorador Dinâmico Completo de Campos</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Renderização automática e recursiva de todos os dados retornados pela API publica.cnpj.ws
          </p>
        </div>

        {/* Filter input */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <SearchIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="input-search-dynamic"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar campos ou valores..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
            />
          </div>

          <button
            id="btn-toggle-expand-all"
            type="button"
            onClick={() => setExpandAll(!expandAll)}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {expandAll ? 'Recolher Todos' : 'Expandir Todos'}
          </button>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <p className="text-sm">Nenhum campo encontrado para &quot;{searchTerm}&quot;</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map(([key, val]) => (
            <DynamicNode
              key={`${key}-${expandAll}`}
              nodeKey={key}
              data={val}
              depth={0}
              initialExpanded={expandAll}
            />
          ))}
        </div>
      )}
    </div>
  );
};
