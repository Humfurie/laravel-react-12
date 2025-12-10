import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { CheckCircle2, Shield, X } from 'lucide-react';
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

    const toggleSelectAll = () => {
        if (actions.length === allActions.length) {
            setActions([]);
        } else {
            setActions([...allActions]);
        }
    };

    const isAllSelected = actions.length === allActions.length;

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

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Slide-over Panel - FULL WIDTH */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative flex h-full w-full max-w-[98vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                    {/* Header - Fixed */}
                    <div className="flex items-center justify-between border-b bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white">{isEditing ? 'Edit Permission' : 'Create New Permission'}</h2>
                                <p className="mt-1 text-sm text-orange-100">
                                    {isEditing ? 'Update the resource and allowed actions' : 'Define resource access controls'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-8 py-8">
                            <div className="mx-auto max-w-7xl space-y-8">
                                {/* Resource Input */}
                                <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-8">
                                    <Label htmlFor="resource" className="mb-3 block text-xl font-bold text-gray-900">
                                        Resource Name
                                        <span className="ml-2 text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="resource"
                                        type="text"
                                        value={resource}
                                        onChange={(e) => setResource(e.target.value)}
                                        placeholder="e.g., developer, blog, user, property"
                                        className="h-14 text-lg"
                                        required
                                    />
                                    <p className="mt-3 text-base text-gray-600">Enter the name of the resource this permission will control</p>
                                </div>

                                {/* Actions Header */}
                                <div className="flex items-end justify-between">
                                    <div>
                                        <Label className="text-xl font-bold text-gray-900">
                                            Actions
                                            <span className="ml-2 text-red-500">*</span>
                                        </Label>
                                        <p className="mt-2 text-base text-gray-600">Select which actions are allowed for this resource</p>
                                    </div>
                                    <div className="rounded-full bg-orange-100 px-6 py-2 text-lg font-bold text-orange-700">
                                        {actions.length} / {allActions.length} selected
                                    </div>
                                </div>

                                {/* Select All - Very Prominent */}
                                <div
                                    className="group cursor-pointer rounded-2xl border-4 border-orange-400 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 p-8 shadow-lg transition-all hover:shadow-xl"
                                    onClick={toggleSelectAll}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-4 border-orange-600 bg-white shadow-md transition-transform group-hover:scale-110">
                                            {isAllSelected && <CheckCircle2 className="h-7 w-7 text-orange-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-2xl font-black text-orange-900">Select All Actions</div>
                                            <p className="mt-1 text-base text-orange-700">
                                                {isAllSelected
                                                    ? '✓ All actions selected - Click to deselect all'
                                                    : 'Click to quickly select all available actions'}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-white px-6 py-3 text-lg font-black text-orange-600 shadow-md">
                                            {isAllSelected ? '✓ ALL' : 'NONE'}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Grid - LARGE */}
                                <div className="grid gap-8 lg:grid-cols-3">
                                    {/* Read Permissions */}
                                    <div className="overflow-hidden rounded-2xl border-4 border-blue-300 bg-white shadow-lg">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-2xl font-black text-white">Read</h3>
                                                <span className="rounded-full bg-white px-4 py-1 text-base font-bold text-blue-700">
                                                    {['viewAny', 'view'].filter((a) => actions.includes(a)).length}/2
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-blue-100">View and list resources</p>
                                        </div>
                                        <div className="space-y-3 p-6">
                                            {['viewAny', 'view'].map((action) => {
                                                const isChecked = actions.includes(action);
                                                return (
                                                    <div
                                                        key={action}
                                                        onClick={() => toggleAction(action)}
                                                        className={`group flex cursor-pointer items-center gap-4 rounded-xl border-3 p-5 transition-all hover:shadow-md ${
                                                            isChecked
                                                                ? 'border-blue-500 bg-blue-100 shadow-sm'
                                                                : 'border-gray-300 bg-white hover:border-blue-300'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-lg border-3 transition-all ${
                                                                isChecked ? 'border-blue-600 bg-blue-600' : 'border-gray-400 bg-white'
                                                            }`}
                                                        >
                                                            {isChecked && <CheckCircle2 className="h-5 w-5 text-white" />}
                                                        </div>
                                                        <span
                                                            className={`text-lg font-bold capitalize ${isChecked ? 'text-blue-900' : 'text-gray-700'}`}
                                                        >
                                                            {action}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    ;{/* Write Permissions */}
                                    <div className="overflow-hidden rounded-2xl border-4 border-green-300 bg-white shadow-lg">
                                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-5">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-2xl font-black text-white">Write</h3>
                                                <span className="rounded-full bg-white px-4 py-1 text-base font-bold text-green-700">
                                                    {['create', 'update'].filter((a) => actions.includes(a)).length}/2
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-green-100">Create and modify resources</p>
                                        </div>
                                        <div className="space-y-3 p-6">
                                            {['create', 'update'].map((action) => {
                                                const isChecked = actions.includes(action);
                                                return (
                                                    <div
                                                        key={action}
                                                        onClick={() => toggleAction(action)}
                                                        className={`group flex cursor-pointer items-center gap-4 rounded-xl border-3 p-5 transition-all hover:shadow-md ${
                                                            isChecked
                                                                ? 'border-green-500 bg-green-100 shadow-sm'
                                                                : 'border-gray-300 bg-white hover:border-green-300'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-lg border-3 transition-all ${
                                                                isChecked ? 'border-green-600 bg-green-600' : 'border-gray-400 bg-white'
                                                            }`}
                                                        >
                                                            {isChecked && <CheckCircle2 className="h-5 w-5 text-white" />}
                                                        </div>
                                                        <span
                                                            className={`text-lg font-bold capitalize ${isChecked ? 'text-green-900' : 'text-gray-700'}`}
                                                        >
                                                            {action}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    ;{/* Destructive Permissions */}
                                    <div className="overflow-hidden rounded-2xl border-4 border-red-300 bg-white shadow-lg">
                                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-2xl font-black text-white">Destructive</h3>
                                                <span className="rounded-full bg-white px-4 py-1 text-base font-bold text-red-700">
                                                    {['delete', 'restore', 'forceDelete'].filter((a) => actions.includes(a)).length}/3
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-red-100">Delete and restore resources</p>
                                        </div>
                                        <div className="space-y-3 p-6">
                                            {['delete', 'restore', 'forceDelete'].map((action) => {
                                                const isChecked = actions.includes(action);
                                                return (
                                                    <div
                                                        key={action}
                                                        onClick={() => toggleAction(action)}
                                                        className={`group flex cursor-pointer items-center gap-4 rounded-xl border-3 p-5 transition-all hover:shadow-md ${
                                                            isChecked
                                                                ? 'border-red-500 bg-red-100 shadow-sm'
                                                                : 'border-gray-300 bg-white hover:border-red-300'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-lg border-3 transition-all ${
                                                                isChecked ? 'border-red-600 bg-red-600' : 'border-gray-400 bg-white'
                                                            }`}
                                                        >
                                                            {isChecked && <CheckCircle2 className="h-5 w-5 text-white" />}
                                                        </div>
                                                        <span
                                                            className={`text-lg font-bold capitalize ${isChecked ? 'text-red-900' : 'text-gray-700'}`}
                                                        >
                                                            {action}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    ;
                                </div>

                                {/* Validation Warning */}
                                {actions.length === 0 && (
                                    <div className="flex items-center gap-4 rounded-xl border-3 border-yellow-400 bg-yellow-50 px-6 py-5 shadow-md">
                                        <Shield className="h-7 w-7 text-yellow-700" />
                                        <p className="text-lg font-semibold text-yellow-800">⚠ Please select at least one action to continue</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="border-t bg-gray-50 px-8 py-6">
                            <div className="mx-auto flex max-w-7xl items-center justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={processing}
                                    className="h-14 px-8 text-lg font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!isFormValid || processing}
                                    className="h-14 bg-orange-600 px-12 text-lg font-bold hover:bg-orange-700"
                                >
                                    {processing ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Permission' : 'Create Permission'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
