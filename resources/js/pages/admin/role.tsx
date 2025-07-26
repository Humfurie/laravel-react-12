import RoleFormModal from '@/components/role-form-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Edit, MoreHorizontal, Plus, Search, Settings, Shield, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Management',
        href: '/roles',
    },
];

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
    users_count: number;
    permissions: string[];
    created_at: string;
}

interface RoleProps {
    roles: Role[];
    permissions: Permission[];
}

export default function Role({ roles, permissions }: RoleProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    console.log(roles);
    const handleCreateRole = () => {
        setEditingRole(null);
        setIsModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Management" />
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
                                    <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                                    <p className="text-sm text-gray-500">Active roles</p>
                                </div>
                            </div>
                            <h3 className="mt-4 text-sm font-medium text-gray-700">Total Roles</h3>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                                    <Users className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{roles.reduce((sum, role) => sum + role.users_count, 0)}</p>
                                    <p className="text-sm text-gray-500">Assigned users</p>
                                </div>
                            </div>
                            <h3 className="mt-4 text-sm font-medium text-gray-700">Total Users</h3>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                                    <Settings className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {[...new Set(roles.flatMap((role) => role.permissions))].length}
                                    </p>
                                    <p className="text-sm text-gray-500">Unique permissions</p>
                                </div>
                            </div>
                            <h3 className="mt-4 text-sm font-medium text-gray-700">Permissions</h3>
                        </div>
                    </div>
                </div>

                {/* Role Table - Clean White Design */}
                <div className="relative flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex h-full flex-col">
                        {/* Table Header */}
                        <div className="border-b border-gray-100 bg-white p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Role Management</h2>
                                    <p className="mt-1 text-sm text-gray-600">Manage user roles and their permissions</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search roles..."
                                            className="w-64 rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm transition-colors focus:border-orange-300 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateRole}
                                        className="btn-orange inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Role
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="flex-1 overflow-auto bg-white">
                            <table className="w-full">
                                <thead className="border-b border-gray-100 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Users</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                            Permissions
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Created</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {roles.map((role) => (
                                        <tr key={role.id} className="group transition-colors hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                                                        <Shield className="h-5 w-5 text-orange-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="font-semibold text-gray-900">{role.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                                                    {role.users_count} users
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.slice(0, 2).map((permission) => (
                                                        <span
                                                            key={permission}
                                                            className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"
                                                        >
                                                            {permission}
                                                        </span>
                                                    ))}
                                                    {role.permissions.length > 2 && (
                                                        <span className="inline-flex items-center rounded-lg border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
                                                            +{role.permissions.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(role.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEditRole(role)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-600"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                                                        <MoreHorizontal className="h-4 w-4" />
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
                                    Showing <span className="font-medium text-gray-900">{roles.length}</span> of{' '}
                                    <span className="font-medium text-gray-900">{roles.length}</span> roles
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

                {/* Role Form Modal */}
                <RoleFormModal isOpen={isModalOpen} onClose={handleCloseModal} role={editingRole} permissions={permissions} />
            </div>
        </AppLayout>
    );
}
