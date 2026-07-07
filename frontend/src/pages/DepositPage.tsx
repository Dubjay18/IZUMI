import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DurationCard } from "@/components/dashboard/DurationCard";
import { VirtualAccountCard } from "@/components/dashboard/VirtualAccountCard";
import { useUser } from "@/context/UserContext";
import { saverApi } from "@/lib/api";

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
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState("");

  const selected = DURATION_OPTIONS.find((d) => d.id === selectedId)!;

  const handleSimulateDeposit = async () => {
    const va = session?.virtualAccount;
    if (!va) return;
    try {
      setIsSimulating(true);
      setSimMessage("");
      // Simulate NGN 150,000 bank transfer collections webhook from Nomba
      const res = await saverApi.triggerMockDepositWebhook(va.accountNumber, 150000, va.reference);
      setSimMessage("Success! Webhook received and processed by Railway backend.");
      alert(`Webhook Triggered: ${res.message || "Simulated deposit swept to vault successfully."}`);
    } catch (err: any) {
      console.error(err);
      setSimMessage(`Error: ${err.message}`);
    } finally {
      setIsSimulating(false);
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
                />

                {/* Webhook Simulation Toolbox */}
                <div className="p-8 bg-surface-container-low border border-outline-variant/40 rounded-2xl">
                  <h4 className="font-display font-bold text-lg text-primary mb-2">Nomba Webhook Simulator</h4>
                  <p className="text-sm text-on-surface-variant mb-6">
                    Because we are using Nomba's Sandbox rails, you can simulate a real cash transfer (₦150,000 NGN) to your virtual account to verify the live Railway webhook.
                  </p>
                  <button
                    onClick={handleSimulateDeposit}
                    disabled={isSimulating}
                    className="px-6 py-3 bg-primary text-secondary-container rounded-lg font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isSimulating ? "Simulating Webhook..." : "Trigger Simulated Funding Webhook"}
                  </button>
                  {simMessage && (
                    <p className={`mt-3 text-xs font-bold ${simMessage.startsWith("Error") ? "text-error" : "text-secondary"}`}>
                      {simMessage}
                    </p>
                  )}
                </div>
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
                  onClick={() => navigate("/onboard")}
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
