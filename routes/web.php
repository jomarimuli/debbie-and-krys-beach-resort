<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\GitHubController;
use App\Http\Controllers\AccommodationController;
use App\Http\Controllers\AccommodationRateController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\RefundController;
use App\Http\Controllers\RebookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentAccountController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FAQController;
use App\Http\Controllers\FAQSearchController;
use App\Http\Controllers\ChatConversationController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\ChatAutoReplyController;
use App\Http\Controllers\CalendarController;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('google.callback');

// Public FAQ search (no auth required)
Route::post('/faq/search', [FAQSearchController::class, 'search'])->name('faq.search');
Route::post('/faq-search/{faqSearch}/feedback', [FAQSearchController::class, 'feedback'])->name('faq.feedback');
Route::get('/faq/popular', [FAQSearchController::class, 'popularQuestions']);

Route::middleware(['auth', 'verified', 'check.user.status'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/api/github-updates', [GitHubController::class, 'getUpdates']);

    Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
    Route::post('/users/{user}/lock', [UserController::class, 'lock'])->name('users.lock');
    Route::post('/users/{user}/unlock', [UserController::class, 'unlock'])->name('users.unlock');

    Route::resource('roles', RoleController::class)->except(['create', 'show', 'edit']);

    // Accommodations
    Route::resource('accommodations', AccommodationController::class);

    // Accommodation Rates
    Route::resource('accommodation-rates', AccommodationRateController::class);

    // Bookings
    Route::resource('bookings', BookingController::class);
    Route::post('bookings/{booking}/confirm', [BookingController::class, 'confirm'])
        ->name('bookings.confirm');
    Route::post('bookings/{booking}/check-in', [BookingController::class, 'checkIn'])
        ->name('bookings.checkIn');
    Route::post('bookings/{booking}/check-out', [BookingController::class, 'checkOut'])
        ->name('bookings.checkOut');
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel'])
        ->name('bookings.cancel');

    // Rebookings
    Route::get('bookings/{booking}/rebook', [RebookingController::class, 'create'])
        ->name('bookings.rebook');
    Route::resource('rebookings', RebookingController::class);
    Route::post('rebookings/{rebooking}/approve', [RebookingController::class, 'approve'])
        ->name('rebookings.approve');
    Route::post('rebookings/{rebooking}/reject', [RebookingController::class, 'reject'])
        ->name('rebookings.reject');
    Route::post('rebookings/{rebooking}/complete', [RebookingController::class, 'complete'])
        ->name('rebookings.complete');
    Route::post('/bookings/{booking}/revert-status', [BookingController::class, 'revertStatus'])
        ->name('bookings.revert-status');
    Route::post('rebookings/{rebooking}/cancel', [RebookingController::class, 'cancel'])
        ->name('rebookings.cancel');

    // Payments
    Route::resource('payments', PaymentController::class);
    Route::get('/payments/{payment}/reference-image', [PaymentController::class, 'showReferenceImage'])
        ->name('payment.reference-image');

    // Refunds
    Route::resource('refunds', RefundController::class);
    Route::get('/refunds/{refund}/reference-image', [RefundController::class, 'showReferenceImage'])
        ->name('refund.reference-image');

    // Payment Accounts
    Route::resource('payment-accounts', PaymentAccountController::class);

    // Feedbacks
    Route::resource('feedbacks', FeedbackController::class);
    Route::post('feedbacks/{feedback}/approve', [FeedbackController::class, 'approve'])->name('feedbacks.approve');
    Route::post('feedbacks/{feedback}/reject', [FeedbackController::class, 'reject'])->name('feedbacks.reject');

    // Galleries
    Route::resource('galleries', GalleryController::class);

    // Announcements
    Route::resource('announcements', AnnouncementController::class);

    // FAQs
    Route::resource('faqs', FAQController::class)->except(['show', 'create', 'edit']);
    Route::get('/faq/analytics', [FAQSearchController::class, 'analytics'])->name('faq.analytics');

    // Chat
    Route::get('/chat', [ChatConversationController::class, 'index'])->name('chat.index');
    Route::post('/chat', [ChatConversationController::class, 'store'])->name('chat.store');

    Route::get('/chat/auto-replies', [ChatAutoReplyController::class, 'index'])
        ->name('chat.auto-replies.index');
    Route::put('/chat/auto-replies/{autoReply}', [ChatAutoReplyController::class, 'update'])
        ->name('chat.auto-replies.update');

    Route::get('/chat/{conversation}', [ChatConversationController::class, 'show'])->name('chat.show');
    Route::post('/chat/{conversation}/assign', [ChatConversationController::class, 'assign'])->name('chat.assign');
    Route::post('/chat/{conversation}/close', [ChatConversationController::class, 'close'])->name('chat.close');
    Route::post('/chat/{conversation}/reopen', [ChatConversationController::class, 'reopen'])->name('chat.reopen');
    Route::post('/chat/{conversation}/messages', [ChatMessageController::class, 'store'])->name('chat.messages.store');

    // Calendar
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::get('/calendar/{date}', [CalendarController::class, 'show'])->name('calendar.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
