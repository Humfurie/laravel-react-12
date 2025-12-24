import GitHubContributionGraph from '@/components/github-contribution-graph';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Code, ExternalLink, GitFork, GitPullRequest, MessageSquare, Star } from 'lucide-react';

interface ContributionDay {
    contributionCount: number;
    date: string;
    color: string;
}

interface ContributionWeek {
    contributionDays: ContributionDay[];
}

interface GitHubContributions {
    total_contributions: number;
    commits: number;
    pull_requests: number;
    issues: number;
    reviews: number;
    private_contributions: number;
    calendar: ContributionWeek[];
    top_repositories: {
        name: string;
        stars: number;
        forks: number;
        language: string | null;
        language_color: string | null;
    }[];
}

interface Project {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    thumbnail_url: string | null;
    contributions: number;
}

interface UserProfile {
    id: number;
    name: string;
    username: string;
    bio: string | null;
    avatar_url: string | null;
    github_username: string | null;
    github_contributions: GitHubContributions | null;
    github_synced_at: string | null;
    created_at: string;
}

interface ProfileProps {
    user: UserProfile;
    contributedProjects: Project[];
}

export default function Profile({ user, contributedProjects }: ProfileProps) {
    const contributions = user.github_contributions;

    return (
        <>
            <Head title={`${user.name} (@${user.username})`} />

            <div className="bg-background min-h-screen">
                <div className="mx-auto max-w-4xl px-4 py-8">
                    {/* Profile Header */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                                    <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>

                                <div className="flex-1 text-center sm:text-left">
                                    <h1 className="text-2xl font-bold">{user.name}</h1>
                                    <p className="text-muted-foreground">@{user.username}</p>

                                    {user.bio && <p className="text-muted-foreground mt-2">{user.bio}</p>}

                                    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                                        {user.github_username && (
                                            <a
                                                href={`https://github.com/${user.github_username}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
                                            >
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                </svg>
                                                {user.github_username}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}

                                        <span className="text-muted-foreground text-sm">
                                            <Calendar className="mr-1 inline h-4 w-4" />
                                            Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* GitHub Contributions */}
                    {contributions && (
                        <>
                            {/* Contribution Stats */}
                            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{contributions.total_contributions}</div>
                                            <div className="text-muted-foreground text-xs">Contributions</div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                                                <Code className="h-5 w-5" />
                                                {contributions.commits}
                                            </div>
                                            <div className="text-muted-foreground text-xs">Commits</div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                                                <GitPullRequest className="h-5 w-5" />
                                                {contributions.pull_requests}
                                            </div>
                                            <div className="text-muted-foreground text-xs">Pull Requests</div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                                                <MessageSquare className="h-5 w-5" />
                                                {contributions.issues}
                                            </div>
                                            <div className="text-muted-foreground text-xs">Issues</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Contribution Graph */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">Contribution Activity</CardTitle>
                                    <CardDescription>{contributions.total_contributions} contributions in the last year</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <GitHubContributionGraph calendar={contributions.calendar} />
                                </CardContent>
                            </Card>

                            {/* Top Repositories */}
                            {contributions.top_repositories && contributions.top_repositories.length > 0 && (
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Top Repositories</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {contributions.top_repositories.map((repo, idx) => (
                                                <a
                                                    key={idx}
                                                    href={`https://github.com/${user.github_username}/${repo.name}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{repo.name}</span>
                                                        {repo.language && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <span
                                                                    className="mr-1 inline-block h-2 w-2 rounded-full"
                                                                    style={{ backgroundColor: repo.language_color || '#8b949e' }}
                                                                />
                                                                {repo.language}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-4 w-4" />
                                                            {repo.stars}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <GitFork className="h-4 w-4" />
                                                            {repo.forks}
                                                        </span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}

                    {/* Contributed Projects */}
                    {contributedProjects.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Project Contributions</CardTitle>
                                <CardDescription>Projects on this site that {user.name} has contributed to</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {contributedProjects.map((project) => (
                                        <Link
                                            key={project.id}
                                            href={route('projects.index') + `#${project.slug}`}
                                            className="hover:bg-muted/50 flex items-center gap-4 rounded-lg border p-3 transition-colors"
                                        >
                                            {project.thumbnail_url && (
                                                <img src={project.thumbnail_url} alt={project.title} className="h-12 w-12 rounded object-cover" />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-medium">{project.title}</h3>
                                                <p className="text-muted-foreground line-clamp-1 text-sm">{project.short_description}</p>
                                            </div>
                                            <Badge variant="secondary">
                                                {project.contributions} commit{project.contributions !== 1 ? 's' : ''}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {!contributions && contributedProjects.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">No public activity to show yet.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
