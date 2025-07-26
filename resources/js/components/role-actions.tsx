import { router } from '@inertiajs/react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';

const RoleActions = ({ role }: { role: { slug: string; name: string; deleted_at: string | null } }) => {
    const [isForceDeleteDialogOpen, setIsForceDeleteDialogOpen] = useState(false);

    const handleForceDelete = () => {
        router.delete(route('roles.forceDestroy', { role: role.slug }), {
            onSuccess: () => setIsForceDeleteDialogOpen(false),
        });
    };
    console.log(isForceDeleteDialogOpen);
    return (
        <>
            {role.deleted_at ? (
                <>
                    <button
                        onClick={() => setIsForceDeleteDialogOpen(true)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>

                    {isForceDeleteDialogOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                            <div className="w-full max-w-sm rounded-lg bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">Permanently Delete Role?</h2>
                                <p className="mb-6 text-gray-600">
                                    This will permanently remove the "{role.name}" role. This action cannot be undone and will delete all associated
                                    data.
                                </p>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setIsForceDeleteDialogOpen(false)}
                                        className="rounded-md border px-4 py-2 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button onClick={handleForceDelete} className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                                        Force Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : null}

            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
            </button>
        </>
    );
};

export default RoleActions;
