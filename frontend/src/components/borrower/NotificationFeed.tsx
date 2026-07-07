import { useMemo } from "react";

interface NotificationItem {
  id: string;
  dot: string;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
}

interface NotificationFeedProps {
  entries: any[];
  loading?: boolean;
}

export function NotificationFeed({ entries, loading }: NotificationFeedProps) {
  const notifications = useMemo(() => {
    const list: NotificationItem[] = [];

    // Parse the 5 most recent transactions
    const recent = entries.slice(0, 5);
    recent.forEach((tx, idx) => {
      const amountVal = Number(tx.amount);
      const formattedAmount = "₦" + amountVal.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      let title = "";
      let description = "";

      if (tx.type === "DISBURSEMENT") {
        title = "Disbursement Successful";
        description = `Your credit line of ${formattedAmount} was successfully funded. Ref: ${tx.reference.slice(0, 8).toUpperCase()}`;
      } else if (tx.type === "REPAYMENT") {
        title = "Daily POS Sweep";
        description = `Automatic sweep repayment of ${formattedAmount} was processed via Nomba POS.`;
      }

      if (title) {
        // Calculate relative time
        const txDate = new Date(tx.createdAt);
        const diffMs = Date.now() - txDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        let timeStr = "";
        if (diffMins < 1) {
          timeStr = "JUST NOW";
        } else if (diffMins < 60) {
          timeStr = `${diffMins} MINUTE${diffMins > 1 ? "S" : ""} AGO`;
        } else if (diffHours < 24) {
          timeStr = `${diffHours} HOUR${diffHours > 1 ? "S" : ""} AGO`;
        } else if (diffDays < 7) {
          timeStr = `${diffDays} DAY${diffDays > 1 ? "S" : ""} AGO`;
        } else {
          timeStr = txDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
        }

        list.push({
          id: `borrow-notif-${tx.id}`,
          dot: idx === 0 ? "bg-secondary" : "bg-outline-variant",
          title,
          description,
          time: timeStr,
          isNew: idx === 0,
        });
      }
    });

    // Default static fallback notifications for clean empty states
    if (list.length === 0) {
      list.push({
        id: "b-welcome",
        dot: "bg-secondary",
        title: "Welcome to Izumi",
        description: "Onboarded successfully. Set up terminal devices to begin sweep repayment cycles.",
        time: "JUST NOW",
        isNew: true,
      });
    }

    list.push({
      id: "b-kyc",
      dot: "bg-outline-variant",
      title: "ZK-KYB Verified",
      description: "Business profile and virtual account references active on-chain.",
      time: "ONBOARDING",
      isNew: false,
    });

    return list;
  }, [entries]);

  const newCount = notifications.filter((n) => n.isNew).length;

  return (
    <div className="glass-panel p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-[20px] font-bold text-primary">Notifications</h3>
        <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2.5 py-0.5 rounded-full font-bold">
          {newCount} NEW
        </span>
      </div>
      
      {loading ? (
        <div className="py-8 text-center text-xs text-on-surface-variant animate-pulse font-body-md">
          Retrieving merchant feed...
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="group p-4 border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <div className={`mt-1.5 w-2 h-2 rounded-full ${n.dot} shrink-0`} />
                <div>
                  <p className="font-body-md text-sm font-bold text-primary">{n.title}</p>
                  <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">{n.description}</p>
                  <p className="text-[10px] text-outline mt-2 tracking-widest">{n.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button className="w-full mt-6 py-3 text-center border-t border-outline-variant/50 text-secondary font-label-sm text-label-sm hover:underline">
        View All Notifications
      </button>
    </div>
  );
}
