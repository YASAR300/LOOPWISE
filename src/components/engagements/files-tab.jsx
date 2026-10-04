// src/components/engagements/files-tab.jsx
"use client";

import { useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Eye,
  FileCode,
  Image as ImageIcon,
  ExternalLink,
  Plus,
  Clock,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function FilesTab({
  engagement,
  files = [],
  deliverables = [],
  userRole,
  isClosed,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeliverable, setSelectedDeliverable] = useState("ALL");
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Form state
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSizeStr, setFileSizeStr] = useState("1.2 MB");
  const [fileType, setFileType] = useState("application/pdf");
  const [linkedDeliverableId, setLinkedDeliverableId] = useState("");
  const [uploadError, setUploadError] = useState("");

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDeliverable =
      selectedDeliverable === "ALL" ||
      (selectedDeliverable === "GENERAL" && !f.deliverableId) ||
      f.deliverableId === selectedDeliverable;
    return matchesSearch && matchesDeliverable;
  });

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!fileName.trim() || !fileUrl.trim()) {
      setUploadError("Please enter file name and storage URL");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const res = await fetch(`/api/engagements/${engagement.id}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fileName.trim(),
          fileUrl: fileUrl.trim(),
          fileSize: 1024 * 1024 * 2, // 2MB default estimate
          fileType: fileType,
          deliverableId: linkedDeliverableId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload file");

      setShowUploadModal(false);
      setFileName("");
      setFileUrl("");
      setLinkedDeliverableId("");
      if (onRefresh) onRefresh();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type, name) => {
    const ext = name.split(".").pop().toLowerCase();
    if (
      type?.includes("image") ||
      ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
    ) {
      return <ImageIcon className="h-5 w-5 text-purple-400" />;
    }
    if (ext === "pdf" || type?.includes("pdf")) {
      return <FileText className="h-5 w-5 text-rose-400" />;
    }
    if (["json", "js", "py", "sh", "yaml", "yml"].includes(ext)) {
      return <FileCode className="h-5 w-5 text-blue-400" />;
    }
    return <FileText className="text-muted-foreground h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="border-border/60 flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight">
            Engagement Files & Assets
            <Badge variant="outline" className="bg-muted/40 font-mono text-xs">
              {files.length} {files.length === 1 ? "file" : "files"}
            </Badge>
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Scoped documents, architecture blueprints, automation configs, and
            deliverables.
          </p>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          {!isClosed && (
            <Button
              onClick={() => setShowUploadModal(true)}
              className="text-primary-foreground w-full gap-2 bg-primary shadow-sm sm:w-auto"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          )}
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-card/40 border-border/50 flex flex-col items-center justify-between gap-3 rounded-xl border p-3 sm:flex-row">
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute left-3 top-2.5 h-4 w-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files by name..."
            className="bg-background/60 h-9 pl-9"
          />
        </div>

        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <Filter className="text-muted-foreground h-4 w-4 shrink-0" />
          <button
            onClick={() => setSelectedDeliverable("ALL")}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedDeliverable === "ALL"
                ? "text-primary-foreground bg-primary"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
            }`}
          >
            All Files
          </button>
          <button
            onClick={() => setSelectedDeliverable("GENERAL")}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedDeliverable === "GENERAL"
                ? "text-primary-foreground bg-primary"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
            }`}
          >
            General Assets
          </button>
          {deliverables.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeliverable(d.id)}
              className={`max-w-[140px] truncate whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedDeliverable === d.id
                  ? "text-primary-foreground bg-primary"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
              title={d.title}
            >
              {d.title}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid / Table */}
      {filteredFiles.length === 0 ? (
        <div className="border-border/80 bg-card/20 rounded-xl border border-dashed p-12 text-center">
          <FileText className="text-muted-foreground/40 mx-auto mb-3 h-10 w-10" />
          <h3 className="text-foreground text-sm font-semibold">
            No files uploaded yet
          </h3>
          <p className="text-muted-foreground mx-auto mb-4 mt-1 max-w-sm text-xs">
            Upload architecture schemas, n8n/Make blueprints, API configurations
            or milestone deliverables.
          </p>
          {!isClosed && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUploadModal(true)}
              className="gap-2"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload First File
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map((file) => {
            const linkedDeliverable = deliverables.find(
              (d) => d.id === file.deliverableId
            );
            const isImage =
              file.fileType?.includes("image") ||
              /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
            const isPdf =
              file.fileType?.includes("pdf") || /\.pdf$/i.test(file.name);

            return (
              <div
                key={file.id}
                className="bg-card/60 hover:bg-card/90 border-border/60 hover:border-primary/40 group relative flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all duration-200"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="bg-muted/60 shrink-0 rounded-lg p-2.5">
                      {getFileIcon(file.fileType, file.name)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="bg-background px-2 py-0.5 font-mono text-[10px] font-medium"
                      >
                        v{file.version}
                      </Badge>
                      {file.version > 1 && (
                        <span className="text-[10px] font-medium text-emerald-400">
                          Updated
                        </span>
                      )}
                    </div>
                  </div>

                  <h4
                    className="text-foreground line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary"
                    title={file.name}
                  >
                    {file.name}
                  </h4>

                  <div className="text-muted-foreground mt-1.5 flex items-center gap-2 text-xs">
                    <span>
                      {(file.fileSize / (1024 * 1024)).toFixed(1) || "1.0"} MB
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(file.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {linkedDeliverable && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <Layers className="text-muted-foreground h-3 w-3" />
                      <span
                        className="text-muted-foreground max-w-[200px] truncate text-xs"
                        title={linkedDeliverable.title}
                      >
                        {linkedDeliverable.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-border/40 mt-4 flex items-center justify-between gap-2 border-t pt-3">
                  <div className="flex items-center gap-1.5">
                    {(isImage || isPdf) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewFile(file)}
                        className="h-8 gap-1.5 px-2 text-xs hover:text-primary"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </Button>
                    )}
                  </div>

                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:bg-primary/10 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Open / Download
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="bg-background/80 animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border-border w-full max-w-lg space-y-4 rounded-xl border p-6 shadow-2xl">
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                <Upload className="h-5 w-5 text-primary" />
                Upload Engagement Asset
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Document / File Name *
                </label>
                <Input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. LLM_Agent_Architecture_v2.pdf or n8n_sales_sync.json"
                  required
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  File URL or Cloud Storage Link *
                </label>
                <Input
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://storage.googleapis.com/... or https://..."
                  required
                />
                <p className="text-muted-foreground mt-1 text-[11px]">
                  Provide S3/GCS bucket URL, Google Drive preview link, or
                  artifact repository URL.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    File Type
                  </label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="border-input h-9 w-full rounded-md border bg-background px-3 text-xs"
                  >
                    <option value="application/pdf">PDF Document</option>
                    <option value="image/png">PNG / JPG Image</option>
                    <option value="application/json">
                      JSON Workflow / Code
                    </option>
                    <option value="text/markdown">Markdown Document</option>
                    <option value="application/octet-stream">
                      Other Binary / Archive
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Link to Deliverable (Optional)
                  </label>
                  <select
                    value={linkedDeliverableId}
                    onChange={(e) => setLinkedDeliverableId(e.target.value)}
                    className="border-input h-9 w-full rounded-md border bg-background px-3 text-xs"
                  >
                    <option value="">General Project Asset</option>
                    {deliverables.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-border/60 flex justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUploading}
                  className="text-primary-foreground gap-2 bg-primary"
                >
                  {isUploading ? "Uploading..." : "Save Asset"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="bg-background/80 animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-card border-border flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border shadow-2xl">
            <div className="border-border/60 flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted/60 rounded p-2">
                  {getFileIcon(previewFile.fileType, previewFile.name)}
                </div>
                <div>
                  <h3 className="text-foreground text-sm font-semibold">
                    {previewFile.name}
                  </h3>
                  <p className="text-muted-foreground font-mono text-xs">
                    Version {previewFile.version}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewFile.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md p-2 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="bg-background/40 flex min-h-[400px] flex-1 items-center justify-center overflow-auto p-4">
              {previewFile.fileType?.includes("image") ||
              /\.(jpg|jpeg|png|webp|gif)$/i.test(previewFile.name) ? (
                <img
                  src={previewFile.fileUrl}
                  alt={previewFile.name}
                  className="border-border/40 max-h-[70vh] max-w-full rounded-lg border object-contain"
                />
              ) : previewFile.fileType?.includes("pdf") ||
                /\.pdf$/i.test(previewFile.name) ? (
                <iframe
                  src={previewFile.fileUrl}
                  title={previewFile.name}
                  className="border-border/40 h-[70vh] w-full rounded-lg border"
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    Preview not available for this file format. Please download
                    or open directly.
                  </p>
                  <a
                    href={previewFile.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-foreground mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
