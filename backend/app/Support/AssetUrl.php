<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class AssetUrl
{
    public static function publicUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return null;
        }

        if (! StoragePath::isAllowed($path)) {
            return null;
        }

        return Storage::disk(config('filesystems.default'))->url($path);
    }
}
