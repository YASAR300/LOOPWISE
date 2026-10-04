// src/app/(app)/client/engagements/[id]/page.jsx
import EngagementWorkspace from "@/components/engagements/engagement-workspace";

export const metadata = {
  title: "Engagement Workspace | Loopwise",
  description:
    "Fractional leadership engagement workspace, deliverables kanban, cadence and time tracking.",
};

export default async function ClientEngagementDetailPage({ params }) {
  const { id } = await params;
  return <EngagementWorkspace engagementId={id} userRole="CLIENT" />;
}
