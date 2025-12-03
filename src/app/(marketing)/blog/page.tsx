"use client";

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/property-kit/status-pill';
import { Calendar, User, ArrowRight, Clock, Tag } from 'lucide-react';

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
            <div className='bg-white min-h-screen'>
                <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-8'>
                    <div className='animate-pulse space-y-8'>
                        <div className='h-10 bg-slate-200 rounded w-1/3'></div>
                        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Card key={i} className='overflow-hidden'>
                                    <div className='h-48 bg-slate-200'></div>
                                    <CardContent className='p-6 space-y-4'>
                                        <div className='h-6 bg-slate-200 rounded w-3/4'></div>
                                        <div className='h-4 bg-slate-200 rounded w-full'></div>
                                        <div className='h-4 bg-slate-200 rounded w-2/3'></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className='bg-white min-h-screen'>
            <main className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-8'>
                {/* Header */}
                <section className='space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
                    <div className='flex flex-wrap items-center gap-3'>
                        <StatusPill tone='success' label='Blog' />
                        <StatusPill tone='neutral' label='Property Insights' />
                    </div>
                    <div>
                        <h1 className='text-4xl font-semibold text-gray-900 font-[family-name:var(--font-space-grotesk)]'>
                            Property Insights & Guides
                        </h1>
                        <p className='mt-3 text-lg text-gray-600'>
                            Expert insights on UK property development, investment strategies, and market analysis.
                        </p>
                    </div>
                </section>

                {/* Categories */}
                {categories && categories.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                        <Badge variant='outline' className='cursor-pointer hover:bg-slate-100'>
                            All Posts
                        </Badge>
                        {categories.map((category) => (
                            <Badge
                                key={category}
                                variant='outline'
                                className='cursor-pointer hover:bg-slate-100'
                            >
                                {category}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Posts Grid */}
                {posts.length === 0 ? (
                    <div className='text-center py-16'>
                        <p className='text-slate-500'>No blog posts yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {posts.map((post) => (
                            <Link key={post._id} href={`/blog/${post.slug}`}>
                                <Card className='overflow-hidden h-full hover:shadow-lg transition-shadow cursor-pointer group'>
                                    {post.featuredImage ? (
                                        <div className='relative h-48 bg-slate-100'>
                                            <Image
                                                src={post.featuredImage}
                                                alt={post.title}
                                                fill
                                                className='object-cover group-hover:scale-105 transition-transform duration-300'
                                            />
                                        </div>
                                    ) : (
                                        <div className='h-48 bg-gradient-to-br from-[var(--pc-blue)] to-blue-600 flex items-center justify-center'>
                                            <span className='text-6xl text-white/20 font-bold'>
                                                {post.title.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <CardContent className='p-6'>
                                        <div className='flex items-center gap-2 mb-3'>
                                            <Badge className='bg-blue-100 text-blue-700 border-0'>
                                                {post.category}
                                            </Badge>
                                            <span className='text-xs text-slate-500 flex items-center gap-1'>
                                                <Clock className='size-3' />
                                                {estimateReadTime(post.content)}
                                            </span>
                                        </div>
                                        <h2 className='text-xl font-semibold text-slate-900 mb-2 group-hover:text-[var(--pc-blue)] transition-colors line-clamp-2'>
                                            {post.title}
                                        </h2>
                                        <p className='text-slate-600 text-sm mb-4 line-clamp-3'>
                                            {post.excerpt}
                                        </p>
                                        <div className='flex items-center justify-between pt-4 border-t border-slate-100'>
                                            <div className='flex items-center gap-2 text-xs text-slate-500'>
                                                <User className='size-3' />
                                                <span>{post.author}</span>
                                            </div>
                                            <div className='flex items-center gap-1 text-xs text-slate-500'>
                                                <Calendar className='size-3' />
                                                <span>{post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BlogPage;
