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
        // Filipino names for customers
        $filipinoNames = [
            ['name' => 'Maria Santos', 'address' => 'Quezon City, Metro Manila'],
            ['name' => 'Juan dela Cruz', 'address' => 'Makati City, Metro Manila'],
            ['name' => 'Rosa Reyes', 'address' => 'Caloocan City, Metro Manila'],
            ['name' => 'Pedro Garcia', 'address' => 'Davao City, Davao del Sur'],
            ['name' => 'Ana Mendoza', 'address' => 'Cebu City, Cebu'],
            ['name' => 'Carlos Bautista', 'address' => 'Pasig City, Metro Manila'],
            ['name' => 'Luz Fernandez', 'address' => 'Taguig City, Metro Manila'],
            ['name' => 'Ramon Torres', 'address' => 'Antipolo City, Rizal'],
            ['name' => 'Elena Cruz', 'address' => 'Las Piñas City, Metro Manila'],
            ['name' => 'Miguel Ramos', 'address' => 'Parañaque City, Metro Manila'],
            ['name' => 'Sofia Villanueva', 'address' => 'Mandaluyong City, Metro Manila'],
            ['name' => 'Diego Lopez', 'address' => 'San Juan City, Metro Manila'],
            ['name' => 'Carmen Aquino', 'address' => 'Valenzuela City, Metro Manila'],
            ['name' => 'Jose Martinez', 'address' => 'Marikina City, Metro Manila'],
            ['name' => 'Isabel Gonzales', 'address' => 'Malabon City, Metro Manila'],
        ];

        $customers = [];
        foreach ($filipinoNames as $index => $person) {
            $i = $index + 1;
            $firstName = explode(' ', $person['name'])[0];
            $lastName = explode(' ', $person['name'])[count(explode(' ', $person['name'])) - 1];

            $customer = User::firstOrCreate(
                ['email' => strtolower($firstName) . '.' . strtolower($lastName) . '@gmail.com'],
                [
                    'name' => $person['name'],
                    'password' => Hash::make('P@ssw0rd'),
                    'email_verified_at' => now(),
                    'password_changed_at' => now(),
                    'phone' => '09' . rand(100000000, 999999999),
                    'address' => $person['address'],
                    'status' => 'active',
                ]
            );
            $customer->assignRole('customer');
            $customers[] = $customer;
        }

        // Get admin and staff users for later use
        $admin = User::where('email', 'jomarisingson04@gmail.com')->first();
        $staff = User::where('email', 'pauljustina11@gmail.com')->first();

        // ============================================
        // ACCOMMODATIONS - Real Client Offers
        // ============================================

        // 2 Big Rooms with AC - Day Tour Only
        $bigRooms = [];
        for ($i = 1; $i <= 2; $i++) {
            $bigRoom = Accommodation::create([
                'name' => "Big Room {$i}",
                'type' => 'room',
                'size' => 'big',
                'description' => 'Spacious airconditioned room with free small cottage',
                'is_air_conditioned' => true,
                'min_capacity' => 6,
                'max_capacity' => 10,
                'is_active' => true,
                'sort_order' => $i,
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

            $bigRooms[] = $bigRoom;
        }

        // 1 Small Room with AC - Day Tour Only
        $smallRoom = Accommodation::create([
            'name' => 'Small Room',
            'type' => 'room',
            'size' => 'small',
            'description' => 'Cozy airconditioned room with free small cottage',
            'is_air_conditioned' => true,
            'min_capacity' => 4,
            'max_capacity' => 8,
            'is_active' => true,
            'sort_order' => 3,
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

        // 3 Big Cottages without AC - Day Tour
        $bigCottagesDayTour = [];
        for ($i = 1; $i <= 3; $i++) {
            $bigCottage = Accommodation::create([
                'name' => "Big Cottage {$i}",
                'type' => 'cottage',
                'size' => 'big',
                'description' => 'Large cottage for groups (Day Tour)',
                'is_air_conditioned' => false,
                'min_capacity' => 10,
                'max_capacity' => 15,
                'is_active' => true,
                'sort_order' => 3 + $i,
            ]);

            AccommodationRate::create([
                'accommodation_id' => $bigCottage->id,
                'booking_type' => 'day_tour',
                'rate' => 800,
                'additional_pax_rate' => 0,
                'adult_entrance_fee' => 100,
                'child_entrance_fee' => 50,
                'child_max_age' => 5,
                'includes_free_cottage' => false,
                'includes_free_entrance' => false,
                'is_active' => true,
            ]);

            $bigCottagesDayTour[] = $bigCottage;
        }

        // 2 Small Cottages without AC - Day Tour
        $smallCottagesDayTour = [];
        for ($i = 1; $i <= 2; $i++) {
            $smallCottage = Accommodation::create([
                'name' => "Small Cottage {$i}",
                'type' => 'cottage',
                'size' => 'small',
                'description' => 'Compact cottage for small groups (Day Tour)',
                'is_air_conditioned' => false,
                'min_capacity' => 8,
                'max_capacity' => 10,
                'is_active' => true,
                'sort_order' => 6 + $i,
            ]);

            AccommodationRate::create([
                'accommodation_id' => $smallCottage->id,
                'booking_type' => 'day_tour',
                'rate' => 400,
                'additional_pax_rate' => 0,
                'adult_entrance_fee' => 100,
                'child_entrance_fee' => 50,
                'child_max_age' => 5,
                'includes_free_cottage' => false,
                'includes_free_entrance' => false,
                'is_active' => true,
            ]);

            $smallCottagesDayTour[] = $smallCottage;
        }

        // 3 Big Cottages without AC - Overnight
        $bigCottagesOvernight = [];
        for ($i = 4; $i <= 6; $i++) {
            $bigCottage = Accommodation::create([
                'name' => "Big Cottage {$i}",
                'type' => 'cottage',
                'size' => 'big',
                'description' => 'Large cottage for groups (Overnight)',
                'is_air_conditioned' => false,
                'min_capacity' => 10,
                'max_capacity' => 15,
                'is_active' => true,
                'sort_order' => 6 + $i,
            ]);

            AccommodationRate::create([
                'accommodation_id' => $bigCottage->id,
                'booking_type' => 'overnight',
                'rate' => 1000,
                'additional_pax_rate' => 0,
                'adult_entrance_fee' => 150,
                'child_entrance_fee' => 100,
                'child_max_age' => 5,
                'includes_free_cottage' => false,
                'includes_free_entrance' => false,
                'is_active' => true,
            ]);

            $bigCottagesOvernight[] = $bigCottage;
        }

        // 2 Small Cottages without AC - Overnight
        $smallCottagesOvernight = [];
        for ($i = 3; $i <= 4; $i++) {
            $smallCottage = Accommodation::create([
                'name' => "Small Cottage {$i}",
                'type' => 'cottage',
                'size' => 'small',
                'description' => 'Compact cottage for small groups (Overnight)',
                'is_air_conditioned' => false,
                'min_capacity' => 8,
                'max_capacity' => 10,
                'is_active' => true,
                'sort_order' => 12 + $i,
            ]);

            AccommodationRate::create([
                'accommodation_id' => $smallCottage->id,
                'booking_type' => 'overnight',
                'rate' => 600,
                'additional_pax_rate' => 0,
                'adult_entrance_fee' => 150,
                'child_entrance_fee' => 100,
                'child_max_age' => 5,
                'includes_free_cottage' => false,
                'includes_free_entrance' => false,
                'is_active' => true,
            ]);

            $smallCottagesOvernight[] = $smallCottage;
        }

        // Combine all accommodations for bookings
        $allAccommodations = array_merge(
            $bigRooms,
            [$smallRoom],
            $bigCottagesDayTour,
            $smallCottagesDayTour,
            $bigCottagesOvernight,
            $smallCottagesOvernight
        );

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
            $customer = $customers[array_rand($customers)];
            $bookingType = $bookingTypes[array_rand($bookingTypes)];
            $checkInDate = now()->addDays(rand(-30, 30))->format('Y-m-d');
            $checkOutDate = $bookingType === 'overnight' ? date('Y-m-d', strtotime($checkInDate . ' +1 day')) : null;

            // Select appropriate accommodation based on booking type
            $accommodation = $allAccommodations[array_rand($allAccommodations)];
            $rate = $accommodation->rates()->where('booking_type', $bookingType)->first();

            // Skip if no rate found for this booking type
            if (!$rate) {
                continue;
            }

            $guests = rand($accommodation->min_capacity, $accommodation->max_capacity);
            $additionalPax = max(0, $guests - $accommodation->min_capacity);
            $accommodationTotal = $rate->rate + ($additionalPax * $rate->additional_pax_rate);

            $entranceFeeTotal = rand(500, 2000);
            $totalAmount = $accommodationTotal + $entranceFeeTotal;
            $paidAmount = rand(0, $totalAmount);

            $booking = Booking::create([
                'booking_number' => 'BK-' . date('Ym', strtotime($checkInDate)) . '-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'booking_code' => strtoupper(substr(md5($i), 0, 8)),
                'source' => $sources[array_rand($sources)],
                'booking_type' => $bookingType,
                'created_by' => $customer->id,
                'guest_name' => $customer->name,
                'guest_email' => $customer->email,
                'guest_phone' => $customer->phone,
                'guest_address' => $customer->address,
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
            BookingAccommodation::create([
                'booking_id' => $booking->id,
                'accommodation_id' => $accommodation->id,
                'accommodation_rate_id' => $rate->id,
                'guests' => $guests,
                'rate' => $rate->rate,
                'additional_pax_charge' => $additionalPax * $rate->additional_pax_rate,
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
                    'rate' => $bookingType === 'day_tour' ? 50 : 100,
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
            $accommodation = $allAccommodations[array_rand($allAccommodations)];
            $rate = $accommodation->rates()->where('booking_type', $originalBooking->booking_type)->first();

            if ($rate) {
                $guests = rand($accommodation->min_capacity, $accommodation->max_capacity);
                $additionalPax = max(0, $guests - $accommodation->min_capacity);

                RebookingAccommodation::create([
                    'rebooking_id' => $rebooking->id,
                    'accommodation_id' => $accommodation->id,
                    'accommodation_rate_id' => $rate->id,
                    'guests' => $guests,
                    'rate' => $rate->rate,
                    'additional_pax_charge' => $additionalPax * $rate->additional_pax_rate,
                    'subtotal' => $rate->rate + ($additionalPax * $rate->additional_pax_rate),
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
        }

        // Feedbacks
        for ($i = 1; $i <= 10; $i++) {
            $customer = $customers[array_rand($customers)];
            $status = 'approved';
            if ($i > 6 && $i <= 8) {
                $status = 'pending';
            } elseif ($i > 8) {
                $status = 'rejected';
            }

            Feedback::create([
                'booking_id' => $bookings[array_rand($bookings)]->id,
                'guest_name' => $customer->name,
                'guest_email' => $customer->email,
                'guest_phone' => $customer->phone,
                'guest_address' => $customer->address,
                'rating' => rand(3, 5),
                'comment' => "Great experience! The resort was amazing and the staff was very accommodating.",
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

        // Galleries - Real client images only
        $galleries = [
            'Beach Front',
            'Garden View',
            'Sunset View',
            'Activities Area',
            'Big Room Interior',
            'Small Room Interior',
            'Big Cottage',
            'Small Cottage',
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
            $customer = $customers[array_rand($customers)];

            $conversation = ChatConversation::create([
                'customer_id' => $isCustomer ? $customer->id : null,
                'staff_id' => $i % 3 === 0 ? $staff->id : null,
                'guest_name' => !$isCustomer ? $customer->name : null,
                'guest_email' => !$isCustomer ? $customer->email : null,
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
                    'sender_name' => $j % 2 === 0 && !$isCustomer ? $customer->name : null,
                    'message' => "Message {$j} in conversation {$i}",
                    'is_read' => rand(0, 1),
                    'read_at' => rand(0, 1) ? now()->subMinutes(rand(1, 60)) : null,
                ]);
            }
        }
    }
}
