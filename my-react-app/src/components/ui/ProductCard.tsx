interface ProductCardProps {
  name: string;
  image: string;
  subtitle?: string;
}

export default function ProductCard({ name, image, subtitle }: ProductCardProps) {
  return (
    <div className="group border border-gray-100 rounded-xl overflow-hidden hover:border-farmGreen hover:shadow-lg hover:shadow-green-100 transition-all duration-300 cursor-pointer">
      <div className="bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <img
          alt={name}
          className="h-24 sm:h-28 lg:h-32 object-contain group-hover:scale-105 transition-transform duration-300"
          src={image}
        />
      </div>
      <div className="p-3 sm:p-4">
        <h4 className="font-bold text-gray-800 text-xs sm:text-sm lg:text-base text-left leading-tight">{name}</h4>
        {subtitle && <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-left">{subtitle}</p>}
        <button className="w-full mt-2 sm:mt-3 py-2 sm:py-2.5 bg-farmGreen text-white rounded-lg text-[11px] sm:text-xs font-semibold transition-all hover:bg-green-600 hover:shadow-md active:scale-[0.98]">
          Shop now
        </button>
      </div>
    </div>
  );
}
