// src/app/(app)/app/billing/page.jsx
import ClientBillingPage from "@/app/(app)/client/billing/page";

export const metadata = {
  title: "Billing & Invoices | Loopwise",
  description:
    "Manage funded escrow milestones, payment methods, and automated billing invoices on Loopwise.",
};

export default function AppBillingPage() {
  return <ClientBillingPage />;
}
