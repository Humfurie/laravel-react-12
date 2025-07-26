<?php

namespace App\Services;
class PermissionParser
{
    /**
     * Extract action from permission string
     *
     * @param string $permission e.g., "users.viewAny"
     * @return string e.g., "viewAny"
     */
    public static function extractAction(string $permission): string
    {
        // Split by dot and get the last part
        $parts = explode('.', $permission);
        return end($parts);
    }

    /**
     * Extract resource from permission string
     *
     * @param string $permission e.g., "users.viewAny"
     * @return string e.g., "users"
     */
    public static function extractResource(string $permission): string
    {
        // Split by dot and get the first part
        $parts = explode('.', $permission);
        return $parts[0];
    }

    /**
     * Parse multiple permissions and extract actions
     *
     * @param array $permissions e.g., ["users.viewAny", "users.create", "roles.delete"]
     * @return array e.g., ["viewAny", "create", "delete"]
     */
    public static function extractActions(array $permissions): array
    {
        return array_map([self::class, 'extractAction'], $permissions);
    }

    /**
     * Parse permission with wildcard support
     *
     * @param array|string $permission
     * @return array ['resource' => string, 'action' => string]
     */
    public static function parse(array|string $permission): array
    {
        if (is_array($permission)) {
            $rolePermissions = [];

            foreach ($permission as $permissionPart) {
                $parts = explode('.', $permissionPart);
                $resource = $parts[0];  // 'users' or 'roles'
                $action = $parts[1];    // 'viewAny', 'create', etc.

                // Group actions under each resource
                if (!isset($rolePermissions[$resource])) {
                    $rolePermissions[$resource] = [];
                }

                $rolePermissions[$resource][] = $action;
            }


            return $rolePermissions;
        }

        // If permission is not an array
        $parts = explode('.', $permission);

        return [
            'resource' => $parts[0] ?? '*',
            'action' => $parts[1] ?? '*'
        ];
    }

    /**
     * Check if permission matches pattern (with wildcard support)
     *
     * @param string $permission e.g., "users.viewAny"
     * @param string $pattern e.g., "users.*" or "*.viewAny" or "*.*"
     * @return bool
     */
    public static function matches(string $permission, string $pattern): bool
    {
        $permissionParts = explode('.', $permission);
        $patternParts = explode('.', $pattern);

        if (count($permissionParts) !== count($patternParts)) {
            return false;
        }

        for ($i = 0, $iMax = count($permissionParts); $i < $iMax; $i++) {
            if ($patternParts[$i] !== '*' && $patternParts[$i] !== $permissionParts[$i]) {
                return false;
            }
        }

        return true;
    }
}
