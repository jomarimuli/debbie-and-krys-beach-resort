<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Http\Requests\Gallery\StoreGalleryRequest;
use App\Http\Requests\Gallery\UpdateGalleryRequest;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    use HandlesImageUpload;

    public function __construct()
    {
        $this->middleware('permission:gallery show|global access')->only(['index', 'show']);
        $this->middleware('permission:gallery create|global access')->only(['create', 'store']);
        $this->middleware('permission:gallery edit|global access')->only(['edit', 'update']);
        $this->middleware('permission:gallery delete|global access')->only('destroy');
    }

    public function index(): Response
    {
        $galleries = Gallery::ordered()
            ->paginate(100);

        return Inertia::render('gallery/index', [
            'galleries' => $galleries,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('gallery/create');
    }

    public function store(StoreGalleryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadImage(
                $request->file('image'),
                'galleries'
            );
        }

        Gallery::create($data);

        return redirect()->route('galleries.index')
            ->with('success', 'Gallery image added successfully.');
    }

    public function show(Gallery $gallery): Response
    {
        return Inertia::render('gallery/show', [
            'gallery' => $gallery,
        ]);
    }

    public function edit(Gallery $gallery): Response
    {
        return Inertia::render('gallery/edit', [
            'gallery' => $gallery,
        ]);
    }

    public function update(UpdateGalleryRequest $request, Gallery $gallery): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image
            if ($gallery->image) {
                $this->deleteImage($gallery->image);
            }

            // Upload new image
            $data['image'] = $this->uploadImage(
                $request->file('image'),
                'galleries'
            );
        } else {
            // Remove image from update data if not provided
            unset($data['image']);
        }

        $gallery->update($data);

        return redirect()->route('galleries.show', $gallery)
            ->with('success', 'Gallery image updated successfully.');
    }

    public function destroy(Gallery $gallery): RedirectResponse
    {
        if ($gallery->image) {
            $this->deleteImage($gallery->image);
        }

        $gallery->delete();

        return redirect()->route('galleries.index')
            ->with('success', 'Gallery image deleted successfully.');
    }
}
