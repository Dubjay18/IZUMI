const TABS = [
  { id: "personal", label: "Personal Information", icon: "person" },
  { id: "2fa", label: "Two-Factor Authentication", icon: "verified_user" },
  { id: "sessions", label: "Session History", icon: "history" },
  { id: "api", label: "API Access", icon: "key" },
  { id: "deactivate", label: "Deactivate Account", icon: "logout", danger: true },
] as const;

type SettingsSidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <nav className="flex flex-col gap-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const base = "flex items-center gap-4 px-6 py-4 rounded-xl transition-all";
        const activeStyle = "bg-primary text-on-primary shadow-md";
        const inactiveStyle = "text-on-surface-variant hover:bg-surface-container-low";
        const dangerStyle = "text-error/80 hover:bg-error-container/20";

        let className = base;
        if (tab.danger) {
          className += isActive ? ` ${activeStyle}` : ` ${dangerStyle}`;
        } else {
          className += isActive ? ` ${activeStyle}` : ` ${inactiveStyle}`;
        }

        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} className={className}>
            <span className="material-symbols-outlined">{tab.icon}</span>
            <span className="font-body-md font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
