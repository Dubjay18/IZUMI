import { useState } from "react";

const INITIAL_KEYS = [
  { name: "Quant_Algo_One_Prod", permissions: "READ_ONLY, DATA_FEED", masked: "iz_prod_••••••••••••x7z8" },
  { name: "Reporting_Suite_ZRH", permissions: "STATEMENT_EXPORT", masked: "iz_prod_••••••••••••a2m9" },
];

export function ApiKeySection() {
  const [keys] = useState(INITIAL_KEYS);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function handleCopy(idx: number) {
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="glass-panel p-8 md:p-12 rounded-3xl bg-primary text-on-primary">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-gutter mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md mb-2">Advanced API Configuration</h2>
          <p className="text-on-primary-container font-body-md">
            Programmable access for institutional algorithmic trading and reporting.
          </p>
        </div>
        <button className="bg-secondary text-on-secondary px-8 py-3 rounded-full font-body-md font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all flex items-center gap-2 whitespace-nowrap">
          <span className="material-symbols-outlined">add</span>
          Generate New Key
        </button>
      </div>

      <div className="space-y-4">
        {keys.map((key, i) => (
          <div
            key={key.name}
            className="p-5 bg-primary-container rounded-2xl border border-on-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">token</span>
              </div>
              <div>
                <p className="font-body-md font-bold text-on-primary">{key.name}</p>
                <p className="text-label-sm text-on-primary-container">Permissions: {key.permissions}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <code className="bg-black/20 px-3 py-1 rounded text-label-sm text-secondary-fixed">{key.masked}</code>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(i)}
                  className="material-symbols-outlined text-on-primary-container hover:text-on-primary transition-colors"
                >
                  {copiedIdx === i ? "check" : "content_copy"}
                </button>
                <button className="material-symbols-outlined text-on-primary-container hover:text-error transition-colors">
                  delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
