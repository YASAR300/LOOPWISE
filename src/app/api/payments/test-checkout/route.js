// src/app/api/payments/test-checkout/route.js
import { NextResponse } from "next/server";
import { formatCentsToCurrency } from "@/lib/fees";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") || `cs_test_${Date.now()}`;
  const milestoneId = searchParams.get("milestoneId") || "";
  const invoiceId = searchParams.get("invoiceId") || "";
  const engagementId = searchParams.get("engagementId") || "";
  const hours = searchParams.get("hours") || "10";
  const type = searchParams.get("type") || "MILESTONE_ESCROW";
  const amountCents = parseInt(searchParams.get("amount") || "108000", 10);

  const formattedAmount = formatCentsToCurrency(amountCents);

  // Return a realistic, beautiful Stripe Test Checkout simulation HTML page
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Stripe Checkout (Test Mode) · Loopwise</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen p-4 font-sans">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div>
        <div class="text-xs uppercase tracking-widest text-indigo-400 font-bold">Stripe Checkout</div>
        <div class="text-lg font-bold text-white mt-0.5">Loopwise Secure Escrow</div>
      </div>
      <span class="bg-amber-500/20 text-amber-300 text-[11px] px-2.5 py-1 rounded-full font-mono font-semibold">TEST MODE</span>
    </div>

    <div class="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
      <div class="text-xs text-slate-400">Total Due Today</div>
      <div class="text-3xl font-extrabold text-white font-mono">${formattedAmount}</div>
      <div class="text-xs text-slate-400">Payment type: <span class="text-indigo-300 font-mono">${type}</span></div>
    </div>

    <form id="payment-form" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Test Card Number</label>
        <div class="relative">
          <input type="text" value="4242 •••• •••• 4242" readonly class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono">
          <span class="absolute right-3 top-2.5 text-xs text-emerald-400 font-bold">VISA</span>
        </div>
        <p class="text-[11px] text-slate-500 mt-1">Stripe standard test card pre-selected.</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Expiry</label>
          <input type="text" value="12/28" readonly class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">CVC</label>
          <input type="text" value="123" readonly class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono">
        </div>
      </div>

      <button type="submit" id="pay-btn" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
        <span>Authorize & Pay ${formattedAmount}</span>
      </button>

      <div id="status" class="hidden text-xs text-center py-2"></div>
    </form>

    <div class="text-[11px] text-center text-slate-500 pt-2 border-t border-slate-800/60">
      Funds are secured in escrow with automated ledger balancing.
    </div>
  </div>

  <script>
    const form = document.getElementById('payment-form');
    const btn = document.getElementById('pay-btn');
    const status = document.getElementById('status');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      btn.disabled = true;
      btn.innerText = 'Processing with Stripe...';
      status.className = 'text-xs text-center py-2 text-indigo-400';
      status.innerText = 'Communicating with Loopwise webhook endpoint...';
      status.classList.remove('hidden');

      try {
        const res = await fetch('/api/webhooks/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 'evt_sim_' + Date.now(),
            type: 'checkout.session.completed',
            data: {
              object: {
                id: '${sessionId}',
                customer: 'cus_sim_client',
                client_reference_id: '${milestoneId || invoiceId || engagementId}',
                amount_total: ${amountCents},
                currency: 'usd',
                metadata: {
                  type: '${type}',
                  milestoneId: '${milestoneId}',
                  invoiceId: '${invoiceId}',
                  engagementId: '${engagementId}',
                  hours: '${hours}',
                  totalChargedCents: '${amountCents}',
                }
              }
            }
          })
        });

        if (!res.ok) throw new Error('Payment processing failed');

        status.className = 'text-xs text-center py-2 text-emerald-400 font-semibold';
        status.innerText = 'Payment successful! Redirecting back to workspace...';

        setTimeout(() => {
          if ('${milestoneId}') {
            window.location.href = '/client/engagements/${engagementId}?tab=money&funded=1&milestoneId=${milestoneId}';
          } else if ('${invoiceId}') {
            window.location.href = '/client/billing?paid=1&invoiceId=${invoiceId}';
          } else {
            window.location.href = '/client/engagements/${engagementId}?tab=money&prefunded=1';
          }
        }, 1200);
      } catch (err) {
        btn.disabled = false;
        btn.innerText = 'Authorize & Pay';
        status.className = 'text-xs text-center py-2 text-rose-400 font-semibold';
        status.innerText = 'Error: ' + err.message;
      }
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
