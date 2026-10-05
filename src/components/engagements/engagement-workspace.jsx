// src/components/engagements/engagement-workspace.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Briefcase,
  Layers,
  Calendar,
  Clock,
  FileText,
  Activity,
  ShieldCheck,
  Settings,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
  Building,
  User,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Sub-tabs
import { OverviewTab } from "@/components/engagements/overview-tab";
import { DeliverablesKanban } from "@/components/engagements/deliverables-kanban";
import { CadenceTab } from "@/components/engagements/cadence-tab";
import { TimeTab } from "@/components/engagements/time-tab";
import FilesTab from "@/components/engagements/files-tab";
import ActivityTab from "@/components/engagements/activity-tab";
import MoneyTab from "@/components/engagements/money-tab";
import { ContractViewerModal } from "@/components/engagements/contract-viewer-modal";
import EngagementControlsModal from "@/components/engagements/engagement-controls-modal";

export default function EngagementWorkspace({
  engagementId,
  userRole,
  initialData,
}) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [activeTab, setActiveTab] = useState("overview"); // overview, deliverables, cadence, time, files, activity
  const [showContractModal, setShowContractModal] = useState(false);
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEngagement = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/engagements/${engagementId}`);
      if (!res.ok) throw new Error("Failed to load engagement");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [engagementId]);

  useEffect(() => {
    if (!initialData) {
      fetchEngagement();
    }
  }, [initialData, fetchEngagement]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-7 w-7 animate-spin text-primary" />
        <p className="text-muted-foreground font-mono text-sm">
          Loading engagement workspace...
        </p>
      </div>
    );
  }

  if (!data || !data.engagement) {
    return (
      <div className="border-border mx-auto my-20 max-w-xl space-y-4 rounded-2xl border border-dashed p-8 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
        <h2 className="text-foreground text-lg font-bold">
          Engagement Not Found
        </h2>
        <p className="text-muted-foreground text-sm">
          You might not have access to this engagement or it has been relocated.
        </p>
        <Button asChild variant="outline">
          <Link
            href={
              userRole === "CLIENT"
                ? "/client/engagements"
                : "/strategist/engagements"
            }
          >
            Back to Engagements
          </Link>
        </Button>
      </div>
    );
  }

  const {
    engagement,
    contract,
    deliverables = [],
    weeklyUpdates = [],
    timeEntries = [],
    files = [],
    activities = [],
    currentWeekMetrics = {},
    is14DayEligible = false,
  } = data;

  const isClosed = ["COMPLETED", "TERMINATED"].includes(engagement.status);
  const isPaused = engagement.status === "PAUSED";
  const needsContractAcceptance =
    contract &&
    ["SENT", "CHANGES_REQUESTED", "DRAFT"].includes(contract.status) &&
    ((userRole === "CLIENT" && !contract.clientSignedAt) ||
      (userRole === "STRATEGIST" && !contract.strategistSignedAt));

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            Active
          </Badge>
        );
      case "PAUSED":
        return (
          <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
            Paused
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-400">
            Completed
          </Badge>
        );
      case "TERMINATED":
        return (
          <Badge className="border-rose-500/30 bg-rose-500/10 text-rose-400">
            Terminated
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Briefcase },
    {
      id: "deliverables",
      label: "Deliverables",
      icon: Layers,
      count: deliverables.length,
    },
    {
      id: "cadence",
      label: "Cadence",
      icon: Calendar,
      count: weeklyUpdates.length,
    },
    { id: "time", label: "Time Tracking", icon: Clock },
    {
      id: "money",
      label: "Escrow & Money",
      icon: DollarSign,
      count: engagement?.milestones?.length,
    },
    {
      id: "files",
      label: "Files & Assets",
      icon: FileText,
      count: files.length,
    },
    { id: "activity", label: "Audit Log", icon: Activity },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20">
      {/* Top Breadcrumb & Status Bar */}
      <div className="bg-card/60 border-border/60 flex flex-col justify-between gap-4 rounded-2xl border p-4 shadow-sm backdrop-blur-md sm:p-5 md:flex-row md:items-center">
        <div className="space-y-1.5">
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <Link
              href={
                userRole === "CLIENT"
                  ? "/client/engagements"
                  : "/strategist/engagements"
              }
              className="hover:text-foreground transition-colors"
            >
              Engagements
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">
              {engagement.organization.name}
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-mono text-[11px] opacity-70">
              {engagement.id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              {engagement.title}
            </h1>
            {getStatusBadge(engagement.status)}
            <Badge variant="outline" className="bg-muted/20 font-mono text-xs">
              {engagement.model}
            </Badge>
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-4 pt-0.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Building className="text-muted-foreground/70 h-3.5 w-3.5" />
              <span>{engagement.organization.name}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <User className="text-muted-foreground/70 h-3.5 w-3.5" />
              <span>
                Strategist:{" "}
                <strong>{engagement.strategistProfile.user.name}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Global Engagement Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEngagement}
            disabled={refreshing}
            className="h-9 w-9 p-0"
            title="Refresh workspace data"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin text-primary" : ""}`}
            />
          </Button>

          {contract && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowContractModal(true)}
              className="border-border/80 h-9 gap-2 text-xs"
            >
              <FileCheck2 className="h-4 w-4 text-primary" />
              Contract v{contract.versions?.length || 1}
              {contract.status === "ACTIVE" && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowControlsModal(true)}
            className="border-border/80 hover:bg-muted h-9 gap-2 text-xs"
          >
            <Settings className="text-muted-foreground h-4 w-4" />
            Controls
          </Button>
        </div>
      </div>

      {/* Contract Signature Warning Banner */}
      {needsContractAcceptance && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">
                Contract Requires Your Signature
              </h4>
              <p className="text-xs text-amber-300/80">
                Terms have been updated or awaiting mutual e-acceptance. Review
                and sign to finalize.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowContractModal(true)}
            className="shrink-0 bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400"
          >
            Review & Sign Contract
          </Button>
        </div>
      )}

      {/* Paused or Closed Banner */}
      {isPaused && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
          <Pause className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            <strong>Engagement Paused:</strong>{" "}
            {engagement.pauseReason || "Active operations temporarily paused."}{" "}
            Timers and deliverables movement are halted.
          </span>
        </div>
      )}

      {isClosed && (
        <div className="bg-muted/40 border-border/80 text-muted-foreground flex items-center justify-between gap-3 rounded-xl border p-3.5 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            <span>
              <strong>Engagement Closed ({engagement.status}):</strong>{" "}
              Workspace is in read-only audit mode. Timesheet records and
              reviews remain accessible.
            </span>
          </div>
          {engagement.closedAt && (
            <span className="font-mono text-[11px]">
              Closed {new Date(engagement.closedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Segmented Navigation Tabs */}
      <div className="border-border/60 flex items-center gap-1 overflow-x-auto border-b pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? "border-primary font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground hover:border-border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`py-0.2 rounded-full px-1.5 font-mono text-[10px] ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === "overview" && (
          <OverviewTab
            engagement={engagement}
            contract={contract}
            deliverables={deliverables}
            weeklyUpdates={weeklyUpdates}
            currentWeekMetrics={currentWeekMetrics}
            userRole={userRole}
            is14DayEligible={is14DayEligible}
            onOpenControls={() => setShowControlsModal(true)}
            onOpenContract={() => setShowContractModal(true)}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "deliverables" && (
          <DeliverablesKanban
            engagement={engagement}
            deliverables={deliverables}
            userRole={userRole}
            isClosed={isClosed}
            onRefresh={fetchEngagement}
          />
        )}

        {activeTab === "cadence" && (
          <CadenceTab
            engagement={engagement}
            weeklyUpdates={weeklyUpdates}
            userRole={userRole}
            isClosed={isClosed}
            onRefresh={fetchEngagement}
          />
        )}

        {activeTab === "time" && (
          <TimeTab
            engagement={engagement}
            timeEntries={timeEntries}
            deliverables={deliverables}
            currentWeekMetrics={currentWeekMetrics}
            userRole={userRole}
            isClosed={isClosed}
            onRefresh={fetchEngagement}
          />
        )}

        {activeTab === "money" && (
          <MoneyTab
            engagement={engagement}
            milestones={engagement?.milestones || []}
            userRole={userRole}
            isClosed={isClosed}
            onRefresh={fetchEngagement}
          />
        )}

        {activeTab === "files" && (
          <FilesTab
            engagement={engagement}
            files={files}
            deliverables={deliverables}
            userRole={userRole}
            isClosed={isClosed}
            onRefresh={fetchEngagement}
          />
        )}

        {activeTab === "activity" && (
          <ActivityTab engagement={engagement} activities={activities} />
        )}
      </div>

      {/* Contract Viewer & Sign Modal */}
      {contract && (
        <ContractViewerModal
          isOpen={showContractModal}
          onClose={() => setShowContractModal(false)}
          contract={contract}
          userRole={userRole}
          onSigned={fetchEngagement}
        />
      )}

      {/* Engagement Controls Modal */}
      <EngagementControlsModal
        isOpen={showControlsModal}
        onClose={() => setShowControlsModal(false)}
        engagement={engagement}
        userRole={userRole}
        is14DayEligible={is14DayEligible}
        onActionComplete={fetchEngagement}
      />
    </div>
  );
}
