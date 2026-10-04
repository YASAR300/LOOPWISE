"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Star,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  Check,
  Send,
  Calendar,
  ExternalLink,
  Users,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ToolChipRow } from "@/components/ui/tool-chip";

export default function ClientShortlistPage() {
  const [shortlists, setShortlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesDraft, setNotesDraft] = useState("");

  useEffect(() => {
    fetchShortlist();
  }, []);

  const fetchShortlist = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client/shortlist");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load shortlist");
      setShortlists(data.shortlists || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (itemId) => {
    try {
      const res = await fetch(`/api/client/shortlist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft }),
      });
      if (!res.ok) throw new Error("Failed to save note");

      setShortlists((prev) =>
        prev.map((sl) => ({
          ...sl,
          items: sl.items.map((item) =>
            item.id === itemId ? { ...item, notes: notesDraft } : item
          ),
        }))
      );
      toast.success("Saved note");
      setEditingNotesId(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemove = async (itemId, name) => {
    try {
      const res = await fetch(`/api/client/shortlist/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove from shortlist");

      setShortlists((prev) =>
        prev.map((sl) => ({
          ...sl,
          items: sl.items.filter((item) => item.id !== itemId),
        }))
      );
      toast.info(`Removed ${name} from shortlist`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const allItems = shortlists.flatMap((sl) =>
    sl.items.map((item) => ({
      ...item,
      briefTitle: sl.brief?.title || sl.name,
    }))
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accent">
            <Bookmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Client Shortlist
            </h1>
            <p className="text-xs text-ink-3">
              Curated Fractional Heads of AI saved for evaluation and hiring
            </p>
          </div>
        </div>

        <span className="rounded-full border border-line bg-panel-2 px-3 py-1 text-xs font-semibold text-ink">
          {allItems.length} Saved Strategists
        </span>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-ink-3">
          Loading shortlist...
        </div>
      ) : allItems.length === 0 ? (
        <div className="shadow-xs rounded-2xl border border-line bg-panel p-12 text-center">
          <Bookmark className="mx-auto mb-2 h-8 w-8 text-ink-3" />
          <h3 className="text-sm font-semibold text-ink">
            No shortlisted strategists yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-3">
            Browse candidate matches on your briefs and click "Shortlist" to
            save candidates here.
          </p>
          <Link
            href="/client/briefs"
            className="btn-primary-indigo mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            <span>View Active Briefs</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {allItems.map((item) => {
            const s = item.strategistProfile;
            const isEditing = editingNotesId === item.id;

            return (
              <div
                key={item.id}
                className="shadow-xs space-y-4 rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-line-2"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Strategist Identity */}
                  <div className="flex items-start gap-4">
                    <div className="bg-tile-indigo flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white">
                      {s.user?.name?.charAt(0) || "S"}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/strategists/${s.slug || s.id}`}
                          className="flex items-center gap-1 font-bold text-ink transition-colors hover:text-brand-indigo"
                        >
                          <span>{s.user?.name || "Verified Strategist"}</span>
                          <ExternalLink className="h-3 w-3 text-ink-3" />
                        </Link>

                        {s.ratingAvg && (
                          <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-2xs font-semibold text-amber-700 dark:text-amber-300">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            <span>{s.ratingAvg.toFixed(1)}</span>
                          </span>
                        )}

                        <span className="rounded-full border border-line bg-panel-2 px-2 py-0.5 text-2xs text-ink-3">
                          ${s.hourlyRate || 150}/hr
                        </span>
                      </div>

                      <p className="text-xs font-medium text-ink-2">
                        {s.headline}
                      </p>

                      <div className="pt-1">
                        <ToolChipRow
                          tools={(s.skills || []).map((sk) => sk.skill?.name)}
                          limit={3}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id, s.user?.name)}
                      className="rounded-lg border border-line p-2 text-ink-3 transition-colors hover:border-red-200 hover:text-red-600"
                      title="Remove from shortlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/hire/${s.slug || s.id}`}
                      className="btn-primary-indigo px-3 py-1.5 text-xs font-semibold"
                    >
                      Hire Strategist
                    </Link>
                  </div>
                </div>

                {/* Client Notes Section */}
                <div className="border-line/80 rounded-xl border bg-panel-2 p-3 text-xs">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                      Evaluation Notes
                    </span>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotesId(item.id);
                          setNotesDraft(item.notes || "");
                        }}
                        className="flex items-center gap-1 text-2xs font-medium text-brand-indigo hover:underline"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit note</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Add internal notes for team review..."
                        className="w-full rounded-lg border border-line bg-canvas p-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-2.5 py-1 text-2xs text-ink-3 hover:text-ink"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(item.id)}
                          className="hover:bg-brand-indigo/90 rounded bg-brand-indigo px-3 py-1 text-2xs font-semibold text-white"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="leading-relaxed text-ink">
                      {item.notes ||
                        "No internal notes yet. Click 'Edit note' to add private evaluation comments."}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
