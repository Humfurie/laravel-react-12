import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import Footer from '@/components/global/Footer';

interface Blog {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    status: 'draft' | 'published' | 'private';
    featured_image: string | null;
    display_image: string | null;
    meta_data: {
        meta_title?: string;
        meta_description?: string;
        meta_keywords?: string;
    } | null;
    isPrimary: boolean;
    sort_order: number;
    view_count: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    status_label: string;
}

interface Props {
    blog: Blog;
}
export default function BlogPost({ blog }: Props) {
    return (
        <>
            <Head title={blog.meta_data?.meta_title || blog.title}>
                <meta
                    name="description"
                    content={blog.meta_data?.meta_description || blog.excerpt || ''}
                />
                <meta
                    name="keywords"
                    content={blog.meta_data?.meta_keywords || ''}
                />
            </Head>

            <div className="min-h-screen bg-muted-white">
                {/* Hero Section with Featured Image */}
                <section className={`relative overflow-hidden ${blog.display_image ? '' : 'bg-gradient-to-br from-brand-orange via-brand-gold to-brand-orange'}`}>
                    {/* Featured Image Background */}
                    {blog.display_image && (
                        <div className="absolute inset-0">
                            <img
                                src={blog.display_image}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                        </div>
                    )}

                    {/* Hero Content */}
                    <div className={`relative z-10 py-24 ${blog.display_image ? 'text-white' : 'text-white'}`}>
                        <div className="container mx-auto px-4 max-w-4xl">
                            <Link href="/blog">
                                <Button variant="ghost" className="mb-8 text-white hover:bg-white/20 border-white/30">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Blog
                                </Button>
                            </Link>

                            <div className="space-y-6">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className="bg-white/20 text-white border-white/30">{blog.status_label}</Badge>
                                    {blog.isPrimary && (
                                        <Badge className="bg-gradient-to-r from-brand-orange to-brand-gold text-white border-0">
                                            ⭐ Featured
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                                    {blog.title}
                                </h1>

                                {blog.excerpt && (
                                    <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                                        {blog.excerpt}
                                    </p>
                                )}

                                <div className="flex items-center gap-6 text-sm text-white/80">
                                    {blog.published_at && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {format(new Date(blog.published_at), 'MMMM dd, yyyy')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>Admin</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>👁️ {blog.view_count || 0} views</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Blog Content */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="prose prose-lg max-w-none prose-headings:text-brand-black prose-p:text-gray-700 prose-a:text-brand-orange prose-strong:text-brand-black w-full">
                            <div
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                                className="blog-content leading-relaxed w-full [&>*]:w-full [&_img]:w-full [&_img]:max-w-full [&_img]:h-auto [&_p]:w-full [&_div]:w-full [&_figure]:w-full [&_table]:w-full [&_blockquote]:w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* Back to Blog */}
                <section className="py-12 bg-gradient-to-r from-brand-orange to-brand-gold">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <Link href="/blog">
                            <Button className="bg-white text-brand-orange hover:bg-gray-100 px-8 py-3 rounded-xl shadow-lg">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to All Posts
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}
