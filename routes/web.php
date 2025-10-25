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
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\AnnouncementController;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('google.callback');

Route::middleware(['auth', 'verified', 'check.user.status'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

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
        ->name('bookings.check-in');
    Route::post('bookings/{booking}/check-out', [BookingController::class, 'checkOut'])
        ->name('bookings.check-out');
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel'])
        ->name('bookings.cancel');

    // Payments
    Route::resource('payments', PaymentController::class);
    Route::get('/payments/{payment}/reference-image', [PaymentController::class, 'showReferenceImage'])
        ->name('payment.reference-image');

    // Feedbacks
    Route::resource('feedbacks', FeedbackController::class);
    Route::post('feedbacks/{feedback}/approve', [FeedbackController::class, 'approve'])->name('feedbacks.approve');
    Route::post('feedbacks/{feedback}/reject', [FeedbackController::class, 'reject'])->name('feedbacks.reject');

    // Galleries
    Route::resource('galleries', GalleryController::class);

    // Announcements
    Route::resource('announcements', AnnouncementController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
