"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function AdminNewUserPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CLIENT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "User created / invited!",
        description: `Invitation sent to ${email} with role ${role}.`,
      });
      router.push("/admin/users");
    }, 500);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to users</span>
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          Invite / Provision User
        </h1>
        <p className="text-xs text-ink-3">
          Create a platform user account with role privileges and audit logging.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="shadow-2xs space-y-5 rounded-2xl border border-line bg-panel p-6 sm:p-8"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="input-base w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
            className="input-base w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink">Account Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-base w-full"
          >
            <option value="CLIENT">
              Client (Hire strategists & manage briefs)
            </option>
            <option value="STRATEGIST">
              Strategist (Fractional CAIO profile)
            </option>
            <option value="ADMIN">Platform Administrator</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
          <Link
            href="/admin/users"
            className="rounded-lg px-4 py-2 text-xs font-medium text-ink-3 hover:text-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary-orange inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Provisioning..." : "Send Invitation"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
