import { AppLayout } from "@/components/layout/AppLayout";
import { NotificationFeed } from "@/components/borrower/NotificationFeed";
import { AccountHealthCard } from "@/components/borrower/AccountHealthCard";
import { LedgerTable } from "@/components/borrower/LedgerTable";

export function BorrowerLedgerPage() {
  return (
    <AppLayout>
      <main className="pt-24 pb-32 px-gutter md:px-container-padding max-w-[1440px] mx-auto min-h-screen">
        {/* Header */}
        <section className="mb-section-gap">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <p className="font-subhead-caps text-subhead-caps text-secondary mb-2 uppercase tracking-widest">
                Global Overview
              </p>
              <h2 className="font-display-lg text-display-lg text-primary">Transaction Ledger</h2>
            </div>
            <div className="flex gap-4">
              <button className="bg-primary text-surface px-6 py-3 flex items-center gap-2 transition-all active:scale-95 hover:shadow-lg rounded-xl">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
                <span className="font-label-sm text-label-sm">New Transfer</span>
              </button>
              <button className="border border-primary text-primary px-6 py-3 flex items-center gap-2 transition-all active:scale-95 hover:bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined">download</span>
                <span className="font-label-sm text-label-sm">Export CSV</span>
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <aside className="lg:col-span-4 space-y-8">
            <NotificationFeed />
            <AccountHealthCard />
          </aside>

          {/* Right Column */}
          <div className="lg:col-span-8">
            <LedgerTable />
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
