import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Store a calculator submission
export const store = mutation({
  args: {
    calculatorType: v.string(),
    calculatorSlug: v.string(),
    formData: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    // Get the user from our users table if authenticated
    let userId = undefined;
    let userEmail = undefined;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .unique();

      if (user) {
        userId = user._id;
        userEmail = user.email;
      } else {
        userEmail = identity.email ?? undefined;
      }
    }

    const now = Date.now();

    // Check if user already has a submission for this calculator
    if (userId) {
      const existing = await ctx.db
        .query("calculatorSubmissions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("calculatorSlug"), args.calculatorSlug))
        .first();

      if (existing) {
        // Update existing submission
        await ctx.db.patch(existing._id, {
          formData: args.formData,
          source: args.source,
          updatedAt: now,
        });
        return existing._id;
      }
    }

    // Create new submission
    return await ctx.db.insert("calculatorSubmissions", {
      userId,
      userEmail,
      calculatorType: args.calculatorType,
      calculatorSlug: args.calculatorSlug,
      formData: args.formData,
      source: args.source,
      followUpStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all submissions for admin dashboard
export const listAll = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let submissions;

    if (args.status) {
      submissions = await ctx.db
        .query("calculatorSubmissions")
        .withIndex("by_followup", (q) => q.eq("followUpStatus", args.status))
        .order("desc")
        .take(args.limit ?? 50);
    } else {
      submissions = await ctx.db
        .query("calculatorSubmissions")
        .order("desc")
        .take(args.limit ?? 50);
    }

    // Enrich with user data
    return Promise.all(
      submissions.map(async (submission) => {
        let user = null;
        if (submission.userId) {
          user = await ctx.db.get(submission.userId);
        }
        return {
          ...submission,
          user: user ? { name: user.name, email: user.email } : null,
        };
      })
    );
  },
});

// Get submissions by calculator type
export const listByCalculator = query({
  args: {
    calculatorSlug: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calculatorSubmissions")
      .withIndex("by_calculator", (q) => q.eq("calculatorSlug", args.calculatorSlug))
      .order("desc")
      .take(args.limit ?? 20);
  },
});

// Get user's own submissions
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("calculatorSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Update follow-up status (admin)
export const updateFollowUpStatus = mutation({
  args: {
    submissionId: v.id("calculatorSubmissions"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      followUpStatus: args.status,
      followUpNotes: args.notes,
      updatedAt: Date.now(),
    });
  },
});

// Get submission stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("calculatorSubmissions").collect();

    const byCalculator: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const submission of all) {
      byCalculator[submission.calculatorSlug] = (byCalculator[submission.calculatorSlug] || 0) + 1;
      if (submission.followUpStatus) {
        byStatus[submission.followUpStatus] = (byStatus[submission.followUpStatus] || 0) + 1;
      }
    }

    return {
      total: all.length,
      byCalculator,
      byStatus,
      recentCount: all.filter(s => s.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
    };
  },
});
