import { Head } from '@inertiajs/react';

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
}

interface Props {
    experiences: Experience[];
}

export default function DebugExperiences({ experiences }: Props) {
    return (
        <>
            <Head title="Debug Experiences" />
            <div className="container mx-auto p-8">
                <h1 className="mb-6 text-3xl font-bold">Experience Data Debug</h1>

                <div className="mb-6 rounded bg-gray-100 p-4">
                    <p className="font-semibold">Total Experiences Received: {experiences?.length || 0}</p>
                </div>

                {!experiences || experiences.length === 0 ? (
                    <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                        <p className="font-bold">No Experiences Data!</p>
                        <p>The experiences prop is empty or undefined.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {experiences.map((exp) => (
                            <div key={exp.id} className="rounded-lg border bg-white p-6 shadow">
                                <div className="flex items-start gap-4">
                                    {exp.image_url ? (
                                        <div>
                                            <img
                                                src={exp.image_url}
                                                alt={exp.company}
                                                className="h-16 w-16 rounded-full border-2 border-gray-200 object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.border = '2px solid red';
                                                }}
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Path: {exp.image_url}</p>
                                        </div>
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                                            <span className="text-gray-400">No img</span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold">{exp.position}</h3>
                                        <p className="text-gray-600">{exp.company}</p>
                                        <p className="text-sm text-gray-500">{exp.location}</p>
                                        <p className="mt-2 text-xs text-gray-400">ID: {exp.id}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-semibold">Description Points:</p>
                                    <ul className="list-inside list-disc text-sm text-gray-700">
                                        {exp.description.map((desc, i) => (
                                            <li key={i}>{desc}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 rounded border border-blue-200 bg-blue-50 p-4">
                    <h2 className="mb-2 font-bold">Raw JSON Data:</h2>
                    <pre className="max-h-96 overflow-auto rounded bg-white p-4 text-xs">{JSON.stringify(experiences, null, 2)}</pre>
                </div>
            </div>
        </>
    );
}
