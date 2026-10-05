// src/app/api/invoices/[id]/pdf/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateInvoicePdfBuffer } from "@/server/services/invoicing";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        lines: true,
        organization: true,
        engagement: {
          include: {
            strategistProfile: { include: { user: true } },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Tenant check: must be client org member, assigned strategist, or admin
    const isStrategist =
      invoice.engagement?.strategistProfile?.userId === user.id;
    const isOrgMember = await db.orgMember.findFirst({
      where: { organizationId: invoice.organizationId, userId: user.id },
    });

    if (!isStrategist && !isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const buffer = await generateInvoicePdfBuffer(invoice);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice_${invoice.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[Invoice PDF Download Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
