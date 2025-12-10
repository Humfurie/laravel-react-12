import PermissionFormModal from '@/components/permission-form-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Search, Settings, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permissions Management',
        href: '/permissions',
    },
];

interface Permission {
    id: number;
    resource: string;
    actions: string[];
    created_at: string;
}

interface PermissionProps {
    permissions: Permission[];
}

export default function Permissions({ permissions }: PermissionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleCreatePermission = () => {
        setEditingPermission(null);
        setIsModalOpen(true);
    };

    const handleEditPermission = (permission: Permission) => {
        setEditingPermission(permission);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPermission(null);
    };

    const allActions = ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'];

    const filteredPermissions = permissions.filter((p) => p.resource.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalActions = permissions.reduce((sum, p) => sum + p.actions.length, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions Management" />
            <div className="flex h-full flex-1 flex-col gap-6 bg-gray-50 p-6">
                {/* Stats Cards - Clean White Design */}
                <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                                    <Shield className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
                                    <p className="text-sm text-gray-500">Active permissions</p>
                                </div>
                            </div>
                            <h3 className="mt-4 text-sm font-medium text-gray-700">Total Permissions</h3>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                                    <Settings className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{totalActions}</p>
                                    <p className="text-sm text-gray-500">Total actions</p>
                                </div>
                            </div>
                            <h3 className="mt-4 text-sm font-medium text-gray-700">Actions</h3>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                                    <Settings className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{allActions.length}</p>
                                    <p className="text-sm text-gray-500">Available actions</p>
                                </div>
                            </div>
                            <h3 className="mt-4 text-sm font-medium text-gray-700">Action Types</h3>
                        </div>
                    </div>
                </div>

                {/* Permission Table - Clean White Design */}
                <div className="relative flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex h-full flex-col">
                        {/* Table Header */}
                        <div className="border-b border-gray-100 bg-white p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Permission Management</h2>
                                    <p className="mt-1 text-sm text-gray-600">Manage permissions for resources and actions</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search permissions..."
                                            className="w-64 rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm transition-colors focus:border-orange-300 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreatePermission}
                                        className="btn-orange inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Permission
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="flex-1 overflow-auto bg-white">
                            <table className="w-full">
                                <thead className="border-b border-gray-100 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Resource</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Actions</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Created</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredPermissions.map((permission) => (
                                        <tr key={permission.id} className="group transition-colors hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                                                        <Shield className="h-5 w-5 text-orange-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="font-semibold text-gray-900">{permission.resource}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {permission.actions.slice(0, 3).map((action) => (
                                                        <span
                                                            key={action}
                                                            className="inline-flex items-center rounded-lg border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600"
                                                        >
                                                            {action}
                                                        </span>
                                                    ))}
                                                    {permission.actions.length > 3 && (
                                                        <span className="inline-flex items-center rounded-lg border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
                                                            +{permission.actions.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(permission.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEditPermission(permission)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-600"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => router.delete(route('permissions.destroy', { permission: permission.id }))}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer */}
                        <div className="border-t border-gray-100 bg-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-medium text-gray-900">{filteredPermissions.length}</span> of{' '}
                                    <span className="font-medium text-gray-900">{permissions.length}</span> permissions
                                </p>
                                <div className="flex items-center gap-2">
                                    <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50">
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-200 bg-orange-100 text-sm font-semibold text-orange-600">
                                            1
                                        </button>
                                    </div>
                                    <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50">
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permission Form Modal */}
                <PermissionFormModal isOpen={isModalOpen} onClose={handleCloseModal} permission={editingPermission} allActions={allActions} />
            </div>
        </AppLayout>
    );
}
