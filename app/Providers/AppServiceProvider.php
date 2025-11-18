<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use App\Services\AccommodationAvailabilityService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(AccommodationAvailabilityService::class, function ($app) {
            return new AccommodationAvailabilityService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('viewPulse', function (User $user) {
            return $user->hasPermissionTo('pulse access') || $user->hasPermissionTo('global access');
        });
    }
}
