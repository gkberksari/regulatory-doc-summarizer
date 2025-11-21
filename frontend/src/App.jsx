import { useCallback, useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import DocumentViewer from './components/DocumentViewer.jsx';
import SummaryDisplay from './components/SummaryDisplay.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function App() {
  const [docId, setDocId] = useState('');
  const [documentMeta, setDocumentMeta] = useState(null);
  const [fullSummary, setFullSummary] = useState('');
  const [querySummary, setQuerySummary] = useState('');
  const [sources, setSources] = useState([]);
  const [modelInfo, setModelInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleUploadSuccess = async (payload) => {
    if (!payload?.doc_id) return;
    setDocId(payload.doc_id);
    setFullSummary(payload.summary || '');
    setModelInfo(payload.model || 't5-base');
    await fetchDocumentInfo(payload.doc_id);
  };

  const fetchDocumentInfo = useCallback(async (id) => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/document/${id}`);
      setDocumentMeta(data);
      if (data?.summary) setFullSummary(data.summary);
      if (data?.model) setModelInfo(data.model);
    } catch (error) {
      console.error('Doküman bilgisi alınamadı', error);
    }
  }, []);

  const handleLoadingState = (state, step) => {
    setIsLoading(state);
    setLoadingStep(step);
  };

  const handleQuery = async (query) => {
    setIsQuerying(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/summarize`, {
        doc_id: docId,
        query
      });
      setQuerySummary(data.summary);
      setSources(data.sources || []);
      if (data.model) setModelInfo(data.model);
    } catch (error) {
      console.error('Sorgu çalıştırılamadı', error);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-500">Regulatory AI</p>
            <h1 className="text-2xl font-semibold text-slate-900">Regulatory Doc Summarizer</h1>
          </div>
          <span className="text-sm text-slate-500">GDPR • KVKK • PCI DSS</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <FileUpload onUploadSuccess={handleUploadSuccess} onLoadingState={handleLoadingState} />
        <LoadingSpinner isLoading={isLoading} currentStep={loadingStep} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DocumentViewer
            docId={docId}
            sources={sources}
            onQuery={handleQuery}
            isQuerying={isQuerying}
          />
          <SummaryDisplay
            fullSummary={fullSummary}
            querySummary={querySummary}
            modelInfo={modelInfo}
            documentMeta={documentMeta}
          />
        </div>
      </main>
    </div>
  );
}
