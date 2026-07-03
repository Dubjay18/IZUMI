export function AdvisoryCTA() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-10">
        <div className="bg-surface-container-high rounded-[3rem] p-16 md:p-24 overflow-hidden relative">
          {/* Background SVG blob */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M44.7,-76.4C58.3,-69.2,70.2,-57.4,78.2,-43.7C86.2,-30.1,90.3,-15,88.4,-0.8C86.5,13.4,78.5,26.7,69.5,38.7C60.5,50.7,50.4,61.4,38.1,68.9C25.8,76.4,11.3,80.7,-2.4,84.9C-16.1,89.1,-32.2,93.2,-46.1,88.2C-60,83.2,-71.7,69.1,-79,54.5C-86.3,39.9,-89.2,24.9,-89.8,10.1C-90.4,-4.7,-88.7,-19.2,-83.1,-32.9C-77.5,-46.6,-68,-59.5,-55.6,-67.2C-43.2,-74.9,-27.9,-77.4,-13.2,-79.8C1.5,-82.2,16.2,-84.5,31.1,-83.6C46,-82.7,61.1,-78.6,44.7,-76.4Z"
                fill="#735c00"
                transform="translate(100 100)"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
            <h2 className="text-[56px] font-display font-bold text-primary leading-[1.1] tracking-[-0.02em]">
              Begin your consultation.
            </h2>
            <p className="text-[18px] font-body text-on-surface-variant leading-[1.6]">
              Our stewards are available for private sessions globally. Secure your
              legacy with the precision it deserves.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <input
                className="bg-surface w-full md:w-96 px-6 py-4 rounded-full border-none focus:ring-2 focus:ring-secondary placeholder:text-outline-variant font-body shadow-sm"
                placeholder="Professional Email Address"
                type="email"
              />
              <button className="bg-primary text-secondary-fixed px-10 py-4 rounded-full text-[14px] font-body uppercase tracking-[0.15em] font-semibold hover:bg-primary/90 transition-all w-full md:w-auto">
                Request Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
