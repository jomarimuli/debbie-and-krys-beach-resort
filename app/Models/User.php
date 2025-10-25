<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable, HasRoles;

    protected $table = 'users';

    protected $fillable = [
        'google_id',
        'avatar',
        'name',
        'email',
        'email_verified_at',
        'phone',
        'address',
        'password',
        'password_changed_at',
        'status',
        'is_locked',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'password_changed_at' => 'datetime',
            'is_locked' => 'boolean',
        ];
    }
}
