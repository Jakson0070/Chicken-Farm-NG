<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\HistoryService;
use App\Services\InventoryService;
use App\Services\NotificationService;
use App\Services\PaymentGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function checkout(
        Request $request,
        InventoryService $inventory,
        NotificationService $notifications,
        PaymentGatewayService $gateway,
        HistoryService $history
    ): JsonResponse
    {
        $validated = $request->validate([
            'delivery_method' => ['required', 'string', 'max:100'],
            'delivery_address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $cart = Order::where('user_id', $request->user()->id)
            ->where('status', Order::STATUS_CART)
            ->with('items.product')
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Cart is empty.',
            ], 422);
        }

        try {
            DB::transaction(function () use ($cart, $validated, $inventory, $gateway, $history) {
                foreach ($cart->items as $item) {
                    $inventory->reserve($item->product, (float) $item->quantity, $item->batch, auth()->id());
                }

                $previousStatus = $cart->status;
                $cart->status = Order::STATUS_PENDING_PAYMENT;
                $cart->delivery_method = $validated['delivery_method'];
                $cart->delivery_address = $validated['delivery_address'] ?? null;
                $cart->notes = $validated['notes'] ?? null;
                $cart->recalcTotals();
                $cart->save();

                $intent = $gateway->createPaymentIntent($cart, (float) $cart->total);

                Payment::create([
                    'order_id' => $cart->id,
                    'status' => Payment::STATUS_PENDING,
                    'amount' => $cart->total,
                    'provider' => $intent['provider'] ?? null,
                    'reference' => $intent['reference'] ?? null,
                    'payload' => $intent['payload'] ?? null,
                ]);

                $history->orderStatus(
                    $cart,
                    auth()->id(),
                    $previousStatus,
                    $cart->status,
                    'checkout'
                );
            });
        } catch (\RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $cart->load('items.product', 'payments');
        $notifications->orderEvent($cart, 'checkout_initiated', [
            'order_id' => $cart->id,
            'total' => $cart->total,
        ]);

        return response()->json([
            'message' => 'Checkout initiated',
            'order' => $cart,
            'payment_url' => $cart->payments->last()?->payload['payment_url'] ?? null,
        ]);
    }
}
