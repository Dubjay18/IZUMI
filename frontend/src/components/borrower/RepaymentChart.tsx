import { useUser } from "@/context/UserContext";
import { useLoans } from "@/hooks/useLoans";
import { useState } from "react";

function makeChartPoints(loans: { createdAt: string; amountApproved: string | null; amountRepaid: string }[]) {
  const sorted = [...loans]
    .filter((l) => l.amountApproved)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (sorted.length === 0) {
    return { points: "", area: "" };
  }

  const maxVal = Math.max(
    ...sorted.map((l) => Number(l.amountApproved)),
    1
  );

  const points = sorted
    .map((l, i) => {
      const x = (i / Math.max(sorted.length - 1, 1)) * 1000;
      const y = 200 - (Number(l.amountApproved) / maxVal) * 180;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const lastX = 1000;
  const lastY = 200 - (Number(sorted[sorted.length - 1].amountApproved) / maxVal) * 180;
  const area = `${points} L${lastX},${lastY} L${lastX},200 L0,200 Z`;

  return { points, area };
}

export function RepaymentChart() {
  const { session } = useUser();
  const { loans } = useLoans(session?.borrowerId);
  const [range, setRange] = useState<"6M" | "1Y" | "ALL">("1Y");

  const now = Date.now();
  const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

  const filtered = loans.filter((l) => {
    const date = new Date(l.createdAt).getTime();
    if (range === "6M") return date >= sixMonthsAgo;
    if (range === "1Y") return date >= oneYearAgo;
    return true;
  });

  const { points, area } = makeChartPoints(filtered);

  return (
    <section className="glass-panel rounded-xl p-8 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="font-headline-md text-headline-md text-primary">Repayment Progress</h3>
          <p className="text-on-surface-variant font-body-md">Loan disbursement and repayment activity</p>
        </div>
        <div className="flex gap-2">
          {(["6M", "1Y", "ALL"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1 rounded-full border text-label-sm font-semibold transition-all ${
                range === r
                  ? "border-primary text-primary bg-primary/5"
                  : "border-outline-variant text-on-surface-variant hover:border-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-64 relative mt-12">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200">
          <defs>
            <linearGradient id="repayGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#001512" stop-opacity="0.1" />
              <stop offset="100%" stop-color="#001512" stop-opacity="0" />
            </linearGradient>
          </defs>
          {points && (
            <>
              <path
                className="chart-path"
                d={points}
                fill="none"
                stroke="#001512"
                strokeWidth="3"
              />
              <path d={area} fill="url(#repayGradient)" />
            </>
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
          <div className="border-t border-primary w-full" />
          <div className="border-t border-primary w-full" />
          <div className="border-t border-primary w-full" />
        </div>
      </div>

      <div className="flex justify-between mt-4 text-label-sm text-outline tracking-widest font-subhead-caps">
        <span>EARLIEST</span>
        <span>CURRENT</span>
      </div>
    </section>
  );
}
