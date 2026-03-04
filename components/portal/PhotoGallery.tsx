'use client';

import { useState } from 'react';

interface Props {
  photos: string[];
  title?: string;
}

export default function PhotoGallery({ photos, title }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <div>
      {title && <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>}
      <div className="flex gap-2 flex-wrap">
        {photos.map((photo, i) => (
          <button key={i} onClick={() => setSelected(i)}
            className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden hover:ring-2 hover:ring-[#2A9D8F] transition-all flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSelected(null)}>
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm text-gray-600">Photo {selected + 1} of {photos.length}</p>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-sm">Warehouse photo placeholder</p>
                <p className="text-xs mt-1">{photos[selected]}</p>
              </div>
            </div>
            <div className="flex justify-between px-4 py-3">
              <button onClick={() => setSelected(Math.max(0, selected - 1))} disabled={selected === 0}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30">Previous</button>
              <button onClick={() => setSelected(Math.min(photos.length - 1, selected + 1))} disabled={selected === photos.length - 1}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
