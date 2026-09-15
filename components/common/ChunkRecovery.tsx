'use client';

import { useEffect } from 'react';

/**
 * Automatically recovers from Next.js ChunkLoadErrors
 * (which occur when the development server recompiles chunks with new hashes while an active browser tab holds older chunk references).
 */
export default function ChunkRecovery() {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = 'reason' in event ? event.reason : event.error;
      const message = error?.message || (typeof error === 'string' ? error : '') || '';
      const name = error?.name || '';

      if (
        name === 'ChunkLoadError' ||
        message.includes('Loading chunk') ||
        message.includes('failed to load chunk') ||
        message.includes('ChunkLoadError')
      ) {
        console.warn('[ChunkRecovery] Detected stale chunk bundle. Performing clean refresh...', message);
        if (typeof window !== 'undefined') {
          // If we haven't reloaded recently, perform a reload to fetch fresh bundles
          const lastReload = sessionStorage.getItem('last_chunk_reload');
          const now = Date.now();
          if (!lastReload || now - parseInt(lastReload, 10) > 3000) {
            sessionStorage.setItem('last_chunk_reload', now.toString());
            window.location.reload();
          }
        }
      }
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleChunkError);

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleChunkError);
    };
  }, []);

  return null;
}
