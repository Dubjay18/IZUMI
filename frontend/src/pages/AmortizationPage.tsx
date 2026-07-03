import { AppLayout } from "@/components/layout/AppLayout";
import { ExposureHero } from "@/components/dashboard/ExposureHero";
import { IntensityDial } from "@/components/dashboard/IntensityDial";
import { SplitIntelligence } from "@/components/dashboard/SplitIntelligence";
import { AmortizationForecast } from "@/components/dashboard/AmortizationForecast";
import { LiveSweepLedger } from "@/components/dashboard/LiveSweepLedger";

export function AmortizationPage() {
  return (
    <AppLayout>
      <main className="py-8 pb-24 px-8 max-w-[1280px] mx-auto">
        <ExposureHero />

        {/* Central Interactive Area: Daily Split Intensity */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-[80px]">
          <div className="lg:col-span-7">
            <IntensityDial />
          </div>
          <div className="lg:col-span-5">
            <SplitIntelligence />
          </div>
        </section>

        {/* Bottom Section: Amortization Forecast & Live Sweep Ledger */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-[80px]">
          <AmortizationForecast />
          <LiveSweepLedger />
        </section>
      </main>
    </AppLayout>
  );
}
