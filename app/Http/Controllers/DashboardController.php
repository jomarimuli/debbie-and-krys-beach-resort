<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Rebooking;
use App\Models\Feedback;
use App\Models\Accommodation;
use App\Models\FAQSearch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $isCustomer = $user->hasRole('customer');

        if ($isCustomer) {
            return $this->customerDashboard();
        }

        return $this->adminStaffDashboard();
    }

    protected function adminStaffDashboard(): Response
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // Booking Statistics
        $totalBookings = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $confirmedBookings = Booking::where('status', 'confirmed')->count();
        $checkedInToday = Booking::where('status', 'checked_in')
            ->whereDate('check_in_date', $today)
            ->count();

        $bookingsByStatus = Booking::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // Financial Statistics
        $monthlyRevenue = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $totalRevenue = Payment::sum('amount');

        $unpaidBookingsData = Booking::select('id', 'total_amount', 'paid_amount')
            ->where('status', '!=', 'cancelled')
            ->whereRaw('total_amount > paid_amount')
            ->get();

        $unpaidBookings = $unpaidBookingsData->count();
        $totalUnpaidAmount = $unpaidBookingsData->sum(function($booking) {
            return $booking->total_amount - $booking->paid_amount;
        });

        $paymentsThisMonth = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->count();

        // Rebooking Statistics
        $pendingRebookings = Rebooking::where('status', 'pending')->count();
        $approvedRebookings = Rebooking::where('status', 'approved')->count();

        // Accommodation Statistics
        $totalAccommodations = Accommodation::where('is_active', true)->count();
        $occupiedAccommodations = Booking::where('status', 'checked_in')
            ->with('accommodations')
            ->get()
            ->pluck('accommodations')
            ->flatten()
            ->pluck('accommodation_id')
            ->unique()
            ->count();

        // Feedback Statistics
        $pendingFeedback = Feedback::where('status', 'pending')->count();
        $averageRating = Feedback::where('status', 'approved')->avg('rating');

        // FAQ Statistics
        $totalFAQSearches = FAQSearch::count();
        $helpfulCount = FAQSearch::where('was_helpful', true)->count();
        $notHelpfulCount = FAQSearch::where('was_helpful', false)->count();
        $noMatchCount = FAQSearch::whereNull('faq_id')->count();

        // Recent Activities
        $recentBookings = Booking::with(['accommodations.accommodation', 'createdBy'])
            ->latest()
            ->take(5)
            ->get();

        $upcomingCheckIns = Booking::whereIn('status', ['pending', 'confirmed'])
            ->whereDate('check_in_date', '>=', $today)
            ->orderBy('check_in_date')
            ->take(5)
            ->get();

        $revenueChartData = $this->getRevenueChartData(7);

        return Inertia::render('dashboard', [
            'stats' => [
                'bookings' => [
                    'total' => $totalBookings,
                    'pending' => $pendingBookings,
                    'confirmed' => $confirmedBookings,
                    'checked_in_today' => $checkedInToday,
                    'by_status' => $bookingsByStatus,
                ],
                'financial' => [
                    'monthly_revenue' => (float) $monthlyRevenue,
                    'total_revenue' => (float) $totalRevenue,
                    'unpaid_bookings' => $unpaidBookings,
                    'total_unpaid_amount' => (float) $totalUnpaidAmount,
                    'payments_this_month' => $paymentsThisMonth,
                ],
                'rebookings' => [
                    'pending' => $pendingRebookings,
                    'approved' => $approvedRebookings,
                ],
                'accommodations' => [
                    'total' => $totalAccommodations,
                    'occupied' => $occupiedAccommodations,
                    'available' => $totalAccommodations - $occupiedAccommodations,
                ],
                'feedback' => [
                    'pending' => $pendingFeedback,
                    'average_rating' => round($averageRating ?? 0, 1),
                ],
                'faq' => [
                    'total_searches' => $totalFAQSearches,
                    'helpful_count' => $helpfulCount,
                    'not_helpful_count' => $notHelpfulCount,
                    'no_match_count' => $noMatchCount,
                ],
            ],
            'recent_bookings' => $recentBookings,
            'upcoming_check_ins' => $upcomingCheckIns,
            'revenue_chart' => $revenueChartData,
        ]);
    }

    protected function customerDashboard(): Response
    {
        $userId = auth()->id();
        $today = Carbon::today();

        $totalBookings = Booking::where('created_by', $userId)->count();
        $activeBookings = Booking::where('created_by', $userId)
            ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->count();
        $completedBookings = Booking::where('created_by', $userId)
            ->where('status', 'checked_out')
            ->count();

        $totalSpent = Payment::whereHas('booking', function ($query) use ($userId) {
            $query->where('created_by', $userId);
        })->sum('amount');

        $unpaidBookingsData = Booking::where('created_by', $userId)
            ->where('status', '!=', 'cancelled')
            ->select('id', 'total_amount', 'paid_amount')
            ->whereRaw('total_amount > paid_amount')
            ->get();

        $unpaidAmount = $unpaidBookingsData->sum(function($booking) {
            return $booking->total_amount - $booking->paid_amount;
        });

        $recentBookings = Booking::where('created_by', $userId)
            ->with(['accommodations.accommodation'])
            ->latest()
            ->take(5)
            ->get();

        $upcomingBookings = Booking::where('created_by', $userId)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereDate('check_in_date', '>=', $today)
            ->orderBy('check_in_date')
            ->take(5)
            ->get();

        $pendingRebookings = Rebooking::whereHas('originalBooking', function ($query) use ($userId) {
            $query->where('created_by', $userId);
        })
        ->where('status', 'pending')
        ->count();

        return Inertia::render('dashboard', [
            'stats' => [
                'bookings' => [
                    'total' => $totalBookings,
                    'active' => $activeBookings,
                    'completed' => $completedBookings,
                ],
                'financial' => [
                    'total_spent' => (float) $totalSpent,
                    'unpaid_amount' => (float) $unpaidAmount,
                ],
                'rebookings' => [
                    'pending' => $pendingRebookings,
                ],
            ],
            'recent_bookings' => $recentBookings,
            'upcoming_bookings' => $upcomingBookings,
        ]);
    }

    protected function getRevenueChartData(int $days = 7): array
    {
        $data = [];
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $revenue = Payment::whereDate('payment_date', $date)->sum('amount');

            $data[] = [
                'date' => $date->format('M d'),
                'revenue' => (float) $revenue,
            ];
        }

        return $data;
    }
}
