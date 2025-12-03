"use client";

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, Clock, BookOpen, ChevronRight, Sparkles, PenTool } from 'lucide-react';

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
};

const BlogPage = () => {
    const posts = useQuery(api.posts.listPublished, { limit: 20 });
    const categories = useQuery(api.posts.getCategories, {});

    if (posts === undefined) {
        return (
            <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50'>
                <div className='relative overflow-hidden border-b border-slate-200/60'>
                    <div className='hero-gradient-mesh absolute inset-0 opacity-30' />
                    <div className='relative mx-auto max-w-7xl px-6 py-16 lg:px-8'>
                        <div className='animate-pulse'>
                            <div className='h-6 bg-slate-200 rounded-full w-24 mb-6'></div>
                            <div className='h-12 bg-slate-200 rounded-xl w-1/2 mb-4'></div>
                            <div className='h-5 bg-slate-200 rounded-lg w-2/3'></div>
                        </div>
                    </div>
                </div>
                <main className='mx-auto max-w-7xl px-6 py-16 lg:px-8'>
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className='rounded-2xl border-2 border-slate-200 bg-white overflow-hidden'>
                                <div className='h-48 bg-slate-200 animate-pulse'></div>
                                <div className='p-6 space-y-4'>
                                    <div className='h-6 bg-slate-200 rounded-lg w-3/4 animate-pulse'></div>
                                    <div className='h-4 bg-slate-200 rounded w-full animate-pulse'></div>
                                    <div className='h-4 bg-slate-200 rounded w-2/3 animate-pulse'></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50'>
            {/* Hero Section */}
            <div className='relative overflow-hidden border-b border-slate-200/60'>
                {/* Animated Background */}
                <div className='hero-gradient-mesh absolute inset-0 opacity-40' />
                <div className='hero-orb-1 absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-purple-500 to-pink-500' />
                <div className='hero-orb-2 absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-blue-500 to-cyan-500' />

                <div className='relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20'>
                    {/* Breadcrumb */}
                    <nav className='hero-fade-up mb-8'>
                        <ol className='flex items-center gap-2 text-sm'>
                            <li>
                                <Link href='/' className='text-slate-500 hover:text-purple-600 transition-colors'>
                                    Home
                                </Link>
                            </li>
                            <ChevronRight className='size-4 text-slate-400' />
                            <li className='font-medium text-slate-900'>Blog</li>
                        </ol>
                    </nav>

                    <div className='max-w-3xl'>
                        <div className='hero-fade-up flex items-center gap-3 mb-6'>
                            <span className='section-badge'>
                                <PenTool className='mr-1.5 size-3.5' />
                                Property Insights
                            </span>
                        </div>
                        <h1 className='hero-fade-up-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl font-[family-name:var(--font-space-grotesk)]'>
                            Property Insights{' '}
                            <span className='bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent'>
                                & Guides
                            </span>
                        </h1>
                        <p className='hero-fade-up-3 mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed'>
                            Expert insights on UK property development, investment strategies, and market analysis.
                        </p>

                        {/* Stats */}
                        <div className='hero-fade-up-4 mt-8 flex flex-wrap items-center gap-4'>
                            <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm'>
                                <BookOpen className='size-4 text-purple-600' />
                                <span className='text-sm font-semibold text-slate-700'>{posts?.length || 0} articles</span>
                            </div>
                            <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm'>
                                <Sparkles className='size-4 text-amber-500' />
                                <span className='text-sm font-semibold text-slate-700'>Expert insights</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className='mx-auto max-w-7xl px-6 py-16 lg:px-8'>
                {/* Categories */}
                {categories && categories.length > 0 && (
                    <div className='flex flex-wrap gap-3 mb-12'>
                        <button className='px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40'>
                            All Posts
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                className='px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-slate-600 border-2 border-slate-200 hover:border-purple-300 hover:text-purple-600 transition-all'
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}

                {/* Posts Grid */}
                {posts.length === 0 ? (
                    <div className='relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-16 text-center'>
                        <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full blur-3xl' />
                        <div className='relative'>
                            <div className='mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl shadow-purple-500/30 mb-8'>
                                <BookOpen className='size-10 text-white' />
                            </div>
                            <h3 className='text-2xl font-bold text-slate-900 mb-3 font-[family-name:var(--font-space-grotesk)]'>No blog posts yet</h3>
                            <p className='text-slate-600 max-w-md mx-auto'>
                                Check back soon for expert insights on UK property development and investment.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {posts.map((post) => (
                            <Link key={post._id} href={`/blog/${post.slug}`}>
                                <div className='group relative h-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white transition-all duration-300 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1'>
                                    {/* Hover gradient */}
                                    <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity z-10' />

                                    {post.featuredImage ? (
                                        <div className='relative h-52 bg-slate-100 overflow-hidden'>
                                            <Image
                                                src={post.featuredImage}
                                                alt={post.title}
                                                fill
                                                className='object-cover group-hover:scale-105 transition-transform duration-500'
                                            />
                                            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
                                        </div>
                                    ) : (
                                        <div className='relative h-52 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center overflow-hidden'>
                                            <span className='text-8xl text-white/20 font-bold'>
                                                {post.title.charAt(0)}
                                            </span>
                                            <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent' />
                                        </div>
                                    )}
                                    <div className='relative p-6'>
                                        <div className='flex items-center gap-3 mb-4'>
                                            <Badge className='bg-purple-100 text-purple-700 border-0 font-semibold'>
                                                {post.category}
                                            </Badge>
                                            <span className='text-xs text-slate-500 flex items-center gap-1.5 font-medium'>
                                                <Clock className='size-3.5' />
                                                {estimateReadTime(post.content)}
                                            </span>
                                        </div>
                                        <h2 className='text-xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2'>
                                            {post.title}
                                        </h2>
                                        <p className='text-slate-600 text-sm mb-5 line-clamp-3 leading-relaxed'>
                                            {post.excerpt}
                                        </p>
                                        <div className='flex items-center justify-between pt-5 border-t border-slate-100'>
                                            <div className='flex items-center gap-2.5 text-sm text-slate-500'>
                                                <div className='size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold'>
                                                    {post.author.charAt(0)}
                                                </div>
                                                <span className='font-medium'>{post.author}</span>
                                            </div>
                                            <div className='flex items-center gap-1.5 text-xs text-slate-400 font-medium'>
                                                <Calendar className='size-3.5' />
                                                <span>{post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BlogPage;
