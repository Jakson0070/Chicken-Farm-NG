<?php

namespace Database\Seeders;

use App\Models\InventoryBatch;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $inventory = app(InventoryService::class);

        $eggs = Product::where('name', 'Fresh Eggs Tray')->first();
        if ($eggs) {
            $batch = InventoryBatch::firstOrCreate([
                'product_id' => $eggs->id,
                'batch_code' => 'EGG-2026-03-A',
            ], [
                'harvested_at' => now()->subDays(2),
                'expires_at' => now()->addDays(20),
                'quantity_on_hand' => 0,
            ]);

            $inventory->stockIn($eggs, 120, $batch, null, 'harvest', 'Initial egg stock');
        }

        $broiler = Product::where('name', 'Broiler Chicken')->first();
        if ($broiler) {
            $batch = InventoryBatch::firstOrCreate([
                'product_id' => $broiler->id,
                'batch_code' => 'BRL-2026-02',
            ], [
                'harvested_at' => now()->subDays(7),
                'expires_at' => now()->addDays(5),
                'quantity_on_hand' => 0,
            ]);

            $inventory->stockIn($broiler, 40, $batch, null, 'purchase', 'Initial broiler stock');
        }

        $feed = Product::where('name', 'Starter Feed Bag')->first();
        if ($feed) {
            $batch = InventoryBatch::firstOrCreate([
                'product_id' => $feed->id,
                'batch_code' => 'FD-2026-03',
            ], [
                'harvested_at' => now()->subDays(1),
                'expires_at' => now()->addMonths(6),
                'quantity_on_hand' => 0,
            ]);

            $inventory->stockIn($feed, 75, $batch, null, 'purchase', 'Initial feed stock');
        }
    }
}
