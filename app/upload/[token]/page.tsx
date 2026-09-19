'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Camera, Image as ImageIcon, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

type SessionState = 'loading' | 'pending' | 'uploading' | 'uploaded' | 'expired' | 'error';

export default function MobileUploadPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<SessionState>('loading');
  const [vendorName, setVendorName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/public/upload-session/${token}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          setState('error');
          setErrorMessage(json.error || 'This link is invalid.');
          return;
        }
        setVendorName(json.data.vendorName || '');
        if (json.data.status === 'uploaded') setState('uploaded');
        else if (json.data.status === 'expired') setState('expired');
        else setState('pending');
      })
      .catch(() => {
        setState('error');
        setErrorMessage('Could not reach the server. Check your connection and reload.');
      });
  }, [token]);

  const handleFileChosen = async (file: File | undefined) => {
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setState('uploading');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/public/upload-session/${token}`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setState('uploaded');
      } else {
        setState('pending');
        setErrorMessage(json.error || 'Upload failed. Please try again.');
      }
    } catch {
      setState('pending');
      setErrorMessage('Network error — please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-full max-w-sm">
        <div className="w-12 h-12 bg-[#1a1a1a] text-[#f9f7f2] flex items-center justify-center font-serif text-xl font-bold mx-auto mb-6 rounded-lg">
          इ
        </div>

        {state === 'loading' && (
          <div className="flex flex-col items-center gap-3 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading upload link&hellip;</p>
          </div>
        )}

        {(state === 'pending' || state === 'uploading') && (
          <>
            <h1 className="font-serif text-2xl font-bold text-stone-900 mb-1">Upload a product photo</h1>
            {vendorName && (
              <p className="text-sm text-stone-500 mb-8">for {vendorName}</p>
            )}

            {previewUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-stone-200 aspect-square bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Selected preview" className="w-full h-full object-cover" />
              </div>
            )}

            {state === 'uploading' ? (
              <div className="flex flex-col items-center gap-3 text-stone-600 py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm font-medium">Uploading&hellip;</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-[#1a1a1a] text-white font-bold uppercase text-xs tracking-[0.15em] rounded-xl shadow"
                >
                  <Camera className="w-4 h-4" />
                  Take a photo
                </button>
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-stone-300 text-stone-800 font-bold uppercase text-xs tracking-[0.15em] rounded-xl"
                >
                  <ImageIcon className="w-4 h-4" />
                  Choose from gallery
                </button>
              </div>
            )}

            {errorMessage && (
              <p className="mt-4 text-xs text-red-600 font-medium">{errorMessage}</p>
            )}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileChosen(e.target.files?.[0])}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChosen(e.target.files?.[0])}
            />
          </>
        )}

        {state === 'uploaded' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            <h1 className="font-serif text-2xl font-bold text-stone-900">Photo uploaded!</h1>
            <p className="text-sm text-stone-500 max-w-xs">
              You&apos;re all set. Go back to your computer and refresh the product form to see it
              filled in automatically.
            </p>
          </div>
        )}

        {state === 'expired' && (
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
            <h1 className="font-serif text-2xl font-bold text-stone-900">This link expired</h1>
            <p className="text-sm text-stone-500 max-w-xs">
              QR codes are only valid for a few minutes. Please go back to the computer and
              generate a new one.
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <h1 className="font-serif text-2xl font-bold text-stone-900">Something went wrong</h1>
            <p className="text-sm text-stone-500 max-w-xs">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}