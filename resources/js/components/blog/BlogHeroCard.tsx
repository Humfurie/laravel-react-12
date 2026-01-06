import { BlogCategoryBadge } from '@/components/blog/BlogCategoryBadge';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Calendar, Eye } from 'lucide-react';

interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    display_image: string | null;
    category_slug: string;
    category_label: string;
    view_count: number;
    published_at: string | null;
}

interface BlogHeroCardProps {
    blog: Blog;
}

export function BlogHeroCard({ blog }: BlogHeroCardProps) {
    const handleClick = () => {
        router.visit(`/blog/${blog.slug}`);
    };

    return (
        <div
            onClick={handleClick}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
        >
            <div className="grid gap-0 lg:grid-cols-2">
                {/* Image Section */}
                <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-[400px]">
                    {blog.display_image ? (
                        <img
                            src={blog.display_image}
                            alt={blog.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="from-brand-orange flex h-full w-full items-center justify-center bg-gradient-to-br to-orange-400">
                            <span className="text-6xl font-bold text-white/20">BLOG</span>
                        </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-gradient-to-r" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                        <BlogCategoryBadge categorySlug={blog.category_slug} categoryLabel={blog.category_label} size="md" />
                    </div>

                    {/* View Count Badge */}
                    <div className="absolute right-4 bottom-4 z-10 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700 backdrop-blur-sm">
                        <Eye className="h-4 w-4" />
                        {blog.view_count || 0}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col justify-center p-6 lg:p-10">
                    <div className="mb-4">
                        <span className="bg-brand-orange/10 text-brand-orange inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                            Latest Post
                        </span>
                    </div>

                    <h2 className="group-hover:text-brand-orange mb-4 text-2xl leading-tight font-bold text-gray-900 transition-colors lg:text-3xl xl:text-4xl">
                        {blog.title}
                    </h2>

                    {blog.excerpt && <p className="mb-6 line-clamp-3 text-gray-600 lg:text-lg">{blog.excerpt}</p>}

                    <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
                        {blog.published_at && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })}
                            </span>
                        )}
                    </div>

                    <Button className="bg-brand-orange hover:bg-brand-orange/90 w-fit rounded-xl px-6 py-3 text-white shadow-lg transition-all duration-300 group-hover:translate-x-1 hover:shadow-xl">
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
