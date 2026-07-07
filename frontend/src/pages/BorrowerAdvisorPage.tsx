import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreditHealthGauge } from "@/components/borrower/CreditHealthGauge";
import { InventoryTips } from "@/components/borrower/InventoryTips";
import { PromotionCard } from "@/components/borrower/PromotionCard";
import { useUser } from "@/context/UserContext";
import { aiApi } from "@/lib/api";

type Message = {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
  analysis?: { dti: string; barWidth: string };
};

const USER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKlUcO8bfvrqBDZvJBJJPI5PiE8zz3VuTznQ3t6X3cXd9l_-ZngRtDkmjCHkhIN09KqbCjT68wE3qMVUwfSU2K_QqsP8p-V5g3IhGTBLfbGR55WzSk-tSQUR_qYX6QVlC0r93wl9ZryyiBZR8qEckVq2WJz4Dn7mTpixssvG3xILmieNurMHjajjeKALqHRzniT2CM0qF-cVE4mg6mVQCQmv1CWw4dVMK-epEHsO59euhaBkkmedfg";

const SUGGESTIONS = [
  "Risk Assessment",
  "Inventory Strategy",
  "Expansion Loan",
];

export function BorrowerAdvisorPage() {
  const { session } = useUser();
  
  // Custom initial message using borrower's real name if logged in
  const initialMessages: Message[] = [
    {
      id: "1",
      role: "ai",
      content: `Good day, ${session?.name || "business partner"}. I am your Izumi AI Advisory assistant. How can I help you optimize your business cashflow, credit health, or inventory strategy today?`,
      timestamp: "Izumi AI • Just now",
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: "You • Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await aiApi.chat({
        message: text,
        borrowerId: session?.borrowerId || undefined,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: res.response,
        timestamp: "Izumi AI • Just now",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("AI advisory chat failed:", err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "ai",
        content: `Error: ${err.message || "Failed to communicate with Izumi AI Advisor. Please try again."}`,
        timestamp: "System • Just now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout>
      <main className="h-[calc(100vh-64px)] flex flex-col md:flex-row max-w-[1440px] mx-auto gap-gutter px-gutter md:px-container-padding py-6 overflow-hidden pb-20 md:pb-6">
        {/* Chat Interface */}
        <section className="flex-1 flex flex-col glass-panel rounded-xl overflow-hidden shadow-sm">
          {/* Chat Header */}
          <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container relative">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" as string }}>
                  smart_toy
                </span>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-surface" />
              </div>
              <div>
                <h2 className="font-headline-md text-xl font-bold text-primary">Izumi AI Advisor</h2>
                <p className="text-label-sm text-on-surface-variant flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  Powered by Izumi Intelligence
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined">history</span>
              </button>
              <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar"
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                {/* AI Message */}
                {msg.role === "ai" && (
                  <div className="flex gap-4 max-w-[85%]">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-sm">
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-surface-container-high p-4 rounded-2xl chat-bubble-ai text-on-surface shadow-sm">
                        <p className="font-body-md">{msg.content}</p>
                        {msg.analysis && (
                          <div className="mt-4 p-4 bg-surface rounded-xl border border-outline-variant/30">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-subhead-caps text-xs opacity-70 uppercase tracking-widest">
                                Projected Q4 DTI
                              </span>
                              <span className="text-secondary font-bold">{msg.analysis.dti}</span>
                            </div>
                            <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-secondary h-full"
                                style={{ width: msg.analysis.barWidth }}
                              />
                            </div>
                            <p className="text-xs text-on-surface-variant mt-2 italic font-body-md">
                              Threshold limit: 35%
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-label-sm tracking-wider uppercase ml-1">
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                )}

                {/* User Message */}
                {msg.role === "user" && (
                  <div className="flex flex-row-reverse gap-4 max-w-[85%] ml-auto">
                    <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden">
                      <img
                        src={USER_AVATAR}
                        alt="You"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="bg-primary text-on-primary p-4 rounded-2xl chat-bubble-user shadow-sm">
                        <p className="font-body-md">{msg.content}</p>
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-label-sm tracking-wider uppercase mr-1">
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-8 h-8 shrink-0 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-sm">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                </div>
                <div className="bg-surface-container-high p-4 rounded-2xl chat-bubble-ai shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/20 shrink-0">
            <div
              className={`relative flex items-center transition-all duration-200 ${
                inputFocused ? "scale-[1.01] shadow-md" : ""
              }`}
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                className="w-full bg-surface border-none border-b-2 border-outline-variant focus:border-secondary focus:ring-0 py-4 pl-4 pr-16 transition-all text-on-surface font-body-md"
                placeholder="Ask about your credit capacity or planning..."
                type="text"
              />
              <div className="absolute right-2 flex gap-2">
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center hover:shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>

            {/* Suggestion Chips */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInputValue(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="whitespace-nowrap px-4 py-2 bg-secondary/10 text-secondary text-xs font-subhead-caps uppercase tracking-widest rounded-full border border-secondary/20 hover:bg-secondary/20 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="w-full md:w-80 space-y-gutter flex flex-col shrink-0">
          <CreditHealthGauge />
          <InventoryTips />
          <PromotionCard />
        </aside>
      </main>
    </AppLayout>
  );
}
