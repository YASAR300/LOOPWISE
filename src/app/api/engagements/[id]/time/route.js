// src/app/api/engagements/[id]/time/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const {
      date,
      hours,
      description,
      deliverableId,
      billable = true,
      action = "MANUAL", // MANUAL | START_TIMER | STOP_TIMER
      entryId,
    } = body;

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: { strategistProfile: true },
    });

    if (!engagement)
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );

    const isStrategist = engagement.strategistProfile.userId === user.id;
    if (!isStrategist && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only strategist can log time" },
        { status: 403 }
      );
    }

    const now = new Date();

    // Helper to calculate timesheet week string: YYYY-Www
    const entryDate = date ? new Date(date) : now;
    const year = entryDate.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const numberOfDays = Math.floor(
      (entryDate - oneJan) / (24 * 60 * 60 * 1000)
    );
    const weekNum = Math.ceil((entryDate.getDay() + 1 + numberOfDays) / 7);
    const timesheetWeek = `${year}-W${String(weekNum).padStart(2, "0")}`;

    if (action === "START_TIMER") {
      // Create running time entry
      const entry = await db.timeEntry.create({
        data: {
          engagementId: id,
          deliverableId: deliverableId || null,
          date: now,
          hours: 0,
          description: description?.trim() || "Active working session",
          billable,
          timesheetWeek,
          isRunning: true,
          startTime: now,
          status: "PENDING",
        },
      });
      return NextResponse.json({ success: true, entry });
    }

    if (action === "STOP_TIMER") {
      if (!entryId) {
        return NextResponse.json(
          { error: "Entry ID required to stop timer" },
          { status: 400 }
        );
      }

      const activeEntry = await db.timeEntry.findUnique({
        where: { id: entryId },
      });
      if (!activeEntry || !activeEntry.isRunning) {
        return NextResponse.json(
          { error: "Running entry not found" },
          { status: 404 }
        );
      }

      const elapsedMs =
        now.getTime() -
        new Date(activeEntry.startTime || activeEntry.createdAt).getTime();
      const elapsedHours = Math.max(
        0.1,
        Math.round((elapsedMs / (1000 * 60 * 60)) * 100) / 100
      );

      const stopped = await db.timeEntry.update({
        where: { id: entryId },
        data: {
          hours: elapsedHours,
          isRunning: false,
          description: description?.trim() || activeEntry.description,
        },
      });

      return NextResponse.json({ success: true, entry: stopped });
    }

    // Manual time log
    if (!hours || parseFloat(hours) <= 0) {
      return NextResponse.json(
        { error: "Valid hours amount is required" },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const entry = await db.timeEntry.create({
      data: {
        engagementId: id,
        deliverableId: deliverableId || null,
        date: entryDate,
        hours: parseFloat(hours),
        description: description.trim(),
        billable,
        timesheetWeek,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("[Time Entry Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
