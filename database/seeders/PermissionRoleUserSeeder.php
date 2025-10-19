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

            // payment
            'payment show',
            'payment create',
            'payment edit',
            'payment delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        // Create admin role
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web'
        ]);

        // Give permission/s to admin
        // $adminRole->givePermissionTo(Permission::all());
        $adminRole->givePermissionTo('global access');

        // Create admin user
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'admin',
                'phone' => '09278210836',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'password_changed_at' => now(),
                'status' => 'active',
            ]
        );

        $adminUser->assignRole($adminRole);

        // Create staff role
        $staffRole = Role::firstOrCreate([
            'name' => 'staff',
            'guard_name' => 'web'
        ]);

        $staffRole->givePermissionTo([
            'staff access',
        ]);

        // Create staff user
        $staffUser = User::firstOrCreate(
            ['email' => 'staff@example.com'],
            [
                'name' => 'staff',
                'phone' => null,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );

        $staffUser->assignRole($staffRole);

        // Create customer role
        $customerRole = Role::firstOrCreate([
            'name' => 'customer',
            'guard_name' => 'web'
        ]);

        $customerRole->givePermissionTo([
            'customer access',
        ]);

        // Create customer user
        $customerUser = User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'customer',
                'phone' => null,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );

        $customerUser->assignRole($customerRole);
    }
}
