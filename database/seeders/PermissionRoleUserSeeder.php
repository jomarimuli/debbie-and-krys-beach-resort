<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
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

            // faq
            'faq show',
            'faq create',
            'faq edit',
            'faq delete',

            // chat
            'chat access',
            'chat assign',
            'chat close',
            'chat auto reply'
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

        $adminRole->givePermissionTo('global access');

        $adminUser = User::firstOrCreate(
            // ['email' => 'admin@example.com'],
            // ['email' => 'jomarisingson04@gmail.com'],
            ['email' => 'castillolanzlaurence@gmail.com'],
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
        // STAFF ROLE - Operational Access (NO DELETE)
        // ============================================
        $staffRole = Role::firstOrCreate([
            'name' => 'staff',
            'guard_name' => 'web'
        ]);

        $staffRole->givePermissionTo([
            // Accommodations - View only
            'accommodation show',
            'accommodation-rate show',

            // Bookings - Create, Edit, Status Changes (NO DELETE)
            'booking show',
            'booking create',
            'booking edit',
            'booking confirm',
            'booking checkin',
            'booking checkout',
            'booking cancel',

            // Rebookings - Full operational control (NO DELETE)
            'rebooking show',
            'rebooking create',
            'rebooking edit',
            'rebooking approve',
            'rebooking complete',
            'rebooking cancel',

            // Payments - Create, Edit (NO DELETE)
            'payment show',
            'payment create',
            'payment edit',

            // Refunds - Create, Edit (NO DELETE)
            'refund show',
            'refund create',
            'refund edit',

            // Payment Accounts - View only
            'payment-account show',

            // Feedback - View and approve only (NO EDIT/DELETE)
            'feedback show',
            'feedback approve',

            // Gallery - View only
            'gallery show',

            // Announcements - View only
            'announcement show',

            // FAQ - View only
            'faq show',

            // Chat - Can respond to customers
            'chat access',
            'chat assign',
            'chat close',
        ]);

        $staffUser = User::firstOrCreate(
            // ['email' => 'staff@example.com'],
            // ['email' => 'pauljustina11@gmail.com'],
            ['email' => 'castillolanz2001@gmail.com'],
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
        // CUSTOMER ROLE - Limited Access (NO EDIT/DELETE except pending bookings)
        // ============================================
        $customerRole = Role::firstOrCreate([
            'name' => 'customer',
            'guard_name' => 'web'
        ]);

        $customerRole->givePermissionTo([
            // Accommodations - View to browse
            'accommodation show',
            'accommodation-rate show',

            // Bookings - Create and view own, edit only pending
            'booking show',
            'booking create',
            'booking edit', // Can edit but only pending bookings (enforced in controller)

            // Rebookings - Can request rebooking for own bookings
            'rebooking show',
            'rebooking create',

            // Payments - Can view own payments only
            'payment show',

            // Refunds - Can view own refunds only
            'refund show',

            // Feedback - Can create and view own
            'feedback show',
            'feedback create',

            // Gallery - View only
            'gallery show',

            // Announcements - View only
            'announcement show',

            // Chat - Can initiate chat with staff
            'chat access',
        ]);

        $customerUser = User::firstOrCreate(
            // ['email' => 'customer@example.com'],
            // ['email' => 'macalommark18u@gmail.com'],
            ['email' => 'lanzlac3231@gmail.com'],
            [
                'name' => 'Customer User',
                'phone' => '09987654321',
                'address' => 'Customer Address',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'password_changed_at' => now(),
                'status' => 'active',
            ]
        );

        $customerUser->assignRole($customerRole);
    }
}
