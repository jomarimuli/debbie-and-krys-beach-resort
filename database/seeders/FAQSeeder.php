<?php

namespace Database\Seeders;

use App\Models\FAQ;
use Illuminate\Database\Seeder;

class FAQSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'What are your operating hours?',
                'answer' => 'We are open every day from 7:00 AM to 10:00 PM (Philippine Time). Day tours run from 7:00 AM to 6:00 PM, while overnight stays check-in at 2:00 PM and check-out at 12:00 PM.',
                'keywords' => ['hours', 'time', 'open', 'schedule', 'operating'],
                'order' => 1,
            ],
            [
                'question' => 'What are your room rates for day tours?',
                'answer' => 'Big Room (Airconditioned): ₱4,500 for 6 pax - includes free 1 small cottage and free entrance for 6 pax. Additional guests are ₱150 per head. Small Room (Airconditioned): ₱3,500 for 4 pax - includes free 1 small cottage and free entrance for 4 pax. Additional guests are ₱150 per head.',
                'keywords' => ['room', 'rates', 'price', 'day tour', 'accommodation', 'airconditioned'],
                'order' => 2,
            ],
            [
                'question' => 'How much is the cottage for day tour?',
                'answer' => 'Big Cottage: ₱800 (flexible capacity, typically 10-15 pax). Small Cottage: ₱400 (8-10 pax). Entrance fee: ₱100 per head for regular, ₱50 per head for 5 years old and below.',
                'keywords' => ['cottage', 'day tour', 'entrance', 'price', 'rates'],
                'order' => 3,
            ],
            [
                'question' => 'What are your overnight rates?',
                'answer' => 'Big Cottage: ₱1,000 (max 15 pax). Small Cottage: ₱600 (max 8 pax). Entrance fee: ₱150 per head for overnight stays.',
                'keywords' => ['overnight', 'stay', 'night', 'cottage', 'rates', 'price'],
                'order' => 4,
            ],
            [
                'question' => 'What is the capacity of your big room?',
                'answer' => 'The Big Room (Airconditioned) can accommodate 6 pax. Additional guests beyond 6 pax can be accommodated at ₱150 per head.',
                'keywords' => ['capacity', 'big room', 'how many', 'pax', 'guests'],
                'order' => 5,
            ],
            [
                'question' => 'What is the capacity of your small room?',
                'answer' => 'The Small Room (Airconditioned) can accommodate 4 pax. Additional guests can be accommodated at ₱150 per head if applicable.',
                'keywords' => ['capacity', 'small room', 'how many', 'pax', 'guests'],
                'order' => 6,
            ],
            [
                'question' => 'How much is the entrance fee?',
                'answer' => 'For day tours: ₱100 per head (regular), ₱50 per head (5 years old and below). For overnight stays: ₱150 per head.',
                'keywords' => ['entrance', 'fee', 'price', 'cost', 'admission'],
                'order' => 7,
            ],
            [
                'question' => 'What is included in the room rates?',
                'answer' => 'Big Room includes free 1 small cottage and free entrance for 6 pax. Small Room includes free 1 small cottage and free entrance for 4 pax.',
                'keywords' => ['inclusions', 'includes', 'free', 'room', 'benefits'],
                'order' => 8,
            ],
            [
                'question' => 'Do you have cottages for big groups?',
                'answer' => 'Yes! Our Big Cottage can accommodate 10-15 pax for day tours (₱800) and up to 15 pax for overnight stays (₱1,000).',
                'keywords' => ['big group', 'large group', 'cottage', 'capacity', 'many people'],
                'order' => 9,
            ],
            [
                'question' => 'What day of the week are you open?',
                'answer' => 'We are open 7 days a week - Monday to Sunday from 7:00 AM to 10:00 PM.',
                'keywords' => ['days', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'week', 'weekday', 'weekend'],
                'order' => 10,
            ],
            [
                'question' => 'What time is check-in and check-out for overnight stays?',
                'answer' => 'Check-in time is 2:00 PM and check-out time is 12:00 PM (noon).',
                'keywords' => ['check-in', 'check-out', 'checkout', 'time', 'overnight'],
                'order' => 11,
            ],
            [
                'question' => 'Is there a discount for children?',
                'answer' => 'Yes! Children 5 years old and below have discounted entrance fee of ₱50 per head for day tours (regular is ₱100). For overnight stays, the entrance fee is ₱150 per head regardless of age.',
                'keywords' => ['discount', 'children', 'kids', 'child', 'age'],
                'order' => 12,
            ],
            [
                'question' => 'Can I rent a cottage without renting a room?',
                'answer' => 'Yes! You can rent cottages for day tours only. Big Cottage is ₱800, Small Cottage is ₱400. Entrance fees apply separately.',
                'keywords' => ['cottage only', 'no room', 'day tour', 'rent cottage'],
                'order' => 13,
            ],
            [
                'question' => 'What payment methods do you accept?',
                'answer' => 'We accept cash payments and bank transfers. Payment details will be provided upon booking confirmation.',
                'keywords' => ['payment', 'pay', 'cash', 'bank', 'transfer', 'gcash'],
                'order' => 14,
            ],
            [
                'question' => 'How do I make a reservation?',
                'answer' => 'You can make a reservation through our website by creating an account and selecting your preferred accommodation and dates. Our staff will confirm your booking.',
                'keywords' => ['book', 'reservation', 'reserve', 'booking'],
                'order' => 15,
            ],
        ];

        foreach ($faqs as $faq) {
            FAQ::create([
                'question' => $faq['question'],
                'answer' => $faq['answer'],
                'keywords' => $faq['keywords'],
                'is_active' => true,
                'order' => $faq['order'],
            ]);
        }
    }
}
