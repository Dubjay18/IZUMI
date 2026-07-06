import { useState } from "react";
import { saverApi, ApiError } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useBalance } from "@/hooks/useBalance";

const EXCHANGE_RATE = 1620.5;

function formatNGN(value: number): string {
  return "₦ " + value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type WithdrawState = "idle" | "processing" | "success" | "error";

export function WithdrawalForm() {
  const { session } = useUser();
  const { balanceUSD, refresh: refreshBalance } = useBalance(session?.userId);

  const [usdAmount, setUsdAmount] = useState<string>("");
  const [state, setState] = useState<WithdrawState>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numericValue = parseFloat(usdAmount) || 0;
  const converted = numericValue * EXCHANGE_RATE;
  const isInsufficient = session && numericValue > balanceUSD;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.userId) {
      setErrorMsg("Please complete onboarding before withdrawing.");
      setState("error");
      return;
    }
    if (numericValue <= 0) {
      setErrorMsg("Please enter a valid withdrawal amount.");
      setState("error");
      return;
    }
    if (isInsufficient) {
      setErrorMsg(`Insufficient balance. Your available balance is $${balanceUSD.toFixed(2)}.`);
      setState("error");
      return;
    }
    setState("processing");
    setErrorMsg(null);
    setTxHash(null);
    try {
      const res = await saverApi.withdraw({ userId: session.userId, amountUSD: numericValue });
      setTxHash(res.txHash);
      setState("success");
      refreshBalance();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : (err as Error).message);
      setState("error");
    }
  }

  function handleReset() {
    setUsdAmount("");
    setState("idle");
    setTxHash(null);
    setErrorMsg(null);
  }

  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-lg">
        <div className="p-8 border-b border-outline-variant bg-surface-container">
          <h3 className="text-[24px] font-display font-semibold text-primary">Execute Withdrawal</h3>
          <p className="text-on-surface-variant text-sm mt-1">
            Funds will be processed through the Izumi Liquidity Bridge.
          </p>
        </div>

        <div className="p-8">
          {/* ── Success state ─────────────────────────────────────── */}
          {state === "success" ? (
            <div className="text-center py-6 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary">
                <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <div>
                <h4 className="font-display text-[24px] font-bold text-on-surface">Transfer Initiated</h4>
                <p className="text-on-surface-variant font-body mt-2">
                  ${numericValue.toFixed(2)} ({formatNGN(converted)}) is being disbursed to your bank account.
                  Funds arrive within 2–4 business hours.
                </p>
              </div>
              {txHash && (
                <div className="p-4 bg-surface-container-highest rounded-xl border border-outline-variant/40 text-left">
                  <p className="text-[11px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant mb-1">On-Chain Tx Hash</p>
                  <p className="font-mono text-[12px] text-surface-tint break-all">{txHash}</p>
                </div>
              )}
              <button
                onClick={handleReset}
                className="px-10 py-3 bg-primary text-secondary-fixed rounded-lg font-body font-bold text-[13px] hover:shadow-lg active:scale-95 transition-all"
              >
                New Withdrawal
              </button>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Destination Account */}
                <div className="space-y-3">
                  <label className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
                    Destination Account
                  </label>
                  <div className="relative">
                    <div className="p-4 bg-white border border-secondary/50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-surface-container-highest rounded flex items-center justify-center overflow-hidden">
                          <span className="material-symbols-outlined text-secondary">credit_card</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{session ? session.name : "GTBank Corporate"}</p>
                          <p className="text-xs text-on-surface-variant">NGN Payout Account</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-secondary">check_circle</span>
                    </div>
                    <p className="text-[10px] mt-2 text-on-surface-variant italic">
                      Withdrawals to NGN accounts include a 0.5% premium conversion spread.
                    </p>
                  </div>
                </div>

                {/* Amount & Conversion */}
                <div className="space-y-3">
                  <label className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
                    Withdrawal Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                    <input
                      id="withdraw-amount"
                      className={`w-full pl-8 pr-4 py-4 bg-white border rounded-xl font-bold text-xl outline-none transition-all ${
                        isInsufficient ? "border-error focus:border-error" : "border-outline-variant focus:border-secondary"
                      }`}
                      placeholder="0.00"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={usdAmount}
                      onChange={e => { setUsdAmount(e.target.value); setState("idle"); setErrorMsg(null); }}
                    />
                  </div>
                  {session && (
                    <p className="text-[11px] text-on-surface-variant font-body">
                      Available: <span className={`font-bold ${isInsufficient ? "text-error" : "text-primary"}`}>${balanceUSD.toFixed(2)}</span>
                    </p>
                  )}
                  <div className="p-4 bg-secondary-fixed/20 rounded-xl border border-secondary/10">
                    <div className="flex justify-between items-center text-xs text-on-secondary-fixed-variant mb-1 font-bold">
                      <span>Estimated Reception (NGN)</span>
                      <span>Rate: {EXCHANGE_RATE.toLocaleString()}</span>
                    </div>
                    <div className="text-2xl font-bold text-secondary">{formatNGN(converted)}</div>
                  </div>
                </div>
              </div>

              {state === "error" && errorMsg && (
                <div className="p-4 bg-error/10 border border-error/30 rounded-xl text-error text-sm font-body">{errorMsg}</div>
              )}

              <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary">shield</span>
                  <span className="text-xs text-[12px] font-body font-medium">Protected by 256-bit institutional encryption</span>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button
                    className="px-8 py-3 border border-outline-variant text-on-surface-variant rounded-lg hover:bg-surface-container transition-all text-[12px] font-body font-medium"
                    type="button"
                    onClick={handleReset}
                  >
                    Clear
                  </button>
                  <button
                    id="withdraw-submit"
                    className="flex-1 md:flex-none px-12 py-3 bg-primary text-on-primary rounded-lg hover:shadow-xl transition-all text-[12px] font-body font-bold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={state === "processing" || !!isInsufficient || numericValue <= 0}
                  >
                    {state === "processing" ? (
                      <><span className="material-symbols-outlined animate-spin">progress_activity</span>Processing...</>
                    ) : (
                      <>Confirm Transfer <span className="material-symbols-outlined">send</span></>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
