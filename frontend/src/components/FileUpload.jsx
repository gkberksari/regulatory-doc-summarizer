import { useRef, useState } from 'react';
import axios from 'axios';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function FileUpload({ onUploadSuccess, onLoadingState }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const resetProgress = () => {
    setProgress(0);
    setError('');
  };

  const validateFile = (file) => {
    if (!file) return 'Dosya seçilmedi.';
    if (file.type !== 'application/pdf') return 'Lütfen yalnızca PDF dosyası yükleyin.';
    if (file.size > MAX_FILE_SIZE) return 'Dosya boyutu 10MB sınırını aşıyor.';
    return '';
  };

  const uploadFile = async (file) => {
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    resetProgress();
    onLoadingState(true, 0);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setProgress(percent);
          const stepIndex = percent < 33 ? 0 : percent < 66 ? 1 : 2;
          onLoadingState(true, stepIndex);
        }
      });
      onLoadingState(false, 2);
      onUploadSuccess(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Yükleme sırasında bir sorun oluştu.');
      onLoadingState(false, 0);
    }
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center transition ${
          dragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50'
        }`}
        role="presentation"
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
        />
        <p className="text-slate-900 text-lg font-semibold mb-2">PDF’nizi sürükleyip bırakın</p>
        <p className="text-slate-500 mb-4">Yalnızca PDF • Maksimum 10 MB</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-700 transition"
        >
          Dosya Seç
        </button>
      </div>

      {progress > 0 && (
        <div className="mt-4">
          <div className="text-sm text-slate-600 mb-1">Yükleme ilerlemesi %{progress}</div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-rose-600 mt-3">{error}</p>}
    </div>
  );
}
