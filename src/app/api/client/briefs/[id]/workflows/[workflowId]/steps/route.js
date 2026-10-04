import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const { workflowId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const count = await db.workflowStep.count({ where: { workflowId } });

    const newStep = await db.workflowStep.create({
      data: {
        workflowId,
        stepNumber: body.stepNumber || count + 1,
        name: body.name || `Step ${count + 1}`,
        description: body.description || "",
        tool: body.tool || "",
        actor: body.actor || "HUMAN",
        input: body.input || "",
        output: body.output || "",
        durationMinutes: Number(body.durationMinutes) || 15,
        decisionPoints: body.decisionPoints || "",
        failureModes: body.failureModes || "",
        automatabilityPct: Number(body.automatabilityPct) || 50,
        hoursSavedWeekly: Number(body.hoursSavedWeekly) || 1,
        riskLevel: body.riskLevel || "LOW",
        agentFit: body.agentFit || "HUMAN_IN_THE_LOOP",
      },
    });

    return NextResponse.json({ success: true, step: newStep });
  } catch (error) {
    console.error("[Step POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { workflowId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { stepId, reorder, steps: reorderedSteps, ...updates } = body;

    // Handle reordering entire steps list
    if (reorder && Array.isArray(reorderedSteps)) {
      for (let i = 0; i < reorderedSteps.length; i++) {
        await db.workflowStep.update({
          where: { id: reorderedSteps[i].id },
          data: { stepNumber: i + 1 },
        });
      }
      const refreshed = await db.workflowStep.findMany({
        where: { workflowId },
        orderBy: { stepNumber: "asc" },
      });
      return NextResponse.json({ success: true, steps: refreshed });
    }

    // Handle single step update
    if (!stepId) {
      return NextResponse.json({ error: "stepId required" }, { status: 400 });
    }

    const updated = await db.workflowStep.update({
      where: { id: stepId },
      data: updates,
    });

    return NextResponse.json({ success: true, step: updated });
  } catch (error) {
    console.error("[Step PATCH Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stepId = searchParams.get("stepId");

    if (!stepId) {
      return NextResponse.json({ error: "stepId required" }, { status: 400 });
    }

    await db.workflowStep.delete({
      where: { id: stepId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Step DELETE Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
