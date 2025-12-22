import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Facebook, FileText, Github, Globe, Linkedin, Plus, Trash2, Twitter, Upload, X } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type SocialLinks = {
    github?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
};

type ProfileStat = {
    label: string;
    value: string;
};

type ProfileForm = {
    name: string;
    username: string;
    email: string;
    bio: string;
    headline: string;
    about: string;
    social_links: SocialLinks;
    profile_stats: ProfileStat[];
    resume: File | null;
};

interface ProfileProps {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function Profile({ mustVerifyEmail, status }: ProfileProps) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        name: auth.user.name,
        username: auth.user.username || '',
        email: auth.user.email,
        bio: auth.user.bio || '',
        headline: auth.user.headline || '',
        about: auth.user.about || '',
        social_links: auth.user.social_links || {},
        profile_stats: auth.user.profile_stats || [],
        resume: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
            // @ts-expect-error - Inertia types don't include _method override
            _method: 'patch',
        });
    };

    const addStat = () => {
        setData('profile_stats', [...data.profile_stats, { label: '', value: '' }]);
    };

    const removeStat = (index: number) => {
        setData(
            'profile_stats',
            data.profile_stats.filter((_, i) => i !== index),
        );
    };

    const updateStat = (index: number, field: 'label' | 'value', value: string) => {
        const newStats = [...data.profile_stats];
        newStats[index][field] = value;
        setData('profile_stats', newStats);
    };

    const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
        setData('social_links', { ...data.social_links, [platform]: value });
    };

    const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('resume', file);
    };

    const removeResume = () => {
        router.delete(route('profile.resume.remove'), {
            preserveScroll: true,
        });
    };

    const clearResumeSelection = () => {
        setData('resume', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <form onSubmit={submit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                        <HeadingSmall title="Basic information" description="Update your name, username, and contact details" />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm">/u/</span>
                                    <Input
                                        id="username"
                                        className="flex-1"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                                        placeholder="username"
                                        autoComplete="username"
                                    />
                                </div>
                                <InputError message={errors.username} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="Email address"
                            />
                            <InputError message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="headline">Headline</Label>
                            <Input
                                id="headline"
                                value={data.headline}
                                onChange={(e) => setData('headline', e.target.value)}
                                placeholder="e.g. Full-Stack Developer | Open Source Enthusiast"
                            />
                            <InputError message={errors.headline} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Short bio</Label>
                            <Textarea
                                id="bio"
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                placeholder="A brief description for your profile card..."
                                rows={2}
                            />
                            <p className="text-muted-foreground text-xs">{data.bio.length}/500 characters</p>
                            <InputError message={errors.bio} />
                        </div>
                    </div>

                    <Separator />

                    {/* About Section */}
                    <div className="space-y-6">
                        <HeadingSmall title="About me" description="Tell visitors more about yourself" />

                        <div className="grid gap-2">
                            <Label htmlFor="about">About</Label>
                            <Textarea
                                id="about"
                                value={data.about}
                                onChange={(e) => setData('about', e.target.value)}
                                placeholder="Share your story, experience, interests..."
                                rows={6}
                            />
                            <InputError message={errors.about} />
                        </div>
                    </div>

                    <Separator />

                    {/* Profile Stats */}
                    <div className="space-y-6">
                        <HeadingSmall
                            title="Profile stats"
                            description="Add fun stats to display on your profile (e.g. '2+ years of experience', '100+ cups of coffee')"
                        />

                        <div className="space-y-3">
                            {data.profile_stats.map((stat, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Input
                                        value={stat.value}
                                        onChange={(e) => updateStat(index, 'value', e.target.value)}
                                        placeholder="Value (e.g. 2+)"
                                        className="w-24"
                                    />
                                    <Input
                                        value={stat.label}
                                        onChange={(e) => updateStat(index, 'label', e.target.value)}
                                        placeholder="Label (e.g. years of experience)"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeStat(index)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button type="button" variant="outline" size="sm" onClick={addStat}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add stat
                            </Button>
                        </div>
                        <InputError message={errors.profile_stats} />
                    </div>

                    <Separator />

                    {/* Social Links */}
                    <div className="space-y-6">
                        <HeadingSmall title="Social links" description="Connect your social profiles" />

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="github" className="flex items-center gap-2">
                                    <Github className="h-4 w-4" /> GitHub
                                </Label>
                                <Input
                                    id="github"
                                    type="url"
                                    value={data.social_links.github || ''}
                                    onChange={(e) => updateSocialLink('github', e.target.value)}
                                    placeholder="https://github.com/username"
                                />
                                <InputError message={errors['social_links.github']} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="linkedin" className="flex items-center gap-2">
                                    <Linkedin className="h-4 w-4" /> LinkedIn
                                </Label>
                                <Input
                                    id="linkedin"
                                    type="url"
                                    value={data.social_links.linkedin || ''}
                                    onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                                    placeholder="https://linkedin.com/in/username"
                                />
                                <InputError message={errors['social_links.linkedin']} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="facebook" className="flex items-center gap-2">
                                    <Facebook className="h-4 w-4" /> Facebook
                                </Label>
                                <Input
                                    id="facebook"
                                    type="url"
                                    value={data.social_links.facebook || ''}
                                    onChange={(e) => updateSocialLink('facebook', e.target.value)}
                                    placeholder="https://facebook.com/username"
                                />
                                <InputError message={errors['social_links.facebook']} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="twitter" className="flex items-center gap-2">
                                    <Twitter className="h-4 w-4" /> Twitter / X
                                </Label>
                                <Input
                                    id="twitter"
                                    type="url"
                                    value={data.social_links.twitter || ''}
                                    onChange={(e) => updateSocialLink('twitter', e.target.value)}
                                    placeholder="https://x.com/username"
                                />
                                <InputError message={errors['social_links.twitter']} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="website" className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" /> Website
                                </Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={data.social_links.website || ''}
                                    onChange={(e) => updateSocialLink('website', e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                />
                                <InputError message={errors['social_links.website']} />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Resume Upload */}
                    <div className="space-y-6">
                        <HeadingSmall title="Resume / CV" description="Upload your resume for visitors to download" />

                        <div className="space-y-4">
                            {auth.user.resume_path && !data.resume && (
                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                    <FileText className="h-8 w-8 text-red-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Current resume</p>
                                        <p className="text-muted-foreground text-xs">{auth.user.resume_path.split('/').pop()}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={removeResume}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {data.resume && (
                                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                                    <FileText className="h-8 w-8 text-green-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">New file selected</p>
                                        <p className="text-muted-foreground text-xs">{data.resume.name}</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={clearResumeSelection}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleResumeChange}
                                    className="hidden"
                                    id="resume-upload"
                                />
                                <label htmlFor="resume-upload">
                                    <Button type="button" variant="outline" asChild>
                                        <span>
                                            <Upload className="mr-2 h-4 w-4" />
                                            {auth.user.resume_path ? 'Replace resume' : 'Upload resume'}
                                        </span>
                                    </Button>
                                </label>
                                <p className="text-muted-foreground mt-2 text-xs">PDF, DOC, or DOCX. Max 5MB.</p>
                            </div>
                            <InputError message={errors.resume} />
                        </div>
                    </div>

                    <Separator />

                    {/* Save Button */}
                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Save changes</Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-green-600">Saved successfully!</p>
                        </Transition>
                    </div>
                </form>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
