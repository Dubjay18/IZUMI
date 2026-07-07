import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ExposureHero } from "@/components/dashboard/ExposureHero";
import { IntensityDial } from "@/components/dashboard/IntensityDial";
import { SplitIntelligence } from "@/components/dashboard/SplitIntelligence";
import { AmortizationForecast } from "@/components/dashboard/AmortizationForecast";
import { LiveSweepLedger } from "@/components/dashboard/LiveSweepLedger";
import { useUser } from "@/context/UserContext";
import { useBorrowerProfile } from "@/hooks/useBorrowerProfile";

export function AmortizationPage() {
  const { session } = useUser();
  const { profile } = useBorrowerProfile(session?.borrowerId);
  const [intensity, setIntensity] = useState(40);

  // Sync state when profile is loaded from backend
  useEffect(() => {
    if (profile?.splitIntensity !== undefined) {
      setIntensity(profile.splitIntensity);
    }
  }, [profile]);

  return (
    <AppLayout>
      <main className="py-8 pb-24 px-8 max-w-[1280px] mx-auto">
        <ExposureHero />

        {/* Central Interactive Area: Daily Split Intensity */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-[80px]">
          <div className="lg:col-span-7">
            <IntensityDial percent={intensity} onChange={setIntensity} />
          </div>
          <div className="lg:col-span-5">
            <SplitIntelligence percent={intensity} />
          </div>
        </section>

        {/* Bottom Section: Amortization Forecast & Live Sweep Ledger */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-[80px]">
          <AmortizationForecast percent={intensity} />
          <LiveSweepLedger percent={intensity} />
        </section>
      </main>
    </AppLayout>
  );
}
