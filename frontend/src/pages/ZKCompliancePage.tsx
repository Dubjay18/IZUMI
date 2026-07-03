import { AppLayout } from "@/components/layout/AppLayout";
import { WalletContext } from "@/components/compliance/WalletContext";
import { ActiveProtocols } from "@/components/compliance/ActiveProtocols";
import { SecurityVisual } from "@/components/compliance/SecurityVisual";
import { ZKProverWidget } from "@/components/compliance/ZKProverWidget";
import { BentoInfoCards } from "@/components/compliance/BentoInfoCards";
import { ShieldActivity } from "@/components/compliance/ShieldActivity";
import { PrivacyScore } from "@/components/compliance/PrivacyScore";
import { RegionalGateway } from "@/components/compliance/RegionalGateway";
import { useParallaxShift } from "@/hooks/useParallaxShift";

export function ZKCompliancePage() {
  useParallaxShift();

  return (
    <AppLayout showCurve={false}>
      <main className="py-8 pb-24 px-8 max-w-[1280px] mx-auto grid grid-cols-12 gap-6 relative">
        {/* Background Parabolic Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary-fixed/10 parabolic-curve -z-10 opacity-50" />

        {/* Left Sidebar: Wallet & Protocols */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <WalletContext />
          <ActiveProtocols />
          <SecurityVisual />
        </aside>

        {/* Center: ZK-Prover Widget */}
        <section className="col-span-12 lg:col-span-6 space-y-6">
          <ZKProverWidget />
          <BentoInfoCards />
        </section>

        {/* Right Side: Recent activity & Stats */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <ShieldActivity />
          <PrivacyScore />
          <RegionalGateway />
        </aside>
      </main>
    </AppLayout>
  );
}
