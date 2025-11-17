<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use GuzzleHttp\Client;

class GoogleController extends Controller
{
    public function redirect()
    {
        $driver = Socialite::driver('google');

        // Fix SSL issues in local development
        if (app()->environment('local')) {
            $driver->setHttpClient(new Client([
                'verify' => false // Disable SSL verification for local development
            ]));
        }

        return $driver->redirect();
    }

    public function callback()
    {
        try {
            $driver = Socialite::driver('google');

            // Fix SSL issues in local development
            if (app()->environment('local')) {
                $driver->setHttpClient(new Client([
                    'verify' => false // Disable SSL verification for local development
                ]));
            }

            $googleUser = $driver->user();

            // Check if user exists
            $user = User::where('email', $googleUser->email)->first();

            if ($user) {

                // Update Google ID and avatar if not set
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->id,
                        'avatar' => $googleUser->avatar,
                    ]);
                }

                // Check if user is active
                if (isset($user->status) && $user->status === 'inactive') {
                    return redirect('/login')->with('error', 'Your account is inactive. Please contact an administrator.');
                }
            } else {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'password' => Hash::make(Str::random(24)),
                    'email_verified_at' => now(),
                    'password_changed_at' => now(),
                    'status' => 'active',
                ]);

                // Assign admin role using Spatie Laravel Permission
                $user->assignRole('customer');
            }

            // Login the user
            Auth::login($user);

            // Redirect to intended destination
            return redirect()->intended('/dashboard')->with('success', 'Successfully logged in with Google!');

        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            return redirect('/login')->with('error', 'Authentication session expired. Please try again.');

        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Unable to login with Google. Please try again.');
        }
    }
}
