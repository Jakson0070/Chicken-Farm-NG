export default function BannerCTA() {
  return (
    <section className="container mx-auto px-5 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      {/* Yellow Banner */}
      <div
        className="rounded-2xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden group hover:shadow-xl transition-shadow duration-300 min-h-[220px] sm:min-h-[280px] flex items-center"
        style={{
          backgroundImage: `url('/images/freshvegetables.jpeg')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-yellow-400/65" />
        <div className="z-10 relative">
          <p className="text-[10px] sm:text-xs font-bold uppercase mb-1 sm:mb-2 tracking-wider">100% Organic</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-4 sm:mb-6 leading-tight font-handwritten">
            Quality Organic
            <br />
            Food Store
          </h3>
          <a href="#products" className="inline-block bg-white text-gray-800 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold hover:bg-gray-50 hover:shadow-md transition-all active:scale-[0.97]">
            Order Now
          </a>
        </div>
      </div>

      {/* Green Banner */}
      <div
        className="rounded-2xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden group hover:shadow-xl transition-shadow duration-300 min-h-[220px] sm:min-h-[280px] flex items-center"
        style={{  
          backgroundImage: `url('/images/freshvegetables.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-green-500/65" />
        <div className="z-10 relative">
          <p className="text-[10px] sm:text-xs font-bold uppercase mb-1 sm:mb-2 tracking-wider">100% Organic</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-4 sm:mb-6 leading-tight font-handwritten">
            Healthy Products
            <br />
            Everyday
          </h3>
          <a href="#products" className="inline-block bg-white text-gray-800 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold hover:bg-gray-50 hover:shadow-md transition-all active:scale-[0.97]">
            Order Now
          </a>
        </div>
      </div>
    </section>
  );
}
