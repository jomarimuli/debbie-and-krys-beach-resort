# Accommodation & Pricing Schema Documentation

## Overview

This document describes the database schema for managing beach resort accommodations, tour types, pricing rates, and entrance fees.

## Database Tables

### 1. `accommodations`
Stores information about available accommodations (rooms and cottages).

**Columns:**
- `id` - Primary key
- `name` - Name of the accommodation (e.g., "Big Room", "Small Cottage")
- `type` - Enum: `room` or `cottage`
- `is_airconditioned` - Boolean: whether the accommodation is air-conditioned
- `base_capacity` - Maximum capacity of guests
- `description` - Additional details about the accommodation
- `status` - Enum: `active` or `inactive`
- `created_at`, `updated_at` - Timestamps

**Seeded Data:**
- Big Room (AC) - Capacity: 6 pax
- Small Room (AC) - Capacity: 4 pax
- Big Cottage - Capacity: 15 pax
- Small Cottage - Capacity: 10 pax

---

### 2. `tour_types`
Stores the types of tours available.

**Columns:**
- `id` - Primary key
- `name` - Display name (e.g., "Day Tour", "Overnight")
- `slug` - URL-friendly identifier (e.g., "day_tour", "overnight")
- `description` - Description of the tour type
- `status` - Enum: `active` or `inactive`
- `created_at`, `updated_at` - Timestamps

**Seeded Data:**
- Day Tour
- Overnight

---

### 3. `accommodation_rates`
Stores pricing information for accommodation + tour type combinations.

**Columns:**
- `id` - Primary key
- `accommodation_id` - Foreign key to `accommodations`
- `tour_type_id` - Foreign key to `tour_types`
- `base_rate` - Base price in PHP (decimal)
- `included_guests` - Number of guests included in base rate
- `additional_guest_rate` - Price per additional guest beyond included count
- `free_cottage_id` - Foreign key to `accommodations` (nullable) - for free cottage inclusions
- `free_entrance_count` - Number of free entrance passes included
- `notes` - Additional notes or conditions
- `status` - Enum: `active` or `inactive`
- `created_at`, `updated_at` - Timestamps

**Unique Constraint:** `(accommodation_id, tour_type_id)` - Each accommodation can only have one rate per tour type.

**Seeded Rates:**

| Accommodation | Tour Type | Base Rate | Included Guests | Additional Rate | Free Cottage | Free Entrance |
|--------------|-----------|-----------|-----------------|-----------------|--------------|---------------|
| Big Room | Day Tour | ₱4,500 | 6 | ₱150/head | Small Cottage | 6 |
| Small Room | Day Tour | ₱3,500 | 4 | ₱150/head | Small Cottage | 4 |
| Big Cottage | Day Tour | ₱800 | 0 | - | - | 0 |
| Small Cottage | Day Tour | ₱400 | 0 | - | - | 0 |
| Big Cottage | Overnight | ₱1,000 | 0 | - | - | 0 |
| Small Cottage | Overnight | ₱600 | 0 | - | - | 0 |

---

### 4. `entrance_fees`
Stores entrance fee rates by tour type and age category.

**Columns:**
- `id` - Primary key
- `tour_type_id` - Foreign key to `tour_types`
- `age_category` - Category name (e.g., "regular", "child", "senior")
- `min_age` - Minimum age for this category (nullable)
- `max_age` - Maximum age for this category (nullable)
- `fee` - Entrance fee in PHP (decimal)
- `description` - Description of the age category
- `status` - Enum: `active` or `inactive`
- `created_at`, `updated_at` - Timestamps

**Seeded Fees:**

| Tour Type | Age Category | Min Age | Max Age | Fee | Description |
|-----------|-------------|---------|---------|-----|-------------|
| Day Tour | regular | 6 | null | ₱100 | 6 years old and above |
| Day Tour | child | 0 | 5 | ₱50 | 5 years old & below |
| Overnight | regular | 0 | null | ₱150 | All ages |

---

## Eloquent Models

### Accommodation Model
**Location:** `app/Models/Accommodation.php`

**Key Methods:**
- `rates()` - Get all rates for this accommodation
- `activeRates()` - Get only active rates
- `isRoom()` - Check if accommodation is a room
- `isCottage()` - Check if accommodation is a cottage

**Scopes:**
- `active()` - Filter active accommodations only
- `rooms()` - Filter rooms only
- `cottages()` - Filter cottages only

---

### TourType Model
**Location:** `app/Models/TourType.php`

**Key Methods:**
- `accommodationRates()` - Get all rates for this tour type
- `entranceFees()` - Get all entrance fees
- `activeEntranceFees()` - Get only active entrance fees
- `getEntranceFeeByAge(int $age)` - Get applicable entrance fee for a given age

**Scopes:**
- `active()` - Filter active tour types only

---

### AccommodationRate Model
**Location:** `app/Models/AccommodationRate.php`

**Key Methods:**
- `accommodation()` - Get the accommodation
- `tourType()` - Get the tour type
- `freeCottage()` - Get the free cottage (if included)
- `calculateTotalRate(int $guests)` - Calculate total rate for given number of guests
- `hasFreeCottage()` - Check if rate includes free cottage
- `hasFreeEntrance()` - Check if rate includes free entrance

**Scopes:**
- `active()` - Filter active rates only

---

### EntranceFee Model
**Location:** `app/Models/EntranceFee.php`

**Key Methods:**
- `tourType()` - Get the tour type
- `appliesForAge(int $age)` - Check if fee applies to given age

**Scopes:**
- `active()` - Filter active entrance fees only
- `forAge(int $age)` - Filter fees applicable for specific age

---

## Usage Examples

### 1. Get all active rooms with their day tour rates
```php
$rooms = Accommodation::active()
    ->rooms()
    ->with(['activeRates' => function ($query) {
        $query->whereHas('tourType', function ($q) {
            $q->where('slug', 'day_tour');
        });
    }])
    ->get();
```

### 2. Calculate total cost for Big Room day tour with 8 guests
```php
$bigRoom = Accommodation::where('name', 'Big Room')->first();
$dayTour = TourType::where('slug', 'day_tour')->first();
$rate = AccommodationRate::where('accommodation_id', $bigRoom->id)
    ->where('tour_type_id', $dayTour->id)
    ->first();

$totalRate = $rate->calculateTotalRate(8); // ₱4,500 + (2 × ₱150) = ₱4,800
```

### 3. Get entrance fee for a 4-year-old child on day tour
```php
$dayTour = TourType::where('slug', 'day_tour')->first();
$entranceFee = $dayTour->getEntranceFeeByAge(4); // Returns ₱50 (child rate)
```

### 4. Get all cottages with overnight rates
```php
$cottages = Accommodation::active()
    ->cottages()
    ->with(['activeRates' => function ($query) {
        $query->whereHas('tourType', function ($q) {
            $q->where('slug', 'overnight');
        })->with('tourType');
    }])
    ->get();
```

### 5. Calculate total booking cost (accommodation + entrance fees)
```php
// Example: Small Room day tour with 5 guests (ages: 25, 30, 3, 7, 10)
$accommodation = Accommodation::where('name', 'Small Room')->first();
$tourType = TourType::where('slug', 'day_tour')->first();
$rate = AccommodationRate::where('accommodation_id', $accommodation->id)
    ->where('tour_type_id', $tourType->id)
    ->first();

// Accommodation cost
$accommodationCost = $rate->calculateTotalRate(5); // ₱3,500 + (1 × ₱150) = ₱3,650

// Entrance fees (free for first 4, paid for 1 additional)
// Ages: 25, 30, 7, 10 = ₱100 each (but first 4 are free)
// Age: 3 = ₱50
$additionalGuests = 5 - $rate->free_entrance_count; // 1 guest
$entranceCost = 0;

if ($additionalGuests > 0) {
    // The 5th guest (age 10) pays entrance
    $entranceFee = $tourType->getEntranceFeeByAge(10);
    $entranceCost = (float) $entranceFee->fee; // ₱100
}

$totalCost = $accommodationCost + $entranceCost; // ₱3,750
```

### 6. Check if accommodation rate includes free cottage
```php
$bigRoomRate = AccommodationRate::whereHas('accommodation', function ($q) {
    $q->where('name', 'Big Room');
})->whereHas('tourType', function ($q) {
    $q->where('slug', 'day_tour');
})->first();

if ($bigRoomRate->hasFreeCottage()) {
    $freeCottage = $bigRoomRate->freeCottage; // Returns Small Cottage
    echo "Includes free: {$freeCottage->name}";
}
```

---

## Running Migrations and Seeders

### Run all migrations
```bash
php artisan migrate
```

### Run specific migrations
```bash
php artisan migrate --path=/database/migrations/0_0_6_create_accommodations_table.php
php artisan migrate --path=/database/migrations/0_0_7_create_tour_types_table.php
php artisan migrate --path=/database/migrations/0_0_8_create_accommodation_rates_table.php
php artisan migrate --path=/database/migrations/0_0_9_create_entrance_fees_table.php
```

### Seed the database
```bash
php artisan db:seed --class=AccommodationSeeder
```

### Fresh migration with all seeders
```bash
php artisan migrate:fresh --seed
```

---

## Business Rules

### Room Rates (Day Tour)
- **Big Room (AC)**: ₱4,500 for 6 pax + free small cottage + free entrance for 6
  - Additional guests: ₱150/head
- **Small Room (AC)**: ₱3,500 for 4 pax + free small cottage + free entrance for 4
  - Additional guests: ₱150/head

### Day Tour (No Room)
- **Big Cottage**: ₱800 (flexible capacity: 10-15 pax)
  - Entrance: ₱100/head (regular), ₱50/head (5 years & below)
- **Small Cottage**: ₱400 (capacity: 8-10 pax)
  - Entrance: ₱100/head (regular), ₱50/head (5 years & below)

### Overnight Rates
- **Big Cottage**: ₱1,000 (max 15 pax)
  - Entrance: ₱150/head
- **Small Cottage**: ₱600 (max 8 pax)
  - Entrance: ₱150/head

---

## Future Enhancements

Potential additions to the schema:
1. **Booking/Reservation System**
   - `bookings` table to track reservations
   - Payment tracking
   - Availability calendar

2. **Seasonal Pricing**
   - Add date ranges for peak/off-peak rates
   - Holiday special rates

3. **Discounts & Promos**
   - Coupon codes
   - Group discounts
   - Loyalty rewards

4. **Amenities**
   - Additional services (food, equipment rental, activities)
   - Add-on pricing

5. **Guest Management**
   - Guest profiles
   - Booking history
   - Preferences

---

## Notes

- All prices are in Philippine Pesos (₱)
- The schema is designed to be flexible and extensible
- Status fields allow soft activation/deactivation without deletion
- Foreign key constraints ensure data integrity
- Unique constraints prevent duplicate rate configurations
