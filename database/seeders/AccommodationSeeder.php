<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Accommodation;
use App\Models\AccommodationRate;

class AccommodationSeeder extends Seeder
{
    public function run(): void
    {
        // Big Room (Airconditioned)
        $bigRoom = Accommodation::create([
            'name' => 'Big Room',
            'type' => 'room',
            'description' => 'Spacious room',
            'is_air_conditioned' => true,
            'min_capacity' => 6,
            'max_capacity' => null,
            'quantity_available' => 5,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $bigRoom->id,
            'booking_type' => 'day_tour',
            'rate' => 4500,
            'base_capacity' => 6,
            'additional_pax_rate' => 150,
            'entrance_fee' => null,
            'child_entrance_fee' => null,
            'child_max_age' => null,
            'includes_free_cottage' => true,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        // Small Room (Airconditioned)
        $smallRoom = Accommodation::create([
            'name' => 'Small Room',
            'type' => 'room',
            'description' => 'Cozy room',
            'is_air_conditioned' => true,
            'min_capacity' => 4,
            'max_capacity' => null,
            'quantity_available' => 8,
            'is_active' => true,
            'sort_order' => 2,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $smallRoom->id,
            'booking_type' => 'day_tour',
            'rate' => 3500,
            'base_capacity' => 4,
            'additional_pax_rate' => 150,
            'entrance_fee' => null,
            'child_entrance_fee' => null,
            'child_max_age' => null,
            'includes_free_cottage' => true,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        // Big Cottage
    $bigCottage = Accommodation::create([
        'name' => 'Big Cottage',
        'type' => 'cottage',
        'description' => 'Large cottage for groups',
        'is_air_conditioned' => false,
        'min_capacity' => 10,
        'max_capacity' => 15,
        'quantity_available' => 10,
        'is_active' => true,
        'sort_order' => 3,
    ]);

        // Big Cottage - Day Tour
        AccommodationRate::create([
            'accommodation_id' => $bigCottage->id,
            'booking_type' => 'day_tour',
            'rate' => 800,
            'base_capacity' => null,
            'additional_pax_rate' => null,
            'entrance_fee' => 100,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        // Big Cottage - Overnight
        AccommodationRate::create([
            'accommodation_id' => $bigCottage->id,
            'booking_type' => 'overnight',
            'rate' => 1000,
            'base_capacity' => null,
            'additional_pax_rate' => null,
            'entrance_fee' => 150,
            'child_entrance_fee' => null,
            'child_max_age' => null,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        // Small Cottage
        $smallCottage = Accommodation::create([
            'name' => 'Small Cottage',
            'type' => 'cottage',
            'description' => 'Compact cottage for small groups',
            'is_air_conditioned' => false,
            'min_capacity' => 8,
            'max_capacity' => 10,
            'quantity_available' => 15,
            'is_active' => true,
            'sort_order' => 4,
        ]);

        // Small Cottage - Day Tour
        AccommodationRate::create([
            'accommodation_id' => $smallCottage->id,
            'booking_type' => 'day_tour',
            'rate' => 400,
            'base_capacity' => null,
            'additional_pax_rate' => null,
            'entrance_fee' => 100,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        // Small Cottage - Overnight
        AccommodationRate::create([
            'accommodation_id' => $smallCottage->id,
            'booking_type' => 'overnight',
            'rate' => 600,
            'base_capacity' => null,
            'additional_pax_rate' => null,
            'entrance_fee' => 150,
            'child_entrance_fee' => null,
            'child_max_age' => null,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);
    }
}
