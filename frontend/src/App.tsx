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
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/deposit" element={<DepositPage />} />
        <Route path="/dashboard/amortization" element={<AmortizationPage />} />
        <Route path="/compliance" element={<ZKCompliancePage />} />
        <Route path="/withdrawal" element={<WithdrawalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
