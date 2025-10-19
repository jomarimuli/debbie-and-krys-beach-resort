<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Http\Requests\Accommodation\StoreAccommodationRequest;
use App\Http\Requests\Accommodation\UpdateAccommodationRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccommodationController extends Controller
{
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
            ->paginate(10);

        return Inertia::render('Accommodation/Index', [
            'accommodations' => $accommodations,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Accommodation/Create');
    }

    public function store(StoreAccommodationRequest $request): RedirectResponse
    {
        Accommodation::create($request->validated());

        return redirect()->route('accommodations.index')
            ->with('success', 'Accommodation created successfully.');
    }

    public function show(Accommodation $accommodation): Response
    {
        $accommodation->load('rates');

        return Inertia::render('Accommodation/Show', [
            'accommodation' => $accommodation,
        ]);
    }

    public function edit(Accommodation $accommodation): Response
    {
        return Inertia::render('Accommodation/Edit', [
            'accommodation' => $accommodation,
        ]);
    }

    public function update(UpdateAccommodationRequest $request, Accommodation $accommodation): RedirectResponse
    {
        $accommodation->update($request->validated());

        return redirect()->route('accommodations.index')
            ->with('success', 'Accommodation updated successfully.');
    }

    public function destroy(Accommodation $accommodation): RedirectResponse
    {
        $accommodation->delete();

        return redirect()->route('accommodations.index')
            ->with('success', 'Accommodation deleted successfully.');
    }
}
