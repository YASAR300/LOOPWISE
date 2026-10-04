// src/components/engagements/contract-viewer-modal.jsx
"use client";

import React, { useState } from "react";
import {
  FileText,
  X,
  Download,
  CheckCircle2,
  Clock,
  History,
  MessageSquare,
  Edit3,
  ShieldCheck,
  Send,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export function ContractViewerModal({
  contract,
  engagement,
  userRole = "CLIENT",
  isOpen,
  onClose,
  onContractUpdated,
}) {
  const [activeTab, setActiveTab] = useState("preview"); // preview | versions | comment
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTerms, setEditedTerms] = useState(contract?.termsMd || "");
  const [changeNotes, setChangeNotes] = useState("");
  const [commentText, setCommentText] = useState("");
  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !contract) return null;

  const isClient = userRole === "CLIENT";
  const isStrategist = userRole === "STRATEGIST";

  const isSignedByMe = isClient
    ? Boolean(contract.signedByClientAt)
    : Boolean(contract.signedByStrategistAt);

  const versions = contract.versions || [];
  const currentTerms = selectedVersion
    ? selectedVersion.termsMd
    : contract.termsMd;

  const handleSign = async (e) => {
    e.preventDefault();
    if (!agreed || !typedName.trim()) {
      toast.error("Please enter your legal name and confirm the agreement.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typedName: typedName.trim(),
          agreeCheckbox: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign contract");

      toast.success(
        data.bothSigned
          ? "Contract Fully Executed & Active! 🎉"
          : "Agreement signed! Awaiting counter-signature."
      );
      if (onContractUpdated) onContractUpdated(data.contract);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAmendment = async () => {
    if (!editedTerms.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}/negotiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termsMd: editedTerms,
          changesSummary: changeNotes || "Terms revision",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save revision");

      toast.success(
        `Draft Version ${data.versionNumber} saved & sent for review.`
      );
      setIsEditing(false);
      if (onContractUpdated) onContractUpdated(data.contract);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`/api/contracts/${contract.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");

      toast.success("Comment added to negotiation log");
      setCommentText("");
      if (onContractUpdated) {
        onContractUpdated({
          ...contract,
          comments: [...(contract.comments || []), data.comment],
        });
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-line bg-panel shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-indigo/10 flex h-10 w-10 items-center justify-center rounded-xl text-brand-indigo">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-ink">
                  Engagement Agreement
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-2xs font-semibold ${
                    contract.status === "ACTIVE"
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                      : "border border-amber-500/20 bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {contract.status}
                </span>
              </div>
              <p className="text-xs text-ink-3">
                Contract ID: {contract.id} • Model: {contract.model}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/contracts/${contract.id}/pdf`}
              download
              className="btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Signed PDF</span>
            </a>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-3 hover:bg-panel-2 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-line px-6 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab("preview");
              setSelectedVersion(null);
            }}
            className={`border-b-2 py-3 transition-colors ${
              activeTab === "preview" && !selectedVersion
                ? "border-brand-indigo text-brand-indigo"
                : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            Agreement Terms
          </button>
          <button
            onClick={() => setActiveTab("versions")}
            className={`flex items-center gap-1.5 border-b-2 py-3 transition-colors ${
              activeTab === "versions" || selectedVersion
                ? "border-brand-indigo text-brand-indigo"
                : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Version History ({versions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("comment")}
            className={`flex items-center gap-1.5 border-b-2 py-3 transition-colors ${
              activeTab === "comment"
                ? "border-brand-indigo text-brand-indigo"
                : "border-transparent text-ink-3 hover:text-ink"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Negotiation Notes ({(contract.comments || []).length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Contract Content Area */}
          <div className="flex flex-1 flex-col overflow-y-auto p-6">
            {activeTab === "versions" && (
              <div className="mb-4 rounded-xl border border-line bg-panel-2 p-3">
                <span className="text-xs font-semibold text-ink">
                  Select a version to inspect:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {versions.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVersion(v)}
                      className={`rounded-lg px-2.5 py-1 text-2xs font-semibold transition-all ${
                        selectedVersion?.id === v.id
                          ? "bg-brand-indigo text-white"
                          : "border border-line bg-panel text-ink hover:bg-panel-2"
                      }`}
                    >
                      v{v.versionNumber} (
                      {new Date(v.createdAt).toLocaleDateString()})
                    </button>
                  ))}
                </div>
                {selectedVersion && (
                  <p className="mt-2 text-2xs text-ink-3">
                    Summary:{" "}
                    {selectedVersion.changesSummary || "Standard revision"}
                  </p>
                )}
              </div>
            )}

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">
                    Amendment Summary (Reason for changes)
                  </label>
                  <input
                    type="text"
                    value={changeNotes}
                    onChange={(e) => setChangeNotes(e.target.value)}
                    placeholder="e.g., Updated weekly cap from 20 to 25 hours, clarified IP clause"
                    className="input-base w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">
                    Contract Terms Markdown
                  </label>
                  <textarea
                    rows={16}
                    value={editedTerms}
                    onChange={(e) => setEditedTerms(e.target.value)}
                    className="input-base w-full font-mono text-xs leading-relaxed"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-outline px-3 py-1.5 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSaveAmendment}
                    className="btn-primary-orange px-4 py-1.5 text-xs font-semibold"
                  >
                    {isSubmitting ? "Saving..." : "Save & Request Review"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-3">
                    {selectedVersion
                      ? `Viewing Snapshot v${selectedVersion.versionNumber}`
                      : "Official Agreement Document"}
                  </span>
                  {contract.status !== "ACTIVE" &&
                    contract.status !== "COMPLETED" && (
                      <button
                        onClick={() => {
                          setEditedTerms(contract.termsMd);
                          setIsEditing(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:underline"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Propose Clause Amendments</span>
                      </button>
                    )}
                </div>

                <div className="prose prose-xs max-w-none rounded-xl border border-line bg-canvas p-6 text-xs leading-relaxed text-ink">
                  <pre className="whitespace-pre-wrap font-sans text-xs text-ink">
                    {currentTerms}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Signatures & Discussion */}
          <div className="bg-panel-2/50 flex w-80 shrink-0 flex-col justify-between overflow-y-auto border-l border-line p-6">
            <div className="space-y-6">
              {/* E-Acceptance Status Card */}
              <div className="space-y-3 rounded-xl border border-line bg-panel p-4">
                <h3 className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <ShieldCheck className="h-4 w-4 text-brand-indigo" />
                  <span>Execution Status</span>
                </h3>

                {/* Client Signature State */}
                <div className="flex items-start gap-2.5 text-xs">
                  {contract.signedByClientAt ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  <div>
                    <div className="font-semibold text-ink">
                      Client Organization
                    </div>
                    <div className="text-2xs text-ink-3">
                      {contract.clientSignedName
                        ? `Signed by ${contract.clientSignedName}`
                        : "Awaiting signature"}
                    </div>
                    {contract.clientSignedAt && (
                      <div className="text-ink-4 text-[10px]">
                        {new Date(contract.clientSignedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Strategist Signature State */}
                <div className="flex items-start gap-2.5 text-xs">
                  {contract.signedByStrategistAt ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  <div>
                    <div className="font-semibold text-ink">
                      Automation Strategist
                    </div>
                    <div className="text-2xs text-ink-3">
                      {contract.strategistSignedName
                        ? `Signed by ${contract.strategistSignedName}`
                        : "Awaiting signature"}
                    </div>
                    {contract.strategistSignedAt && (
                      <div className="text-ink-4 text-[10px]">
                        {new Date(contract.strategistSignedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Discussion / Comments */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-ink">
                  Negotiation Notes
                </h4>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {(contract.comments || []).length === 0 ? (
                    <p className="text-2xs text-ink-3">No comments yet.</p>
                  ) : (
                    (contract.comments || []).map((c) => (
                      <div
                        key={c.id}
                        className="space-y-1 rounded-lg border border-line bg-panel p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between text-2xs text-ink-3">
                          <span className="font-semibold text-ink">
                            {c.author?.name || "Participant"} ({c.authorRole})
                          </span>
                          <span>
                            {new Date(c.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-2xs text-ink-2">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add clause question..."
                    className="input-base flex-1 py-1.5 text-2xs"
                  />
                  <button
                    type="submit"
                    className="btn-outline px-2.5 text-2xs font-semibold"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </form>
              </div>
            </div>

            {/* Electronic Acceptance Form */}
            {!isSignedByMe && contract.status !== "COMPLETED" && (
              <form
                onSubmit={handleSign}
                className="border-brand-indigo/30 bg-brand-indigo/5 mt-6 space-y-3 rounded-xl border p-4"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-indigo">
                  <FileCheck className="h-4 w-4" />
                  <span>Execute Agreement</span>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-ink">
                    Type Your Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="e.g. Jane Doe, VP Engineering"
                    className="input-base w-full py-1.5 text-xs font-medium"
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-tight text-ink-2">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-line text-brand-indigo"
                  />
                  <span>
                    I confirm electronic acceptance of these terms. Timestamp,
                    IP & device evidence will be recorded under UETA/ESIGN.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!agreed || !typedName.trim() || isSubmitting}
                  className="btn-primary-orange w-full py-2 text-xs font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Recording Evidence..." : "E-Sign Agreement"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
