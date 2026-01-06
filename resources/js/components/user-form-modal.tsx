import { useEffect, useState } from 'react';

interface User {
    id?: number;
    name: string;
    email: string;
}

interface UserFormModalProps {
    user: User | null;
    onClose: () => void;
    onSave?: (user: User) => void;
}

export default function UserFormModal({ user, onClose, onSave }: UserFormModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        } else {
            setName('');
            setEmail('');
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userData: User = {
            id: user?.id,
            name,
            email,
        };
        if (onSave) {
            onSave(userData);
        }
        onClose();
    };

    return (
        // Overlay background
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            {/* Modal window */}
            <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
                {/* Close button */}
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" aria-label="Close">
                    &times;
                </button>
                <h2 className="mb-4 text-xl font-semibold">{user ? 'Edit User' : 'New User'}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    {/* Add more fields here if needed */}
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
