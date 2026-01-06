import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FileText, Image as ImageIcon, Link as LinkIcon, Save, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface Setting {
    id: number;
    key: string;
    value: string | null;
    type: string;
    description: string | null;
    group: string;
    url?: string; // URL for file-type settings
}

interface Props {
    allSettings: Setting[];
}

export default function Settings({ allSettings }: Props) {
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<{ settings: Record<string, string> }>({
        settings: allSettings.reduce(
            (acc, setting) => {
                acc[setting.key] = setting.value || '';
                return acc;
            },
            {} as Record<string, string>,
        ),
    });

    const handleFileSelect = (key: string, file: File | null) => {
        if (!file) return;

        setSelectedFiles((prev) => ({
            ...prev,
            [key]: file,
        }));
    };

    const handleRemoveFileSelection = (key: string) => {
        setSelectedFiles((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });

        if (fileInputRefs.current[key]) {
            fileInputRefs.current[key]!.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Upload files first
        for (const [key, file] of Object.entries(selectedFiles)) {
            await uploadFile(key, file);
        }

        // Then save all settings
        post(route('admin.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedFiles({});
            },
        });
    };

    const uploadFile = async (key: string, file: File) => {
        setUploading({ ...uploading, [key]: true });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(route('admin.settings.upload', { key }), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
            });

            const result = await response.json();

            if (result.success) {
                setData('settings', {
                    ...data.settings,
                    [key]: result.path,
                });
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading({ ...uploading, [key]: false });
        }
    };

    const groupedSettings = allSettings.reduce(
        (acc, setting) => {
            if (!acc[setting.group]) {
                acc[setting.group] = [];
            }
            acc[setting.group].push(setting);
            return acc;
        },
        {} as Record<string, Setting[]>,
    );

    const renderSettingInput = (setting: Setting) => {
        const value = data.settings[setting.key];
        const hasSelectedFile = selectedFiles[setting.key];

        switch (setting.type) {
            case 'file':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRefs.current[setting.key]?.click()}
                                disabled={uploading[setting.key]}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {uploading[setting.key] ? 'Uploading...' : 'Choose File'}
                            </Button>
                            <input
                                ref={(el) => {
                                    fileInputRefs.current[setting.key] = el;
                                }}
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileSelect(setting.key, e.target.files?.[0] || null)}
                                accept={setting.key.includes('logo') || setting.key.includes('image') ? 'image/*' : '*/*'}
                            />
                        </div>

                        {/* Show selected file preview */}
                        {hasSelectedFile && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 flex-shrink-0 text-green-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-green-900 dark:text-green-100">File selected</p>
                                        <p className="text-muted-foreground truncate text-xs">{selectedFiles[setting.key].name}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveFileSelection(setting.key)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Show current file if exists */}
                        {value && !hasSelectedFile && (
                            <div className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-900">
                                {setting.key.includes('logo') || setting.key.includes('image') ? (
                                    <img
                                        src={setting.url || `/storage/${value}`}
                                        alt={setting.key}
                                        className="max-h-32 w-auto rounded-md border object-contain"
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `<div class="flex items-center gap-2 text-sm"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><span class="text-gray-600">${value}</span></div>`;
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-gray-600 break-all">{value}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'json':
                return (
                    <Textarea
                        id={setting.key}
                        value={value}
                        onChange={(e) => setData('settings', { ...data.settings, [setting.key]: e.target.value })}
                        rows={6}
                        className="font-mono text-sm"
                        placeholder='{"key": "value"}'
                    />
                );

            case 'boolean':
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={setting.key}
                            checked={value === 'true'}
                            onChange={(e) => setData('settings', { ...data.settings, [setting.key]: e.target.checked.toString() })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <Label htmlFor={setting.key} className="cursor-pointer text-sm">
                            Enable
                        </Label>
                    </div>
                );

            case 'integer':
                return (
                    <Input
                        type="number"
                        id={setting.key}
                        value={value || ''}
                        onChange={(e) => setData('settings', { ...data.settings, [setting.key]: e.target.value })}
                        placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
                    />
                );

            default:
                return (
                    <Input
                        type="text"
                        id={setting.key}
                        value={value || ''}
                        onChange={(e) => setData('settings', { ...data.settings, [setting.key]: e.target.value })}
                        placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
                    />
                );
        }
    };

    const getGroupIcon = (group: string) => {
        switch (group) {
            case 'files':
                return <Upload className="h-5 w-5 text-blue-600" />;
            case 'social':
                return <LinkIcon className="h-5 w-5 text-purple-600" />;
            case 'branding':
                return <ImageIcon className="h-5 w-5 text-pink-600" />;
            default:
                return <FileText className="h-5 w-5 text-gray-600" />;
        }
    };

    const getGroupColor = (group: string) => {
        switch (group) {
            case 'files':
                return 'bg-blue-50 border-blue-100';
            case 'social':
                return 'bg-purple-50 border-purple-100';
            case 'branding':
                return 'bg-pink-50 border-pink-100';
            default:
                return 'bg-gray-50 border-gray-100';
        }
    };

    return (
        <AdminLayout>
            <Head title="Site Settings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
                        <p className="text-muted-foreground mt-2">Manage your website configuration and assets</p>
                    </div>
                    <Button onClick={handleSubmit} disabled={processing}>
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                {/* Success Message */}
                {recentlySuccessful && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">Settings saved successfully!</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    {Object.entries(groupedSettings).map(([group, settings]) => (
                        <div key={group} className={`rounded-lg border p-4 ${getGroupColor(group)}`}>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-white p-2">{getGroupIcon(group)}</div>
                                <div>
                                    <p className="text-sm font-medium capitalize">{group.replace(/_/g, ' ')}</p>
                                    <p className="text-2xl font-bold">{settings.length}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {Object.entries(groupedSettings).map(([group, settingsInGroup]) => (
                        <div key={group} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                            <div className="border-b bg-gray-50 p-6">
                                <div className="flex items-center gap-3">
                                    {getGroupIcon(group)}
                                    <div>
                                        <h2 className="text-xl font-semibold capitalize">{group.replace(/_/g, ' ')}</h2>
                                        <p className="text-muted-foreground text-sm">Configure {group} settings for your website</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6 p-6">
                                {settingsInGroup.map((setting) => (
                                    <div key={setting.key} className="space-y-2">
                                        <Label htmlFor={setting.key} className="text-sm font-medium">
                                            {setting.key
                                                .split('_')
                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ')}
                                        </Label>
                                        {setting.description && <p className="text-muted-foreground text-xs">{setting.description}</p>}
                                        {renderSettingInput(setting)}
                                        {errors[`settings.${setting.key}`] && (
                                            <p className="text-sm text-red-600">{errors[`settings.${setting.key}`]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </form>

                {allSettings.length === 0 && (
                    <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center">
                        <p className="text-lg font-medium">No settings found</p>
                        <p className="mt-2 text-sm">Settings will appear here once they are configured</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
