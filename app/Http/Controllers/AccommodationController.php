<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Http\Requests\Accommodation\StoreAccommodationRequest;
use App\Http\Requests\Accommodation\UpdateAccommodationRequest;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AccommodationController extends Controller
{
    use HandlesImageUpload;

    public function __construct()
    {
        $this->middleware('permission:accommodation show|global access')->only(['index', 'show']);
        $this->middleware('permission:accommodation create|global access')->only(['create', 'store']);
        $this->middleware('permission:accommodation edit|global access')->only(['edit', 'update']);
        $this->middleware('permission:accommodation delete|global access')->only('destroy');
    }

    public function index(): Response
    {
        $accommodations = Accommodation::with('rates')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(100);

        return Inertia::render('accommodation/index', [
            'accommodations' => $accommodations,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('accommodation/create');
    }

    public function store(StoreAccommodationRequest $request): RedirectResponse
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            // Handle image uploads - specify 'accommodations' subfolder
            if ($request->hasFile('images')) {
                $data['images'] = $this->uploadImages($request->file('images'), 'accommodations');
            }

            Accommodation::create($data);

            DB::commit();

            return redirect()->route('accommodations.index')
                ->with('success', 'Accommodation created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Accommodation $accommodation): Response
    {
        $accommodation->load('rates');

        return Inertia::render('accommodation/show', [
            'accommodation' => $accommodation,
        ]);
    }

    public function edit(Accommodation $accommodation): Response
    {
        // Customers cannot edit accommodations
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('accommodation/edit', [
            'accommodation' => $accommodation,
        ]);
    }

    public function update(UpdateAccommodationRequest $request, Accommodation $accommodation): RedirectResponse
    {
        // Customers cannot update accommodations
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        DB::beginTransaction();
        try {
            $data = $request->validated();

            $existingImages = $request->input('existing_images', []);
            $imagesToDelete = array_diff($accommodation->images ?? [], $existingImages);

            // Delete removed images
            if (!empty($imagesToDelete)) {
                $this->deleteImages($imagesToDelete);
            }

            // Upload new images - specify 'accommodations' subfolder
            $newImages = [];
            if ($request->hasFile('images')) {
                $newImages = $this->uploadImages($request->file('images'), 'accommodations');
            }

            // Merge existing and new images
            $data['images'] = array_merge($existingImages, $newImages);

            $accommodation->update($data);

            DB::commit();

            return redirect()->route('accommodations.index')
                ->with('success', 'Accommodation updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function destroy(Accommodation $accommodation): RedirectResponse
    {
        DB::beginTransaction();
        try {
            // Delete all images
            if ($accommodation->images) {
                $this->deleteImages($accommodation->images);
            }

            $accommodation->delete();

            DB::commit();

            return redirect()->route('accommodations.index')
                ->with('success', 'Accommodation deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }
}
