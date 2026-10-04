"use client";

import React, { use } from "react";
import { BriefBuilder } from "@/components/briefs/brief-builder";

export default function EditBriefPage({ params }) {
  const unwrappedParams = use(params);
  return <BriefBuilder briefId={unwrappedParams.id} />;
}
