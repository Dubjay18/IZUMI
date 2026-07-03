export function RegionalGateway() {
  return (
    <div className="glass-panel p-4 rounded-xl space-y-3">
      <p className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
        REGIONAL GATEWAY
      </p>
      <div className="h-32 w-full rounded-lg bg-surface-container-high grayscale contrast-[0.8] opacity-60 overflow-hidden">
        <img
          className="w-full h-full object-cover rounded-lg"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXjFgzKtK50miHAUvshZDT-rqyiawnDqNxF7zlOZJxUHb_PJZ3YOzegRBv9kMLGeGZyzMw3pRYUsUxtc4dgg51vJ8-yBg4qmMw88sp94PE1NL7l5fGT-IAdUspvozTh15ywi3awhP4287sCYRmH8zxbxdWY-pXpohJ5ClyrYp6OIck9c8AHfv3N71pVn2ZsV-3PU3IYyHoFhC5VW5a6dM5HowjAwQT7Ela1jsXh3MwDBAruncB0Xex"
          alt="Zurich financial district"
        />
      </div>
      <div className="flex justify-between items-center px-1">
        <span className="text-[12px] font-body font-bold text-primary">
          Zürich Node
        </span>
        <span className="text-[12px] font-body text-surface-tint">Active</span>
      </div>
    </div>
  );
}
