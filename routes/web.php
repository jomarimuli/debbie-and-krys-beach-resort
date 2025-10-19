<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\GitHubController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
