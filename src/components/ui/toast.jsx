"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
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

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex animate-fade-in items-start gap-3 rounded-lg border border-border-hairline bg-surface-raised p-3.5 shadow-2xl transition-all duration-fast",
              t.variant === "success" &&
                "border-semantic-success/30 bg-surface-raised",
              t.variant === "danger" &&
                "border-semantic-danger/30 bg-surface-raised",
              t.variant === "warning" &&
                "border-semantic-warning/30 bg-surface-raised"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {t.variant === "success" && (
                <CheckCircle className="h-4 w-4 text-semantic-success" />
              )}
              {t.variant === "danger" && (
                <AlertOctagon className="h-4 w-4 text-semantic-danger" />
              )}
              {t.variant === "warning" && (
                <AlertTriangle className="h-4 w-4 text-semantic-warning" />
              )}
              {(!t.variant ||
                t.variant === "default" ||
                t.variant === "info") && (
                <Info className="h-4 w-4 text-accent" />
              )}
            </div>

            <div className="grid flex-1 gap-1">
              {t.title && (
                <div className="text-xs font-semibold leading-tight text-text-primary">
                  {t.title}
                </div>
              )}
              {t.description && (
                <div className="text-2xs leading-normal text-text-secondary">
                  {t.description}
                </div>
              )}
              {t.onUndo && (
                <button
                  type="button"
                  onClick={() => {
                    t.onUndo();
                    removeToast(t.id);
                  }}
                  className="mt-1 text-left text-xs font-medium text-accent hover:underline"
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
              className="shrink-0 p-0.5 text-text-muted hover:text-text-primary"
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
