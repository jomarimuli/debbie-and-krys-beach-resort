<?php

namespace Database\Seeders;

use App\Models\Feedback;
use Illuminate\Database\Seeder;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $feedbacks = [
            [
                'booking_id' => null,
                'guest_name' => 'Maria Santos',
                'guest_email' => 'maria.santos@email.com',
                'guest_phone' => '0917 123 4567',
                'guest_address' => 'Manila, Philippines',
                'rating' => 5,
                'comment' => 'Amazing beach resort! The staff was incredibly friendly and the accommodations were spotless. We enjoyed every moment of our stay and the sunset view was breathtaking.',
                'status' => 'approved',
            ],
            [
                'booking_id' => null,
                'guest_name' => 'John David Cruz',
                'guest_email' => 'jd.cruz@email.com',
                'guest_phone' => '0918 234 5678',
                'guest_address' => 'Quezon City, Philippines',
                'rating' => 5,
                'comment' => 'Perfect getaway destination! The beach was clean, the rooms were comfortable, and the food was delicious. Highly recommend for families and couples.',
                'status' => 'approved',
            ],
            [
                'booking_id' => null,
                'guest_name' => 'Ana Reyes',
                'guest_email' => 'ana.reyes@email.com',
                'guest_phone' => '0919 345 6789',
                'guest_address' => 'Makati, Philippines',
                'rating' => 4,
                'comment' => 'Great experience overall. The location is beautiful and the staff went above and beyond to make our stay comfortable. Will definitely come back!',
                'status' => 'approved',
            ],
            [
                'booking_id' => null,
                'guest_name' => 'Roberto Garcia',
                'guest_email' => 'roberto.garcia@email.com',
                'guest_phone' => '0920 456 7890',
                'guest_address' => 'Pasig, Philippines',
                'rating' => 5,
                'comment' => 'Exceeded our expectations! The resort is well-maintained, the beach is pristine, and the atmosphere is very relaxing. Perfect for a weekend escape.',
                'status' => 'approved',
            ],
            [
                'booking_id' => null,
                'guest_name' => 'Carmen Flores',
                'guest_email' => 'carmen.flores@email.com',
                'guest_phone' => '0921 567 8901',
                'guest_address' => 'Taguig, Philippines',
                'rating' => 5,
                'comment' => 'Wonderful place for family bonding. The kids loved the beach and the pool area. Staff was very accommodating and helpful throughout our stay.',
                'status' => 'approved',
            ],
            [
                'booking_id' => null,
                'guest_name' => 'Michael Tan',
                'guest_email' => 'michael.tan@email.com',
                'guest_phone' => '0922 678 9012',
                'guest_address' => 'Cavite, Philippines',
                'rating' => 4,
                'comment' => 'Very peaceful and relaxing environment. The resort has everything you need for a comfortable stay. Good value for money.',
                'status' => 'approved',
            ],
            [
                'booking_id' => null,
                'guest_name' => 'Lisa Mendoza',
                'guest_email' => 'lisa.mendoza@email.com',
                'guest_phone' => '0923 789 0123',
                'guest_address' => 'Laguna, Philippines',
                'rating' => 5,
                'comment' => 'Best beach resort we have visited! Clean facilities, friendly staff, and beautiful surroundings. The sunset view from the beach is absolutely stunning.',
                'status' => 'approved',
            ],
            [
                'booking_id' => null,
                'guest_name' => 'Patrick Villanueva',
                'guest_email' => 'patrick.v@email.com',
                'guest_phone' => '0924 890 1234',
                'guest_address' => 'Batangas City, Philippines',
                'rating' => 4,
                'comment' => 'Nice resort with good amenities. The location is convenient and the staff is very professional. Enjoyed our stay and would recommend to others.',
                'status' => 'approved',
            ],
            [
                'booking_id' => null,
                'guest_name' => 'Jennifer Ramos',
                'guest_email' => 'jen.ramos@email.com',
                'guest_phone' => '0925 901 2345',
                'guest_address' => 'Paranaque, Philippines',
                'rating' => 5,
                'comment' => 'Absolutely loved our stay! The resort is beautiful, the beach is clean, and the staff made us feel very welcome. Perfect place for relaxation.',
                'status' => 'approved',
            ],
            [
                'booking_id' => null,
                'guest_name' => 'Daniel Torres',
                'guest_email' => 'daniel.torres@email.com',
                'guest_phone' => '0926 012 3456',
                'guest_address' => 'Caloocan, Philippines',
                'rating' => 5,
                'comment' => 'Fantastic resort with excellent service. Everything was clean and well-organized. The beach is gorgeous and perfect for swimming. Will visit again soon!',
                'status' => 'approved',
            ],
        ];

        foreach ($feedbacks as $feedback) {
            Feedback::create($feedback);
        }
    }
}
