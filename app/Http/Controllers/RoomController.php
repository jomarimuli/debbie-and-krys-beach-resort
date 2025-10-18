<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    use HandlesImageUpload;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!auth()->user()->can('global access') && !auth()->user()->can('room access')) {
                abort(403, 'Unauthorized');
            }
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $query = Room::query();

        // Apply search if provided
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply column filters
        if ($request->filled('filters')) {
            $filters = $request->filters;

            if (isset($filters['size']) && !empty($filters['size'])) {
                $sizeFilters = is_array($filters['size']) ? $filters['size'] : [$filters['size']];
                $query->whereIn('size', $sizeFilters);
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
            'size',
            'max_pax',
            'day_tour_price',
            'overnight_price',
            'quantity',
            'created_at',
            'updated_at',
        ];

        if (!in_array($sortField, $allowedSortFields) || !is_string($sortField)) {
            $sortField = 'created_at';
        }

        $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'desc';
        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->get('per_page', 10);
        $rooms = $query->paginate($perPage)->withQueryString();

        // Transform data
        $transformedRooms = $rooms->through(function ($room) {
            return [
                'id' => $room->id,
                'name' => $room->name,
                'size' => $room->size,
                'size_label' => ucfirst($room->size),
                'description' => $room->description,
                'max_pax' => $room->max_pax,
                'day_tour_price' => $room->day_tour_price,
                'formatted_day_tour_price' => number_format($room->day_tour_price, 2),
                'overnight_price' => $room->overnight_price,
                'formatted_overnight_price' => $room->overnight_price ? number_format($room->overnight_price, 2) : null,
                'quantity' => $room->quantity,
                'has_ac' => $room->has_ac,
                'free_entrance_count' => $room->free_entrance_count,
                'free_cottage_size' => $room->free_cottage_size,
                'excess_pax_fee' => $room->excess_pax_fee,
                'formatted_excess_pax_fee' => number_format($room->excess_pax_fee, 2),
                'images' => $room->images,
                'is_active' => $room->is_active,
                'status_label' => $room->is_active ? 'Active' : 'Inactive',
                'created_at' => $room->created_at->format('M d, Y'),
                'updated_at' => $room->updated_at->format('M d, Y'),
            ];
        });

        $filterOptions = $this->getFilterOptions();

        return inertia('rooms/index', [
            'rooms' => $transformedRooms,
            'filterOptions' => $filterOptions,
            'queryParams' => $request->only(['search', 'sort', 'direction', 'per_page', 'filters']),
        ]);
    }

    private function getFilterOptions()
    {
        return [
            'size' => [
                ['value' => 'big', 'label' => 'Big'],
                ['value' => 'small', 'label' => 'Small'],
            ],
            'is_active' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
        ];
    }

    public function store(StoreRoomRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('images')) {
            $data['images'] = $this->uploadImages($request->file('images'), 'rooms');
        }

        Room::create($data);

        return redirect()->route('rooms.index')
            ->with('success', 'Room created successfully');
    }

    public function update(UpdateRoomRequest $request, Room $room)
    {
        $data = $request->validated();

        $existingImages = $request->input('existing_images', []);
        $newImages = [];

        if ($request->hasFile('images')) {
            $newImages = $this->uploadImages($request->file('images'), 'rooms');
        }

        $data['images'] = array_merge($existingImages, $newImages);

        if ($room->images) {
            $removedImages = array_diff($room->images, $existingImages);
            if (!empty($removedImages)) {
                $this->deleteImages($removedImages);
            }
        }

        $room->update($data);

        return redirect()->route('rooms.index')
            ->with('success', 'Room updated successfully');
    }

    public function destroy(Room $room)
    {
        if ($room->images) {
            $this->deleteImages($room->images);
        }

        $room->delete();

        return redirect()->route('rooms.index')
            ->with('success', 'Room deleted successfully');
    }
}
