import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { ParabolicCurve } from "@/components/ui/ParabolicCurve";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";

type AppLayoutProps = {
  children: React.ReactNode;
  /** Pass false to hide the parabolic background curve (e.g. on Compliance page) */
  showCurve?: boolean;
};

export function AppLayout({ children, showCurve = true }: AppLayoutProps) {
  return (
    <>
      <GrainOverlay />
      {showCurve && <ParabolicCurve />}
      <Navbar />

      {/* Shell: sidebar + scrollable page content */}
      <div className="flex pt-16 min-h-screen">
        <AppSidebar />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>

      <MobileNav />
    </>
  );
}
