export default function OrganicCTA() {
  return (
    <section
      className="py-16 sm:py-24 lg:py-32 bg-cover bg-center bg-fixed text-white relative"
      style={{
        backgroundImage:
          "url('/images/freshvegetables.jpeg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10">
        <p className="font-handwritten text-farmGreen text-base sm:text-lg lg:text-xl mb-3 sm:mb-4 tracking-wide">100% Organic</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 sm:mb-8 max-w-3xl mx-auto leading-tight drop-shadow-lg">
          Be Healthy &amp; Eat Only Fresh Organic Vegetables
        </h2>
        <a
          href="#products"
          className="inline-block bg-farmGreen hover:bg-green-600 px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl hover:shadow-green-900/30 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Shop Now
        </a>
      </div>
    </section>
  );
}
