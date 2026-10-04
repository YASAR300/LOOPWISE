// src/app/api/engagements/[id]/time/export/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: {
        timeEntries: {
          orderBy: { date: "desc" },
          include: { deliverable: true },
        },
        organization: true,
        strategistProfile: { include: { user: true } },
      },
    });

    if (!engagement)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isStrategist = engagement.strategistProfile.userId === user.id;
    const isOrgMember = await db.orgMember.findFirst({
      where: { organizationId: engagement.organizationId, userId: user.id },
    });

    if (!isStrategist && !isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const headers = [
      "Date",
      "Hours",
      "Description",
      "Deliverable",
      "Billable",
      "Status",
      "TimesheetWeek",
    ];
    const rows = engagement.timeEntries.map((t) => [
      new Date(t.date).toISOString().split("T")[0],
      t.hours,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      `"${(t.deliverable?.title || "General").replace(/"/g, '""')}"`,
      t.billable ? "Yes" : "No",
      t.status,
      t.timesheetWeek || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Loopwise_Timesheet_${id}.csv"`,
      },
    });
  } catch (error) {
    console.error("[Time Export Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
