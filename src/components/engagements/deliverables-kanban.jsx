// src/components/engagements/deliverables-kanban.jsx
"use client";

import React, { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  CheckSquare,
  Square,
  Calendar,
  Tag,
  ThumbsUp,
  X,
  FileCheck,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

const COLUMNS = [
  { id: "BACKLOG", label: "Backlog", color: "text-ink-3" },
  { id: "IN_PROGRESS", label: "In Progress", color: "text-brand-indigo" },
  { id: "IN_REVIEW", label: "In Review", color: "text-brand-orange" },
  { id: "APPROVED", label: "Approved", color: "text-emerald-600" },
];

export function DeliverablesKanban({
  engagementId,
  deliverables = [],
  userRole = "CLIENT",
  isClosed = false,
  onRefresh,
}) {
  const isClient = userRole === "CLIENT";

  const [items, setItems] = useState(deliverables);
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newLabels, setNewLabels] = useState("");
  const [newStage, setNewStage] = useState("BACKLOG");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if props change
  React.useEffect(() => {
    setItems(deliverables);
  }, [deliverables]);

  const handleDragStart = (e, id) => {
    if (isClosed) return;
    setDraggedCardId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e) => {
    if (isClosed) return;
    e.preventDefault();
  };

  const handleDrop = async (e, targetStage) => {
    if (isClosed) return;
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedCardId;
    if (!id) return;

    const card = items.find((i) => i.id === id);
    if (!card || card.stage === targetStage) return;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stage: targetStage } : item
      )
    );

    try {
      const res = await fetch(
        `/api/engagements/${engagementId}/deliverables/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: targetStage }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update deliverable stage");
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message);
      // Revert on error
      setItems(deliverables);
    } finally {
      setDraggedCardId(null);
    }
  };

  const handleCreateDeliverable = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const labelsArray = newLabels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const res = await fetch(`/api/engagements/${engagementId}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          stage: newStage,
          labels: labelsArray,
          dueDate: newDueDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add deliverable");

      toast.success("Deliverable card added to board");
      setIsAddModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewDueDate("");
      setNewLabels("");
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientReview = async (id, approvalStatus, feedback = "") => {
    try {
      const res = await fetch(
        `/api/engagements/${engagementId}/deliverables/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientApprovalStatus: approvalStatus,
            clientFeedback: feedback,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to submit review");

      toast.success(
        approvalStatus === "APPROVED"
          ? "Deliverable approved! Moved to Approved."
          : "Changes requested. Returned to In Progress."
      );
      if (onRefresh) onRefresh();
      setSelectedCard(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleChecklistItem = async (card, itemIndex) => {
    const list = [...(card.checklist || [])];
    if (!list[itemIndex]) return;
    list[itemIndex].done = !list[itemIndex].done;

    // Optimistic
    setItems((prev) =>
      prev.map((i) => (i.id === card.id ? { ...i, checklist: list } : i))
    );

    try {
      await fetch(`/api/engagements/${engagementId}/deliverables/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklist: list }),
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">Deliverables Board</h3>
          <p className="text-2xs text-ink-3">
            Kanban workflow. Drag and drop cards to update execution stage.
          </p>
        </div>

        {!isClosed && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary-orange inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Deliverable</span>
          </button>
        )}
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {COLUMNS.map((col) => {
          const colItems = items.filter((i) => i.stage === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-panel-2/40 flex min-h-[500px] flex-col rounded-2xl border border-line p-3"
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="rounded-full border border-line bg-panel px-2 py-0.5 font-mono text-2xs font-bold text-ink-3">
                    {colItems.length}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto">
                {colItems.length === 0 ? (
                  <div className="border-line/60 flex h-24 items-center justify-center rounded-xl border border-dashed text-2xs text-ink-3">
                    Drag items here
                  </div>
                ) : (
                  colItems.map((card) => {
                    const checklist = Array.isArray(card.checklist)
                      ? card.checklist
                      : [];
                    const completedChecklist = checklist.filter(
                      (c) => c.done
                    ).length;

                    return (
                      <div
                        key={card.id}
                        draggable={!isClosed}
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        onClick={() => setSelectedCard(card)}
                        className={`shadow-2xs hover:border-brand-indigo/40 hover:shadow-xs group relative cursor-pointer rounded-xl border border-line bg-panel p-3.5 transition-all ${
                          draggedCardId === card.id ? "opacity-40" : ""
                        }`}
                      >
                        {/* Title & Approval Pill */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold leading-snug text-ink">
                              {card.title}
                            </span>
                            {card.clientApprovalStatus && (
                              <span
                                className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                  card.clientApprovalStatus === "APPROVED"
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-amber-500/10 text-amber-600"
                                }`}
                              >
                                {card.clientApprovalStatus}
                              </span>
                            )}
                          </div>
                          {card.description && (
                            <p className="line-clamp-2 text-2xs text-ink-3">
                              {card.description}
                            </p>
                          )}
                        </div>

                        {/* Checklist Counter if any */}
                        {checklist.length > 0 && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-2xs text-ink-3">
                            <CheckSquare className="h-3 w-3 text-brand-indigo" />
                            <span>
                              {completedChecklist}/{checklist.length} tasks
                            </span>
                          </div>
                        )}

                        {/* Card Footer: Due Date & Labels */}
                        <div className="border-line/50 mt-3 flex items-center justify-between border-t pt-2 text-[10px] text-ink-3">
                          <div className="flex items-center gap-1">
                            {card.dueDate && (
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="h-2.5 w-2.5" />
                                {new Date(card.dueDate).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {(card.labels || []).slice(0, 2).map((l, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-panel-2 px-1.5 py-0.5 font-medium text-ink-2"
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deliverable Modal */}
      {isAddModalOpen && (
        <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateDeliverable}
            className="w-full max-w-md space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-sm font-bold text-ink">New Deliverable</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-ink-3 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Zendesk LangGraph State Machine Architecture"
                className="input-base w-full text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">
                Description & Success Criteria
              </label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Outline deliverables, verification scripts, and acceptance terms..."
                className="input-base w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Initial Column
                </label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  className="input-base w-full text-xs"
                >
                  <option value="BACKLOG">Backlog</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="input-base w-full text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">
                Labels (comma-separated)
              </label>
              <input
                type="text"
                value={newLabels}
                onChange={(e) => setNewLabels(e.target.value)}
                placeholder="Workflow, Agent, Infrastructure"
                className="input-base w-full text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-line pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="btn-outline px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-orange px-4 py-1.5 text-xs font-semibold"
              >
                {isSubmitting ? "Adding..." : "Add to Board"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Card Detail & Client Approval Modal */}
      {selectedCard && (
        <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-brand-indigo">
                  {selectedCard.stage}
                </span>
                <h3 className="text-base font-bold text-ink">
                  {selectedCard.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="rounded-lg p-1 text-ink-3 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-2xs font-semibold uppercase text-ink-3">
                Description
              </span>
              <p className="text-xs leading-relaxed text-ink-2">
                {selectedCard.description || "No description provided."}
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2 border-t border-line pt-3">
              <span className="text-2xs font-semibold uppercase text-ink-3">
                Checklist / Sub-tasks
              </span>
              {(selectedCard.checklist || []).length === 0 ? (
                <p className="text-2xs text-ink-3">
                  No checklist items defined.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {selectedCard.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleChecklistItem(selectedCard, idx)}
                      className="flex cursor-pointer select-none items-center gap-2 text-xs text-ink"
                    >
                      {item.done ? (
                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Square className="h-4 w-4 text-ink-3" />
                      )}
                      <span
                        className={item.done ? "text-ink-3 line-through" : ""}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Approval Controls */}
            {isClient && selectedCard.stage === "IN_REVIEW" && !isClosed && (
              <div className="border-brand-indigo/30 bg-brand-indigo/5 space-y-3 rounded-xl border p-4">
                <span className="text-xs font-bold text-brand-indigo">
                  Client Review & Acceptance
                </span>
                <p className="text-2xs text-ink-3">
                  Confirm deliverable quality and completeness.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() =>
                      handleClientReview(selectedCard.id, "APPROVED")
                    }
                    className="btn-primary-orange flex-1 py-1.5 text-xs font-semibold"
                  >
                    Approve Deliverable
                  </button>
                  <button
                    onClick={() => {
                      const reason = window.prompt(
                        "Reason for requesting changes:"
                      );
                      if (reason)
                        handleClientReview(
                          selectedCard.id,
                          "CHANGES_REQUESTED",
                          reason
                        );
                    }}
                    className="btn-outline flex-1 py-1.5 text-xs font-semibold"
                  >
                    Request Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
