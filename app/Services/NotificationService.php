<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Get all admin and staff email addresses
     */
    public static function getAdminStaffEmails(): array
    {
        return User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })
        ->where('status', 'active')
        ->whereNotNull('email')
        ->pluck('email')
        ->unique()
        ->toArray();
    }

    /**
     * Get only admin emails
     */
    public static function getAdminEmails(): array
    {
        return User::role('admin')
            ->where('status', 'active')
            ->whereNotNull('email')
            ->pluck('email')
            ->unique()
            ->toArray();
    }

    /**
     * Get only staff emails
     */
    public static function getStaffEmails(): array
    {
        return User::role('staff')
            ->where('status', 'active')
            ->whereNotNull('email')
            ->pluck('email')
            ->unique()
            ->toArray();
    }

    /**
     * Get all active user emails (admin, staff, customers)
     */
    public static function getAllActiveUserEmails(): array
    {
        return User::where('status', 'active')
            ->whereNotNull('email')
            ->pluck('email')
            ->unique()
            ->toArray();
    }

    /**
     * Get all active customer emails only
     */
    public static function getCustomerEmails(): array
    {
        return User::role('customer')
            ->where('status', 'active')
            ->whereNotNull('email')
            ->pluck('email')
            ->unique()
            ->toArray();
    }

    /**
     * Send emails in batches to avoid overwhelming the mail server
     * Returns the number of emails sent
     */
    public static function sendInBatches(array $recipients, $mailable, int $batchSize = 50): int
    {
        $chunks = array_chunk($recipients, $batchSize);
        $totalSent = 0;

        foreach ($chunks as $chunk) {
            try {
                Mail::to($chunk)->send($mailable);
                $totalSent += count($chunk);

                // Small delay between batches to avoid rate limiting
                if (count($chunks) > 1) {
                    sleep(1);
                }
            } catch (\Exception $e) {
                Log::error('Batch email failed: ' . $e->getMessage());
            }
        }

        return $totalSent;
    }
}
