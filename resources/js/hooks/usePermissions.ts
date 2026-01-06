import type { Permissions, ResourcePermissions } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage().props as unknown as { auth: { permissions: Permissions; isAdmin: boolean } };

    const can = (resource: keyof Permissions, action: keyof ResourcePermissions): boolean => {
        if (auth.isAdmin) {
            return true;
        }

        return auth.permissions[resource]?.[action] ?? false;
    };

    const canAny = (resource: keyof Permissions): boolean => {
        return can(resource, 'viewAny');
    };

    const getPermissions = (resource: keyof Permissions): ResourcePermissions => {
        if (auth.isAdmin) {
            return {
                viewAny: true,
                view: true,
                create: true,
                update: true,
                delete: true,
                restore: true,
                forceDelete: true,
            };
        }

        return (
            auth.permissions[resource] ?? {
                viewAny: false,
                view: false,
                create: false,
                update: false,
                delete: false,
                restore: false,
                forceDelete: false,
            }
        );
    };

    return {
        can,
        canAny,
        getPermissions,
        isAdmin: auth.isAdmin,
    };
}
