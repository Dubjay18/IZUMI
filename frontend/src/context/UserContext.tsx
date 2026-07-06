import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { UserSession, VirtualAccount } from "@/lib/types";

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = "izumi_session";

function loadSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: UserSession | null) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface UserContextValue {
  session: UserSession | null;
  /** Called after saver onboarding succeeds */
  loginAsSaver: (
    userId: string,
    name: string,
    email: string,
    walletAddress: string,
    virtualAccount: VirtualAccount
  ) => void;
  /** Called after borrower onboarding succeeds */
  loginAsBorrower: (
    userId: string,
    name: string,
    email: string,
    borrowerId: string,
    virtualAccount?: VirtualAccount
  ) => void;
  /** Attach a borrowerId to an existing saver session */
  setBorrowerId: (borrowerId: string) => void;
  /** Clear session (logout) */
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(loadSession);

  const loginAsSaver = useCallback(
    (
      userId: string,
      name: string,
      email: string,
      walletAddress: string,
      virtualAccount: VirtualAccount
    ) => {
      const next: UserSession = {
        userId,
        name,
        email,
        role: "SAVER",
        kycStatus: "VERIFIED",
        walletAddress,
        virtualAccount,
        borrowerId: null,
      };
      saveSession(next);
      setSession(next);
    },
    []
  );

  const loginAsBorrower = useCallback(
    (
      userId: string,
      name: string,
      email: string,
      borrowerId: string,
      virtualAccount?: VirtualAccount
    ) => {
      const next: UserSession = {
        userId,
        name,
        email,
        role: "BORROWER",
        kycStatus: "VERIFIED",
        walletAddress: "",
        virtualAccount: virtualAccount ?? null,
        borrowerId,
      };
      saveSession(next);
      setSession(next);
    },
    []
  );

  const setBorrowerId = useCallback((borrowerId: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, borrowerId };
      saveSession(next);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setSession(null);
  }, []);

  return (
    <UserContext.Provider
      value={{ session, loginAsSaver, loginAsBorrower, setBorrowerId, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a <UserProvider>");
  return ctx;
}
