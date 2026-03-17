interface ProductCardProps {
  id: number;
  name: string;
  image: string;
  subtitle?: string;
  price?: number;
  onAddToCart?: (id: number) => void;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export default function ProductCard({ id, name, image, subtitle, price, onAddToCart, onImageError }: ProductCardProps) {
  const handleClick = () => {
    if (onAddToCart) {
      onAddToCart(id);
    }
  };

  return (
    <div className="group border border-gray-100 rounded-xl overflow-hidden hover:border-farmGreen hover:shadow-lg hover:shadow-green-100 transition-all duration-300 cursor-pointer">
      <div className="bg-gray-50 flex items-center justify-center p-4 sm:p-6 h-40 sm:h-48 lg:h-56">
        <img
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          src={image}
          onError={onImageError}
        />
      </div>
      <div className="p-3 sm:p-4">
        <h4 className="font-bold text-gray-800 text-xs sm:text-sm lg:text-base text-left leading-tight">{name}</h4>
        {subtitle && <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-left">{subtitle}</p>}
        {price && (
          <p className="text-farmGreen font-bold text-sm mt-1">₦{price.toLocaleString()}</p>
        )}
        <button
          onClick={handleClick}
          className="w-full mt-2 sm:mt-3 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg text-[11px] sm:text-xs font-semibold transition-all hover:bg-green-600 hover:shadow-lg hover:shadow-green-200 active:scale-[0.98]"
        >
          Shop now
        </button>
      </div>
    </div>
  );
}
