import { useState } from "react";

const NGN_RATE = 1620.5;

function formatNGN(value: number): string {
  return "₦ " + value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function WithdrawalForm() {
  const [usdAmount, setUsdAmount] = useState<string>("5000");
  const [isProcessing, setIsProcessing] = useState(false);

  const numericValue = parseFloat(usdAmount) || 0;
  const converted = numericValue * NGN_RATE;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      alert(
        "Transfer initiated. Funds should arrive within 2-4 business hours."
      );
      setIsProcessing(false);
    }, 2000);
  }

  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-lg">
        <div className="p-8 border-b border-outline-variant bg-surface-container">
          <h3 className="text-[24px] font-display font-semibold text-primary">
            Execute Withdrawal
          </h3>
          <p className="text-on-surface-variant text-sm mt-1">
            Funds will be processed through the Izumi Liquidity Bridge.
          </p>
        </div>

        <div className="p-8">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Destination Account */}
              <div className="space-y-3">
                <label className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
                  Destination Account
                </label>
                <div className="relative">
                  <div className="p-4 bg-white border border-secondary/50 rounded-xl flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-surface-container-highest rounded flex items-center justify-center overflow-hidden">
                        <span className="material-symbols-outlined text-secondary">
                          credit_card
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">
                          GTBank Corporate
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          **** 9012 (NGN)
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary">
                      check_circle
                    </span>
                  </div>
                  <p className="text-[10px] mt-2 text-on-surface-variant italic">
                    Withdrawals to NGN accounts include a 0.5% premium
                    conversion spread.
                  </p>
                </div>
              </div>

              {/* Amount & Conversion */}
              <div className="space-y-3">
                <label className="text-[14px] font-body font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
                  Withdrawal Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                    $
                  </span>
                  <input
                    className="w-full pl-8 pr-4 py-4 bg-white border border-outline-variant rounded-xl focus:border-secondary transition-all font-bold text-xl outline-none"
                    placeholder="0.00"
                    type="number"
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(e.target.value)}
                  />
                </div>
                <div className="p-4 bg-secondary-fixed/20 rounded-xl border border-secondary/10">
                  <div className="flex justify-between items-center text-xs text-on-secondary-fixed-variant mb-1 font-bold">
                    <span>Estimated Reception (NGN)</span>
                    <span>Rate: 1,620.50</span>
                  </div>
                  <div className="text-2xl font-bold text-secondary">
                    {formatNGN(converted)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary">
                  shield
                </span>
                <span className="text-xs text-[12px] font-body font-medium">
                  Protected by 256-bit institutional encryption
                </span>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button
                  className="px-8 py-3 border border-outline-variant text-on-surface-variant rounded-lg hover:bg-surface-container transition-all text-[12px] font-body font-medium"
                  type="button"
                >
                  Save Draft
                </button>
                <button
                  className="flex-1 md:flex-none px-12 py-3 bg-primary text-on-primary rounded-lg hover:shadow-xl transition-all text-[12px] font-body font-bold flex items-center justify-center gap-2 active:scale-95"
                  type="submit"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">
                        progress_activity
                      </span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm Transfer
                      <span className="material-symbols-outlined">send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
