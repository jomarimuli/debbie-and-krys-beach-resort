<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccommodationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Tour Types
        $dayTour = DB::table('tour_types')->insertGetId([
            'name' => 'Day Tour',
            'slug' => 'day_tour',
            'description' => 'Day tour package',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $overnight = DB::table('tour_types')->insertGetId([
            'name' => 'Overnight',
            'slug' => 'overnight',
            'description' => 'Overnight stay package',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create Accommodations
        $bigRoom = DB::table('accommodations')->insertGetId([
            'name' => 'Big Room',
            'type' => 'room',
            'is_airconditioned' => true,
            'base_capacity' => 6,
            'description' => 'Air-conditioned big room with capacity for 6 guests',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $smallRoom = DB::table('accommodations')->insertGetId([
            'name' => 'Small Room',
            'type' => 'room',
            'is_airconditioned' => true,
            'base_capacity' => 4,
            'description' => 'Air-conditioned small room with capacity for 4 guests',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $bigCottage = DB::table('accommodations')->insertGetId([
            'name' => 'Big Cottage',
            'type' => 'cottage',
            'is_airconditioned' => false,
            'base_capacity' => 15,
            'description' => 'Large cottage with flexible capacity (typically 10-15 guests, max 15)',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $smallCottage = DB::table('accommodations')->insertGetId([
            'name' => 'Small Cottage',
            'type' => 'cottage',
            'is_airconditioned' => false,
            'base_capacity' => 10,
            'description' => 'Small cottage with capacity for 8-10 guests (max 8 overnight, max 10 day tour)',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create Accommodation Rates
        // Big Room (Day Tour)
        DB::table('accommodation_rates')->insert([
            'accommodation_id' => $bigRoom,
            'tour_type_id' => $dayTour,
            'base_rate' => 4500.00,
            'included_guests' => 6,
            'additional_guest_rate' => 150.00,
            'free_cottage_id' => $smallCottage, // Free 1 small cottage
            'free_entrance_count' => 6, // Free entrance for 6 pax
            'notes' => 'Includes free 1 small cottage and free entrance for 6 pax. Additional guests charged ₱150 per head.',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Small Room (Day Tour)
        DB::table('accommodation_rates')->insert([
            'accommodation_id' => $smallRoom,
            'tour_type_id' => $dayTour,
            'base_rate' => 3500.00,
            'included_guests' => 4,
            'additional_guest_rate' => 150.00,
            'free_cottage_id' => $smallCottage, // Free 1 small cottage
            'free_entrance_count' => 4, // Free entrance for 4 pax
            'notes' => 'Includes free 1 small cottage and free entrance for 4 pax. Additional guests charged ₱150 per head.',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Big Cottage (Day Tour - No Room)
        DB::table('accommodation_rates')->insert([
            'accommodation_id' => $bigCottage,
            'tour_type_id' => $dayTour,
            'base_rate' => 800.00,
            'included_guests' => 0, // Entrance fee separate
            'additional_guest_rate' => null,
            'free_cottage_id' => null,
            'free_entrance_count' => 0,
            'notes' => 'Flexible capacity (typically 10-15 pax). Entrance fees: ₱100 per head (regular), ₱50 per head (5 years old & below).',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Small Cottage (Day Tour - No Room)
        DB::table('accommodation_rates')->insert([
            'accommodation_id' => $smallCottage,
            'tour_type_id' => $dayTour,
            'base_rate' => 400.00,
            'included_guests' => 0, // Entrance fee separate
            'additional_guest_rate' => null,
            'free_cottage_id' => null,
            'free_entrance_count' => 0,
            'notes' => 'Capacity: 8-10 pax. Entrance fees: ₱100 per head (regular), ₱50 per head (5 years old & below).',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Big Cottage (Overnight)
        DB::table('accommodation_rates')->insert([
            'accommodation_id' => $bigCottage,
            'tour_type_id' => $overnight,
            'base_rate' => 1000.00,
            'included_guests' => 0, // Entrance fee separate
            'additional_guest_rate' => null,
            'free_cottage_id' => null,
            'free_entrance_count' => 0,
            'notes' => 'Max capacity: 15 pax. Entrance fee: ₱150 per head.',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Small Cottage (Overnight)
        DB::table('accommodation_rates')->insert([
            'accommodation_id' => $smallCottage,
            'tour_type_id' => $overnight,
            'base_rate' => 600.00,
            'included_guests' => 0, // Entrance fee separate
            'additional_guest_rate' => null,
            'free_cottage_id' => null,
            'free_entrance_count' => 0,
            'notes' => 'Max capacity: 8 pax. Entrance fee: ₱150 per head.',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create Entrance Fees
        // Day Tour Entrance Fees
        DB::table('entrance_fees')->insert([
            'tour_type_id' => $dayTour,
            'age_category' => 'regular',
            'min_age' => 6,
            'max_age' => null,
            'fee' => 100.00,
            'description' => 'Regular entrance fee for guests 6 years old and above',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('entrance_fees')->insert([
            'tour_type_id' => $dayTour,
            'age_category' => 'child',
            'min_age' => 0,
            'max_age' => 5,
            'fee' => 50.00,
            'description' => '5 years old & below',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Overnight Entrance Fees
        DB::table('entrance_fees')->insert([
            'tour_type_id' => $overnight,
            'age_category' => 'regular',
            'min_age' => 0,
            'max_age' => null,
            'fee' => 150.00,
            'description' => 'Overnight entrance fee per head',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
