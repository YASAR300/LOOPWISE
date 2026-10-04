import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateOpportunityMarkdown } from "@/server/services/workflow-mapper";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brief = await db.brief.findUnique({
      where: { id },
      include: {
        workflows: {
          include: {
            steps: { orderBy: { stepNumber: "asc" } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    const markdown = generateOpportunityMarkdown({
      workflows: brief.workflows,
      summary: brief.opportunitySummary,
      briefTitle: brief.title,
    });

    const filename = `automation-opportunity-summary-${brief.id.slice(-6)}.md`;

    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[Workflow Export Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
