"use client";

import * as React from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDropzone({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 10,
  accept = "*",
  className = "",
  disabled = false,
}) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState([]);
  const [error, setError] = React.useState(null);
  const inputRef = React.useRef(null);

  const handleFiles = (files) => {
    setError(null);
    const validFiles = [];
    const maxBytes = maxSizeMB * 1024 * 1024;

    for (const file of Array.from(files)) {
      if (file.size > maxBytes) {
        setError(`File "${file.name}" exceeds the ${maxSizeMB}MB limit.`);
        return;
      }
      validFiles.push(file);
    }

    const updated = [...selectedFiles, ...validFiles].slice(0, maxFiles);
    setSelectedFiles(updated);
    onFilesSelected?.(updated);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelected?.(updated);
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer select-none flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all duration-fast",
          isDragOver
            ? "bg-accent-subtle/30 border-accent"
            : "bg-surface-raised/50 border-border-hairline hover:border-border-subtle hover:bg-surface-raised",
          disabled && "pointer-events-none cursor-not-allowed opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-border-hairline bg-surface-overlay text-text-secondary">
          <UploadCloud className="h-5 w-5" />
        </div>
        <p className="text-xs font-medium text-text-primary">
          <span className="text-accent underline underline-offset-2">
            Click to upload
          </span>{" "}
          or drag and drop
        </p>
        <p className="mt-1 text-2xs text-text-muted">
          Max {maxFiles} file{maxFiles > 1 ? "s" : ""} up to {maxSizeMB}MB
        </p>
      </div>

      {error && (
        <p className="text-2xs leading-tight text-semantic-danger">{error}</p>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-1.5">
          {selectedFiles.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded border border-border-hairline bg-surface-raised p-2 text-xs"
            >
              <div className="flex items-center space-x-2 truncate">
                <FileText className="h-4 w-4 shrink-0 text-text-muted" />
                <span className="truncate font-medium text-text-primary">
                  {file.name}
                </span>
                <span className="shrink-0 font-mono text-2xs text-text-muted">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(i);
                }}
                className="p-0.5 text-text-muted hover:text-semantic-danger"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
