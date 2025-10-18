<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\GitHubController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\CottageController;
use App\Http\Controllers\EntranceFeeController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\GuestBookingController;
use App\Http\Controllers\WalkInBookingController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('google.callback');

Route::prefix('guest-bookings')->name('guest-bookings.')->group(function () {
    Route::get('/create', [GuestBookingController::class, 'create'])->name('create');
    Route::post('/', [GuestBookingController::class, 'store'])->name('store');
    Route::get('/{bookingNumber}', [GuestBookingController::class, 'show'])->name('show');
});

Route::middleware(['auth', 'verified', 'check.user.status'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/api/github-updates', [GitHubController::class, 'getUpdates']);

    Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
    Route::post('/users/{user}/lock', [UserController::class, 'lock'])->name('users.lock');
    Route::post('/users/{user}/unlock', [UserController::class, 'unlock'])->name('users.unlock');

    Route::resource('roles', RoleController::class)->except(['create', 'show', 'edit']);

    Route::resource('rooms', RoomController::class);
    Route::resource('cottages', CottageController::class);
    Route::resource('entrance-fees', EntranceFeeController::class);

    Route::resource('bookings', BookingController::class)->except(['destroy']);
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');

    // Walk-In Bookings (Staff/Admin only)
    Route::prefix('walk-in-bookings')->name('walk-in-bookings.')->group(function () {
        Route::get('/', [WalkInBookingController::class, 'index'])->name('index');
        Route::get('/create', [WalkInBookingController::class, 'create'])->name('create');
        Route::post('/', [WalkInBookingController::class, 'store'])->name('store');
        Route::get('/{walkInBooking}', [WalkInBookingController::class, 'show'])->name('show');
    });

    // Admin only - Delete bookings
    Route::delete('bookings/{booking}', [BookingController::class, 'destroy'])
        ->name('bookings.destroy')
        ->middleware('can:global access');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
