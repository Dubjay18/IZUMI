import { AppLayout } from "@/components/layout/AppLayout";
import { AvailableLiquidity } from "@/components/withdrawal/AvailableLiquidity";
import { LockedPositions } from "@/components/withdrawal/LockedPositions";
import { WithdrawalForm } from "@/components/withdrawal/WithdrawalForm";

export function WithdrawalPage() {
  return (
    <AppLayout>
      <main className="py-8 px-8 max-w-[1280px] mx-auto">
        <AvailableLiquidity />
        <LockedPositions />
        <WithdrawalForm />
      </main>
    </AppLayout>
  );
}
