import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "403 Forbidden - Loopwise",
  description: "Access denied to this workspace or resource.",
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border-hairline bg-surface-raised p-8 shadow-2xl">
        <div className="border-semantic-danger/30 bg-semantic-danger/10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border text-semantic-danger">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            403 - Access Denied
          </h1>
          <p className="text-sm text-text-secondary">
            You do not have the required role or organization permissions to
            view this resource.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button asChild variant="primary" size="md" className="w-full gap-2">
            <Link href="/app">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Workspace</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="md"
            className="w-full gap-2 border-border-hairline"
          >
            <Link href="/login">
              <LogOut className="h-4 w-4" />
              <span>Switch Account</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
