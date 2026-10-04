"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function NewProposalPage() {
  const router = useRouter();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("jobId");
    if (jobId) {
      router.replace(`/strategist/jobs/${jobId}/apply`);
    } else {
      router.replace("/strategist/jobs");
    }
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center p-16 text-center text-xs text-ink-3">
      Redirecting to proposal composer...
    </div>
  );
}
