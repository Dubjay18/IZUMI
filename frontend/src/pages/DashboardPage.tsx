import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { ParabolicCurve } from "@/components/ui/ParabolicCurve";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { LiquidityCard } from "@/components/dashboard/LiquidityCard";
import { YieldForecast } from "@/components/dashboard/YieldForecast";
import { AssetFlow } from "@/components/dashboard/AssetFlow";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CommunityImpact } from "@/components/dashboard/CommunityImpact";

export function DashboardPage() {
  return (
    <>
      <GrainOverlay />
      <ParabolicCurve />
      <DashboardHeader />
      <main className="pt-24 pb-24 md:pb-12 px-10 max-w-[1440px] mx-auto grid grid-cols-12 gap-6">
        <DashboardSidebar />

        <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <LiquidityCard />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <YieldForecast />
            <AssetFlow />
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <RecentActivity />
          <CommunityImpact />
        </aside>
      </main>
      <MobileNav />
    </>
  );
}
