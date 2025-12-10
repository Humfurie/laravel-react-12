import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { FileText, Image as ImageIcon, Link as LinkIcon, Save, Upload } from 'lucide-react';
import { useState } from 'react';

interface Setting {
    id: number;
    key: string;
    value: string | null;
    type: string;
    description: string | null;
    group: string;
}

interface Props {
    settings: Record<string, Record<string, string | number | boolean>>;
    allSettings: Setting[];
}

const breadcrumbs = [
    {
        title: 'Settings',
        href: '/admin/settings',
    },
];

export default function Settings({ allSettings }: Props) {
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [previews, setPreviews] = useState<Record<string, string>>({});

    const { data, setData, post, processing, errors } = useForm<{ settings: Record<string, string> }>({
        settings: allSettings.reduce(
            (acc, setting) => {
                acc[setting.key] = setting.value || '';
                return acc;
            },
            {} as Record<string, string>,
        ),
    });

    const handleFileChange = async (key: string, file: File | null) => {
        if (!file) return;

        setUploading({ ...uploading, [key]: true });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`/admin/settings/upload/${key}`, {
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
                setPreviews({
                    ...previews,
                    [key]: result.url,
                });
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading({ ...uploading, [key]: false });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings', {
            preserveScroll: true,
        });
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

        switch (setting.type) {
            case 'file':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                id={setting.key}
                                onChange={(e) => handleFileChange(setting.key, e.target.files?.[0] || null)}
                                className="flex-1"
                                disabled={uploading[setting.key]}
                            />
                            {uploading[setting.key] && <span className="text-sm text-gray-500">Uploading...</span>}
                        </div>
                        {(value || previews[setting.key]) && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                {setting.key.includes('logo') || setting.key.includes('image') ? (
                                    <img
                                        src={previews[setting.key] || `/storage/${value}`}
                                        alt={setting.key}
                                        className="max-h-32 w-auto rounded-md object-contain"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-gray-600">{value}</span>
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
                            className="text-brand-orange focus:ring-brand-orange h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor={setting.key} className="cursor-pointer">
                            Enable
                        </Label>
                    </div>
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
                return <Upload className="h-5 w-5" />;
            case 'social':
                return <LinkIcon className="h-5 w-5" />;
            case 'branding':
                return <ImageIcon className="h-5 w-5" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />
            <div className="flex h-full flex-1 flex-col gap-6 bg-gray-50 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage your website configuration and assets</p>
                    </div>
                    <Button onClick={handleSubmit} disabled={processing} className="btn-orange">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {Object.entries(groupedSettings).map(([group, settingsInGroup]) => (
                        <Card key={group}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    {getGroupIcon(group)}
                                    <CardTitle className="capitalize">{group.replace(/_/g, ' ')}</CardTitle>
                                </div>
                                <CardDescription>Configure {group} settings for your website</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {settingsInGroup.map((setting) => (
                                    <div key={setting.key} className="space-y-2">
                                        <Label htmlFor={setting.key} className="text-sm font-medium text-gray-700">
                                            {setting.key
                                                .split('_')
                                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ')}
                                        </Label>
                                        {setting.description && <p className="text-xs text-gray-500">{setting.description}</p>}
                                        {renderSettingInput(setting)}
                                        {errors[`settings.${setting.key}`] && (
                                            <p className="text-sm text-red-600">{errors[`settings.${setting.key}`]}</p>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </form>
            </div>
        </AppLayout>
    );
}
