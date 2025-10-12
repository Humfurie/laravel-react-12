import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

interface Experience {
    id: number;
    company: string;
    image_url: string | null;
    location: string;
    description: string[];
    position: string;
    start_month: number;
    start_year: number;
    end_month: number | null;
    end_year: number | null;
    is_current_position: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    experiences: Experience[];
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(month: number, year: number): string {
    return `${months[month]} ${year}`;
}

// Individual Experience Card Component
function ExperienceCard({ experience }: { experience: Experience }) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this experience?')) {
            router.delete(route('admin.experiences.destroy', experience.id));
        }
    };

    const handleEdit = () => {
        router.visit(route('admin.experiences.edit', experience.id));
    };

    return (
        <div className="hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors" onClick={handleEdit}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 gap-4">
                    {/* Company Logo */}
                    {experience.image_url && (
                        <div className="flex-shrink-0">
                            <img
                                src={experience.image_url}
                                alt={experience.company}
                                className="h-16 w-16 rounded-full border-2 border-gray-200 object-cover"
                            />
                        </div>
                    )}

                    {/* Experience Details */}
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">{experience.position}</h3>
                            {experience.is_current_position && (
                                <Badge variant="secondary" className="text-xs">
                                    Current
                                </Badge>
                            )}
                        </div>

                        <p className="text-muted-foreground text-sm font-medium">{experience.company}</p>
                        <p className="text-muted-foreground text-sm">{experience.location}</p>

                        <p className="text-muted-foreground text-sm">
                            {formatDate(experience.start_month, experience.start_year)} -{' '}
                            {experience.is_current_position ? 'Present' : formatDate(experience.end_month!, experience.end_year!)}
                        </p>

                        <div className="text-muted-foreground text-xs">
                            {experience.description.length} responsibility point{experience.description.length !== 1 ? 's' : ''}
                        </div>

                        <div className="text-muted-foreground text-xs">
                            Last modified: {formatDistanceToNow(new Date(experience.updated_at), { addSuffix: true })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEdit}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}

export default function ExperienceIndex({ experiences }: Props) {
    return (
        <AdminLayout>
            <Head title="Experience Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Work Experience</h1>
                        <p className="text-muted-foreground">Manage your professional experience timeline</p>
                    </div>
                    <Link href={route('admin.experiences.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Experience
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    <div className="text-muted-foreground text-sm">
                        {experiences.length} experience{experiences.length !== 1 ? 's' : ''} found
                    </div>

                    {experiences.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">No experiences found.</p>
                                <Link href={route('admin.experiences.create')} className="mt-4 inline-block">
                                    <Button>Add your first experience</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        experiences.map((experience) => <ExperienceCard key={experience.id} experience={experience} />)
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
