<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\Cottage;
use App\Models\EntranceFee;

class BeachResortSeeder extends Seeder
{
    public function run(): void
    {
        // Rooms
        Room::create([
            'name' => 'Big Room (Airconditioned)',
            'size' => 'big',
            'description' => 'Air-conditioned big room with free small cottage and entrance for 6 pax',
            'max_pax' => 6,
            'day_tour_price' => 4500.00,
            'overnight_price' => null,
            'quantity' => 2,
            'has_ac' => true,
            'free_entrance_count' => 6,
            'free_cottage_size' => 'small',
            'excess_pax_fee' => 150.00,
            'is_active' => true,
        ]);

        Room::create([
            'name' => 'Small Room (Airconditioned)',
            'size' => 'small',
            'description' => 'Air-conditioned small room with free small cottage and entrance for 4 pax',
            'max_pax' => 4,
            'day_tour_price' => 3500.00,
            'overnight_price' => null,
            'quantity' => 1,
            'has_ac' => true,
            'free_entrance_count' => 4,
            'free_cottage_size' => 'small',
            'excess_pax_fee' => 150.00,
            'is_active' => true,
        ]);

        // Cottages
        Cottage::create([
            'name' => 'Big Cottage',
            'size' => 'big',
            'description' => 'Big cottage for day tour (flexible capacity) or overnight (max 15 pax)',
            'max_pax' => 15,
            'day_tour_price' => 800.00,
            'overnight_price' => 1000.00,
            'quantity' => 3,
            'is_active' => true,
        ]);

        Cottage::create([
            'name' => 'Small Cottage',
            'size' => 'small',
            'description' => 'Small cottage for day tour (8-10 pax) or overnight (max 8 pax)',
            'max_pax' => 8,
            'day_tour_price' => 400.00,
            'overnight_price' => 600.00,
            'quantity' => 5,
            'is_active' => true,
        ]);

        // Entrance Fees
        EntranceFee::create([
            'name' => 'Adult (Day Tour)',
            'rental_type' => 'day_tour',
            'price' => 100.00,
            'min_age' => 6,
            'max_age' => null,
            'description' => 'Regular entrance fee for day tour guests 6 years old and above',
            'is_active' => true,
        ]);

        EntranceFee::create([
            'name' => 'Child (Day Tour)',
            'rental_type' => 'day_tour',
            'price' => 50.00,
            'min_age' => 0,
            'max_age' => 5,
            'description' => 'Discounted entrance fee for children 5 years old and below',
            'is_active' => true,
        ]);

        EntranceFee::create([
            'name' => 'Per Head (Overnight)',
            'rental_type' => 'overnight',
            'price' => 150.00,
            'min_age' => null,
            'max_age' => null,
            'description' => 'Entrance fee for overnight guests (all ages)',
            'is_active' => true,
        ]);
    }
}
