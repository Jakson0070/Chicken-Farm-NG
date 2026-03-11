import { Users, Sprout } from 'lucide-react';

export default function StatsBar() {
  return (
    <section className="bg-green-50 py-10 sm:py-14 lg:py-16">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 lg:gap-12">
        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800 max-w-sm text-center md:text-left">
          Growing crops and raising livestock.
        </div>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-16">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-orange-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-orange-400">38K</div>
              <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                Trusted Customers
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 sm:border-l sm:border-gray-200 sm:pl-8 lg:pl-16">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sprout size={20} className="text-orange-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-orange-400">28M</div>
              <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                Growth Tons
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
