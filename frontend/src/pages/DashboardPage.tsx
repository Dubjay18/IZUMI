import { AppLayout } from "@/components/layout/AppLayout";
import { LiquidityCard } from "@/components/dashboard/LiquidityCard";
import { YieldForecast } from "@/components/dashboard/YieldForecast";
import { AssetFlow } from "@/components/dashboard/AssetFlow";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CommunityImpact } from "@/components/dashboard/CommunityImpact";

export function DashboardPage() {
  return (
    <AppLayout>
      <main className="py-8 px-8 max-w-[1280px] mx-auto grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <LiquidityCard />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <YieldForecast />
            <AssetFlow />
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <RecentActivity />
          <CommunityImpact />
        </aside>
      </main>
    </AppLayout>
  );
}
