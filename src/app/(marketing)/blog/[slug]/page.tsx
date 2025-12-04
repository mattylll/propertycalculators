"use client";

import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, Clock, Tag, Share2, ChevronRight, ArrowRight, Calculator } from 'lucide-react';
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

// Parse markdown tables to HTML
const parseTable = (tableString: string): string => {
    const lines = tableString.trim().split('\n');
    if (lines.length < 2) return tableString;

    // Check if this is a valid table (has separator row with dashes)
    const separatorIndex = lines.findIndex(line => /^\|[\s-:|]+\|$/.test(line.trim()));
    if (separatorIndex === -1) return tableString;

    const headerLine = lines[0];
    const bodyLines = lines.slice(separatorIndex + 1);

    // Parse header
    const headers = headerLine
        .split('|')
        .filter(cell => cell.trim())
        .map(cell => cell.trim());

    // Parse body rows
    const rows = bodyLines
        .filter(line => line.trim() && line.includes('|'))
        .map(line =>
            line
                .split('|')
                .filter(cell => cell.trim() !== '' || line.split('|').length > 2)
                .slice(line.startsWith('|') ? 1 : 0)
                .map(cell => cell.trim())
                .filter((_, i, arr) => i < arr.length - (line.endsWith('|') ? 1 : 0) || arr[i] !== '')
        );

    // Build HTML table
    let html = '<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-slate-200 rounded-lg overflow-hidden">';

    // Header
    html += '<thead class="bg-slate-50"><tr>';
    headers.forEach(header => {
        html += `<th class="border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900">${header}</th>`;
    });
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    rows.forEach((row, rowIndex) => {
        const bgClass = rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';
        html += `<tr class="${bgClass}">`;
        row.forEach((cell, cellIndex) => {
            if (cellIndex < headers.length) {
                // Check if cell contains bold text for emphasis
                const isBold = cell.startsWith('**') && cell.endsWith('**');
                const cellContent = isBold ? cell.slice(2, -2) : cell;
                const fontWeight = isBold ? 'font-semibold' : '';
                html += `<td class="border border-slate-200 px-4 py-3 text-sm text-slate-700 ${fontWeight}">${cellContent}</td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody></table></div>';

    return html;
};

// Simple markdown to HTML converter
const parseMarkdown = (markdown: string): string => {
    let html = markdown;

    // First, handle tables (before other processing that might interfere)
    // Match table blocks (lines starting with |)
    const tableRegex = /(?:^|\n)((?:\|[^\n]+\|\n?)+)/gm;
    html = html.replace(tableRegex, (match, tableContent) => {
        // Check if it's a valid table (has header separator row)
        if (/\|[\s-:|]+\|/.test(tableContent)) {
            return '\n' + parseTable(tableContent) + '\n';
        }
        return match;
    });

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
            <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50'>
                <div className='relative overflow-hidden border-b border-slate-200/60'>
                    <div className='hero-gradient-mesh absolute inset-0 opacity-30' />
                    <div className='relative mx-auto max-w-4xl px-6 py-16 lg:px-8'>
                        <div className='animate-pulse space-y-6'>
                            <div className='h-6 bg-slate-200 rounded-full w-32'></div>
                            <div className='h-12 bg-slate-200 rounded-xl w-3/4'></div>
                            <div className='h-5 bg-slate-200 rounded-lg w-2/3'></div>
                        </div>
                    </div>
                </div>
                <main className='mx-auto max-w-4xl px-6 py-16 lg:px-8'>
                    <div className='h-80 bg-slate-200 rounded-2xl animate-pulse mb-12'></div>
                    <div className='space-y-4'>
                        <div className='h-4 bg-slate-200 rounded w-full animate-pulse'></div>
                        <div className='h-4 bg-slate-200 rounded w-5/6 animate-pulse'></div>
                        <div className='h-4 bg-slate-200 rounded w-4/6 animate-pulse'></div>
                    </div>
                </main>
            </div>
        );
    }

    if (post === null) {
        return (
            <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50'>
                <div className='relative overflow-hidden'>
                    <div className='hero-gradient-mesh absolute inset-0 opacity-40' />
                    <div className='hero-orb-1 absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-purple-500 to-pink-500' />

                    <main className='relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-8 px-6 pb-16 pt-24 lg:px-8'>
                        <div className='mx-auto flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl shadow-purple-500/30 mb-4'>
                            <ArrowLeft className='size-12 text-white' />
                        </div>
                        <h1 className='text-3xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]'>Post not found</h1>
                        <p className='text-lg text-slate-600 text-center max-w-md'>The blog post you're looking for doesn't exist or has been removed.</p>
                        <Link href='/blog'>
                            <Button className='gap-2 h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30'>
                                <ArrowLeft className='size-4' />
                                Back to Blog
                            </Button>
                        </Link>
                    </main>
                </div>
            </div>
        );
    }

    // Filter out current post from related posts
    const filteredRelated = relatedPosts?.filter(p => p._id !== post._id).slice(0, 3) || [];

    return (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50'>
            {/* Hero Section */}
            <div className='relative overflow-hidden border-b border-slate-200/60'>
                {/* Animated Background */}
                <div className='hero-gradient-mesh absolute inset-0 opacity-40' />
                <div className='hero-orb-1 absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-purple-500 to-pink-500' />
                <div className='hero-orb-2 absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-blue-500 to-cyan-500' />

                <div className='relative mx-auto max-w-4xl px-6 py-12 lg:px-8'>
                    {/* Breadcrumb */}
                    <nav className='hero-fade-up mb-8'>
                        <ol className='flex items-center gap-2 text-sm'>
                            <li>
                                <Link href='/' className='text-slate-500 hover:text-purple-600 transition-colors'>
                                    Home
                                </Link>
                            </li>
                            <ChevronRight className='size-4 text-slate-400' />
                            <li>
                                <Link href='/blog' className='text-slate-500 hover:text-purple-600 transition-colors'>
                                    Blog
                                </Link>
                            </li>
                            <ChevronRight className='size-4 text-slate-400' />
                            <li className='font-medium text-slate-900 truncate max-w-[200px]'>{post.title}</li>
                        </ol>
                    </nav>

                    {/* Article Header */}
                    <header className='hero-fade-up-2'>
                        <div className='flex flex-wrap items-center gap-3 mb-6'>
                            <Badge className='bg-purple-100 text-purple-700 border-0 font-semibold px-3 py-1'>
                                {post.category}
                            </Badge>
                            <span className='text-sm text-slate-500 flex items-center gap-1.5 font-medium'>
                                <Clock className='size-4' />
                                {estimateReadTime(post.content)}
                            </span>
                        </div>

                        <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)] leading-tight mb-6'>
                            {post.title}
                        </h1>

                        <p className='text-lg sm:text-xl text-slate-600 leading-relaxed mb-8'>
                            {post.excerpt}
                        </p>

                        <div className='flex items-center justify-between p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm'>
                            <div className='flex items-center gap-4'>
                                <div className='size-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30'>
                                    {post.author.charAt(0)}
                                </div>
                                <div>
                                    <p className='font-semibold text-slate-900'>{post.author}</p>
                                    <p className='text-sm text-slate-500 flex items-center gap-1.5'>
                                        <Calendar className='size-3.5' />
                                        {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
                                    </p>
                                </div>
                            </div>
                            <Button variant='outline' size='sm' className='gap-2 border-2 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 transition-all'>
                                <Share2 className='size-4' />
                                Share
                            </Button>
                        </div>
                    </header>
                </div>
            </div>

            <main className='mx-auto max-w-4xl px-6 py-12 lg:px-8'>
                {/* Featured Image */}
                {post.featuredImage && (
                    <div className='relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-xl'>
                        <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className='object-cover'
                            priority
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/10 to-transparent' />
                    </div>
                )}

                {/* Article Content */}
                <article
                    className='prose prose-slate prose-lg max-w-none mb-12'
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className='flex flex-wrap items-center gap-3 py-8 border-y border-slate-200'>
                        <Tag className='size-5 text-slate-400' />
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant='outline' className='text-slate-600 border-2 px-3 py-1 hover:border-purple-300 hover:text-purple-600 transition-all cursor-pointer'>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Related Posts */}
                {filteredRelated.length > 0 && (
                    <section className='py-12'>
                        <div className='flex items-center justify-between mb-8'>
                            <h2 className='text-2xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]'>Related Articles</h2>
                            <Link href='/blog' className='flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors'>
                                View all
                                <ArrowRight className='size-4' />
                            </Link>
                        </div>
                        <div className='grid gap-6 md:grid-cols-3'>
                            {filteredRelated.map((relatedPost) => (
                                <Link key={relatedPost._id} href={`/blog/${relatedPost.slug}`}>
                                    <div className='group h-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white transition-all duration-300 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1'>
                                        {relatedPost.featuredImage ? (
                                            <div className='relative h-36 bg-slate-100 overflow-hidden'>
                                                <Image
                                                    src={relatedPost.featuredImage}
                                                    alt={relatedPost.title}
                                                    fill
                                                    className='object-cover group-hover:scale-105 transition-transform duration-500'
                                                />
                                            </div>
                                        ) : (
                                            <div className='h-36 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500' />
                                        )}
                                        <div className='p-5'>
                                            <Badge className='bg-purple-100 text-purple-700 border-0 text-xs font-semibold mb-3'>
                                                {relatedPost.category}
                                            </Badge>
                                            <h3 className='font-bold text-slate-900 line-clamp-2 group-hover:text-purple-600 transition-colors'>
                                                {relatedPost.title}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA */}
                <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 mt-8'>
                    {/* Background decorations */}
                    <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl' />
                    <div className='absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-3xl' />

                    <div className='relative text-center'>
                        <div className='mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 mb-6'>
                            <Calculator className='size-8 text-white' />
                        </div>
                        <h3 className='text-2xl sm:text-3xl font-bold text-white mb-4 font-[family-name:var(--font-space-grotesk)]'>
                            Ready to run the numbers?
                        </h3>
                        <p className='text-slate-400 mb-8 max-w-md mx-auto'>
                            Use our free calculators to analyse your next property deal.
                        </p>
                        <Link href='/calculators'>
                            <Button className='gap-2 h-14 px-8 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40'>
                                Explore Calculators
                                <ArrowRight className='size-5' />
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BlogPostPage;
