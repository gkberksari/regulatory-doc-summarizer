import { useState } from 'react';

export default function DocumentViewer({ docId, sources, onQuery, isQuerying }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim() || !docId) return;
    onQuery(query.trim());
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Doküman Sorgulama</h2>
        <p className="text-sm text-slate-500">
          {docId
            ? `Doküman ID: ${docId}`
            : 'Sorgu yapmadan önce bir PDF yüklemeniz gerekiyor.'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          rows={3}
          disabled={!docId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Örn: GDPR’da veri ihlal bildirimi süresi nedir?"
          className="w-full rounded-xl border border-slate-200 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-400"
        />
        <button
          type="submit"
          disabled={!docId || isQuerying}
          className="inline-flex justify-center items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isQuerying ? 'Sorgulanıyor…' : 'Sorgu Gönder'}
        </button>
      </form>

      {sources?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Kaynak Chunk’lar</h3>
          <div className="grid gap-3">
            {sources.map((source) => (
              <div key={source.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <p className="text-sm text-slate-600 mb-2">{source.content}</p>
                <div className="text-xs text-slate-500">
                  {source.metadata?.article && <span>Article {source.metadata.article} • </span>}
                  {source.metadata?.page && <span>Sayfa {source.metadata.page}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
