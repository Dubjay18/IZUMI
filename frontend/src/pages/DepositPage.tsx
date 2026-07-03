import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DurationCard } from "@/components/dashboard/DurationCard";
import { VirtualAccountCard } from "@/components/dashboard/VirtualAccountCard";

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

  const selected = DURATION_OPTIONS.find((d) => d.id === selectedId)!;

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
            <VirtualAccountCard
              accountNumber="0092384755"
              bankName="Izumi Institutional Bank"
              accountName="IZM_PORTAL_USER_482"
              selectedDuration={selected.duration}
            />
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
