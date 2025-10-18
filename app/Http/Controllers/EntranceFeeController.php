<?php

namespace App\Http\Controllers;

use App\Models\EntranceFee;
use App\Http\Requests\StoreEntranceFeeRequest;
use App\Http\Requests\UpdateEntranceFeeRequest;
use Illuminate\Http\Request;

class EntranceFeeController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!auth()->user()->can('global access') && !auth()->user()->can('entrance fee access')) {
                abort(403, 'Unauthorized');
            }
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $query = EntranceFee::query();

        // Apply search if provided
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('rental_type', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply column filters
        if ($request->filled('filters')) {
            $filters = $request->filters;

            if (isset($filters['rental_type']) && !empty($filters['rental_type'])) {
                $rentalTypeFilters = is_array($filters['rental_type']) ? $filters['rental_type'] : [$filters['rental_type']];
                $query->whereIn('rental_type', $rentalTypeFilters);
            }

            if (isset($filters['is_active']) && !empty($filters['is_active'])) {
                $statusFilters = is_array($filters['is_active'])
                    ? $filters['is_active']
                    : explode(',', $filters['is_active']);

                $query->where(function ($q) use ($statusFilters) {
                    foreach ($statusFilters as $status) {
                        if ($status === 'active') {
                            $q->orWhere('is_active', true);
                        } elseif ($status === 'inactive') {
                            $q->orWhere('is_active', false);
                        }
                    }
                });
            }
        }

        // Apply sorting with validation
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSortFields = [
            'name',
            'rental_type',
            'price',
            'min_age',
            'max_age',
            'created_at',
            'updated_at',
        ];

        if (!in_array($sortField, $allowedSortFields) || !is_string($sortField)) {
            $sortField = 'created_at';
        }

        $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'desc';
        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->get('per_page', 10);
        $entranceFees = $query->paginate($perPage)->withQueryString();

        // Transform data
        $transformedEntranceFees = $entranceFees->through(function ($fee) {
            $ageRange = 'All ages';
            if ($fee->min_age !== null && $fee->max_age !== null) {
                $ageRange = "{$fee->min_age} - {$fee->max_age} years";
            } elseif ($fee->min_age !== null) {
                $ageRange = "{$fee->min_age}+ years";
            } elseif ($fee->max_age !== null) {
                $ageRange = "Up to {$fee->max_age} years";
            }

            return [
                'id' => $fee->id,
                'name' => $fee->name,
                'rental_type' => $fee->rental_type,
                'rental_type_label' => ucfirst(str_replace('_', ' ', $fee->rental_type)),
                'price' => $fee->price,
                'formatted_price' => number_format($fee->price, 2),
                'min_age' => $fee->min_age,
                'max_age' => $fee->max_age,
                'age_range' => $ageRange,
                'description' => $fee->description,
                'is_active' => $fee->is_active,
                'status_label' => $fee->is_active ? 'Active' : 'Inactive',
                'created_at' => $fee->created_at->format('M d, Y'),
                'updated_at' => $fee->updated_at->format('M d, Y'),
            ];
        });

        $filterOptions = $this->getFilterOptions();

        return inertia('entrance-fees/index', [
            'entranceFees' => $transformedEntranceFees,
            'filterOptions' => $filterOptions,
            'queryParams' => $request->only(['search', 'sort', 'direction', 'per_page', 'filters']),
        ]);
    }

    private function getFilterOptions()
    {
        // Simpler approach with fixed options instead of dynamic query
        return [
            'rental_type' => [
                ['value' => 'day_tour', 'label' => 'Day Tour'],
                ['value' => 'overnight', 'label' => 'Overnight'],
            ],
            'is_active' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
        ];
    }

    public function store(StoreEntranceFeeRequest $request)
    {
        EntranceFee::create($request->validated());

        return redirect()->route('entrance-fees.index')
            ->with('success', 'Entrance fee created successfully');
    }

    public function update(UpdateEntranceFeeRequest $request, EntranceFee $entranceFee)
    {
        $entranceFee->update($request->validated());

        return redirect()->route('entrance-fees.index')
            ->with('success', 'Entrance fee updated successfully');
    }

    public function destroy(EntranceFee $entranceFee)
    {
        $entranceFee->delete();

        return redirect()->route('entrance-fees.index')
            ->with('success', 'Entrance fee deleted successfully');
    }
}
