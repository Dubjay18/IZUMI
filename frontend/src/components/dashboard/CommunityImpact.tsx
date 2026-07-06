import { useUser } from "@/context/UserContext";
import { useBalance } from "@/hooks/useBalance";

export function CommunityImpact() {
  const { session } = useUser();
  const { balanceUSD } = useBalance(session?.userId);

  const baseline = balanceUSD > 0 ? balanceUSD : 10000;
  
  // Custom estimated funding split for demonstration
  const abyssiniaFunding = baseline * 0.045; // 4.5% of portfolio
  const luminaImpact = (baseline * 0.082).toFixed(2); // 8.2% APY impact metric

  const formatUSD = (val: number) =>
    "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const IMPACT_PROJECTS = [
    {
      title: "Abyssinia Collective",
      subtitle: `Funded by your Portfolio: ${formatUSD(abyssiniaFunding)}`,
      tag: "Sustainable Agro",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBCJ0jyZml4GSZXC1R6z8KnasWB7pq4YMBwSR2roA6cwo95q9DomdSCUaHtAiY_uGFk3HbztBKbttKcp_G9ClMN410llHKdB9DFhQw5HiUqHc8iwHShiejlVGco4l3z9oC5hesRTXqxKxxvz90oGHSfmBevg-y0sbXp4HBEWaCS5UdV4XS2ghIMYhph-aSqce5vG0XrdEeC3uzkjuxUZF_YjWxnkwMqOYa5jpdmucxeM5NtNuPDRMgN",
      aspect: "aspect-[4/5]",
    },
    {
      title: "Lumina Energy",
      subtitle: `Proportional Allocation: $${Number(luminaImpact).toLocaleString()}`,
      tag: "Renewable Tech",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBrdF1Bs0g2Grfh00ujO0wEQMkIHjia3L0Z6Enp0N9YL6IZkGQBRR0Gaxm-VRukr1O5wNguQjDDegJoT2IsfLUVkGSQbOAf_L0CrvvKCc-ZiEx5tdZpToVjfaBZ5IAyYWNYwxCenidSaxens6PDkIYhgFUtH5A3PJSCw-ovkIjBlXK4iRdRnVH5ukJ_pfxH0cAPpnq3TLgTAwzQSQrd3YnK6b6V6Acq3CwqbPwJSas84UcFqSJryZ0L",
      aspect: "aspect-[4/3]",
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[14px] font-body font-semibold text-primary uppercase tracking-[0.15em] px-2">
        Community Impact
      </h3>
      {IMPACT_PROJECTS.map((project) => (
        <div
          key={project.title}
          className={`group relative rounded-2xl overflow-hidden ${project.aspect} cursor-pointer shadow-lg`}
        >
          <img
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            src={project.image}
            alt={project.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
              {project.tag}
            </span>
            <h4 className="text-secondary-fixed font-display text-[20px] font-semibold">
              {project.title}
            </h4>
            <p className="text-primary-fixed-dim text-[12px] font-body font-medium mt-1">
              {project.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
