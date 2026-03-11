import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi, cartApi } from "../../services/api";

interface Product {
    id: number;
    name: string;
    price: number;
    unit: string;
    image: string;
    description?: string;
    type?: string;
}

interface CartItem {
    id: number;
    product_id: number;
    product: Product;
    quantity: number;
}

interface CartResponse {
    id?: number;
    items?: CartItem[];
    data?: CartItem[];
    [key: string]: any;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total: number;
    created_at: string;
    delivery_method: string;
    delivery_address: string;
    items?: OrderItem[];
}

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    image?: string;
}

// Get order display name from items
const getOrderDisplayName = (order: Order): string => {
    if (!order.items || order.items.length === 0) {
        return `Order #${order.order_number}`;
    }
    if (order.items.length === 1) {
        return order.items[0].product_name;
    }
    return `${order.items[0].product_name} +${order.items.length - 1} more`;
};

// Placeholder image for products without images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' text-anchor='middle' x='100' y='100'%3ENo Image%3C/text%3E%3C/svg%3E";

function ProductsIndex() {
    const navigate = useNavigate();
    
    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutData, setCheckoutData] = useState({
        delivery_method: "local_delivery",
        delivery_address: "",
        notes: ""
    });
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isOrdersOpen, setIsOrdersOpen] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [productTypes, setProductTypes] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Check authentication status on mount and when storage changes
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };
        checkAuth();

        // Listen for storage changes (login/logout in other tabs)
        const handleStorageChange = () => checkAuth();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Fetch product types from products data
    useEffect(() => {
        if (products.length > 0) {
            const types = Array.from(new Set(products.map(p => p.type).filter(Boolean))) as string[];
            setProductTypes(types);
        }
    }, [products]);

    // Fetch products when search or type changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1); // Reset to first page when search/type changes
            loadProducts(selectedType, searchQuery, 1);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [selectedType, searchQuery]);

    // Image error handler
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = PLACEHOLDER_IMAGE;
    };

    // Fetch products and cart on mount
    useEffect(() => {
        loadProducts("", "", 1);
    }, []);

    const loadProducts = async (type: string = "", search: string = "", page: number = 1) => {
        try {
            setIsLoading(true);
            setError(null);

            // Build params object only with defined values
            const params: { type?: string; search?: string; page?: string } = {};
            if (type) params.type = type;
            if (search) params.search = search;
            params.page = page.toString();

            // Fetch products with filters
            const productsData = await productsApi.getAll(params);
            console.log('Products data:', productsData);
            console.log('Products data.data:', productsData.data);
            const productsArray = Array.isArray(productsData.data) ? productsData.data : (Array.isArray(productsData) ? productsData : []);
            console.log('Products array:', productsArray);
            setProducts(productsArray);
            
            // Update pagination info
            setLastPage(productsData.last_page || 1);
            setCurrentPage(productsData.current_page || 1);
            setTotalProducts(productsData.total || 0);

            // Fetch cart
            try {
                const cartData: CartResponse = await cartApi.getCart();
                console.log('Cart data on load:', cartData);
                // Extract items from different possible response structures
                const cart = Array.isArray(cartData.items) ? cartData.items :
                            Array.isArray(cartData.data) ? cartData.data :
                            Array.isArray(cartData) ? cartData : [];
                console.log('Extracted cart items:', cart);
                setCartItems(cart);
            } catch (cartError) {
                console.log('Cart fetch error (might be empty):', cartError);
                // Cart might be empty or user not authenticated
                setCartItems([]);
            }
        } catch (err) {
            console.error('Load products error:', err);
            setError("Failed to load products. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await cartApi.clearCart().catch(() => {});
        } finally {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const addToCart = async (productId: number) => {
        // Check if user is logged in
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }

        try {
            const response = await cartApi.addItem(productId, 1);
            console.log('Add to cart response:', response);
            // Refresh cart
            const cartData: CartResponse = await cartApi.getCart();
            console.log('Cart data:', cartData);
            const cart = Array.isArray(cartData.items) ? cartData.items :
                        Array.isArray(cartData.data) ? cartData.data :
                        Array.isArray(cartData) ? cartData : [];
            setCartItems(cart);
        } catch (err) {
            alert("Failed to add to cart. Please try again.");
            console.error(err);
        }
    };

    const removeCartItem = async (cartItemId: number) => {
        try {
            await cartApi.removeItem(cartItemId);
            // Refresh cart
            const cartData: CartResponse = await cartApi.getCart();
            const cart = Array.isArray(cartData.items) ? cartData.items : 
                        Array.isArray(cartData.data) ? cartData.data : 
                        Array.isArray(cartData) ? cartData : [];
            setCartItems(cart);
        } catch (err) {
            alert("Failed to remove item. Please try again.");
            console.error(err);
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!checkoutData.delivery_address.trim()) {
            alert("Please enter a delivery address");
            return;
        }

        try {
            setIsProcessing(true);
            const response = await fetch("http://localhost:8000/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(checkoutData),
            });

            const data = await response.json();

            if (response.ok) {
                setOrderSuccess(true);
                setCartItems([]);
                setTimeout(() => {
                    setIsCheckoutOpen(false);
                    setIsCartOpen(false);
                    setOrderSuccess(false);
                    setCheckoutData({
                        delivery_method: "local_delivery",
                        delivery_address: "",
                        notes: ""
                    });
                }, 3000);
            } else {
                alert(data.message || "Checkout failed. Please try again.");
            }
        } catch (err) {
            alert("Checkout failed. Please make sure the backend is running.");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setIsLoadingOrders(true);
            const response = await fetch("http://localhost:8000/api/orders", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setOrders(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const fetchOrderDetails = async (orderId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setSelectedOrder(data.data || data);
            }
        } catch (err) {
            console.error("Failed to fetch order details:", err);
        }
    };

    const handleOpenOrders = () => {
        fetchOrders();
        setIsOrdersOpen(true);
        setSelectedOrder(null);
    };

    const handlePayNow = (orderId: number) => {
        // Redirect to payment page with order ID
        window.location.href = `/payment?order_id=${orderId}`;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= lastPage) {
            setCurrentPage(page);
            loadProducts(selectedType, searchQuery, page);
            // Scroll to top of product grid
            window.scrollTo({ top: 300, behavior: 'smooth' });
        }
    };

    // Calculate totals
    const totalItems = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + Math.floor(item.quantity), 0) : 0;
    const totalPrice = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => sum + (Math.floor(item.product.price) * Math.floor(item.quantity)), 0) : 0;

    return (
        <div className="font-[Inter,sans-serif] overflow-x-hidden bg-gray-50 text-gray-800">
            {/* BEGIN: MainHeader */}
            <header className="bg-white border-b sticky top-0 z-[100]">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2">
                        <img alt="Chicken Farm Logo" className="w-12 h-12" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1l8l9tZRJN5BG5N3vzGEA0fgj3i4WkpY52c9Zj6XQGlfuyMG6sGNA6QPFLNZklylR4yuzex8WLlopblCR2vdG9y4TFnaUGbRujzegAc_ljFApAfP8MExmeHuyQrhxEeUlm22aEklaryAMo9iVO2SACOW6R47ehdUDdJACx5c_-VujxFubAK8hoKu1XApUzupNkfwWbNXPG3AO2jFCg46yaqhC02qYhpyx6-rScIkb-T7_OwxrNihvhrM9QoPglKq3vM5qd3GBwlU"/>
                        <span className="text-[#199b1d] font-bold text-xl">Chicken Farm</span>
                    </div>
                    {/* Navigation links */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
                        <a className="hover:text-[#199b1d] transition-colors" href="#">Home</a>
                        <a className="text-[#199b1d] border-b-2 border-[#199b1d] pb-1" href="#">Shop</a>
                        <a className="hover:text-[#199b1d] transition-colors" href="#">About Us</a>
                        <a className="hover:text-[#199b1d] transition-colors" href="#">Our Products</a>
                        <a className="hover:text-[#199b1d] transition-colors" href="#">Contact Us</a>
                    </nav>
                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {isLoggedIn ? (
                            // Show Orders and Logout when logged in
                            <>
                                <button
                                    onClick={handleOpenOrders}
                                    className="border border-gray-300 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                                >
                                    <i className="fa-solid fa-box text-[#199b1d]"></i>
                                    Orders
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="border border-gray-300 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            // Show Login and Register when not logged in
                            <>
                                <button
                                    onClick={() => navigate("/login")}
                                    className="border border-gray-300 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-all"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate("/register")}
                                    className="bg-[#199b1d] text-white px-6 py-2 rounded-md font-medium hover:bg-[#147a17] transition-all"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>
            {/* END: MainHeader */}
            {/* BEGIN: TopBar Marquee */}
            <div className="bg-white border-b py-2">
                <div className="container mx-auto px-4 flex items-center overflow-hidden">
                    <div className="bg-[#199b1d] text-white px-3 py-1 text-xs font-bold uppercase shrink-0 mr-4">News</div>
                    <div className="overflow-hidden whitespace-nowrap flex-grow italic text-sm text-gray-600">
                        <div className="inline-block animate-[marquee_30s_linear_infinite]">
                            Live Cow, Beef and Cow-sharing options available. &nbsp;&nbsp;&nbsp; Fresh Honey available. &nbsp;&nbsp;&nbsp; Live Cow, Beef and Cow-sharing options available. &nbsp;&nbsp;&nbsp; Fresh Honey available.
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white py-2 text-center text-xs text-gray-500 border-b">
                For supplies (wholesale) and enquires call +234 904556540, +234 9051564437
            </div>
            {/* END: TopBar Marquee */}
            {/* BEGIN: SubHeader Search */}
            <div className="bg-white py-6">
                <div className="container mx-auto px-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img alt="Small Logo" className="w-10 h-10 grayscale opacity-70" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwXVRGnPmlTVOiuvLBCIsNn65CtqRkp94aoBw722p8p-nQQ8bZE2sls-822CVq45_YpvlrrCRfK-ShzZ9WoYxmCuj0PabinctXUxJWfva5voRSWQGdBR3D1Z7S8_wjfJNb8oIIapbsyhify-wdvUD6RqYaxNKjo8WAfwD9sJpeiZlgDsE7GAjwjHb-1T3rRvwwxUgqoQflrF1jHYQzi5LwHlxwKtFtvDauP239ZDXSCELdbj4Cb5NZc_qwH6YKlG6mTKixezGWx-Dw"/>
                        <span className="font-bold text-gray-700 tracking-tighter">CHICKEN FARM</span>
                    </div>
                    <div className="flex-grow max-w-2xl flex items-center border rounded-md overflow-hidden">
                        <select 
                            className="bg-gray-50 border-none text-sm px-4 py-2 outline-none focus:ring-0 min-w-[150px]"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            {productTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <input 
                            className="flex-grow border-none text-sm px-4 py-2 focus:ring-0" 
                            placeholder="Search by product name..." 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    // Search is already reactive, but this allows Enter key support
                                }
                            }}
                        />
                        <button 
                            className="px-4 text-gray-400 hover:text-[#199b1d] transition-colors"
                            onClick={() => {
                                // Trigger search (already reactive, but can add analytics here)
                            }}
                        >
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                    <div className="relative">
                        <button onClick={toggleCart} className="bg-white border p-2 rounded-md relative hover:bg-gray-50 transition-colors">
                            <i className="fa-solid fa-basket-shopping text-[#199b1d] text-xl"></i>
                            <span className="absolute -top-2 -right-2 bg-[#199b1d] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{totalItems}</span>
                        </button>
                        {/* Cart Dropdown */}
                        {isCartOpen && (
                            <div className="absolute right-full top-0 mr-2 z-50 w-[320px] bg-white rounded-lg shadow-2xl border border-gray-100 p-4" data-purpose="shopping-cart-summary">
                                <h3 className="text-[#199b1d] font-bold text-center border-b pb-3 mb-4">{totalItems} item(s) in your cart</h3>
                                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-4">
                                    {cartItems.length === 0 ? (
                                        <p className="text-center text-gray-500 text-sm py-4">Your cart is empty</p>
                                    ) : (
                                        cartItems.map((item) => (
                                            <div key={item.id} className="flex gap-3 relative">
                                                <button onClick={() => removeCartItem(item.id)} className="absolute top-0 right-0 text-[#199b1d] text-xs hover:text-red-500"><i className="fa-solid fa-trash-can"></i></button>
                                                <img alt={item.product.name} className="w-12 h-12 rounded object-cover" src={item.product.image || PLACEHOLDER_IMAGE} onError={handleImageError} />
                                                <div className="flex-grow">
                                                    <h4 className="text-sm font-semibold">{item.product.name}</h4>
                                                    <p className="text-[10px] text-gray-500">Quantity : {Math.floor(item.quantity)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-400">price :</p>
                                                    <p className="text-sm font-bold text-[#199b1d]">₦{Math.floor(item.product.price).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="border-t pt-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-4">Total: ₦{totalPrice.toLocaleString()}</p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setIsCheckoutOpen(true)}
                                            disabled={cartItems.length === 0}
                                            className="flex-1 bg-[#199b1d] text-white py-2 rounded text-xs font-bold hover:bg-[#147a17] disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            CHECKOUT
                                        </button>
                                        <button className="w-24 bg-gray-200 text-gray-700 py-2 rounded text-xs font-bold hover:bg-gray-300">
                                            CART
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Checkout Modal */}
                        {isCheckoutOpen && (
                            <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                                <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative">
                                    <button 
                                        onClick={() => setIsCheckoutOpen(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                    >
                                        <i className="fa-solid fa-xmark text-xl"></i>
                                    </button>
                                    
                                    {orderSuccess ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <i className="fa-solid fa-check text-green-500 text-3xl"></i>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Order Placed!</h3>
                                            <p className="text-gray-600">Your order has been placed successfully.</p>
                                            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-bold text-gray-800 mb-4">Checkout</h3>
                                            <form onSubmit={handleCheckout} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Method</label>
                                                    <select 
                                                        value={checkoutData.delivery_method}
                                                        onChange={(e) => setCheckoutData({...checkoutData, delivery_method: e.target.value})}
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#199b1d] focus:border-transparent outline-none"
                                                    >
                                                        <option value="local_delivery">Local Delivery</option>
                                                        <option value="pickup">Farm Pickup</option>
                                                        <option value="shipping">Shipping</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address</label>
                                                    <textarea 
                                                        value={checkoutData.delivery_address}
                                                        onChange={(e) => setCheckoutData({...checkoutData, delivery_address: e.target.value})}
                                                        placeholder="Enter your delivery address"
                                                        rows={3}
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#199b1d] focus:border-transparent outline-none resize-none"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Order Notes (Optional)</label>
                                                    <textarea 
                                                        value={checkoutData.notes}
                                                        onChange={(e) => setCheckoutData({...checkoutData, notes: e.target.value})}
                                                        placeholder="Special instructions for your order"
                                                        rows={2}
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#199b1d] focus:border-transparent outline-none resize-none"
                                                    />
                                                </div>
                                                <div className="border-t pt-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-gray-600">Total Amount:</span>
                                                        <span className="text-xl font-bold text-[#199b1d]">₦{totalPrice.toLocaleString()}</span>
                                                    </div>
                                                    <button 
                                                        type="submit"
                                                        disabled={isProcessing || cartItems.length === 0}
                                                        className="w-full bg-[#199b1d] text-white py-3 rounded-lg font-bold hover:bg-[#147a17] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        {isProcessing ? (
                                                            <>
                                                                <i className="fa-solid fa-circle-notch animate-spin"></i>
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            'Place Order'
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Orders Modal */}
                        {isOrdersOpen && (
                            <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                                <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-hidden flex flex-col">
                                    <button
                                        onClick={() => {
                                            setIsOrdersOpen(false);
                                            setSelectedOrder(null);
                                        }}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                                    >
                                        <i className="fa-solid fa-xmark text-2xl"></i>
                                    </button>

                                    <h3 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h3>

                                    {isLoadingOrders ? (
                                        <div className="flex justify-center items-center py-12">
                                            <i className="fa-solid fa-circle-notch animate-spin text-3xl text-[#199b1d]"></i>
                                            <span className="ml-3 text-gray-600">Loading orders...</span>
                                        </div>
                                    ) : selectedOrder ? (
                                        // Order Details View
                                        <div className="flex-1 overflow-y-auto">
                                            <button
                                                onClick={() => setSelectedOrder(null)}
                                                className="flex items-center gap-2 text-[#199b1d] hover:underline mb-4"
                                            >
                                                <i className="fa-solid fa-arrow-left"></i>
                                                Back to Orders
                                            </button>

                                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-lg">{getOrderDisplayName(selectedOrder)}</h4>
                                                        <p className="text-sm text-gray-500">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        selectedOrder.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' :
                                                        selectedOrder.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {selectedOrder.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <p><strong>Delivery:</strong> {selectedOrder.delivery_method.replace('_', ' ')}</p>
                                                    <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h5 className="font-bold text-gray-700 mb-3">Order Items</h5>
                                                <div className="space-y-3">
                                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                        selectedOrder.items.map((item) => (
                                                            <div key={item.id} className="flex gap-3 items-center border-b pb-3">
                                                                <img
                                                                    alt={item.product_name}
                                                                    className="w-16 h-16 rounded object-cover bg-gray-100"
                                                                    src={item.image || PLACEHOLDER_IMAGE}
                                                                    onError={handleImageError}
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-sm">{item.product_name}</p>
                                                                    <p className="text-xs text-gray-500">Qty: {Math.floor(item.quantity)}</p>
                                                                </div>
                                                                <p className="font-bold text-[#199b1d]">₦{Math.floor(item.price * item.quantity).toLocaleString()}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">No items in this order</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="border-t pt-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="font-bold text-gray-700">Total</span>
                                                    <span className="text-xl font-bold text-[#199b1d]">₦{Math.floor(selectedOrder.total).toLocaleString()}</span>
                                                </div>
                                                {selectedOrder.status === 'pending_payment' && (
                                                    <button
                                                        onClick={() => handlePayNow(selectedOrder.id)}
                                                        className="w-full bg-[#199b1d] text-white py-3 rounded-lg font-bold hover:bg-[#147a17] transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <i className="fa-solid fa-credit-card"></i>
                                                        Pay Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        // Orders List View
                                        <div className="flex-1 overflow-y-auto">
                                            {orders.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <i className="fa-solid fa-box-open text-6xl text-gray-300 mb-4"></i>
                                                    <p className="text-gray-500">No orders yet</p>
                                                    <p className="text-sm text-gray-400 mt-2">Start shopping to see your orders here</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {orders.map((order) => (
                                                        <div
                                                            key={order.id}
                                                            className="border rounded-lg p-4 hover:border-[#199b1d] hover:bg-gray-50 cursor-pointer transition-all"
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div onClick={() => fetchOrderDetails(order.id)} className="flex-1 cursor-pointer">
                                                                    <h4 className="font-bold text-gray-800">{getOrderDisplayName(order)}</h4>
                                                                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                                                    <p className="text-xs text-gray-400 mt-1">{order.items?.length || 0} item(s)</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                                        order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' :
                                                                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                        {order.status.replace('_', ' ')}
                                                                    </span>
                                                                    <p className="font-bold text-[#199b1d] mt-2">₦{Math.floor(order.total).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            {order.status === 'pending_payment' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlePayNow(order.id);
                                                                    }}
                                                                    className="w-full mt-2 bg-[#199b1d] text-white py-2 rounded-lg font-bold hover:bg-[#147a17] transition-colors flex items-center justify-center gap-2"
                                                                >
                                                                    <i className="fa-solid fa-credit-card"></i>
                                                                    Pay Now
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* END: SubHeader Search */}
            {/* BEGIN: Hero Title Section */}
            <div className="bg-[#199b1d] py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-white text-4xl font-bold text-center">All Products</h1>
                </div>
            </div>
            {/* END: Hero Title Section */}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <p className="text-gray-600 text-sm italic">
                        {error ? error : `Showing ${products.length} of ${totalProducts} product(s) (Page ${currentPage} of ${lastPage})`}
                    </p>
                </div>
                {/* BEGIN: Product Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-gray-500">Loading products...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white p-4 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col h-full">
                                <div className="bg-gray-50 rounded-lg overflow-hidden mb-4 flex-grow flex items-center justify-center min-h-[180px]">
                                    <img alt={product.name} className="max-w-full h-auto object-contain" src={product.image || PLACEHOLDER_IMAGE} onError={handleImageError} />
                                </div>
                                <div className="space-y-1 mb-4">
                                    <h3 className="font-bold text-base">{product.name}</h3>
                                    <p className="text-lg font-bold">₦{product.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">per {product.unit}</span></p>
                                </div>
                                <button 
                                    onClick={() => addToCart(product.id)}
                                    className="w-full bg-[#199b1d] text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#147a17] transition-colors"
                                >
                                    Add to Cart <i className="fa-solid fa-cart-plus"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {/* END: Product Grid */}
                {/* BEGIN: Pagination */}
                <div className="flex justify-center items-center gap-2 mt-16 mb-12">
                    {/* Previous Button */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-md border text-gray-400 hover:border-[#199b1d] hover:text-[#199b1d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fa-solid fa-angle-left"></i>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 flex items-center justify-center rounded-md font-medium transition-colors ${
                                currentPage === page
                                    ? 'bg-[#199b1d] text-white'
                                    : 'border text-gray-400 hover:border-[#199b1d] hover:text-[#199b1d]'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    {/* Next Button */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === lastPage}
                        className="w-10 h-10 flex items-center justify-center rounded-md border text-gray-400 hover:border-[#199b1d] hover:text-[#199b1d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fa-solid fa-angle-right"></i>
                    </button>
                </div>
                {/* END: Pagination */}
            </main>
            {/* BEGIN: Footer */}
            <footer className="bg-[#1e1e1e] text-white pt-16 pb-6">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-gray-800 pb-12">
                    {/* Company Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <img alt="Chicken Farm Logo" className="w-12 h-12 bg-white rounded-full p-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRnyLb5Wk8W-_Kc6quwNriGzwNIuzcwX5hrREQ607uSlRMKP1k9fE8flsh26XxDGvK4YQBY7-venLNAhJ0HRysynWyuqq4MIVi_zs9v5vT9IRNW3WXnj5zkQVbaAEafb0U6Nzwxp5b2NG7K29ZXffftvJQuPcqpMZiLbRqwKYbINcGFTfyOjai6S6UPrKamYrNtBxwtJhEn-DtlDdUimKE4Rx-D_LFvZdhxCrG6Yfq8so_hFWo1sabJOlRqfXyaTTzOADtNOHTDbo"/>
                            <span className="text-[#199b1d] font-bold text-xl">Chicken Farm</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            There are many variations of passages of lorem ipsum available, but the majority suffered.
                        </p>
                        <div className="flex gap-4">
                            <a className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#199b1d] transition-all" href="#"><i className="fa-brands fa-twitter text-sm"></i></a>
                            <a className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#199b1d] transition-all" href="#"><i className="fa-brands fa-facebook-f text-sm"></i></a>
                            <a className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#199b1d] transition-all" href="#"><i className="fa-brands fa-pinterest-p text-sm"></i></a>
                            <a className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#199b1d] transition-all" href="#"><i className="fa-brands fa-instagram text-sm"></i></a>
                        </div>
                    </div>
                    {/* Explore Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 border-b-2 border-[#199b1d] w-fit pb-1">Explore</h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><a className="hover:text-[#199b1d] flex items-center gap-2" href="#"><i className="fa-solid fa-leaf text-[8px]"></i> About</a></li>
                            <li><a className="hover:text-[#199b1d] flex items-center gap-2" href="#"><i className="fa-solid fa-leaf text-[8px]"></i> Services</a></li>
                            <li><a className="hover:text-[#199b1d] flex items-center gap-2" href="#"><i className="fa-solid fa-leaf text-[8px]"></i> Our Projects</a></li>
                            <li><a className="hover:text-[#199b1d] flex items-center gap-2" href="#"><i className="fa-solid fa-leaf text-[8px]"></i> Meet the Farmers</a></li>
                            <li><a className="hover:text-[#199b1d] flex items-center gap-2" href="#"><i className="fa-solid fa-leaf text-[8px]"></i> Contact</a></li>
                        </ul>
                    </div>
                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 border-b-2 border-[#199b1d] w-fit pb-1">Contact</h3>
                        <div className="space-y-4 text-gray-400 text-sm">
                            <p className="flex items-center gap-3"><i className="fa-solid fa-phone text-[#199b1d]"></i> +234 888 0000</p>
                            <p className="flex items-center gap-3"><i className="fa-solid fa-envelope text-[#199b1d]"></i> Chickenfarm@company.com</p>
                            <p className="flex items-start gap-3"><i className="fa-solid fa-location-dot text-[#199b1d] mt-1"></i> 80 yola street street line<br/>Kano, Nigeria</p>
                            <div className="mt-8">
                                <div className="flex rounded-md overflow-hidden">
                                    <input className="bg-white text-gray-800 text-xs px-4 py-3 flex-grow outline-none border-none" placeholder="Your Email Address" type="email"/>
                                    <button className="bg-[#199b1d] px-4 flex items-center justify-center hover:bg-[#199b1d]-dark transition-all">
                                        <i className="fa-solid fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Copyright */}
                <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between text-xs text-gray-500">
                    <p>© All Copyright 2026 by <span className="text-[#199b1d]">MASQ IT</span></p>
                    <div className="flex gap-4 mt-2 md:mt-0">
                        <a className="hover:text-white" href="#">Terms of Use</a>
                        <span>|</span>
                        <a className="hover:text-white" href="#">Privacy Policy</a>
                    </div>
                </div>
            </footer>
            {/* END: Footer */}
        </div>
    )
}

export default ProductsIndex
