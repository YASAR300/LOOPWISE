// src/app/api/invoices/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatInvoicesToCSV } from "@/server/services/invoicing";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";
    const type = searchParams.get("type") || "ALL";
    const search = searchParams.get("search") || "";
    const format = searchParams.get("format"); // "csv" | json
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    let whereClause = {};

    // Determine user role and scope
    if (user.role === "CLIENT") {
      const membership = await db.orgMember.findFirst({
        where: { userId: user.id },
      });
      if (!membership?.organizationId) {
        return NextResponse.json({
          invoices: [],
          summary: { openTotal: 0, paidTotal: 0 },
        });
      }
      whereClause.organizationId = membership.organizationId;
    } else if (user.role === "STRATEGIST") {
      const profile = await db.strategistProfile.findUnique({
        where: { userId: user.id },
      });
      if (!profile) {
        return NextResponse.json({
          invoices: [],
          summary: { openTotal: 0, paidTotal: 0 },
        });
      }
      whereClause.engagement = {
        strategistProfileId: profile.id,
      };
    } else if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Apply filters
    if (status !== "ALL") {
      whereClause.status = status;
    }
    if (type !== "ALL") {
      whereClause.invoiceType = type;
    }
    if (search.trim()) {
      whereClause.OR = [
        { number: { contains: search.trim(), mode: "insensitive" } },
        {
          engagement: {
            title: { contains: search.trim(), mode: "insensitive" },
          },
        },
      ];
    }
    if (fromDate || toDate) {
      whereClause.createdAt = {};
      if (fromDate) whereClause.createdAt.gte = new Date(fromDate);
      if (toDate) whereClause.createdAt.lte = new Date(toDate);
    }

    const invoices = await db.invoice.findMany({
      where: whereClause,
      include: {
        organization: { select: { id: true, name: true } },
        engagement: {
          select: {
            id: true,
            title: true,
            model: true,
            strategistProfile: {
              select: {
                id: true,
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
        lines: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // CSV format request
    if (format === "csv") {
      const csvContent = formatInvoicesToCSV(invoices);
      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="Loopwise_Invoices_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Summaries
    const openTotal = invoices
      .filter((i) => i.status === "OPEN" || i.status === "DRAFT")
      .reduce((sum, i) => sum + i.total, 0);

    const paidTotal = invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.total, 0);

    return NextResponse.json({
      invoices,
      totalCount: invoices.length,
      summary: {
        openTotal,
        paidTotal,
      },
    });
  } catch (error) {
    console.error("[Invoices GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
