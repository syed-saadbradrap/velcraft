<?php

namespace App\Support;

class StoragePath
{
    public const IMAGE = 'regex:/^(?:images\/(?:shoes|hero|collections|catalog-extra|uploads|colors|buckles)\/)[a-zA-Z0-9\/_.-]+$/';

    public const MODEL = 'regex:/^models\/(?:shoes|buckles)\/[a-zA-Z0-9\/_.-]+$/';

    public const TEXTURE = 'regex:/^textures\/[a-zA-Z0-9\/_.-]+$/';

    public static function isAllowed(?string $path): bool
    {
        if ($path === null || $path === '') {
            return true;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return false;
        }

        return (bool) preg_match('/^(?:images\/(?:shoes|hero|collections|catalog-extra|uploads|colors|buckles)\/|models\/(?:shoes|buckles)\/|textures\/)[a-zA-Z0-9\/_.-]+$/', $path);
    }
}
