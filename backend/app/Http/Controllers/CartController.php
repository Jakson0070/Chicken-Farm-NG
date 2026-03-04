<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user()->id);
        $cart->load('items.product');

        return response()->json($cart);
    }

    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if ($product->status !== Product::STATUS_PUBLISHED) {
            return response()->json([
                'message' => 'Product is not available for purchase.',
            ], 422);
        }

        $cart = $this->getOrCreateCart($request->user()->id);

        $item = $cart->items()->where('product_id', $product->id)->first();
        $quantity = (float) $validated['quantity'];

        if ($item) {
            $item->quantity = (float) $item->quantity + $quantity;
            $item->total_price = (float) $item->quantity * (float) $item->unit_price;
            $item->save();
        } else {
            $item = OrderItem::create([
                'order_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => (float) $product->price,
                'subtotal' => (float) $product->price * $quantity,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'shipping_amount' => 0,
                'total_price' => (float) $product->price * $quantity,
            ]);
        }

        $cart->recalcTotals();
        $cart->load('items.product');

        return response()->json([
            'message' => 'Item added to cart',
            'cart' => $cart,
        ]);
    }

    public function updateItem(Request $request, OrderItem $item): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'numeric', 'min:0.01'],
        ]);

        $cart = $this->getOrCreateCart($request->user()->id);

        if ($item->order_id !== $cart->id) {
            return response()->json([
                'message' => 'Item not found in your cart.',
            ], 404);
        }

        $item->quantity = (float) $validated['quantity'];
        $item->subtotal = (float) $item->quantity * (float) $item->unit_price;
        $item->total_price = $item->subtotal;
        $item->save();

        $cart->recalcTotals();
        $cart->load('items.product');

        return response()->json([
            'message' => 'Cart item updated',
            'cart' => $cart,
        ]);
    }

    public function removeItem(Request $request, OrderItem $item): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user()->id);

        if ($item->order_id !== $cart->id) {
            return response()->json([
                'message' => 'Item not found in your cart.',
            ], 404);
        }

        $item->delete();
        $cart->recalcTotals();
        $cart->load('items.product');

        return response()->json([
            'message' => 'Item removed from cart',
            'cart' => $cart,
        ]);
    }

    private function getOrCreateCart(int $userId): Order
    {
        return Order::firstOrCreate([
            'user_id' => $userId,
            'status' => Order::STATUS_CART,
        ], [
            'subtotal' => 0,
            'total' => 0,
        ]);
    }
}
