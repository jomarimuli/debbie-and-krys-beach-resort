<?php

namespace Database\Seeders;

use App\Models\Accommodation;
use App\Models\AccommodationRate;
use App\Models\Announcement;
use App\Models\Booking;
use App\Models\BookingAccommodation;
use App\Models\BookingEntranceFee;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\Feedback;
use App\Models\Gallery;
use App\Models\Payment;
use App\Models\PaymentAccount;
use App\Models\Rebooking;
use App\Models\RebookingAccommodation;
use App\Models\RebookingEntranceFee;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create test users
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('P@ssw0rd'),
                'email_verified_at' => now(),
                'password_changed_at' => now(),
                'phone' => '09123456789',
                'address' => 'Manila, Philippines',
                'status' => 'active',
            ]
        );
        $admin->assignRole('admin');

        $staff = User::firstOrCreate(
            ['email' => 'staff@test.com'],
            [
                'name' => 'Staff User',
                'password' => Hash::make('P@ssw0rd'),
                'email_verified_at' => now(),
                'password_changed_at' => now(),
                'phone' => '09234567890',
                'address' => 'Quezon City, Philippines',
                'status' => 'active',
            ]
        );
        $staff->assignRole('staff');

        $customers = [];
        for ($i = 1; $i <= 10; $i++) {
            $customer = User::firstOrCreate(
                ['email' => "customer{$i}@test.com"],
                [
                    'name' => "Customer {$i}",
                    'password' => Hash::make('P@ssw0rd'),
                    'email_verified_at' => now(),
                    'password_changed_at' => now(),
                    'phone' => '0912345' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'address' => "Address {$i}, Philippines",
                    'status' => 'active',
                ]
            );
            $customer->assignRole('customer');
            $customers[] = $customer;
        }

        // Accommodations with rates
        $bigRoom = Accommodation::create([
            'name' => 'Big Room',
            'type' => 'room',
            'size' => 'big',
            'description' => 'Spacious airconditioned room perfect for families',
            'is_air_conditioned' => true,
            'min_capacity' => 6,
            'max_capacity' => 10,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $bigRoom->id,
            'booking_type' => 'day_tour',
            'rate' => 4500,
            'additional_pax_rate' => 150,
            'adult_entrance_fee' => 100,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => true,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $bigRoom->id,
            'booking_type' => 'overnight',
            'rate' => 5500,
            'additional_pax_rate' => 200,
            'adult_entrance_fee' => 150,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => true,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        $smallRoom = Accommodation::create([
            'name' => 'Small Room',
            'type' => 'room',
            'size' => 'small',
            'description' => 'Cozy airconditioned room for small groups',
            'is_air_conditioned' => true,
            'min_capacity' => 4,
            'max_capacity' => 6,
            'is_active' => true,
            'sort_order' => 2,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $smallRoom->id,
            'booking_type' => 'day_tour',
            'rate' => 3500,
            'additional_pax_rate' => 150,
            'adult_entrance_fee' => 100,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => true,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $smallRoom->id,
            'booking_type' => 'overnight',
            'rate' => 4000,
            'additional_pax_rate' => 200,
            'adult_entrance_fee' => 150,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => true,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        $bigCottage = Accommodation::create([
            'name' => 'Big Cottage',
            'type' => 'cottage',
            'size' => 'big',
            'description' => 'Large cottage for groups',
            'is_air_conditioned' => false,
            'min_capacity' => 10,
            'max_capacity' => 15,
            'is_active' => true,
            'sort_order' => 3,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $bigCottage->id,
            'booking_type' => 'day_tour',
            'rate' => 800,
            'additional_pax_rate' => 100,
            'adult_entrance_fee' => 100,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $bigCottage->id,
            'booking_type' => 'overnight',
            'rate' => 1000,
            'additional_pax_rate' => 120,
            'adult_entrance_fee' => 150,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        $smallCottage = Accommodation::create([
            'name' => 'Small Cottage',
            'type' => 'cottage',
            'size' => 'small',
            'description' => 'Compact cottage for small groups',
            'is_air_conditioned' => false,
            'min_capacity' => 8,
            'max_capacity' => 10,
            'is_active' => true,
            'sort_order' => 4,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $smallCottage->id,
            'booking_type' => 'day_tour',
            'rate' => 400,
            'additional_pax_rate' => 100,
            'adult_entrance_fee' => 100,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $smallCottage->id,
            'booking_type' => 'overnight',
            'rate' => 600,
            'additional_pax_rate' => 120,
            'adult_entrance_fee' => 150,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        $deluxeRoom = Accommodation::create([
            'name' => 'Deluxe Room',
            'type' => 'room',
            'size' => 'big',
            'description' => 'Premium airconditioned room with amenities',
            'is_air_conditioned' => true,
            'min_capacity' => 8,
            'max_capacity' => 12,
            'is_active' => true,
            'sort_order' => 5,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $deluxeRoom->id,
            'booking_type' => 'day_tour',
            'rate' => 6000,
            'additional_pax_rate' => 200,
            'adult_entrance_fee' => 120,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => true,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $deluxeRoom->id,
            'booking_type' => 'overnight',
            'rate' => 7500,
            'additional_pax_rate' => 250,
            'adult_entrance_fee' => 150,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => true,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        $familyCottage = Accommodation::create([
            'name' => 'Family Cottage',
            'type' => 'cottage',
            'size' => 'big',
            'description' => 'Family-sized cottage with extra space',
            'is_air_conditioned' => false,
            'min_capacity' => 12,
            'max_capacity' => 18,
            'is_active' => true,
            'sort_order' => 6,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $familyCottage->id,
            'booking_type' => 'day_tour',
            'rate' => 1200,
            'additional_pax_rate' => 110,
            'adult_entrance_fee' => 100,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $familyCottage->id,
            'booking_type' => 'overnight',
            'rate' => 1500,
            'additional_pax_rate' => 130,
            'adult_entrance_fee' => 150,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        $premiumCottage = Accommodation::create([
            'name' => 'Premium Cottage',
            'type' => 'cottage',
            'size' => 'big',
            'description' => 'Premium cottage with covered area',
            'is_air_conditioned' => false,
            'min_capacity' => 15,
            'max_capacity' => 20,
            'is_active' => true,
            'sort_order' => 7,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $premiumCottage->id,
            'booking_type' => 'day_tour',
            'rate' => 1500,
            'additional_pax_rate' => 120,
            'adult_entrance_fee' => 100,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $premiumCottage->id,
            'booking_type' => 'overnight',
            'rate' => 2000,
            'additional_pax_rate' => 140,
            'adult_entrance_fee' => 150,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        $standardRoom = Accommodation::create([
            'name' => 'Standard Room',
            'type' => 'room',
            'size' => 'small',
            'description' => 'Basic airconditioned room for couples',
            'is_air_conditioned' => true,
            'min_capacity' => 2,
            'max_capacity' => 4,
            'is_active' => true,
            'sort_order' => 8,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $standardRoom->id,
            'booking_type' => 'day_tour',
            'rate' => 2500,
            'additional_pax_rate' => 150,
            'adult_entrance_fee' => 100,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $standardRoom->id,
            'booking_type' => 'overnight',
            'rate' => 3000,
            'additional_pax_rate' => 200,
            'adult_entrance_fee' => 150,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        $gardenCottage = Accommodation::create([
            'name' => 'Garden Cottage',
            'type' => 'cottage',
            'size' => 'small',
            'description' => 'Cottage with garden view',
            'is_air_conditioned' => false,
            'min_capacity' => 6,
            'max_capacity' => 8,
            'is_active' => true,
            'sort_order' => 9,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $gardenCottage->id,
            'booking_type' => 'day_tour',
            'rate' => 600,
            'additional_pax_rate' => 100,
            'adult_entrance_fee' => 100,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $gardenCottage->id,
            'booking_type' => 'overnight',
            'rate' => 800,
            'additional_pax_rate' => 120,
            'adult_entrance_fee' => 150,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => false,
            'includes_free_entrance' => false,
            'is_active' => true,
        ]);

        $vipRoom = Accommodation::create([
            'name' => 'VIP Room',
            'type' => 'room',
            'size' => 'big',
            'description' => 'VIP airconditioned room with exclusive amenities',
            'is_air_conditioned' => true,
            'min_capacity' => 10,
            'max_capacity' => 15,
            'is_active' => true,
            'sort_order' => 10,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $vipRoom->id,
            'booking_type' => 'day_tour',
            'rate' => 8000,
            'additional_pax_rate' => 250,
            'adult_entrance_fee' => 120,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => true,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        AccommodationRate::create([
            'accommodation_id' => $vipRoom->id,
            'booking_type' => 'overnight',
            'rate' => 10000,
            'additional_pax_rate' => 300,
            'adult_entrance_fee' => 150,
            'child_entrance_fee' => 50,
            'child_max_age' => 5,
            'includes_free_cottage' => true,
            'includes_free_entrance' => true,
            'is_active' => true,
        ]);

        // Payment Accounts
        $paymentAccounts = [
            [
                'type' => 'bank',
                'account_name' => 'Resort Bank Account',
                'account_number' => '1234567890',
                'bank_name' => 'BDO',
                'sort_order' => 1,
            ],
            [
                'type' => 'gcash',
                'account_name' => 'Resort GCash',
                'account_number' => '09123456789',
                'bank_name' => null,
                'sort_order' => 2,
            ],
            [
                'type' => 'maya',
                'account_name' => 'Resort Maya',
                'account_number' => '09234567890',
                'bank_name' => null,
                'sort_order' => 3,
            ],
            [
                'type' => 'bank',
                'account_name' => 'Secondary Bank Account',
                'account_number' => '0987654321',
                'bank_name' => 'BPI',
                'sort_order' => 4,
            ],
            [
                'type' => 'other',
                'account_name' => 'Cash on Hand',
                'account_number' => null,
                'bank_name' => null,
                'sort_order' => 5,
            ],
        ];

        $createdPaymentAccounts = [];
        foreach ($paymentAccounts as $account) {
            $createdPaymentAccounts[] = PaymentAccount::create($account);
        }

        // Bookings with related data
        $bookings = [];
        $statuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
        $sources = ['guest', 'registered', 'walkin'];
        $bookingTypes = ['day_tour', 'overnight'];

        for ($i = 1; $i <= 10; $i++) {
            $bookingType = $bookingTypes[array_rand($bookingTypes)];
            $checkInDate = now()->addDays(rand(-30, 30))->format('Y-m-d');
            $checkOutDate = $bookingType === 'overnight' ? date('Y-m-d', strtotime($checkInDate . ' +1 day')) : null;

            $accommodationTotal = rand(3000, 10000);
            $entranceFeeTotal = rand(500, 2000);
            $totalAmount = $accommodationTotal + $entranceFeeTotal;
            $paidAmount = rand(0, $totalAmount);

            $booking = Booking::create([
                'booking_number' => 'BK-' . date('Ym', strtotime($checkInDate)) . '-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'booking_code' => strtoupper(substr(md5($i), 0, 8)),
                'source' => $sources[array_rand($sources)],
                'booking_type' => $bookingType,
                'created_by' => $customers[array_rand($customers)]->id,
                'guest_name' => "Guest {$i}",
                'guest_email' => "guest{$i}@example.com",
                'guest_phone' => '09123456' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'guest_address' => "Address {$i}, Philippines",
                'check_in_date' => $checkInDate,
                'check_out_date' => $checkOutDate,
                'total_adults' => rand(4, 10),
                'total_children' => rand(0, 5),
                'accommodation_total' => $accommodationTotal,
                'entrance_fee_total' => $entranceFeeTotal,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'down_payment_amount' => $totalAmount * 0.3,
                'down_payment_paid' => min($paidAmount, $totalAmount * 0.3),
                'down_payment_required' => true,
                'status' => $statuses[array_rand($statuses)],
                'notes' => $i % 3 === 0 ? "Special request for booking {$i}" : null,
            ]);

            $bookings[] = $booking;

            // Booking Accommodations
            $accommodation = [$bigRoom, $smallRoom, $bigCottage, $smallCottage][array_rand([$bigRoom, $smallRoom, $bigCottage, $smallCottage])];
            $rate = $accommodation->rates()->where('booking_type', $bookingType)->first();

            BookingAccommodation::create([
                'booking_id' => $booking->id,
                'accommodation_id' => $accommodation->id,
                'accommodation_rate_id' => $rate->id,
                'guests' => rand(4, 10),
                'rate' => $rate->rate,
                'additional_pax_charge' => rand(0, 500),
                'subtotal' => $accommodationTotal,
                'free_entrance_used' => $rate->includes_free_entrance ? rand(0, 6) : 0,
            ]);

            // Booking Entrance Fees
            BookingEntranceFee::create([
                'booking_id' => $booking->id,
                'type' => 'adult',
                'quantity' => rand(4, 10),
                'rate' => $bookingType === 'day_tour' ? 100 : 150,
                'subtotal' => rand(400, 1500),
            ]);

            if (rand(0, 1)) {
                BookingEntranceFee::create([
                    'booking_id' => $booking->id,
                    'type' => 'child',
                    'quantity' => rand(1, 5),
                    'rate' => $bookingType === 'day_tour' ? 50 : 150,
                    'subtotal' => rand(50, 500),
                ]);
            }

            // Payments
            if ($paidAmount > 0) {
                $payment = Payment::create([
                    'booking_id' => $booking->id,
                    'payment_number' => 'PAY-' . date('Ym') . '-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'amount' => $paidAmount,
                    'is_down_payment' => $paidAmount <= $totalAmount * 0.3,
                    'is_rebooking_payment' => false,
                    'payment_account_id' => $createdPaymentAccounts[array_rand($createdPaymentAccounts)]->id,
                    'reference_number' => 'REF' . rand(100000, 999999),
                    'notes' => $i % 2 === 0 ? "Payment note {$i}" : null,
                    'received_by' => [$admin->id, $staff->id][array_rand([$admin->id, $staff->id])],
                    'payment_date' => now()->subDays(rand(0, 30)),
                ]);

                // Some payments have refunds
                if ($i % 4 === 0) {
                    Refund::create([
                        'payment_id' => $payment->id,
                        'refund_number' => 'REF-' . date('Ym') . '-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                        'amount' => rand(500, 2000),
                        'refund_method' => ['cash', 'bank', 'gcash', 'original_method'][array_rand(['cash', 'bank', 'gcash', 'original_method'])],
                        'is_rebooking_refund' => false,
                        'refund_account_id' => $createdPaymentAccounts[array_rand($createdPaymentAccounts)]->id,
                        'reference_number' => 'REFNUM' . rand(100000, 999999),
                        'reason' => 'Cancellation refund',
                        'notes' => "Refund processed for booking {$i}",
                        'processed_by' => [$admin->id, $staff->id][array_rand([$admin->id, $staff->id])],
                        'refund_date' => now()->subDays(rand(0, 30)),
                    ]);
                }
            }
        }

        // Rebookings
        for ($i = 1; $i <= 10; $i++) {
            $originalBooking = $bookings[array_rand($bookings)];
            $newCheckInDate = date('Y-m-d', strtotime($originalBooking->check_in_date . ' +7 days'));
            $newCheckOutDate = $originalBooking->booking_type === 'overnight' ? date('Y-m-d', strtotime($newCheckInDate . ' +1 day')) : null;

            $originalAmount = $originalBooking->total_amount;
            $newAmount = rand(3000, 10000);
            $amountDifference = $newAmount - $originalAmount;
            $rebookingFee = 500;

            $rebooking = Rebooking::create([
                'original_booking_id' => $originalBooking->id,
                'rebooking_number' => 'RB-' . date('Ym') . '-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'processed_by' => [$admin->id, $staff->id][array_rand([$admin->id, $staff->id])],
                'new_check_in_date' => $newCheckInDate,
                'new_check_out_date' => $newCheckOutDate,
                'new_total_adults' => rand(4, 10),
                'new_total_children' => rand(0, 5),
                'original_amount' => $originalAmount,
                'new_amount' => $newAmount,
                'amount_difference' => $amountDifference,
                'rebooking_fee' => $rebookingFee,
                'total_adjustment' => $amountDifference + $rebookingFee,
                'status' => ['pending', 'approved', 'completed'][array_rand(['pending', 'approved', 'completed'])],
                'payment_status' => ['pending', 'paid'][array_rand(['pending', 'paid'])],
                'reason' => "Rebooking reason for {$i}",
                'remarks' => $i % 2 === 0 ? "Admin notes for rebooking {$i}" : null,
                'approved_at' => $i % 2 === 0 ? now()->subDays(rand(0, 10)) : null,
                'completed_at' => $i % 3 === 0 ? now()->subDays(rand(0, 5)) : null,
            ]);

            // Rebooking Accommodations
            $accommodation = [$bigRoom, $smallRoom, $bigCottage, $smallCottage][array_rand([$bigRoom, $smallRoom, $bigCottage, $smallCottage])];
            $rate = $accommodation->rates()->where('booking_type', $originalBooking->booking_type)->first();

            RebookingAccommodation::create([
                'rebooking_id' => $rebooking->id,
                'accommodation_id' => $accommodation->id,
                'accommodation_rate_id' => $rate->id,
                'guests' => rand(4, 10),
                'rate' => $rate->rate,
                'additional_pax_charge' => rand(0, 500),
                'subtotal' => rand(3000, 8000),
                'free_entrance_used' => $rate->includes_free_entrance ? rand(0, 6) : 0,
            ]);

            // Rebooking Entrance Fees
            RebookingEntranceFee::create([
                'rebooking_id' => $rebooking->id,
                'type' => 'adult',
                'quantity' => rand(4, 10),
                'rate' => $originalBooking->booking_type === 'day_tour' ? 100 : 150,
                'subtotal' => rand(400, 1500),
            ]);
        }

        // Feedbacks
        for ($i = 1; $i <= 10; $i++) {
            $status = 'approved';
            if ($i > 6 && $i <= 8) {
                $status = 'pending';
            } elseif ($i > 8) {
                $status = 'rejected';
            }

            Feedback::create([
                'booking_id' => $bookings[array_rand($bookings)]->id,
                'guest_name' => "Guest {$i}",
                'guest_email' => "guest{$i}@example.com",
                'guest_phone' => '09123456' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'guest_address' => "Address {$i}, Philippines",
                'rating' => rand(3, 5),
                'comment' => "Great experience! Feedback {$i}",
                'status' => $status,
            ]);
        }

        // Announcements
        $announcements = [
            ['Holiday Special', 'Get 20% off on all bookings this holiday season!'],
            ['New Pool Opening', 'We are excited to announce our new infinity pool!'],
            ['Maintenance Notice', 'Scheduled maintenance on Big Cottage on Dec 15.'],
            ['Event Package', 'Now offering special packages for birthday celebrations.'],
            ['Early Bird Promo', 'Book 30 days in advance and save 15%!'],
            ['Weekend Special', 'Special rates for weekend bookings this month.'],
            ['Group Discount', 'Groups of 15 or more get special discounts.'],
            ['New Menu', 'Check out our new restaurant menu with local cuisine.'],
            ['Safety Protocols', 'Updated safety and health protocols for your visit.'],
            ['Thank You', 'Thank you for choosing our resort for your getaway!'],
        ];

        foreach ($announcements as $index => $announcement) {
            Announcement::create([
                'title' => $announcement[0],
                'content' => $announcement[1],
                'is_active' => $index < 5,
                'published_at' => now()->subDays(rand(0, 30)),
                'expires_at' => now()->addDays(rand(30, 90)),
            ]);
        }

        // Galleries
        $galleries = [
            'Pool View',
            'Beach Front',
            'Big Room Interior',
            'Small Room Interior',
            'Big Cottage',
            'Small Cottage',
            'Restaurant Area',
            'Garden View',
            'Sunset View',
            'Activities Area',
        ];

        foreach ($galleries as $index => $title) {
            Gallery::create([
                'title' => $title,
                'description' => "Beautiful view of {$title}",
                'image' => "gallery-{$index}.jpg",
                'is_active' => true,
                'sort_order' => $index + 1,
            ]);
        }

        // Chat Conversations
        for ($i = 1; $i <= 10; $i++) {
            $isCustomer = $i % 2 === 0;
            $conversation = ChatConversation::create([
                'customer_id' => $isCustomer ? $customers[array_rand($customers)]->id : null,
                'staff_id' => $i % 3 === 0 ? $staff->id : null,
                'guest_name' => !$isCustomer ? "Guest {$i}" : null,
                'guest_email' => !$isCustomer ? "guest{$i}@example.com" : null,
                'guest_session_id' => !$isCustomer ? 'session_' . $i : null,
                'status' => ['open', 'assigned', 'closed'][array_rand(['open', 'assigned', 'closed'])],
                'subject' => "Inquiry about booking {$i}",
                'assigned_at' => $i % 3 === 0 ? now()->subHours(rand(1, 24)) : null,
                'closed_at' => $i % 4 === 0 ? now()->subHours(rand(0, 12)) : null,
            ]);

            // Chat Messages
            for ($j = 1; $j <= rand(3, 8); $j++) {
                ChatMessage::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $j % 2 === 0 ? ($isCustomer ? $conversation->customer_id : null) : $staff->id,
                    'sender_name' => $j % 2 === 0 && !$isCustomer ? "Guest {$i}" : null,
                    'message' => "Message {$j} in conversation {$i}",
                    'is_read' => rand(0, 1),
                    'read_at' => rand(0, 1) ? now()->subMinutes(rand(1, 60)) : null,
                ]);
            }
        }
    }
}
