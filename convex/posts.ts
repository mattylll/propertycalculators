import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query: Get all published posts
export const listPublished = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "published"));

    const posts = await query.order("desc").collect();

    // Filter by category if specified
    let filtered = args.category
      ? posts.filter((p) => p.category === args.category)
      : posts;

    // Apply limit
    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

// Query: Get all posts (for admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect();
    return posts;
  },
});

// Query: Get single post by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return post;
  },
});

// Query: Get single post by ID (for admin)
export const getById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    return post;
  },
});

// Query: Get posts by category
export const getByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let posts = await ctx.db
      .query("posts")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc")
      .collect();

    if (args.limit) {
      posts = posts.slice(0, args.limit);
    }

    return posts;
  },
});

// Query: Get unique categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    const categories = [...new Set(posts.map((p) => p.category))];
    return categories.sort();
  },
});

// Mutation: Create post
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    featuredImage: v.optional(v.string()),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
    author: v.string(),
    metaDescription: v.optional(v.string()),
    metaKeywords: v.optional(v.array(v.string())),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if slug already exists
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error(`A post with slug "${args.slug}" already exists`);
    }

    const postId = await ctx.db.insert("posts", {
      ...args,
      publishedAt: args.status === "published" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

// Mutation: Update post
export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    author: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    metaKeywords: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = Date.now();

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Post not found");
    }

    // If slug is being changed, check it doesn't conflict
    if (updates.slug && updates.slug !== existing.slug) {
      const slugExists = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug!))
        .first();

      if (slugExists) {
        throw new Error(`A post with slug "${updates.slug}" already exists`);
      }
    }

    // Set publishedAt if publishing for the first time
    const publishedAt =
      updates.status === "published" && existing.status !== "published"
        ? now
        : existing.publishedAt;

    await ctx.db.patch(id, {
      ...updates,
      publishedAt,
      updatedAt: now,
    });

    return id;
  },
});

// Mutation: Delete post
export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Mutation: Publish post
export const publish = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "published",
      publishedAt: now,
      updatedAt: now,
    });
    return args.id;
  },
});

// Mutation: Unpublish post
export const unpublish = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "draft",
      updatedAt: Date.now(),
    });
    return args.id;
  },
});
