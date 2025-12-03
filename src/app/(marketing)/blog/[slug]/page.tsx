"use client";

import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/property-kit/status-pill';
import { Calendar, User, ArrowLeft, Clock, Tag, Share2, Bookmark } from 'lucide-react';
import { useMemo } from 'react';

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

// Simple markdown to HTML converter
const parseMarkdown = (markdown: string): string => {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-slate-900 mt-8 mb-4">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-slate-900 mt-10 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-slate-900 mt-12 mb-6">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" class="text-[var(--pc-blue)] hover:underline">$1</a>');

    // Unordered lists
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-6 list-disc text-slate-700">$1</li>');

    // Ordered lists
    html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-6 list-decimal text-slate-700">$1</li>');

    // Blockquotes
    html = html.replace(/^>\s+(.*$)/gim, '<blockquote class="border-l-4 border-[var(--pc-blue)] pl-4 italic text-slate-600 my-4">$1</blockquote>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<pre class="bg-slate-100 rounded-lg p-4 overflow-x-auto my-4"><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-slate-100 px-1 py-0.5 rounded text-sm">$1</code>');

    // Paragraphs (lines that aren't already wrapped)
    html = html.split('\n\n').map(para => {
        if (para.trim().startsWith('<')) return para;
        if (!para.trim()) return '';
        return `<p class="text-slate-700 leading-relaxed mb-4">${para}</p>`;
    }).join('\n');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="border-slate-200 my-8" />');

    return html;
};

const BlogPostPage = () => {
    const params = useParams();
    const slug = params.slug as string;
    const post = useQuery(api.posts.getBySlug, { slug });
    const relatedPosts = useQuery(api.posts.listPublished, { limit: 3 });

    const contentHtml = useMemo(() => {
        if (!post) return '';
        return parseMarkdown(post.content);
    }, [post]);

    if (post === undefined) {
        return (
            <div className='bg-white min-h-screen'>
                <main className='mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-8'>
                    <div className='animate-pulse space-y-6'>
                        <div className='h-8 bg-slate-200 rounded w-2/3'></div>
                        <div className='h-4 bg-slate-200 rounded w-1/3'></div>
                        <div className='h-64 bg-slate-200 rounded'></div>
                        <div className='space-y-4'>
                            <div className='h-4 bg-slate-200 rounded w-full'></div>
                            <div className='h-4 bg-slate-200 rounded w-5/6'></div>
                            <div className='h-4 bg-slate-200 rounded w-4/6'></div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (post === null) {
        return (
            <div className='bg-white min-h-screen'>
                <main className='mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-8 px-6 pb-16 pt-16 lg:px-8'>
                    <h1 className='text-2xl font-semibold text-slate-900'>Post not found</h1>
                    <p className='text-slate-600'>The blog post you're looking for doesn't exist.</p>
                    <Link href='/blog'>
                        <Button variant='outline' className='gap-2'>
                            <ArrowLeft className='size-4' />
                            Back to Blog
                        </Button>
                    </Link>
                </main>
            </div>
        );
    }

    // Filter out current post from related posts
    const filteredRelated = relatedPosts?.filter(p => p._id !== post._id).slice(0, 3) || [];

    return (
        <div className='bg-white min-h-screen'>
            <main className='mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-8'>
                {/* Back Link */}
                <Link href='/blog' className='flex items-center gap-2 text-slate-600 hover:text-[var(--pc-blue)] transition-colors'>
                    <ArrowLeft className='size-4' />
                    <span>Back to Blog</span>
                </Link>

                {/* Article Header */}
                <header className='space-y-6'>
                    <div className='flex flex-wrap items-center gap-3'>
                        <Badge className='bg-blue-100 text-blue-700 border-0'>
                            {post.category}
                        </Badge>
                        <span className='text-sm text-slate-500 flex items-center gap-1'>
                            <Clock className='size-3' />
                            {estimateReadTime(post.content)}
                        </span>
                    </div>

                    <h1 className='text-4xl md:text-5xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]'>
                        {post.title}
                    </h1>

                    <p className='text-xl text-slate-600'>
                        {post.excerpt}
                    </p>

                    <div className='flex items-center justify-between pt-4 border-t border-slate-200'>
                        <div className='flex items-center gap-4'>
                            <div className='size-10 rounded-full bg-gradient-to-br from-[var(--pc-blue)] to-blue-600 flex items-center justify-center text-white font-semibold'>
                                {post.author.charAt(0)}
                            </div>
                            <div>
                                <p className='font-medium text-slate-900'>{post.author}</p>
                                <p className='text-sm text-slate-500'>
                                    {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button variant='ghost' size='sm' className='gap-2'>
                                <Share2 className='size-4' />
                                Share
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {post.featuredImage && (
                    <div className='relative w-full h-[400px] rounded-2xl overflow-hidden'>
                        <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className='object-cover'
                            priority
                        />
                    </div>
                )}

                {/* Article Content */}
                <article
                    className='prose prose-slate max-w-none'
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className='flex flex-wrap items-center gap-2 pt-8 border-t border-slate-200'>
                        <Tag className='size-4 text-slate-400' />
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant='outline' className='text-slate-600'>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Related Posts */}
                {filteredRelated.length > 0 && (
                    <section className='pt-12 border-t border-slate-200'>
                        <h2 className='text-2xl font-semibold text-slate-900 mb-6'>Related Articles</h2>
                        <div className='grid gap-6 md:grid-cols-3'>
                            {filteredRelated.map((relatedPost) => (
                                <Link key={relatedPost._id} href={`/blog/${relatedPost.slug}`}>
                                    <Card className='overflow-hidden h-full hover:shadow-md transition-shadow'>
                                        {relatedPost.featuredImage ? (
                                            <div className='relative h-32 bg-slate-100'>
                                                <Image
                                                    src={relatedPost.featuredImage}
                                                    alt={relatedPost.title}
                                                    fill
                                                    className='object-cover'
                                                />
                                            </div>
                                        ) : (
                                            <div className='h-32 bg-gradient-to-br from-[var(--pc-blue)] to-blue-600' />
                                        )}
                                        <CardContent className='p-4'>
                                            <Badge className='bg-blue-100 text-blue-700 border-0 text-xs mb-2'>
                                                {relatedPost.category}
                                            </Badge>
                                            <h3 className='font-semibold text-slate-900 line-clamp-2'>
                                                {relatedPost.title}
                                            </h3>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA */}
                <Card className='border-[var(--pc-blue)]/30 bg-gradient-to-br from-blue-50 to-white mt-8'>
                    <CardContent className='p-8 text-center'>
                        <h3 className='text-2xl font-semibold text-slate-900 mb-3'>
                            Ready to run the numbers?
                        </h3>
                        <p className='text-slate-600 mb-6'>
                            Use our free calculators to analyse your next property deal.
                        </p>
                        <Link href='/calculators'>
                            <Button className='bg-[var(--pc-blue)] hover:bg-[var(--pc-blue)]/90'>
                                Explore Calculators
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default BlogPostPage;
