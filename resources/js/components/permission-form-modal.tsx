import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface Permission {
    id?: number;
    resource: string;
    actions: string[];
}

interface PermissionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    permission?: Permission | null;
    allActions: string[];
    onSave?: (permission: Permission) => void;
}

export default function PermissionFormModal({ isOpen, onClose, permission, allActions, onSave }: PermissionFormModalProps) {
    const isEditing = !!permission;
    const [resource, setResource] = useState('');
    const [actions, setActions] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (permission) {
                setResource(permission.resource);
                setActions(permission.actions);
            } else {
                setResource('');
                setActions([]);
            }
        }
    }, [permission, isOpen]);

    const toggleAction = (action: string) => {
        setActions((prev) => (prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const permData: Permission = {
            resource,
            actions,
            id: permission?.id,
        };

        if (isEditing && permission?.id) {
            router.put(route('permissions.update', permission.id), permData, {
                onSuccess: () => {
                    if (onSave) {
                        onSave(permData);
                    }
                    setProcessing(false);
                    onClose();
                },
                onError: () => {
                    setProcessing(false);
                },
            });
        } else {
            router.post(route('permissions.store'), permData, {
                onSuccess: () => {
                    if (onSave) {
                        onSave(permData);
                    }
                    setProcessing(false);
                    onClose();
                },
                onError: () => {
                    setProcessing(false);
                },
            });
        }
    };

    const isFormValid = resource.trim().length > 0 && actions.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Resource Input */}
                        <div className="space-y-2">
                            <Label htmlFor="resource">Resource</Label>
                            <Input
                                id="resource"
                                type="text"
                                value={resource}
                                onChange={(e) => setResource(e.target.value)}
                                placeholder="Enter resource name"
                                required
                            />
                        </div>

                        {/* Actions List */}
                        <div className="space-y-3">
                            <Label>
                                Actions <span className="text-red-500">*</span>
                            </Label>
                            {actions.length === 0 && <p className="text-xs text-gray-500">Select at least one action</p>}
                            <div className="max-h-60 space-y-4 overflow-y-auto rounded-lg border border-gray-200 p-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {allActions.map((action) => (
                                        <div key={action} className="flex items-start space-x-3">
                                            <input
                                                type="checkbox"
                                                id={`action-${action}`}
                                                checked={actions.includes(action)}
                                                onChange={() => toggleAction(action)}
                                                className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                            />
                                            <div className="flex-1">
                                                <label htmlFor={`action-${action}`} className="block cursor-pointer text-sm text-gray-700 capitalize">
                                                    {action}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!isFormValid || processing} className="bg-orange-600 hover:bg-orange-700">
                            {processing ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Permission' : 'Create Permission'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
