export function Mission() {
  return (
    <section className="py-20 bg-primary text-secondary-fixed relative">
      <div className="container mx-auto px-10">
        <div className="grid grid-cols-12 gap-6 items-center">
          {/* Left text */}
          <div className="col-span-12 lg:col-span-6 mb-12 lg:mb-0">
            <span className="text-[14px] font-body font-semibold text-primary-fixed-dim uppercase tracking-[0.2em] block mb-6">
              Our Core Ethos
            </span>
            <h2 className="text-[56px] font-display font-bold mb-8 leading-[1.1] tracking-[-0.02em]">
              Wealth meets Purpose <br />
              in every allocation.
            </h2>
            <p className="text-[18px] font-body text-primary-fixed-dim/80 max-w-lg mb-10 leading-[1.6]">
              We believe that capital is not a static resource but a moving force.
              Like a fountain, it must be recycled, replenished, and directed toward
              meaningful impact to maintain its vitality.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-display text-[32px] font-semibold mb-2">
                  01. Curation
                </h4>
                <p className="text-sm font-body text-primary-fixed-dim/60">
                  Bespoke investment vehicles tailored to generational legacies.
                </p>
              </div>
              <div>
                <h4 className="font-display text-[32px] font-semibold mb-2">
                  02. Fluidity
                </h4>
                <p className="text-sm font-body text-primary-fixed-dim/60">
                  Dynamic risk management that adapts to shifting global tides.
                </p>
              </div>
            </div>
          </div>

          {/* Right images */}
          <div className="col-span-12 lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="pt-12">
                <div className="rounded-3xl overflow-hidden aspect-[3/4] mb-4">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1zScLIYtgOzXjRkPKOxMc4fEkDeT-y_ob42LPKnTs-z_N1iKY2vLr49gtI-PR_sc9K4uzWFb_7CK26RWu1Z1DegimIeEf5VvOruVsZeYlBSWQnCA1DbDlQRz4cvPS0JtUzYaL0HZ_NMEYqrXQBqNlMddaWwmUtsBVImHxBhnGILT2ewTpUBssQsx1QesWQCOxEs0GAsJy9AsJ5fkOhIgDMv5wCo5_HcutmTUNADwzSYZ4zDsWqsAP"
                    alt="Ink swirling in clear water"
                  />
                </div>
              </div>
              <div>
                <div className="rounded-3xl overflow-hidden aspect-[3/4]">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9lVOGZvjrmg0f2WhgrPWAjKS5BLaeHbr9wOz3rOMDvzXJmmY4vAXD00Qy2BvyFgKL00LTFHhc29dnRzimtl3LC2kSCYp3aLmyflvB8lRIvYLy1kyq4Z8cMssRT2ROpICLwTelWRHq4_Id1S0P2PdEtcNbwkl34qQHudqFQChUA6g9s78o9Xs-ZniooQsRTRW164pE8NvQdmZ1cbzqv4s0-Ho0bvGhyFSnswFuFSAL3yuB9Qy3seR4"
                    alt="Ultra-modern office interior"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
