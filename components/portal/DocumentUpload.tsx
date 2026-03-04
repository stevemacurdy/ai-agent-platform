'use client';

import { useState, useRef } from 'react';

interface Props {
  label: string;
  accept?: string;
  multiple?: boolean;
  onUpload: (files: File[]) => void;
}

export default function DocumentUpload({ label, accept = '.pdf,.jpg,.jpeg,.png', multiple = false, onUpload }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    setFiles(prev => [...prev, ...arr]);
    arr.forEach(f => {
      if (f.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviews(prev => [...prev, e.target?.result as string]);
        reader.readAsDataURL(f);
      } else {
        setPreviews(prev => [...prev, '']);
      }
    });
    onUpload(arr);
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#2A9D8F] hover:bg-[#2A9D8F]/5 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG supported</p>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              {previews[i] ? (
                <img src={previews[i]} alt="" className="w-10 h-10 rounded object-cover" />
              ) : (
                <div className="w-10 h-10 rounded bg-red-50 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-500">PDF</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">{f.name}</p>
                <p className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
