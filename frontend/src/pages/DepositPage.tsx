import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DurationCard } from "@/components/dashboard/DurationCard";
import { VirtualAccountCard } from "@/components/dashboard/VirtualAccountCard";
import { useUser } from "@/context/UserContext";
import { saverApi, vaultApi } from "@/lib/api";

const DURATION_OPTIONS = [
  {
    id: "30",
    label: "SHORT TERM",
    duration: "30 Days",
    apy: "4.2%",
    maturityDate: "Oct 24, 2024",
  },
  {
    id: "60",
    label: "BALANCED",
    duration: "60 Days",
    apy: "4.8%",
    maturityDate: "Nov 23, 2024",
  },
  {
    id: "90",
    label: "MAXIMIZED",
    duration: "90 Days",
    apy: "5.5%",
    maturityDate: "Dec 23, 2024",
  },
] as const;

export function DepositPage() {
  const [selectedId, setSelectedId] = useState("30");
  const { session } = useUser();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const selected = DURATION_OPTIONS.find((d) => d.id === selectedId)!;

  const handleConfirmTransaction = async () => {
    if (!session?.userId) return;
    
    console.log("IZUMI DEBUG: saverApi is", saverApi);
    if (typeof saverApi.syncDeposits !== "function") {
      console.error("IZUMI DEBUG ERROR: syncDeposits is not defined on saverApi! This is likely due to browser/Vite cache. Please force-reload the page (Ctrl+Shift+R or Cmd+Shift+R) or restart your Vite dev server.");
    }

    // Map selectedId duration ("30", "60", "90") to contract lockup tiers (0, 1, 2)
    const tierMap: Record<string, number> = { "30": 0, "60": 1, "90": 2 };
    const tier = tierMap[selectedId] ?? 0;

    try {
      setIsConfirming(true);
      setConfirmMessage("");
      const res = await vaultApi.syncDeposits(session.userId, tier);
      setConfirmMessage(res.message || "Sync complete! Any new deposits detected have been swept and credited to your balance.");
      alert(res.message || "Sync complete! Any new deposits detected have been swept and credited to your balance.");
    } catch (err: any) {
      console.error("Sync error:", err);
      setConfirmMessage(`Error confirming deposit: ${err.message}`);
      alert(`Error confirming deposit: ${err.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AppLayout>
      <main className="py-8 px-8 max-w-[1280px] mx-auto">
        {/* Hero Section */}
        <section className="mb-16">
          <p className="text-[14px] font-body font-semibold tracking-[0.15em] text-secondary mb-4 uppercase">
            Capital Preservation
          </p>
          <h1 className="text-[56px] font-display font-bold text-primary max-w-2xl leading-[1.1] tracking-[-0.02em]">
            Fund Your Future
          </h1>
          <p className="text-[18px] font-body text-on-surface-variant mt-6 max-w-xl leading-[1.6]">
            Secure your wealth with our bespoke fixed-term deposit portal. Choose
            your horizon and facilitate your transfer through Izumi's premium
            liquidity network.
          </p>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Column: Select Duration */}
          <div className="col-span-12 md:col-span-5 space-y-6">
            <h3 className="text-[32px] font-display font-semibold text-primary mb-2 leading-[1.3]">
              Select Duration
            </h3>
            {DURATION_OPTIONS.map((option) => (
              <DurationCard
                key={option.id}
                label={option.label}
                duration={option.duration}
                apy={option.apy}
                maturityDate={option.maturityDate}
                active={selectedId === option.id}
                onClick={() => setSelectedId(option.id)}
              />
            ))}
          </div>

          {/* Right Column: Virtual Account Card */}
          <div className="col-span-12 md:col-span-7">
            {session?.virtualAccount ? (
              <div className="space-y-6">
                <VirtualAccountCard
                  accountNumber={session.virtualAccount.accountNumber}
                  bankName={session.virtualAccount.bankName}
                  accountName={session.virtualAccount.accountName}
                  selectedDuration={selected.duration}
                  onConfirm={handleConfirmTransaction}
                  isConfirming={isConfirming}
                />
                {confirmMessage && (
                  <div className={`p-4 rounded-xl text-sm font-semibold ${confirmMessage.startsWith("Error") ? "bg-error/10 text-error border border-error/30" : "bg-secondary-fixed/10 text-secondary border border-secondary/20"}`}>
                    {confirmMessage}
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated / no account yet */
              <div className="bg-primary text-on-primary p-12 rounded-2xl shadow-2xl min-h-[600px] flex flex-col items-center justify-center text-center gap-6">
                <span className="material-symbols-outlined text-[64px] opacity-60" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance
                </span>
                <div>
                  <h3 className="font-display text-[28px] font-semibold text-secondary-fixed mb-3">
                    No Virtual Account Yet
                  </h3>
                  <p className="font-body text-on-primary-container leading-relaxed max-w-xs">
                    Complete saver onboarding to receive your personal Nomba virtual account for deposits.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/saver/onboard")}
                  className="px-10 py-3.5 bg-secondary-container text-on-secondary-fixed font-bold rounded-xl text-[14px] font-body hover:shadow-lg active:scale-[0.98] transition-all"
                >
                  Start Onboarding
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
