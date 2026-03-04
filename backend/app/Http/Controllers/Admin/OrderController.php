<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\HistoryService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with('items.product', 'payments', 'user')
            ->paginate($request->get('per_page', 15));

        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load('items.product', 'payments', 'user');

        return response()->json($order);
    }

    public function updateStatus(
        Request $request,
        Order $order,
        NotificationService $notifications,
        HistoryService $history
    ): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in([
                Order::STATUS_PENDING_PAYMENT,
                Order::STATUS_PAID,
                Order::STATUS_FULFILLMENT,
                Order::STATUS_DELIVERED,
                Order::STATUS_CANCELLED,
            ])],
        ]);

        $previousStatus = $order->status;
        $order->status = $validated['status'];
        $order->save();

        $history->orderStatus($order, auth()->id(), $previousStatus, $order->status, 'admin_update');

        $notifications->orderEvent($order, 'order_status_updated', [
            'order_id' => $order->id,
            'status' => $order->status,
        ]);

        return response()->json([
            'message' => 'Order status updated',
            'order' => $order,
        ]);
    }

    public function history(Order $order): JsonResponse
    {
        $history = $order->statusHistories()
            ->with('user')
            ->latest()
            ->paginate(25);

        return response()->json($history);
    }
}
