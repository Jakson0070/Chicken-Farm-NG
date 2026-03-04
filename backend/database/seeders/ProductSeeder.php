<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::updateOrCreate(
            ['name' => 'Fresh Eggs Tray'],
            [
                'description' => 'Farm fresh eggs packed by tray.',
                'type' => 'produce',
                'status' => Product::STATUS_PUBLISHED,
                'unit' => 'dozen',
                'pack_size' => 1,
                'is_preorder' => false,
                'is_seasonal' => false,
                'requires_cold_chain' => false,
                'price' => 650,
            ]
        );

        Product::updateOrCreate(
            ['name' => 'Broiler Chicken'],
            [
                'description' => 'Live broiler chicken per piece.',
                'type' => 'livestock',
                'status' => Product::STATUS_PUBLISHED,
                'unit' => 'piece',
                'pack_size' => 1,
                'is_preorder' => false,
                'is_seasonal' => false,
                'requires_cold_chain' => true,
                'price' => 3500,
            ]
        );

        Product::updateOrCreate(
            ['name' => 'Starter Feed Bag'],
            [
                'description' => '25kg starter feed bag.',
                'type' => 'feed',
                'status' => Product::STATUS_PUBLISHED,
                'unit' => 'bag',
                'pack_size' => 25,
                'is_preorder' => false,
                'is_seasonal' => false,
                'requires_cold_chain' => false,
                'price' => 14500,
            ]
        );

        Product::updateOrCreate(
            ['name' => 'Hybrid Maize Seedlings'],
            [
                'description' => 'Pre-order hybrid maize seedlings.',
                'type' => 'seedlings',
                'status' => Product::STATUS_DRAFT,
                'unit' => 'crate',
                'pack_size' => 50,
                'is_preorder' => true,
                'is_seasonal' => true,
                'requires_cold_chain' => false,
                'price' => 12000,
            ]
        );
    }
}
