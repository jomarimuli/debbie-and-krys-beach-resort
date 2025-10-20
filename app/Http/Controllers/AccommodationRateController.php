<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Models\AccommodationRate;
use App\Http\Requests\AccommodationRate\StoreAccommodationRateRequest;
use App\Http\Requests\AccommodationRate\UpdateAccommodationRateRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccommodationRateController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:accommodation-rate show|global access')->only(['index', 'show']);
        $this->middleware('permission:accommodation-rate create|global access')->only(['create', 'store']);
        $this->middleware('permission:accommodation-rate edit|global access')->only(['edit', 'update']);
        $this->middleware('permission:accommodation-rate delete|global access')->only('destroy');
    }

    public function index(): Response
    {
        $rates = AccommodationRate::with('accommodation')
            ->latest()
            ->paginate(10);

        return Inertia::render('accommodation-rate/index', [
            'rates' => $rates,
        ]);
    }

    public function create(): Response
    {
        $accommodations = Accommodation::active()->orderBy('name')->get();

        return Inertia::render('accommodation-rate/create', [
            'accommodations' => $accommodations,
        ]);
    }

    public function store(StoreAccommodationRateRequest $request): RedirectResponse
    {
        AccommodationRate::create($request->validated());

        return redirect()->route('accommodation-rates.index')
            ->with('success', 'Accommodation rate created successfully.');
    }

    public function show(AccommodationRate $accommodationRate): Response
    {
        $this->authorize('accommodation-rate show');

        $accommodationRate->load('accommodation');

        return Inertia::render('accommodation-rate/show', [
            'rate' => $accommodationRate,
        ]);
    }

    public function edit(AccommodationRate $accommodationRate): Response
    {
        $accommodations = Accommodation::active()->orderBy('name')->get();

        return Inertia::render('accommodation-rate/edit', [
            'rate' => $accommodationRate,
            'accommodations' => $accommodations,
        ]);
    }

    public function update(UpdateAccommodationRateRequest $request, AccommodationRate $accommodationRate): RedirectResponse
    {
        $accommodationRate->update($request->validated());

        return redirect()->route('accommodation-rates.index')
            ->with('success', 'Accommodation rate updated successfully.');
    }

    public function destroy(AccommodationRate $accommodationRate): RedirectResponse
    {
        $accommodationRate->delete();

        return redirect()->route('accommodation-rates.index')
            ->with('success', 'Accommodation rate deleted successfully.');
    }
}
