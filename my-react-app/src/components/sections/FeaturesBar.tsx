import { ShieldCheck, Truck, Home } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const features: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: ShieldCheck, title: 'Secure Packaging', desc: 'Carefully managed' },
  { icon: Truck, title: 'Farm to Door Delivery', desc: 'Fresh products for you' },
  { icon: Home, title: 'Local Farm Network', desc: 'Always fresh & local' },
];

export default function FeaturesBar() {
  return (
    <section className="container mx-auto px-4 lg:px-8 -mt-8 sm:-mt-12 relative z-10">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 border border-gray-100 overflow-hidden">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="p-4 sm:p-6 lg:p-8 flex items-center gap-3 sm:gap-4 hover:bg-green-50/50 transition-colors group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 text-farmGreen rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-farmGreen group-hover:text-white transition-colors">
                <Icon size={20} strokeWidth={2} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm sm:text-base">{f.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
