import PermissionFormModal from '@/components/permission-form-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus, Search, Settings } from 'lucide-react';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions Management" />
            <div className="flex h-full flex-1 flex-col gap-6 bg-gray-50 p-6">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                    {/* Total Permissions - Orange themed */}
                    <div className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                                    <Settings className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
                                    <p className="text-sm text-gray-500">Total Permissions</p>
                                </div>
                            </div>
                            <h3 className="mt-4 text-sm font-medium text-gray-700">Permissions Count</h3>
                        </div>
                    </div>
                </div>
                {/* Permission Table Header */}
                <div className="border-b border-orange-100 bg-white p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Permissions Management</h2>
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
                            {/* Add Permission Button with orange theme */}
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
                {/* Permissions Table */}
                <div className="flex-1 overflow-auto rounded-2xl border border-orange-100 bg-white shadow-sm">
                    <table className="w-full">
                        <thead className="border-b border-orange-100 bg-gray-50">
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
                                    <td className="px-6 py-4">{permission.resource}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            <span className="inline-flex items-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">
                                                {permission.actions.join(', ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{permission.created_at}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => handleEditPermission(permission)} className="btn-icon" title="Edit">
                                                {/* Using the Settings icon with orange color */}
                                                <Settings className="h-4 w-4 text-orange-600" />
                                            </button>
                                            {/* You can add delete button if needed */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal for create/edit permission - Fixed to match role-form-modal pattern */}
                <PermissionFormModal permission={editingPermission} onClose={handleCloseModal} allActions={allActions} isOpen={isModalOpen} />
            </div>
        </AppLayout>
    );
}
