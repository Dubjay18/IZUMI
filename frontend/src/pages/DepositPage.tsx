import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DurationCard } from "@/components/dashboard/DurationCard";
import { VirtualAccountCard } from "@/components/dashboard/VirtualAccountCard";
import { Link } from "react-router-dom";
import { api } from "@/services/api";

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
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [virtualAccount, setVirtualAccount] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("izumi_user_role");
    const userId = localStorage.getItem("izumi_user_id");
    const name = localStorage.getItem("izumi_user_name");
    const vaRaw = localStorage.getItem("izumi_virtual_account");

    if (role === "SAVER" && userId && name && vaRaw) {
      setSessionUser({ role, userId, name });
      setVirtualAccount(JSON.parse(vaRaw));
    }
  }, []);

  const selected = DURATION_OPTIONS.find((d) => d.id === selectedId)!;

  const handleSimulateDeposit = async () => {
    if (!virtualAccount) return;
    try {
      setIsSimulating(true);
      setSimMessage("");
      // Simulate NGN 150,000 bank transfer collections webhook from Nomba
      const res = await api.triggerMockDepositWebhook(virtualAccount.accountNumber, 150000);
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
            {sessionUser ? (
              <div className="space-y-6">
                <VirtualAccountCard
                  accountNumber={virtualAccount.accountNumber}
                  bankName={virtualAccount.bankName}
                  accountName={virtualAccount.accountName}
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
              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-12 text-center space-y-6">
                <span className="material-symbols-outlined text-[64px] text-outline-variant">
                  account_balance_wallet
                </span>
                <h3 className="text-2xl font-display font-semibold text-primary">No Active Saver Session</h3>
                <p className="text-on-surface-variant max-w-md mx-auto text-sm leading-relaxed">
                  Before you can generate a virtual account and fund deposits, you must complete your Zero-Knowledge compliance check.
                </p>
                <Link
                  to="/compliance"
                  className="inline-block px-8 py-4 bg-primary text-secondary-container rounded-full font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Go to Compliance Shield
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

