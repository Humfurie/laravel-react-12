import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
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

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Role Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Role Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter role name"
                                className={errors.name ? 'border-red-300' : ''}
                            />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Permissions */}
                        <div className="space-y-3">
                            <Label>Permissions</Label>
                            <div className="max-h-60 space-y-4 overflow-y-auto rounded-lg border border-gray-200 p-4">
                                {Object.entries(permissionsByResource).map(([resource, actions]) => (
                                    <div key={resource} className="space-y-2">
                                        <h4 className="font-medium text-gray-800 capitalize">{resource}</h4>
                                        <div className="ml-4 space-y-2">
                                            {actions.map((action) => {
                                                const permissionString = `${resource}.${action}`;
                                                return (
                                                    <div key={permissionString} className="flex items-start space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            id={`permission-${permissionString}`}
                                                            checked={data.permissions.includes(permissionString)}
                                                            onChange={() => handlePermissionToggle(resource, action)}
                                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                        />
                                                        <div className="flex-1">
                                                            <label
                                                                htmlFor={`permission-${permissionString}`}
                                                                className="block cursor-pointer text-sm text-gray-700 capitalize"
                                                            >
                                                                {action}
                                                            </label>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.permissions && <p className="text-sm text-red-600">{errors.permissions}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-orange-600 hover:bg-orange-700">
                            {processing ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Role' : 'Create Role'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
