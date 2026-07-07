import { useState, useCallback } from "react";

interface VirtualAccountCardProps {
  accountNumber: string;
  bankName: string;
  accountName: string;
  selectedDuration: string;
  onConfirm?: () => Promise<void>;
  isConfirming?: boolean;
}

export function VirtualAccountCard({
  accountNumber,
  bankName,
  accountName,
  selectedDuration,
  onConfirm,
  isConfirming = false,
}: VirtualAccountCardProps) {
  const [toast, setToast] = useState(false);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    });
  }, []);

  const formattedAccount = accountNumber.replace(/(.{4})/g, "$1 ").trim();

  return (
    <div className="bg-primary text-on-primary p-12 rounded-2xl relative overflow-hidden shadow-2xl h-full flex flex-col justify-between min-h-[600px]">
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none">
        <svg
          viewBox="0 0 400 600"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fed65b" />
              <stop offset="100%" stopColor="#e9c349" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q100,50 200,100 T400,100"
            stroke="url(#goldGrad)"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M0,200 Q100,150 200,200 T400,200"
            stroke="url(#goldGrad)"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M0,300 Q100,250 200,300 T400,300"
            stroke="url(#goldGrad)"
            strokeWidth="1"
            fill="none"
            opacity="0.3"
          />
          <path
            d="M0,400 Q100,350 200,400 T400,400"
            stroke="url(#goldGrad)"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
          />
          <path
            d="M0,500 Q100,450 200,500 T400,500"
            stroke="url(#goldGrad)"
            strokeWidth="1"
            fill="none"
            opacity="0.1"
          />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h3 className="text-[32px] font-display font-semibold text-secondary-fixed leading-[1.3]">
              Virtual Account
            </h3>
            <p className="text-[16px] font-body text-on-primary-container leading-[1.6]">
              Secure Transfer Gateway
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-[14px] font-body font-semibold tracking-[0.15em] opacity-60 uppercase">
              Izumi × Nomba
            </span>
          </div>
        </div>

        <div className="space-y-8">
          <button
            className="group cursor-pointer text-left w-full"
            onClick={() => copyToClipboard(accountNumber)}
          >
            <p className="text-[14px] font-body font-semibold tracking-[0.15em] text-primary-fixed-dim mb-2 uppercase">
              Account Number
            </p>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold tracking-tight text-white font-display">
                {formattedAccount}
              </span>
              <span className="material-symbols-outlined text-secondary-container group-hover:text-white transition-colors">
                content_copy
              </span>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[14px] font-body font-semibold tracking-[0.15em] text-primary-fixed-dim mb-1 uppercase">
                Bank Name
              </p>
              <p className="text-[18px] font-body font-semibold text-white leading-[1.6]">
                {bankName}
              </p>
            </div>
            <div>
              <p className="text-[14px] font-body font-semibold tracking-[0.15em] text-primary-fixed-dim mb-1 uppercase">
                Account Name
              </p>
              <p className="text-[18px] font-body font-semibold text-white leading-[1.6]">
                {accountName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-12 p-6 rounded-xl bg-primary-container border border-outline/20">
        <div className="flex gap-4 items-start">
          <span className="material-symbols-outlined text-secondary-container mt-1">
            info
          </span>
          <p className="text-[16px] font-body text-on-primary-container leading-relaxed">
            Funds transferred to this virtual account will be automatically
            allocated to your selected {selectedDuration} deposit plan. Transfers
            are cleared within 15 minutes of receipt.
          </p>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={isConfirming}
        className="relative z-10 mt-10 w-full py-5 bg-secondary-container text-on-secondary-fixed font-bold rounded-xl text-lg hover:bg-secondary transition-all active:scale-[0.98] duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isConfirming ? (
          <>
            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            Processing Investment...
          </>
        ) : (
          `Confirm & Lock in ${selectedDuration} Plan`
        )}
      </button>

      {/* Toast notification */}
      <div
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-on-surface text-surface px-6 py-3 rounded-full font-bold shadow-xl transition-all duration-500 z-[100] ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        Account number copied
      </div>
    </div>
  );
}
