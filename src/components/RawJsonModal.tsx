import React, { useState, useEffect } from 'react';
import {
  CodeIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  XIcon,
} from './icons';

interface RawJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: unknown;
  cnpjNumber?: string;
}

export const RawJsonModal: React.FC<RawJsonModalProps> = ({
  isOpen,
  onClose,
  data,
  cnpjNumber,
}) => {
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cnpj_${cnpjNumber || 'consulta'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Syntax highlighting
  const renderHighlightedJson = (json: string) => {
    // Basic regex tokenizer for JSON syntax highlighting
    const formatted = json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-600'; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-indigo-600 font-semibold'; // key
          } else {
            cls = 'text-emerald-700'; // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-600 font-bold'; // boolean
        } else if (/null/.test(match)) {
          cls = 'text-rose-500 font-medium italic'; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );

    return { __html: formatted };
  };

  // Approximate line and size stats
  const lineCount = jsonString.split('\n').length;
  const byteSize = new Blob([jsonString]).size;
  const kbSize = (byteSize / 1024).toFixed(1);

  return (
    <div
      id="raw-json-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="raw-json-modal-dialog"
        className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <CodeIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                JSON Bruto da Consulta
              </h3>
              <p className="text-xs text-slate-500">
                {lineCount} linhas • {kbSize} KB • Resposta original da API publica.cnpj.ws
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-raw-json"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              {copied ? (
                <>
                  <CheckIcon size={14} />
                  Copiado!
                </>
              ) : (
                <>
                  <CopyIcon size={14} />
                  Copiar JSON
                </>
              )}
            </button>

            <button
              id="btn-download-json"
              onClick={handleDownload}
              title="Baixar arquivo JSON"
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <DownloadIcon size={16} />
            </button>

            <button
              id="btn-close-modal"
              onClick={onClose}
              title="Fechar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-1"
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>

        {/* Search bar inside JSON */}
        <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar texto no JSON (ex: 'capital', 'logradouro')..."
            className="w-full max-w-sm px-3 py-1 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          />
          <span className="hidden sm:inline text-[11px] text-slate-500">
            Dica: Pressione Esc para fechar
          </span>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed selection:bg-indigo-500 selection:text-white">
          <pre
            className="overflow-x-auto whitespace-pre font-mono"
            dangerouslySetInnerHTML={renderHighlightedJson(
              filterQuery
                ? jsonString
                    .split('\n')
                    .filter((line) =>
                      line.toLowerCase().includes(filterQuery.toLowerCase())
                    )
                    .join('\n')
                : jsonString
            )}
          />
        </div>
      </div>
    </div>
  );
};
