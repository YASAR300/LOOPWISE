"use client";

import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

let globalToastHandler = null;

export const toast = Object.assign(
  (options) => {
    if (globalToastHandler) {
      return globalToastHandler(options);
    }
  },
  {
    success: (title, opts = {}) => {
      if (globalToastHandler) {
        return globalToastHandler({
          title,
          description: typeof opts === "string" ? opts : opts.description,
          action: opts.action ? (
            <button
              type="button"
              onClick={opts.action.onClick}
              className="mt-1 text-left text-xs font-semibold text-brand-indigo hover:underline"
            >
              {opts.action.label}
            </button>
          ) : undefined,
          variant: "success",
        });
      }
    },
    error: (title, opts = {}) => {
      if (globalToastHandler) {
        return globalToastHandler({
          title,
          description: typeof opts === "string" ? opts : opts.description,
          variant: "danger",
        });
      }
    },
    info: (title, opts = {}) => {
      if (globalToastHandler) {
        return globalToastHandler({
          title,
          description: typeof opts === "string" ? opts : opts.description,
          variant: "info",
        });
      }
    },
  }
);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      description,
      variant = "default",
      duration = 4500,
      action,
      onUndo,
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, title, description, variant, action, onUndo };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  useEffect(() => {
    globalToastHandler = showToast;
    return () => {
      globalToastHandler = null;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toast: showToast, removeToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "shadow-warm pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-panel p-3.5 text-xs transition-all",
              t.variant === "success" &&
                "border-emerald-300 dark:border-emerald-800",
              t.variant === "danger" && "border-red-300 dark:border-red-800",
              t.variant === "warning" &&
                "border-amber-300 dark:border-amber-800"
            )}
          >
            {t.variant === "success" && (
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            {t.variant === "danger" && (
              <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            {t.variant === "warning" && (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            )}
            {(t.variant === "info" || t.variant === "default") && (
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-indigo" />
            )}

            <div className="flex-1">
              <div className="font-semibold text-ink">{t.title}</div>
              {t.description && (
                <div className="mt-0.5 text-ink-2">{t.description}</div>
              )}
              {t.onUndo && (
                <button
                  type="button"
                  onClick={() => {
                    t.onUndo();
                    removeToast(t.id);
                  }}
                  className="mt-1 text-left text-xs font-semibold text-brand-indigo hover:underline"
                >
                  Undo
                </button>
              )}
              {t.action && !t.onUndo && (
                <div className="mt-1.5">{t.action}</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-0.5 text-ink-3 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
