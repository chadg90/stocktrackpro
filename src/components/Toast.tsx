'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

// ============================================
// CONTEXT
// ============================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================
// TOAST ITEM COMPONENT
// ============================================

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  };

  const styles = {
    success: 'border-green-500/30 bg-green-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${styles[toast.type]} backdrop-blur-sm shadow-lg animate-slide-in`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-white/70 text-sm mt-1">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 text-white/50 hover:text-white transition-colors rounded"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ============================================
// TOAST CONTAINER COMPONENT
// ============================================

function ToastContainer() {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts, removeToast } = context;

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

// ============================================
// TOAST PROVIDER COMPONENT
// ============================================

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = generateId();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, [generateId]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string): string => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string): string => {
    return addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string): string => {
    return addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string): string => {
    return addToast({ type: 'info', title, message });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
