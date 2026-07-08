const ECOSYSTEM_LINKS = [
  "Managed Portfolios",
  "Direct Lending",
  "Venture Capital",
  "Impact Reports",
];

const COMPANY_LINKS = ["Our Ethos", "Governance", "Careers", "Press Room"];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-fixed-dim pt-24 pb-12">
      <div className="container mx-auto px-10">
        <div className="grid grid-cols-12 gap-6 mb-20">
          {/* Brand column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary-fixed flex items-center justify-center rounded-full overflow-hidden">
                  <img
                    src="/screen.png"
                    alt="Izumi Logo"
                    className="w-full h-full object-contain"
                  />
              </div>
              <span className="font-display text-2xl font-bold text-white tracking-tight">
                Izumi
              </span>
            </div>
            <p className="text-sm font-body opacity-60 max-w-xs leading-relaxed">
              A vision of perpetual prosperity, stewards of high-performance capital
              and generational impact. Registered Global Wealth Advisory.
            </p>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full border border-primary-fixed-dim/20 flex items-center justify-center hover:bg-secondary-fixed hover:text-primary transition-all"
                href="#"
              >
                <span className="material-symbols-outlined text-lg">public</span>
              </a>
              <a
                className="w-10 h-10 rounded-full border border-primary-fixed-dim/20 flex items-center justify-center hover:bg-secondary-fixed hover:text-primary transition-all"
                href="#"
              >
                <span className="material-symbols-outlined text-lg">shield</span>
              </a>
            </div>
          </div>

          {/* Ecosystem links */}
          <div className="col-span-6 lg:col-span-2 space-y-6">
            <h5 className="text-xs font-body font-semibold text-secondary-fixed uppercase tracking-[0.15em]">
              Ecosystem
            </h5>
            <ul className="space-y-4 text-sm font-body">
              {ECOSYSTEM_LINKS.map((link) => (
                <li key={link}>
                  <a className="hover:text-white transition-colors" href="#">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="col-span-6 lg:col-span-2 space-y-6">
            <h5 className="text-xs font-body font-semibold text-secondary-fixed uppercase tracking-[0.15em]">
              Company
            </h5>
            <ul className="space-y-4 text-sm font-body">
              {COMPANY_LINKS.map((link) => (
                <li key={link}>
                  <a className="hover:text-white transition-colors" href="#">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <h5 className="text-xs font-body font-semibold text-secondary-fixed uppercase tracking-[0.15em]">
              Inquiries
            </h5>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary-fixed">
                  location_on
                </span>
                <p className="text-sm font-body opacity-80">
                  14-22 Mayfair Place,
                  <br />
                  London, W1J 8AJ, UK
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary-fixed">
                  mail
                </span>
                <p className="text-sm font-body opacity-80">
                  concierge@izumi.finance
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary-fixed">
                  phone_iphone
                </span>
                <p className="text-sm font-body opacity-80">
                  +44 (0) 20 7946 0852
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-primary-fixed-dim/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-body uppercase tracking-[0.15em] opacity-40">
          <p>&copy; 2026 Izumi Management Ltd. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a className="hover:text-white" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-white" href="#">
              Terms of Stewardship
            </a>
            <a className="hover:text-white" href="#">
              Regulatory Disclosure
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
