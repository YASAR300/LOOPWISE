import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { paused } = body;

    // Return the updated agent status
    return NextResponse.json({
      success: true,
      agentId: id,
      status: paused ? "paused" : "active",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to toggle agent status" },
      { status: 500 }
    );
  }
}
