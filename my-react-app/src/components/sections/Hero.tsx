import { ArrowRight, Phone } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-hero-overlay min-h-[500px] sm:min-h-[550px] lg:min-h-[700px] flex items-center relative overflow-hidden">
      {/* Net bag flush against right wall */}
      <img
        src="/images/net%20bag.png"
        alt="Net bag with vegetables"
        className="absolute right-0 top-1/2 -translate-y-[40%] h-[55%] sm:h-[65%] lg:h-[75%] object-contain object-right hidden sm:block pointer-events-none select-none z-20"
      />

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 text-white relative z-10">
        <div className="max-w-[90%] sm:max-w-xl lg:max-w-2xl">
          <p className="font-handwritten text-xl sm:text-2xl lg:text-3xl mb-4 sm:mb-5 mt-2 sm:mt-4 tracking-wide">
            <span className="text-yellow-400">WELCOME TO</span>{' '}
            <span className="text-farmGreen">CHICKEN FARM</span>
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-extrabold leading-[1.1] mb-5 sm:mb-6">
            Your Home Of Fresh{' '}
            <span className="text-yellow-400">Poultry &amp; Farm<br />Products</span>{' '}
            Delivered<br />Same-Day
          </h1>
          <p className="text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 text-white/80 font-medium">
            Hygienic &bull; Affordable &bull; Trusted by homes &amp; businesses
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <a
              href="#products"
              className="bg-farmGreen hover:bg-green-600 hover:shadow-lg hover:shadow-green-900/30 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-bold flex items-center gap-2 sm:gap-2.5 transition-all text-sm"
            >
              Order now <ArrowRight size={16} />
            </a>
            <a
              href="#contact"
              className="bg-gray-900/80 border-2 border-gray-600 hover:bg-gray-800 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-bold flex items-center gap-2 sm:gap-2.5 transition-all text-sm"
            >
              Call us <Phone size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
