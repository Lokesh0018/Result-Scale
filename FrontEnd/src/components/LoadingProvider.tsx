import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

// Global state for tracking fetch requests
let activeRequests = 0;
const subscribers = new Set<(loading: boolean) => void>();

const updateSubscribers = () => {
  const isLoading = activeRequests > 0;
  subscribers.forEach(cb => cb(isLoading));
};

// Overwrite window.fetch immediately at module load time!
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit & { skipLoading?: boolean }) => {
  if (init?.skipLoading) {
    const { skipLoading, ...cleanInit } = init;
    return originalFetch(input, cleanInit);
  }
  activeRequests++;
  updateSubscribers();
  try {
    return await originalFetch(input, init);
  } finally {
    activeRequests--;
    updateSubscribers();
  }
};

const LoadingContext = createContext<{
  isLoading: boolean;
} | null>(null);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(activeRequests > 0);

  useEffect(() => {
    const handler = (loading: boolean) => {
      setIsLoading(loading);
    };
    subscribers.add(handler);
    // Sync initial state
    handler(activeRequests > 0);
    return () => {
      subscribers.delete(handler);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
      {isLoading && createPortal(
        <div className="global-loader-overlay">
          <div className="global-loader-content">
            <Loader2 className="global-loader-spinner" size={48} />
            <p className="global-loader-text">Processing Request...</p>
          </div>
        </div>,
        document.body
      )}
    </LoadingContext.Provider>
  );
};
