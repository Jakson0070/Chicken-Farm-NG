const API_BASE_URL = import.meta.env.VITE_APP_URL as string;
export { API_BASE_URL };

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem("token");
};

// Generic fetch wrapper with auth headers
async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const config: RequestInit = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` }),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Handle 401 unauthorized
        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        
        return response;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

// Products API
export const productsApi = {
    // Get all products (with optional filters)
    getAll: async (params?: { type?: string; search?: string; page?: string }) => {
        const queryString = params ? new URLSearchParams(params).toString() : "";
        const endpoint = queryString ? `/products?${queryString}` : "/products";
        const response = await fetchApi(endpoint);
        if (!response.ok) throw new Error("Failed to fetch products");
        return response.json();
    },

    // Get single product
    getById: async (id: number) => {
        const response = await fetchApi(`/products/${id}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        return response.json();
    },
};

// Cart API
export const cartApi = {
    // Get cart items
    getCart: async () => {
        const response = await fetchApi("/cart");
        if (!response.ok) throw new Error("Failed to fetch cart");
        return response.json();
    },
    
    // Add item to cart
    addItem: async (productId: number, quantity: number) => {
        const response = await fetchApi("/cart/items", {
            method: "POST",
            body: JSON.stringify({ product_id: productId, quantity }),
        });
        if (!response.ok) {
            let message = "Failed to add to cart";
            try {
                const data = await response.json();
                if (data?.message) message = data.message;
            } catch {
                try {
                    const text = await response.text();
                    if (text) message = text;
                } catch {
                    // ignore
                }
            }
            throw new Error(message);
        }
        return response.json();
    },
    
    // Remove item from cart
    removeItem: async (itemId: number) => {
        const response = await fetchApi(`/cart/items/${itemId}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to remove from cart");
        return response.json();
    },
    
    // Update cart item quantity
    updateQuantity: async (itemId: number, quantity: number) => {
        const response = await fetchApi(`/cart/items/${itemId}`, {
            method: "PUT",
            body: JSON.stringify({ quantity }),
        });
        if (!response.ok) throw new Error("Failed to update cart");
        return response.json();
    },
    
    // Clear cart
    clearCart: async () => {
        const response = await fetchApi("/cart/clear", {
            method: "POST",
        });
        if (!response.ok) throw new Error("Failed to clear cart");
        return response.json();
    },
};

// Auth API
export const authApi = {
    logout: async () => {
        const response = await fetchApi("/auth/logout", {
            method: "POST",
        });
        localStorage.removeItem("token");
        return response.json();
    },
};
