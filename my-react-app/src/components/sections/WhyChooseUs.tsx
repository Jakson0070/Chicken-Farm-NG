import { Truck, Home, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const cards: { image: string; title: string; titleColor: string; bgColor: string; borderColor: string; desc: string; icon: LucideIcon; iconBg: string }[] = [
  {
    image: '/images/samedaydelivery.png',
    title: 'Same-Day Delivery',
    titleColor: 'text-orange-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-100',
    desc: 'We prepare and deliver your order quickly so you receive fresh product without delay',
    icon: Truck,
    iconBg: 'bg-yellow-500',
  },
  {
    image: '/images/service-02.webp.png',
    title: 'Trusted by Homes & Businesses',
    titleColor: 'text-blue-900',
    bgColor: 'bg-white',
    borderColor: 'border-gray-100',
    desc: 'Families, restaurants, and buyers rely on us for consistent supply and dependable service',
    icon: Home,
    iconBg: 'bg-blue-900',
  },
  {
    image: '/images/hygeinic.jpg',
    title: 'Fresh & Hygenic',
    titleColor: 'text-farmGreen',
    bgColor: 'bg-green-100/50',
    borderColor: 'border-green-100',
    desc: 'Farm-Fresh products carefully handled to ensure quality and safety from farm to delivery',
    icon: Leaf,
    iconBg: 'bg-farmGreen',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-farmGreen mb-3 sm:mb-4">Why Choose Us</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto px-2">
            Fresh farm products, sold in practical quantities for homes and businesses
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`${card.bgColor} p-5 sm:p-6 lg:p-8 rounded-2xl border ${card.borderColor} flex flex-col hover:shadow-xl transition-all duration-300 group`}
            >
              <div className="overflow-hidden rounded-xl mb-4 sm:mb-6 w-full relative">
                <img
                  alt={card.title}
                  className="w-full object-cover h-40 sm:h-44 lg:h-48 group-hover:scale-105 transition-transform duration-500"
                  src={card.image}
                />
                {/* Icon badge */}
                <div className={`absolute bottom-3 right-3 ${card.iconBg} w-10 h-10 rounded-lg flex items-center justify-center shadow-lg`}>
                  <card.icon size={18} className="text-white" />
                </div>
              </div>
              <h3 className={`${card.titleColor} font-extrabold mb-4 text-sm lg:text-base`}>
                {card.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
