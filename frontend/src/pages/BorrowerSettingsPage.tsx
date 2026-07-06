import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/borrower/SettingsSidebar";
import { ProfileInfoForm } from "@/components/borrower/ProfileInfoForm";
import { MFASection } from "@/components/borrower/MFASection";
import { SessionHistoryTable } from "@/components/borrower/SessionHistoryTable";
import { ApiKeySection } from "@/components/borrower/ApiKeySection";

export function BorrowerSettingsPage() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <AppLayout>
      <main className="pt-24 pb-32 px-gutter md:px-container-padding max-w-[1440px] mx-auto min-h-screen">
        {/* Header */}
        <section className="mb-section-gap">
          <p className="font-subhead-caps text-subhead-caps text-secondary uppercase tracking-[0.2em] mb-base">
            Profile Management
          </p>
          <h1 className="font-display-lg text-display-lg text-primary mb-base">
            Institutional Security &amp; Profile
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Configure your administrative credentials and multi-layer authentication protocols to ensure the
            highest tier of capital protection.
          </p>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-4">
            <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9 space-y-gutter">
            {activeTab === "personal" && <ProfileInfoForm />}
            {activeTab === "2fa" && <MFASection />}
            {activeTab === "sessions" && <SessionHistoryTable />}
            {activeTab === "api" && <ApiKeySection />}
            {activeTab === "deactivate" && (
              <div className="glass-panel p-8 md:p-12 rounded-3xl text-center">
                <span className="material-symbols-outlined text-error text-6xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                  warning
                </span>
                <h2 className="font-headline-md text-headline-md text-primary mb-4">Deactivate Account</h2>
                <p className="text-on-surface-variant font-body-md max-w-lg mx-auto mb-8">
                  This action is irreversible. All active loans will be called, and any remaining balance will
                  be settled. Your digital identity and associated credentials will be permanently removed.
                </p>
                <button className="bg-error text-on-error px-8 py-3 rounded-full font-body-md font-semibold hover:shadow-lg active:scale-95 transition-all">
                  Confirm Deactivation
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
