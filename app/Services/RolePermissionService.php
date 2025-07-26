<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\Role;
use JsonException;

class RolePermissionService
{
    /**
     * Manage permissions for a role (attach or sync)
     *
     * @param array $permissions Raw permissions array
     * @param Role $role The role to attach/sync permissions to
     * @param string $method Either 'attach' or 'sync'
     * @return void
     * @throws JsonException
     */
    public function managePermissions(array $permissions, Role $role, string $method = 'attach'): void
    {
        $permissions = PermissionParser::parse($permissions);

        // Attach/sync permissions with actions if provided
        if (!empty($permissions)) {
            // Get all permissions in one query
            $resourceNames = array_keys($permissions);
            $permissionMap = Permission::whereIn('resource', $resourceNames)
                ->pluck('id', 'resource')
                ->toArray();

            // Prepare data for operation
            $permissionData = [];
            foreach ($permissions as $resource => $actions) {
                if (isset($permissionMap[$resource])) {
                    $permissionData[$permissionMap[$resource]] = [
                        'actions' => json_encode($actions, JSON_THROW_ON_ERROR)
                    ];
                }
            }

            // Choose operation based on method parameter
            if ($method === 'sync') {
                $role->permissions()->sync($permissionData);
            } else {
                $role->permissions()->attach($permissionData);
            }
        } elseif ($method === 'sync') {
            // If no permissions provided in sync mode, detach all
            $role->permissions()->detach();
        }
    }
}
