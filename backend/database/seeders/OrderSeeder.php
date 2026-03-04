<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Services\InventoryService;
use App\Services\NotificationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userRole = Role::where('name', 'user')->first();
        $customer = User::firstOrCreate(
            ['email' => 'customer@chickenfarm.ng'],
            [
                'name' => 'Sample Customer',
                'password' => Hash::make('password123'),
                'role_id' => $userRole?->id,
            ]
        );

        $product = Product::where('status', Product::STATUS_PUBLISHED)->first();
        if (!$product) {
            return;
        }

        $order = Order::create([
            'user_id' => $customer->id,
            'status' => Order::STATUS_PENDING_PAYMENT,
            'subtotal' => 0,
            'total' => 0,
            'delivery_method' => 'local_delivery',
            'delivery_address' => 'Farm Road, Kaduna',
        ]);

        $quantity = 2;
        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price' => (float) $product->price,
            'total_price' => (float) $product->price * $quantity,
        ]);

        $order->recalcTotals();

        Payment::create([
            'order_id' => $order->id,
            'status' => Payment::STATUS_PENDING,
            'amount' => $order->total,
            'provider' => 'manual',
            'reference' => 'SEED-ORDER-001',
        ]);

        $notifications = app(NotificationService::class);
        $notifications->orderEvent($order, 'order_seeded', [
            'order_id' => $order->id,
            'amount' => $order->total,
        ]);
    }
}
