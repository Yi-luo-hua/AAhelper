
import React, { useCallback, useState, useRef } from 'react';

interface ReceiptUploaderProps {
  onUpload: (file: File) => void;
  isAnalyzing: boolean;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onUpload, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  }

  return (
    <div 
      className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors p-4 text-center
        ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white'}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="bg-indigo-100 p-3 rounded-full mb-3">
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-slate-800 mb-1">上传小票</h3>
      <p className="text-slate-500 mb-4 max-w-xs text-sm">
        拖拽图片到这里，或点击下方按钮
      </p>

      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        accept="image/*" 
        onChange={handleChange} 
        disabled={isAnalyzing}
      />
      <button 
        onClick={handleButtonClick}
        disabled={isAnalyzing}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm text-white shadow-md transition-all
          ${isAnalyzing 
            ? 'bg-slate-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg cursor-pointer'
          }
        `}
      >
        {isAnalyzing ? '正在分析...' : '选择图片'}
      </button>
      
      {isAnalyzing && (
        <p className="mt-3 text-xs text-indigo-600 animate-pulse font-medium">
          Gemini 正在读取小票...
        </p>
      )}
    </div>
  );
};
