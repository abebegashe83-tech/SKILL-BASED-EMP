'use client';

import React, { useState, useRef } from 'react';
import api from '@/lib/api';

const IconUpload = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>;
const IconCheck = () => <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>;
const IconFile = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>;
const IconX = () => <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>;

export default function CVUpload({ onUploadSuccess, currentCV }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf') {
      setStatus('error');
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setStatus('error');
      setErrorMsg('File exceeds the 5MB limit.');
      return;
    }

    setFile(selected);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const res = await api.post('upload-cv/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setStatus('success');
      setFile(null); // Clear selected file after upload
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onUploadSuccess) {
        onUploadSuccess(res.data.cv_url);
      }
      
      // Reset success status after a few seconds
      setTimeout(() => setStatus('idle'), 3000);
      
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.error || 'Upload failed. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-colors">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        
        {/* CV Status / Input */}
        <div className="flex-1 w-full">
          {currentCV && !file ? (
             <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
               <div className="flex items-center gap-3 truncate">
                 <IconFile />
                 <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">My Resume (PDF)</span>
               </div>
               <a href={currentCV} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest shrink-0 ml-4">View CV</a>
             </div>
          ) : (
             <div className="relative">
               <input 
                 type="file" 
                 accept="application/pdf"
                 onChange={handleFileChange}
                 ref={fileInputRef}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               <div className={`flex items-center justify-between bg-white dark:bg-gray-900 px-4 py-3 rounded-xl border transition-colors ${file ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700 border-dashed hover:border-gray-300 dark:hover:border-gray-600'}`}>
                 <div className="flex items-center gap-3 truncate">
                   <div className={`shrink-0 ${file ? 'text-blue-500' : 'text-gray-400'}`}>
                     <IconUpload />
                   </div>
                   <span className={`text-sm font-semibold truncate ${file ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                     {file ? file.name : "Click or drag to select PDF (Max 5MB)"}
                   </span>
                 </div>
                 {file && (
                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       setFile(null);
                       if (fileInputRef.current) fileInputRef.current.value = '';
                     }}
                     className="relative z-20 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-4 shrink-0"
                   >
                     <IconX />
                   </button>
                 )}
               </div>
             </div>
          )}
        </div>

        {/* Upload Action */}
        <button 
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className={`shrink-0 h-[46px] px-8 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
            !file 
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
              : status === 'uploading'
                ? 'bg-blue-600/50 text-white cursor-wait'
                : status === 'success'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-95'
          }`}
        >
          {status === 'uploading' ? 'Uploading...' : status === 'success' ? <div className="flex items-center gap-2"><IconCheck /> <span>Done</span></div> : currentCV ? 'Replace CV' : 'Upload CV'}
        </button>
      </div>

      {/* Error Message */}
      {status === 'error' && (
        <p className="mt-3 text-sm font-semibold text-rose-500 flex items-center gap-2">
          <span>⚠️</span> {errorMsg}
        </p>
      )}
      
    </div>
  );
}
