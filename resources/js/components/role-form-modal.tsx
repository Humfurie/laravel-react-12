import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Shield, X } from 'lucide-react';
import React, { useEffect } from 'react';

interface Permission {
    id: number;
    name: string;
    resource: string;
    actions: string[];
}

interface Role {
    id: number;
    name: string;
    slug: string;
    permissions: string[];
    users_count: number;
    created_at: string;
}

interface RoleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    role?: Role | null;
    permissions: Permission[];
}

export default function RoleFormModal({ isOpen, onClose, role, permissions }: RoleFormModalProps) {
    const isEditing = !!role;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        permissions: [] as string[],
    });

    useEffect(() => {
        if (isOpen) {
            if (role) {
                setData({
                    name: role.name,
                    permissions: role.permissions,
                });
            } else {
                reset();
            }
        }
    }, [role, isOpen, setData, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(route('roles.update', role.slug), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('roles.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    const handlePermissionToggle = (resource: string, action: string) => {
        const permissionString = `${resource}.${action}`;
        setData(
            'permissions',
            data.permissions.includes(permissionString)
                ? data.permissions.filter((p) => p !== permissionString)
                : [...data.permissions, permissionString],
        );
    };

    const handleClose = () => {
        onClose();
        reset();
    };

    // Group permissions by resource
    const permissionsByResource = permissions.reduce(
        (acc, permission) => {
            acc[permission.resource] = permission.actions;
            return acc;
        },
        {} as Record<string, string[]>,
    );

    // Select all permissions for a resource
    const toggleResourcePermissions = (resource: string, actions: string[]) => {
        const resourcePermissions = actions.map((action) => `${resource}.${action}`);
        const allSelected = resourcePermissions.every((p) => data.permissions.includes(p));

        if (allSelected) {
            // Deselect all for this resource
            setData(
                'permissions',
                data.permissions.filter((p) => !resourcePermissions.includes(p)),
            );
        } else {
            // Select all for this resource
            setData('permissions', [...new Set([...data.permissions, ...resourcePermissions])]);
        }
    };

    // Select ALL permissions across all resources
    const toggleAllPermissions = () => {
        const allPermissions = Object.entries(permissionsByResource).flatMap(([resource, actions]) =>
            actions.map((action) => `${resource}.${action}`),
        );

        if (data.permissions.length === allPermissions.length) {
            setData('permissions', []);
        } else {
            setData('permissions', allPermissions);
        }
    };

    const totalPermissions = Object.values(permissionsByResource).reduce((sum, actions) => sum + actions.length, 0);
    const isAllSelected = data.permissions.length === totalPermissions;

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />

            {/* Slide-over Panel - FULL WIDTH */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative flex h-full w-full max-w-[98vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                    {/* Header - Fixed */}
                    <div className="flex items-center justify-between border-b bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">{isEditing ? 'Edit Role' : 'Create New Role'}</h2>
                                <p className="text-xs text-orange-100">
                                    {isEditing ? 'Update the role name and permissions' : 'Define a new role with specific permissions'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <div className="mx-auto max-w-7xl space-y-6">
                                {/* Role Name Input */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <Label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-900">
                                        Role Name
                                        <span className="ml-1 text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Admin, Editor, Viewer"
                                        className="h-10 text-sm"
                                        required
                                    />
                                    {errors.name && <p className="mt-2 text-xs text-red-600">{errors.name}</p>}
                                    <p className="mt-2 text-xs text-gray-600">Enter a descriptive name for this role</p>
                                </div>

                                {/* Permissions Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-900">
                                            Permissions
                                            <span className="ml-1 text-red-500">*</span>
                                        </Label>
                                        <p className="mt-1 text-xs text-gray-600">Select which permissions this role should have</p>
                                    </div>
                                    <div className="rounded-md bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                        {data.permissions.length} / {totalPermissions}
                                    </div>
                                </div>

                                {/* Select All - Minimalist */}
                                <div
                                    className="group cursor-pointer rounded-lg border border-orange-200 bg-orange-50 p-4 transition-all hover:border-orange-300 hover:bg-orange-100"
                                    onClick={toggleAllPermissions}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                                                isAllSelected ? 'border-orange-600 bg-orange-600' : 'border-orange-400 bg-white'
                                            }`}
                                        >
                                            {isAllSelected && (
                                                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-orange-900">Select All Permissions</div>
                                            <p className="mt-0.5 text-xs text-orange-700">
                                                {isAllSelected ? 'All permissions selected' : 'Click to select all available permissions'}
                                            </p>
                                        </div>
                                        <div className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-orange-600 shadow-sm">
                                            {isAllSelected ? 'ALL' : 'NONE'}
                                        </div>
                                    </div>
                                </div>

                                {/* Permissions Grid - By Resource */}
                                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                    {Object.entries(permissionsByResource).map(([resource, actions]) => {
                                        const resourcePermissions = actions.map((action) => `${resource}.${action}`);
                                        const allResourceSelected = resourcePermissions.every((p) => data.permissions.includes(p));
                                        const someResourceSelected = resourcePermissions.some((p) => data.permissions.includes(p));

                                        return (
                                            <div key={resource} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                                {/* Resource Header */}
                                                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-sm font-semibold text-gray-900 capitalize">{resource}</h3>
                                                        <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                                            {resourcePermissions.filter((p) => data.permissions.includes(p)).length}/{actions.length}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Select All for Resource */}
                                                <div
                                                    onClick={() => toggleResourcePermissions(resource, actions)}
                                                    className={`group cursor-pointer border-b px-4 py-2.5 transition-colors hover:bg-gray-50 ${
                                                        allResourceSelected
                                                            ? 'border-orange-200 bg-orange-50'
                                                            : someResourceSelected
                                                              ? 'bg-orange-25 border-orange-100'
                                                              : 'border-gray-100 bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${
                                                                allResourceSelected
                                                                    ? 'border-orange-600 bg-orange-600'
                                                                    : 'border-gray-300 bg-white group-hover:border-gray-400'
                                                            }`}
                                                        >
                                                            {allResourceSelected && (
                                                                <svg
                                                                    className="h-3 w-3 text-white"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={3}
                                                                        d="M5 13l4 4L19 7"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-700">Select all</span>
                                                    </div>
                                                </div>

                                                {/* Individual Permissions */}
                                                <div className="p-3">
                                                    {actions.map((action) => {
                                                        const permissionString = `${resource}.${action}`;
                                                        const isChecked = data.permissions.includes(permissionString);

                                                        return (
                                                            <div
                                                                key={permissionString}
                                                                onClick={() => handlePermissionToggle(resource, action)}
                                                                className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-gray-50"
                                                            >
                                                                <div
                                                                    className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${
                                                                        isChecked
                                                                            ? 'border-orange-600 bg-orange-600'
                                                                            : 'border-gray-300 bg-white group-hover:border-gray-400'
                                                                    }`}
                                                                >
                                                                    {isChecked && (
                                                                        <svg
                                                                            className="h-3 w-3 text-white"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke="currentColor"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={3}
                                                                                d="M5 13l4 4L19 7"
                                                                            />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm text-gray-700 capitalize">{action}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Validation Warning */}
                                {data.permissions.length === 0 && (
                                    <div className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2.5">
                                        <Shield className="h-4 w-4 text-yellow-700" />
                                        <p className="text-xs font-medium text-yellow-800">Please select at least one permission</p>
                                    </div>
                                )}

                                {errors.permissions && (
                                    <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5">
                                        <Shield className="h-4 w-4 text-red-700" />
                                        <p className="text-xs font-medium text-red-800">{errors.permissions}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="border-t bg-gray-50 px-8 py-4">
                            <div className="mx-auto flex max-w-7xl items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={processing}
                                    className="h-9 px-4 text-sm font-medium"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || data.permissions.length === 0 || !data.name.trim()}
                                    className="h-9 bg-orange-600 px-6 text-sm font-semibold hover:bg-orange-700"
                                >
                                    {processing ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Role' : 'Create Role'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
