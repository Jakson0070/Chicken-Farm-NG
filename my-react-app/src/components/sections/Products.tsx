import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../ui/ProductCard';
import { productsApi } from '../../services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  description?: string;
}

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' text-anchor='middle' x='100' y='100'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const productsData = await productsApi.getAll();
      const productsArray = Array.isArray(productsData.data) ? productsData.data : (Array.isArray(productsData) ? productsData : []);
      setProducts(productsArray);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  const handleAddToCart = async (_productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    navigate('/market');
  };

  return (
    <section id="products" className="py-14 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-farmGreen mb-3 sm:mb-4">Our Product</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm px-2">
            Fresh farm products, sold in practical quantities for homes and businesses
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farmGreen"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  image={product.image || PLACEHOLDER_IMAGE}
                  subtitle={product.unit}
                  price={product.price}
                  onAddToCart={handleAddToCart}
                  onImageError={handleImageError}
                />
              ))}
            </div>

            <div className="mt-12 text-center">
              <a
                className="inline-flex items-center gap-2 text-farmGreen font-bold hover:gap-3 transition-all"
                href="/market"
              >
                See all <span className="text-xl">→</span>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
