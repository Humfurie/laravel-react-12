import UserFormModal from '@/components/user-form-modal'; // You should create this component
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Edit, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/users',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    // Add other user properties as needed
}

interface UserProps {
    users: User[];
}

export default function UserManagement({ users }: UserProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleCreateUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
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
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-green-100 bg-green-50">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                                    <p className="text-sm text-gray-500">Total Users</p>
                                </div>
                            </div>
                            <h3 className="mt-4 text-sm font-medium text-gray-700">Users Count</h3>
                        </div>
                    </div>
                    {/* You can add more stats cards similarly if needed */}
                </div>

                {/* User Table */}
                <div className="relative flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex h-full flex-col">
                        {/* Table Header */}
                        <div className="border-b border-gray-100 bg-white p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                                    <p className="mt-1 text-sm text-gray-600">Manage users and their details</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            className="w-64 rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm transition-colors focus:border-green-300 focus:ring-2 focus:ring-green-100 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateUser}
                                        className="btn-green inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add User
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="flex-1 overflow-auto bg-white">
                            <table className="w-full">
                                <thead className="border-b border-gray-100 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">Joined</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {users.map((user) => (
                                        <tr key={user.id} className="group transition-colors hover:bg-gray-50">
                                            <td className="px-6 py-4">{user.name}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">{user.created_at}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <Edit className="h-4 w-4" /> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* Modal for create/edit user */}
                {isModalOpen && <UserFormModal user={editingUser} onClose={handleCloseModal} />}
            </div>
        </AppLayout>
    );
}
