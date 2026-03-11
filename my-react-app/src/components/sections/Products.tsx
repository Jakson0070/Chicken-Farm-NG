import ProductCard from '../ui/ProductCard';

const products = [
  {
    name: 'Fresh Fruits',
    image: '/images/fresh%20fruits.png',
    subtitle: 'Sold per basket or bag',
  },
  {
    name: 'Vegetables',
    image: '/images/vegetables.png',
    subtitle: 'Sold per kg',
  },
  {
    name: 'Eggs',
    image: '/images/eggs.png',
    subtitle: 'Tray of 30 eggs',
  },
  {
    name: 'Fresh Chicken',
    image: '/images/image%20118.png',
    subtitle: 'Sold per kg',
  },
  {
    name: 'Live chicken',
    image: '/images/image%20120.png',
    subtitle: 'Sold per basket or bag',
  },
  {
    name: 'Fresh Fish',
    image: '/images/image%20121.png',
    subtitle: 'Sold per kg',
  },
  {
    name: 'Roasted Chicken',
    image: '/images/image%20122.png',
    subtitle: 'Half / whole',
  },
  {
    name: 'Staple Farm Produce',
    image: '/images/image%20123.png',
    subtitle: 'Sold per bag',
  },
];

export default function Products() {
  return (
    <section id="products" className="py-14 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-farmGreen mb-3 sm:mb-4">Our Product</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm px-2">
            Fresh farm products, sold in practical quantities for homes and businesses
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.name} name={product.name} image={product.image} subtitle={product.subtitle} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <a className="inline-flex items-center gap-2 text-farmGreen font-bold hover:gap-3 transition-all" href="#">
            See all <span className="text-xl">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
