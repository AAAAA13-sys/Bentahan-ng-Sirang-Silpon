<?php

namespace Database\Seeders;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local', 'testing')) {
            return;
        }
        $base = ['password' => 'SiliconDemo2026', 'location' => 'Pasig City'];
        User::firstOrCreate(['email' => 'buyer@silicon.test'], $base + ['name' => 'Alex Reyes', 'role' => 'buyer']);
        User::firstOrCreate(['email' => 'admin@silicon.test'], $base + ['name' => 'Silicon Admin', 'role' => 'admin']);
        $seller = User::firstOrCreate(['email' => 'seller@silicon.test'], $base + ['name' => 'CircuitLab Manila', 'role' => 'seller', 'seller_verified' => true]);
        $other = User::firstOrCreate(['email' => 'parts@silicon.test'], $base + ['name' => 'Second Life Electronics', 'role' => 'seller', 'location' => 'Quezon City', 'seller_verified' => true]);
        $parts = [
            ['iPhone 12 Pro donor board', 'Apple', 'iPhone 12 Pro / A2407', 'Donor boards', 'For harvesting', 145000, 8, 1, 'board'],
            ['Galaxy S21 mainboard', 'Samsung', 'Galaxy S21 / SM-G991B', 'Donor boards', 'Tested working', 220000, 5, 1, 'board'],
            ['iPhone 11 OLED display', 'Apple', 'iPhone 11 Pro / A2215', 'Displays', 'Tested working', 185000, 12, 1, 'display'],
            ['PM8150 power management IC', 'Xiaomi', 'Mi 9 / Snapdragon 855', 'ICs & chips', 'Tested working', 35000, 40, 1, 'chip'],
            ['iPhone XR donor board lot', 'Apple', 'iPhone XR / A2105', 'Bulk lots', 'For harvesting', 65000, 50, 10, 'board'],
            ['Reno 6 rear camera module', 'OPPO', 'Reno 6 / CPH2235', 'Cameras', 'Tested working', 58000, 7, 1, 'camera'],
            ['Galaxy A52 donor board', 'Samsung', 'Galaxy A52 / SM-A525F', 'Donor boards', 'For repair', 95000, 6, 1, 'board'],
            ['V21 charging IC', 'Vivo', 'V21 / V2050', 'ICs & chips', 'Tested working', 28000, 25, 1, 'chip'],
        ];
        foreach ($parts as $i => $p) {
            Listing::firstOrCreate(['title' => $p[0]], [
                'seller_id' => $i % 2 ? $other->id : $seller->id, 'brand' => $p[1], 'model' => $p[2],
                'category' => $p[3], 'condition' => $p[4], 'price_centavos' => $p[5], 'quantity' => $p[6],
                'minimum_quantity' => $p[7], 'art' => $p[8],
                'description' => 'Sample inventory for the Silicon Trading prototype. Reclaimed '.$p[0].'. Match the exact board revision and chassis model before ordering. Sold in the condition stated; accessories are not included.',
                'diagnostics' => 'Demo diagnostic record: visual inspection recorded by the seller. Confirm pad integrity, impedance readings and component compatibility before use. Product artwork is illustrative, not a photograph.',
                'created_at' => now()->subMinutes($i),
            ]);
        }
    }
}
