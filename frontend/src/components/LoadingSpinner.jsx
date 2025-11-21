const steps = ['Parsing PDF', 'Creating chunks', 'Generating embeddings'];

export default function LoadingSpinner({ isLoading, currentStep }) {
  if (!isLoading) return null;

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="relative flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-500" />
        </span>
        <p className="text-slate-800 font-semibold">İşleme devam ediyor…</p>
      </div>
      <div className="grid gap-3">
        {steps.map((label, idx) => (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              idx <= currentStep
                ? 'border-brand-200 bg-brand-50 text-brand-700'
                : 'border-slate-200 text-slate-500'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                idx <= currentStep ? 'bg-brand-500' : 'bg-slate-300'
              }`}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
