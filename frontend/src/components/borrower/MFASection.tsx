export function MFASection() {
  return (
    <div className="glass-panel p-8 md:p-12 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
      <div className="md:col-span-7">
        <h2 className="font-headline-md text-headline-md text-primary mb-4">Multi-Factor Authentication</h2>
        <p className="text-on-surface-variant font-body-md mb-6 leading-relaxed">
          Protect your assets with biometric or application-based MFA. Scan this unique QR code with your Izumi
          Secure Vault app to link this device.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="bg-secondary text-on-secondary px-6 py-2 rounded-full font-body-md font-semibold flex items-center gap-2 hover:brightness-110 transition-all">
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            <span>Regenerate Key</span>
          </button>
          <button className="border border-primary text-primary px-6 py-2 rounded-full font-body-md font-semibold hover:bg-surface-container-low transition-all">
            Disable MFA
          </button>
        </div>
      </div>
      <div className="md:col-span-5 flex justify-center">
        <div className="p-6 bg-white rounded-2xl shadow-inner border border-outline-variant relative group overflow-hidden">
          <div className="w-40 h-40 bg-on-background relative flex items-center justify-center rounded-lg overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-20">
              <div className="bg-white col-span-1 row-span-1" />
              <div className="bg-white col-span-2 row-span-2 translate-x-2 translate-y-2" />
              <div className="bg-white col-start-8 row-start-2 w-4 h-4" />
              <div className="bg-white col-start-2 row-start-8 w-4 h-4" />
            </div>
            <span className="material-symbols-outlined text-surface text-5xl opacity-50">security</span>
          </div>
          <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
            <span className="text-on-primary font-label-sm uppercase tracking-widest font-bold">Secure Entry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
