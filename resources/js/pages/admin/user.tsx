import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit as EditIcon, Plus, Search, Shield, Trash2, UserCog, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/admin/users',
    },
];

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    roles: Role[];
    role_ids: number[];
    is_super_admin: boolean;
    created_at: string;
    deleted_at: string | null;
    can_edit: boolean;
    can_delete: boolean;
    can_assign_role: boolean;
}

interface UserProps {
    users: User[];
    roles: Role[];
    can: {
        create: boolean;
    };
}

export default function UserManagement({ users, roles, can }: UserProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredUsers = users.filter(
        (user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleAssignRole = (user: User) => {
        setSelectedUser(user);
        setIsRoleModalOpen(true);
    };

    const handleDeleteUser = (user: User) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(route('users.destroy', user.id), {
                preserveScroll: true,
            });
        }
    };

    const handleRestoreUser = (user: User) => {
        router.patch(
            route('users.restore', user.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-6 bg-gray-50 p-6">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                    {/* Total Users */}
                    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
                                    <UserCog className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{users.filter((u) => !u.deleted_at).length}</p>
                                    <p className="text-sm text-gray-500">Active Users</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deleted Users */}
                    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-100 bg-red-50">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.deleted_at).length}</p>
                                    <p className="text-sm text-gray-500">Deleted Users</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Roles */}
                    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                        <div className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-100 bg-purple-50">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                                    <p className="text-sm text-gray-500">Total Roles</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Table */}
                <div className="relative flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex h-full flex-col">
                        {/* Table Header */}
                        <div className="border-b border-gray-100 bg-white p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                                    <p className="mt-1 text-sm text-gray-600">Manage users and their roles</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-64 rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                                        />
                                    </div>
                                    {/* Add User Button */}
                                    {can.create && (
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add User
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="flex-1 overflow-auto bg-white">
                            <table className="w-full">
                                <thead className="border-b border-gray-100 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Roles</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Joined</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className={`group transition-colors ${user.deleted_at ? 'bg-red-50 opacity-60' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-gray-900">{user.name}</p>
                                                            {user.is_super_admin && (
                                                                <span className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                                                                    Super Admin
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.length > 0 ? (
                                                        user.roles.map((role) => (
                                                            <span
                                                                key={role.id}
                                                                className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                                                            >
                                                                {role.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-gray-400">No roles assigned</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.deleted_at ? (
                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                        Deleted
                                                    </span>
                                                ) : user.email_verified_at ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{user.created_at}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.deleted_at ? (
                                                        <button
                                                            onClick={() => handleRestoreUser(user)}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                                                        >
                                                            Restore
                                                        </button>
                                                    ) : (
                                                        <>
                                                            {user.can_edit && (
                                                                <button
                                                                    onClick={() => handleEditUser(user)}
                                                                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                                                >
                                                                    <EditIcon className="h-3.5 w-3.5" />
                                                                    Edit
                                                                </button>
                                                            )}
                                                            {user.can_assign_role && (
                                                                <button
                                                                    onClick={() => handleAssignRole(user)}
                                                                    className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
                                                                >
                                                                    <Shield className="h-3.5 w-3.5" />
                                                                    Roles
                                                                </button>
                                                            )}
                                                            {user.can_delete && (
                                                                <button
                                                                    onClick={() => handleDeleteUser(user)}
                                                                    className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Edit User Modal */}
                {isEditModalOpen && selectedUser && (
                    <EditUserModal
                        user={selectedUser}
                        roles={roles}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedUser(null);
                        }}
                    />
                )}

                {/* Role Assignment Modal */}
                {isRoleModalOpen && selectedUser && (
                    <RoleAssignmentModal
                        user={selectedUser}
                        roles={roles}
                        onClose={() => {
                            setIsRoleModalOpen(false);
                            setSelectedUser(null);
                        }}
                    />
                )}

                {/* Create User Modal */}
                {isCreateModalOpen && <CreateUserModal roles={roles} onClose={() => setIsCreateModalOpen(false)} />}
            </div>
        </AppLayout>
    );
}

// Create User Modal Component
function CreateUserModal({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_ids: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const toggleRole = (roleId: number) => {
        if (data.role_ids.includes(roleId)) {
            setData(
                'role_ids',
                data.role_ids.filter((id) => id !== roleId),
            );
        } else {
            setData('role_ids', [...data.role_ids, roleId]);
        }
    };

    const isFormValid =
        data.name.trim().length > 0 && data.email.trim().length > 0 && data.password.length > 0 && data.password_confirmation.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <UserCog className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
                            <p className="text-sm text-gray-500">Add a new user and assign roles</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/50 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="max-h-[calc(100vh-16rem)] overflow-y-auto p-6">
                        {/* User Details Section */}
                        <div className="mb-6">
                            <h4 className="mb-4 text-sm font-semibold text-gray-900">User Details</h4>
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="create-name" className="mb-2 block text-sm font-medium text-gray-700">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="create-name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="create-email" className="mb-2 block text-sm font-medium text-gray-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="create-email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="create-password" className="mb-2 block text-sm font-medium text-gray-700">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        id="create-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                                        required
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="create-password-confirmation" className="mb-2 block text-sm font-medium text-gray-700">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        id="create-password-confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Roles Section */}
                        <div>
                            <h4 className="mb-4 text-sm font-semibold text-gray-900">Assign Roles (Optional)</h4>
                            <div className="space-y-3">
                                {roles.map((role) => (
                                    <label
                                        key={role.id}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                                            data.role_ids.includes(role.id)
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.role_ids.includes(role.id)}
                                            onChange={() => toggleRole(role.id)}
                                            disabled={processing}
                                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:cursor-not-allowed"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{role.name}</p>
                                            <p className="text-xs text-gray-500">{role.slug}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.role_ids && <p className="mt-3 text-sm text-red-600">{errors.role_ids}</p>}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid || processing}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Edit User Modal Component
function EditUserModal({ user, roles, onClose }: { user: User; roles: Role[]; onClose: () => void }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role_ids: user.role_ids,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.update', user.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    const toggleRole = (roleId: number) => {
        if (data.role_ids.includes(roleId)) {
            setData(
                'role_ids',
                data.role_ids.filter((id) => id !== roleId),
            );
        } else {
            setData('role_ids', [...data.role_ids, roleId]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <EditIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                            <p className="text-sm text-gray-500">Update user details and roles</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/50 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Warning for Super Admin */}
                {user.is_super_admin && (
                    <div className="border-b border-gray-200 bg-yellow-50 p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="mt-0.5 h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">Super Admin Account</p>
                                <p className="mt-1 text-xs text-yellow-700">
                                    This is the super admin account. Role changes are not allowed for security reasons.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="max-h-[calc(100vh-16rem)] overflow-y-auto p-6">
                        {/* User Details Section */}
                        <div className="mb-6">
                            <h4 className="mb-4 text-sm font-semibold text-gray-900">User Details</h4>
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                                        Password <span className="text-gray-500">(leave blank to keep current)</span>
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="password_confirmation" className="mb-2 block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Roles Section */}
                        <div>
                            <h4 className="mb-4 text-sm font-semibold text-gray-900">Assign Roles</h4>
                            <div className="space-y-3">
                                {roles.map((role) => (
                                    <label
                                        key={role.id}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                                            data.role_ids.includes(role.id)
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                                        } ${user.is_super_admin ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.role_ids.includes(role.id)}
                                            onChange={() => toggleRole(role.id)}
                                            disabled={user.is_super_admin || processing}
                                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:cursor-not-allowed"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{role.name}</p>
                                            <p className="text-xs text-gray-500">{role.slug}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.role_ids && <p className="mt-3 text-sm text-red-600">{errors.role_ids}</p>}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Role Assignment Modal Component
function RoleAssignmentModal({ user, roles, onClose }: { user: User; roles: Role[]; onClose: () => void }) {
    const { data, setData, patch, processing, errors } = useForm({
        role_ids: user.role_ids,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('users.assign-role', user.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    const toggleRole = (roleId: number) => {
        if (data.role_ids.includes(roleId)) {
            setData(
                'role_ids',
                data.role_ids.filter((id) => id !== roleId),
            );
        } else {
            setData('role_ids', [...data.role_ids, roleId]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Assign Roles</h3>
                            <p className="text-sm text-gray-500">{user.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Warning for Super Admin */}
                {user.is_super_admin && (
                    <div className="border-b border-gray-200 bg-yellow-50 p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="mt-0.5 h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">Super Admin Account</p>
                                <p className="mt-1 text-xs text-yellow-700">
                                    This is the super admin account (User ID: 1). Role changes are not allowed for security reasons.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="max-h-96 overflow-y-auto p-6">
                        <div className="space-y-3">
                            {roles.map((role) => (
                                <label
                                    key={role.id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                                        data.role_ids.includes(role.id)
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                                    } ${user.is_super_admin ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.role_ids.includes(role.id)}
                                        onChange={() => toggleRole(role.id)}
                                        disabled={user.is_super_admin || processing}
                                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:cursor-not-allowed"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{role.name}</p>
                                        <p className="text-xs text-gray-500">{role.slug}</p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {errors.role_ids && <p className="mt-3 text-sm text-red-600">{errors.role_ids}</p>}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={user.is_super_admin || processing}
                            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
