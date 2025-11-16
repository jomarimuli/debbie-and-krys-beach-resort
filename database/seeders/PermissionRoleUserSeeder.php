<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionRoleUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // global
            'global access',

            // pulse
            'pulse access',

            // customer
            'customer access',

            // staff
            'staff access',

            // user
            'user show',
            'user create',
            'user edit',
            'user delete',

            // role
            'role show',
            'role create',
            'role edit',
            'role delete',

            // accommodation
            'accommodation show',
            'accommodation create',
            'accommodation edit',
            'accommodation delete',

            // accommodation rate
            'accommodation-rate show',
            'accommodation-rate create',
            'accommodation-rate edit',
            'accommodation-rate delete',

            // booking
            'booking show',
            'booking create',
            'booking edit',
            'booking delete',
            'booking confirm',
            'booking checkin',
            'booking checkout',
            'booking cancel',

            // rebooking
            'rebooking show',
            'rebooking create',
            'rebooking edit',
            'rebooking delete',
            'rebooking approve',
            'rebooking complete',
            'rebooking cancel',

            // payment
            'payment show',
            'payment create',
            'payment edit',
            'payment delete',

            // refund
            'refund show',
            'refund create',
            'refund edit',
            'refund delete',

            // payment-account
            'payment-account show',
            'payment-account create',
            'payment-account edit',
            'payment-account delete',

            // feedback
            'feedback show',
            'feedback create',
            'feedback edit',
            'feedback delete',
            'feedback approve',

            // gallery
            'gallery show',
            'gallery create',
            'gallery edit',
            'gallery delete',

            // announcement
            'announcement show',
            'announcement create',
            'announcement edit',
            'announcement delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        // ============================================
        // ADMIN ROLE - Full Access
        // ============================================
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web'
        ]);

        // Admin has global access (all permissions)
        $adminRole->givePermissionTo('global access');

        // Create admin user
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'phone' => '09278210836',
                'address' => 'Admin Office',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'password_changed_at' => now(),
                'status' => 'active',
            ]
        );

        $adminUser->assignRole($adminRole);

        // ============================================
        // STAFF ROLE - Operational Access
        // ============================================
        $staffRole = Role::firstOrCreate([
            'name' => 'staff',
            'guard_name' => 'web'
        ]);

        $staffRole->givePermissionTo([
            // 'staff access',

            // Accommodations - View only
            'accommodation show',
            'accommodation-rate show',

            // Bookings - Full operational control
            'booking show',
            'booking create',
            'booking edit',
            'booking confirm',
            'booking checkin',
            'booking checkout',
            'booking cancel',

            // Rebookings - Full operational control
            'rebooking show',
            'rebooking create',
            'rebooking edit',
            'rebooking approve',
            'rebooking complete',
            'rebooking cancel',

            // Payments - Full control
            'payment show',
            'payment create',
            'payment edit',

            // Refunds - Full control
            'refund show',
            'refund create',
            'refund edit',

            // Payment Accounts - View only
            'payment-account show',

            // Feedback - Can view and approve
            'feedback show',
            'feedback approve',

            // Gallery - View only
            'gallery show',

            // Announcements - View only
            'announcement show',
        ]);

        // Create staff user
        $staffUser = User::firstOrCreate(
            ['email' => 'staff@example.com'],
            [
                'name' => 'Staff User',
                'phone' => '09123456789',
                'address' => 'Front Desk',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'password_changed_at' => now(),
                'status' => 'active',
            ]
        );

        $staffUser->assignRole($staffRole);

        // ============================================
        // CUSTOMER ROLE - Limited Access
        // ============================================
        $customerRole = Role::firstOrCreate([
            'name' => 'customer',
            'guard_name' => 'web'
        ]);

        $customerRole->givePermissionTo([
            // 'customer access',

            // Accommodations - View to browse
            'accommodation show',
            'accommodation-rate show',

            // Bookings - Can view own bookings only (controller handles ownership)
            'booking show',
            'booking create', // Can create own bookings

            // Rebookings - Can request rebooking for own bookings
            'rebooking show',
            'rebooking create',

            // Payments - Can view own payments
            'payment show',

            // Refunds - Can view own refunds
            'refund show',

            // Feedback - Can create and view
            'feedback show',
            'feedback create',

            // Gallery - View only
            'gallery show',

            // Announcements - View only
            'announcement show',
        ]);

        // Create customer user
        $customerUser = User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'Customer User',
                'phone' => '09987654321',
                'address' => 'Customer Address',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );

        $customerUser->assignRole($customerRole);
    }
}
