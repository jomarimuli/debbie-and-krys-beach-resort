<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait HandlesImageUpload
{
    /**
     * Upload single image
     */
    protected function uploadImage(UploadedFile $file, string $folder): string
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $sanitizedName = Str::slug($originalName);
        $timestamp = now()->timestamp;
        $filename = "{$sanitizedName}_{$timestamp}.{$extension}";

        $path = $file->storeAs($folder, $filename, 'public');

        return $path;
    }

    /**
     * Upload multiple images
     */
    protected function uploadImages(array $files, string $folder): array
    {
        $paths = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $paths[] = $this->uploadImage($file, $folder);
            }
        }

        return $paths;
    }

    /**
     * Delete single image
     */
    protected function deleteImage(?string $path): bool
    {
        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }

    /**
     * Delete multiple images
     */
    protected function deleteImages(?array $paths): bool
    {
        if (!$paths) {
            return false;
        }

        $existingPaths = array_filter($paths, fn($path) => Storage::disk('public')->exists($path));

        if (empty($existingPaths)) {
            return false;
        }

        return Storage::disk('public')->delete($existingPaths);
    }
}
