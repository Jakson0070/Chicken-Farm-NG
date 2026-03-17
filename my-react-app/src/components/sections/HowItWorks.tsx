import { Search, ShoppingCart, Package } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const steps: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Search, title: 'Step 1', desc: 'Choose your farm product' },
  { icon: ShoppingCart, title: 'Step 2', desc: 'Place your order online' },
  { icon: Package, title: 'Step 3', desc: 'Get fresh delivery to your home or business' },
];

export default function HowItWorks() {
  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-3 sm:mb-4">How it works</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto px-2">
            How ChickenFarm Works
          </p>
        </div>

        <div className="relative flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Step Connector Line */}
          <div className="hidden sm:block absolute top-1/2 left-[15%] w-[70%] h-0.5 bg-gradient-to-r from-gray-200 via-green-600/30 to-gray-200 z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center bg-white p-6 sm:p-8 border border-gray-100 rounded-2xl card-shadow w-full sm:w-72 hover:border-green-600 hover:shadow-xl transition-all duration-300 group relative z-10"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 border-4 border-white shadow-md group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <Icon size={24} strokeWidth={1.8} />
                </div>
                <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">{step.title}</h4>
                <p className="text-[11px] sm:text-xs text-gray-400 text-center">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
