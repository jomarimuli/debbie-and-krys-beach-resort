<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = auth()->user();

            if (!$user->hasPermissionTo('global access')) {
                $routeName = $request->route()->getName();

                switch ($routeName) {
                    case 'users.index':
                        if (!$user->hasPermissionTo('user show')) {
                            abort(403, 'Unauthorized: Missing user show permission');
                        }
                        break;

                    case 'users.show':
                        if (!$user->hasPermissionTo('user show')) {
                            abort(403, 'Unauthorized: Missing user show permission');
                        }
                        break;

                    case 'users.store':
                        if (!$user->hasPermissionTo('user create')) {
                            abort(403, 'Unauthorized: Missing user create permission');
                        }
                        break;

                    case 'users.update':
                        if (!$user->hasPermissionTo('user edit')) {
                            abort(403, 'Unauthorized: Missing user edit permission');
                        }
                        break;

                    case 'users.destroy':
                        if (!$user->hasPermissionTo('user delete')) {
                            abort(403, 'Unauthorized: Missing user delete permission');
                        }
                        break;
                }
            }

            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $query = User::with('roles');

        // Apply search if provided
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhereHas('roles', function ($rq) use ($search) {
                    $rq->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Apply column filters
        if ($request->filled('filters')) {
            $filters = $request->filters;

            if (isset($filters['name']) && !empty($filters['name'])) {
                $nameFilters = is_array($filters['name']) ? $filters['name'] : [$filters['name']];
                $query->whereIn('name', $nameFilters);
            }

            if (isset($filters['status_display']) && !empty($filters['status_display'])) {
                $statusFilters = is_array($filters['status_display'])
                    ? $filters['status_display']
                    : explode(',', $filters['status_display']);
                $query->whereIn('status', array_filter($statusFilters));
            }

            if (isset($filters['email_verified_display']) && !empty($filters['email_verified_display'])) {
                $emailVerifiedFilters = is_array($filters['email_verified_display'])
                    ? $filters['email_verified_display']
                    : explode(',', $filters['email_verified_display']);

                $query->where(function ($q) use ($emailVerifiedFilters) {
                    foreach ($emailVerifiedFilters as $status) {
                        if ($status === 'verified') {
                            $q->orWhereNotNull('email_verified_at');
                        } elseif ($status === 'unverified') {
                            $q->orWhereNull('email_verified_at');
                        }
                    }
                });
            }

            if (isset($filters['roles_display']) && !empty($filters['roles_display'])) {
                $roleFilters = is_array($filters['roles_display'])
                    ? $filters['roles_display']
                    : explode(',', $filters['roles_display']);

                $query->whereHas('roles', function ($rq) use ($roleFilters) {
                    $rq->whereIn('name', array_filter($roleFilters));
                });
            }
        }

        // Apply sorting with validation
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');

        $allowedSortFields = [
            'name',
            'email',
            'status',
            'created_at',
            'updated_at',
            'email_verified_display',
            'email_verified'
        ];

        if (!in_array($sortField, $allowedSortFields) || !is_string($sortField)) {
            $sortField = 'name';
        }

        $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'asc';

        if ($sortField === 'email_verified' || $sortField === 'email_verified_display') {
            $query->orderByRaw('email_verified_at IS NOT NULL ' . $sortDirection);
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $perPage = $request->get('per_page', 10);
        $users = $query->paginate($perPage)->withQueryString();

        // Transform data
        $transformedUsers = $users->through(function ($user) {
            return [
                'id' => $user->id,
                'name' => ucwords($user->name),
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'status' => $user->status,
                'status_label' => ucfirst($user->status),
                'email_verified_at' => $user->email_verified_at,
                'email_verified' => $user->email_verified_at ? 'Verified' : 'Unverified',
                'email_verified_status' => $user->email_verified_at ? 'verified' : 'unverified',
                'password_changed_at' => $user->password_changed_at,
                'password_changed' => $user->password_changed_at ? 'Changed' : 'Not Changed',
                'password_changed_status' => $user->password_changed_at ? 'changed' : 'not-changed',
                'roles' => $user->roles->pluck('name')->toArray(),
                'roles_text' => $user->roles->pluck('name')->implode(', ') ?: 'No roles',
                'roles_count' => $user->roles->count(),
                'can_edit' => $user->id !== 1 && (!$user->hasRole('admin') || auth()->user()->hasRole('admin')),
                'can_delete' => $user->id !== 1 && !$user->hasRole('admin'),
                'is_admin' => $user->hasRole('admin'),
                'created_at' => $user->created_at->format('M d, Y'),
                'updated_at' => $user->updated_at->format('M d, Y'),
                'is_locked' => $user->is_locked,
                'locked_at' => $user->locked_at,
            ];
        });

        $availableRoles = Role::all()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'label' => ucfirst($role->name),
            ];
        });

        $filterOptions = $this->getFilterOptions();

        return Inertia::render('users/index', [
            'users' => $transformedUsers,
            'availableRoles' => $availableRoles,
            'filterOptions' => $filterOptions,
            'queryParams' => $request->only(['search', 'sort', 'direction', 'per_page', 'filters']),
        ]);
    }

    private function getFilterOptions()
    {
        return [
            'status_display' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
            'email_verified_display' => [
                ['value' => 'verified', 'label' => 'Verified'],
                ['value' => 'unverified', 'label' => 'Unverified'],
            ],
            'roles_display' => Role::all()->map(function ($role) {
                return [
                    'value' => $role->name,
                    'label' => ucfirst($role->name)
                ];
            })->values()->toArray(),
            'roles' => Role::all()->pluck('name')->toArray(),
        ];
    }

    private function getPasswordValidationRules($isUpdate = false, $required = true)
    {
        $rules = [
            'min:8',
            'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/'
        ];

        if ($required && !$isUpdate) {
            array_unshift($rules, 'required');
        } elseif ($isUpdate) {
            array_unshift($rules, 'nullable');
        }

        return $rules;
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'password' => $this->getPasswordValidationRules(),
            'password_confirmation' => ['required', 'same:password'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'email_verified_at' => ['nullable', 'boolean'],
            'password_changed_at' => ['nullable', 'boolean'],
            'roles' => ['array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'password' => Hash::make($request->password),
            'status' => $request->status,
            'email_verified_at' => $request->email_verified_at ? now() : null,
            'password_changed_at' => $request->password_changed_at ? now() : null,
        ]);

        if ($request->roles) {
            $user->assignRole($request->roles);
        }

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        // Prevent editing user ID 1 (super admin)
        if ($user->id === 1) {
            return redirect()->back()->with('error', 'Super admin user cannot be edited.');
        }

        // Prevent editing admin user if current user is not admin
        if ($user->hasRole('admin') && !auth()->user()->hasRole('admin')) {
            return redirect()->back()->with('error', 'You cannot edit admin users.');
        }

        $passwordRules = $this->getPasswordValidationRules(true, false);

        $validationRules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'password' => $passwordRules,
            'status' => ['required', 'string', 'in:active,inactive'],
            'email_verified_at' => ['nullable', 'boolean'],
            'password_changed_at' => ['nullable', 'boolean'],
            'roles' => ['array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ];

        // Add password confirmation validation only if password is provided
        if ($request->filled('password')) {
            $validationRules['password_confirmation'] = ['required', 'same:password'];
        }

        $request->validate($validationRules);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'status' => $request->status,
            'email_verified_at' => $request->email_verified_at ? now() : null,
            'password_changed_at' => $request->password_changed_at ? now() : null,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
            $updateData['password_changed_at'] = now();
        }

        $user->update($updateData);
        $user->syncRoles($request->roles ?? []);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        // Prevent deleting user ID 1 (super admin)
        if ($user->id === 1) {
            return redirect()->back()->with('error', 'Super admin user cannot be deleted.');
        }

        // Prevent deleting admin users
        if ($user->hasRole('admin')) {
            return redirect()->back()->with('error', 'Admin users cannot be deleted.');
        }

        // Prevent users from deleting themselves
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    public function lock(User $user)
    {
        if ($user->id === 1) {
            return back()->with('error', 'Super admin cannot be locked.');
        }

        if ($user->hasRole('admin')) {
            return back()->with('error', 'Admin users cannot be locked.');
        }

        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot lock your own account.');
        }

        $user->update(['is_locked' => true]);

        return back()->with('success', 'User account locked successfully.');
    }

    public function unlock(User $user)
    {
        $user->update(['is_locked' => false]);

        return back()->with('success', 'User account unlocked successfully.');
    }
}
