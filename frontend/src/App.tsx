import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Mission } from "@/components/sections/Mission";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { AdvisoryCTA } from "@/components/sections/AdvisoryCTA";
import { Footer } from "@/components/layout/Footer";
import { DashboardPage } from "@/pages/DashboardPage";
import { AmortizationPage } from "@/pages/AmortizationPage";
import { DepositPage } from "@/pages/DepositPage";
import { ZKCompliancePage } from "@/pages/ZKCompliancePage";
import { WithdrawalPage } from "@/pages/WithdrawalPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { BorrowerOnboardingPage } from "@/pages/BorrowerOnboardingPage";
import { LoanApplicationPage } from "@/pages/LoanApplicationPage";
import { LoanResultPage } from "@/pages/LoanResultPage";
import { LoanAgreementPage } from "@/pages/LoanAgreementPage";
import { BorrowerDashboardPage } from "@/pages/BorrowerDashboardPage";
import { BorrowerSettingsPage } from "@/pages/BorrowerSettingsPage";
import { BorrowerLedgerPage } from "@/pages/BorrowerLedgerPage";
import { BorrowerAdvisorPage } from "@/pages/BorrowerAdvisorPage";
import { UnderwriterAdminPage } from "@/pages/UnderwriterAdminPage";
import { IngestionPage } from "@/pages/IngestionPage";
import { VaultHealthPage } from "@/pages/VaultHealthPage";
import { TransactionHistoryPage } from "@/pages/TransactionHistoryPage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { ComplianceChecklistPage } from "@/pages/ComplianceChecklistPage";
import { POSTerminalPage } from "@/pages/POSTerminalPage";
import { MobileKycPage } from "@/pages/MobileKycPage";

function LandingPage() {
  useScrollReveal();

  return (
    <>
      <GrainOverlay />
      <Navbar />
      <main className="relative">
        <Hero />
        <Mission />
        <Ecosystem />
        <AdvisoryCTA />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Tier 1: Landing & Onboarding ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboard" element={<OnboardingPage />} />
        <Route path="/borrow/onboard" element={<BorrowerOnboardingPage />} />
        <Route path="/onboard/mobile-kyc" element={<MobileKycPage />} />

        {/* ── Tier 2: Core User Platform (Saver) ── */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/deposit" element={<DepositPage />} />
        <Route path="/withdrawal" element={<WithdrawalPage />} />
        <Route path="/dashboard/portfolio" element={<PortfolioPage />} />
        <Route path="/dashboard/history" element={<TransactionHistoryPage />} />
        <Route path="/dashboard/amortization" element={<AmortizationPage />} />
        <Route path="/compliance" element={<ZKCompliancePage />} />

        {/* ── Tier 3: Loan & Credit Operations (Borrower) ── */}
        <Route path="/borrow/dashboard" element={<BorrowerDashboardPage />} />
        <Route path="/borrow/apply" element={<LoanApplicationPage />} />
        <Route path="/borrow/loan/:id" element={<LoanResultPage />} />
        <Route path="/borrow/loan/:id/execute" element={<LoanAgreementPage />} />
        <Route path="/borrow/ledger" element={<BorrowerLedgerPage />} />
        <Route path="/borrow/advisor" element={<BorrowerAdvisorPage />} />
        <Route path="/borrow/settings" element={<BorrowerSettingsPage />} />
        <Route path="/ingestion" element={<IngestionPage />} />

        {/* ── Tier 4: Administration / Governance / Compliance ── */}
        <Route path="/underwriter/admin" element={<UnderwriterAdminPage />} />
        <Route path="/admin/vault" element={<VaultHealthPage />} />
        <Route path="/admin/compliance-checklist" element={<ComplianceChecklistPage />} />
        <Route path="/admin/pos-manager" element={<POSTerminalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

