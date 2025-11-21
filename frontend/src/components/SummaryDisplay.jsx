export default function SummaryDisplay({ fullSummary, querySummary, modelInfo }) {
  if (!fullSummary && !querySummary) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-500">
        Henüz özet bulunmuyor. PDF yükleyip sorgu gönderdikten sonra burada görünecek.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {fullSummary && (
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Tam Doküman Özeti</h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{fullSummary}</p>
        </section>
      )}

      {querySummary && (
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Sorgu Bazlı Özet</h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{querySummary}</p>
        </section>
      )}

      <div className="text-xs text-slate-500">
        <span className="font-medium">Model:</span> {modelInfo || 'T5-base / BART (konfigüre edilebilir)'}
      </div>
    </div>
  );
}
