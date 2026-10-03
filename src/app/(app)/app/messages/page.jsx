"use client";

import React, { useState } from "react";
import { IdentityTile } from "@/components/ui/identity-tile";
import { Send, Paperclip, MoreVertical, Phone, CheckCheck } from "lucide-react";
import { toast } from "@/components/ui/toast";

const INITIAL_THREADS = [
  {
    id: "th-1",
    name: "Elena Rostova",
    role: "Fractional Head of AI",
    lastLine:
      "I've pushed the latest LangGraph state machine changes to staging.",
    time: "10:42 AM",
    unread: true,
  },
  {
    id: "th-2",
    name: "Marcus Vance",
    role: "Solutions Architect",
    lastLine: "Webhook payload tests passed for HubSpot lead sync.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "th-3",
    name: "Loopwise Advisory Desk",
    role: "Concierge Matchmaking",
    lastLine:
      "We found 2 prospective enterprise briefs matching your rate tier.",
    time: "Oct 1",
    unread: false,
  },
];

const INITIAL_MESSAGES = [
  {
    id: "m-1",
    sender: "Elena Rostova",
    time: "10:30 AM",
    text: "Hi Alex! Following up on the accounts payable triage milestone.",
    isSelf: false,
  },
  {
    id: "m-2",
    sender: "You",
    time: "10:38 AM",
    text: "Great! Did the NetSuite PDF parser handle multi-page tax tables properly?",
    isSelf: true,
  },
  {
    id: "m-3",
    sender: "Elena Rostova",
    time: "10:42 AM",
    text: "Yes, I've pushed the latest LangGraph state machine changes to staging. Everything is verified against your test fixtures.",
    isSelf: false,
  },
];

export default function MessagesPage() {
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState("th-1");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");

  const activeThread =
    threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "You",
      time: "Just now",
      text: inputText.trim(),
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate response after 1s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: activeThread.name,
          time: "Just now",
          text: "Acknowledged! Let me run another regression test on that.",
          isSelf: false,
        },
      ]);
    }, 1200);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] min-h-[500px] max-w-6xl flex-col">
      <div className="shadow-2xs flex flex-1 overflow-hidden rounded-2xl border border-line bg-panel">
        {/* LEFT COLUMN: Thread List (56px rows with identity tile, name, last line, time, unread dot) */}
        <aside className="flex w-80 shrink-0 flex-col border-r border-line bg-panel">
          <div className="border-b border-line p-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink">
              Messages ({threads.length})
            </h2>
          </div>

          <div className="flex-1 divide-y divide-line overflow-y-auto">
            {threads.map((thread) => {
              const isSelected = thread.id === activeThreadId;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    if (thread.unread) {
                      setThreads((prev) =>
                        prev.map((t) =>
                          t.id === thread.id ? { ...t, unread: false } : t
                        )
                      );
                    }
                  }}
                  className={`flex h-14 w-full select-none items-center justify-between gap-3 px-3.5 text-left transition-colors ${
                    isSelected
                      ? "border-l-2 border-brand-indigo bg-panel-2"
                      : "hover:bg-panel-2"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div className="relative shrink-0">
                      <IdentityTile
                        name={thread.name}
                        id={thread.id}
                        size="sm"
                      />
                      {thread.unread && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-accent ring-2 ring-panel" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-semibold text-ink">
                          {thread.name}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-ink-3">
                          {thread.time}
                        </span>
                      </div>
                      <p className="truncate text-[11px] leading-tight text-ink-2">
                        {thread.lastLine}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT COLUMN: Conversation with compact message layout & pinned composer */}
        <main className="flex flex-1 flex-col bg-canvas dark:bg-panel-2">
          {/* Header */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-panel px-5">
            <div className="flex items-center gap-2.5">
              <IdentityTile
                name={activeThread.name}
                id={activeThread.id}
                size="sm"
              />
              <div>
                <h3 className="text-xs font-bold text-ink">
                  {activeThread.name}
                </h3>
                <p className="text-[10px] text-ink-3">{activeThread.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  toast.info("Scheduling synced video sync via Zoom...")
                }
                className="btn-secondary-outline rounded-lg p-1.5 text-ink-2"
                title="Schedule sync"
              >
                <Phone className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="btn-secondary-outline rounded-lg p-1.5 text-ink-2"
                title="Options"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex max-w-[75%] flex-col ${
                  msg.isSelf ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.isSelf
                      ? "rounded-br-xs bg-brand-indigo text-white"
                      : "rounded-bl-xs shadow-2xs border border-line bg-panel text-ink"
                  }`}
                >
                  {msg.text}
                </div>
                <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-ink-3">
                  <span>{msg.time}</span>
                  {msg.isSelf && (
                    <CheckCheck className="h-3 w-3 text-brand-indigo" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pinned Composer */}
          <div className="shrink-0 border-t border-line bg-panel p-3">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => toast.info("Attachment upload ready")}
                className="p-2 text-ink-3 transition-colors hover:text-ink"
                title="Attach deliverable file"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeThread.name}...`}
                className="focus:outline-hidden flex-1 rounded-xl border border-line bg-panel-2 px-3.5 py-2 text-xs text-ink focus:ring-2 focus:ring-brand-indigo"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="btn-primary-indigo rounded-xl p-2 text-white transition-transform active:scale-95 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
