import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    slug: string;
    permissions: string[];
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
        if (role) {
            setData({
                name: role.name,
                permissions: role.permissions,
            });
        } else {
            reset();
        }
    }, [role, isOpen, setData, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        if (isEditing) {
            put(`/roles/${role.slug}`, {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post('/roles', {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    const handlePermissionToggle = (permissionName: string) => {
        setData(
            'permissions',
            data.permissions.includes(permissionName) ? data.permissions.filter((p) => p !== permissionName) : [...data.permissions, permissionName],
        );
    };

    const handleClose = () => {
        onClose();
        reset();
    };

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
                            <div className="max-h-60 space-y-3 overflow-y-auto rounded-lg border border-gray-200 p-4">
                                {permissions.map((permission) => (
                                    <div key={permission.id} className="flex items-start space-x-3">
                                        <input
                                            type="checkbox"
                                            id={`permission-${permission.id}`}
                                            checked={data.permissions.includes(permission.name)}
                                            onChange={() => handlePermissionToggle(permission.name)}
                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <div className="flex-1">
                                            <label
                                                htmlFor={`permission-${permission.id}`}
                                                className="block cursor-pointer text-sm font-medium text-gray-900"
                                            >
                                                {permission.name}
                                            </label>
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
