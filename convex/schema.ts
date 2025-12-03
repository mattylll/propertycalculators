import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Blog posts
  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(), // Markdown content
    featuredImage: v.optional(v.string()),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
    author: v.string(),
    authorId: v.optional(v.id("users")),
    metaDescription: v.optional(v.string()),
    metaKeywords: v.optional(v.array(v.string())),
    status: v.string(), // draft, published
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_published", ["status", "publishedAt"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    createdAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]),

  deals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    address: v.string(),
    localAuthority: v.optional(v.string()),
    lat: v.optional(v.number()),
    long: v.optional(v.number()),

    // PD Assessment
    pdData: v.optional(v.object({
      existingUse: v.string(),
      proposedUse: v.string(),
      gia: v.number(),
      storeys: v.number(),
      targetUnits: v.number(),
      articleFour: v.boolean(),
      heritage: v.boolean(),
      pdRoute: v.string(),
      reasoning: v.string(),
      completed: v.boolean(),
    })),

    // GDV Assessment
    gdvData: v.optional(v.object({
      postcode: v.string(),
      propertyType: v.string(),
      bedrooms: v.number(),
      totalUnits: v.number(),
      avgSqft: v.number(),
      newBuildPremium: v.number(),
      totalGdv: v.number(),
      gdvPerUnit: v.number(),
      gdvPerSqft: v.number(),
      reasoning: v.string(),
      completed: v.boolean(),
    })),

    // Build Cost Assessment
    buildCostData: v.optional(v.object({
      totalGia: v.number(),
      buildType: v.string(),
      specLevel: v.string(),
      region: v.string(),
      storeys: v.number(),
      contingency: v.number(),
      professionalFees: v.number(),
      totalCost: v.number(),
      costPerSqm: v.number(),
      reasoning: v.string(),
      completed: v.boolean(),
    })),

    // Finance Assessment
    financeData: v.optional(v.object({
      purchasePrice: v.number(),
      buildCost: v.number(),
      gdv: v.number(),
      termMonths: v.number(),
      targetLtc: v.number(),
      requireMezzanine: v.boolean(),
      seniorDebtAmount: v.number(),
      equityRequired: v.number(),
      totalLtc: v.number(),
      profitOnCost: v.number(),
      lenderAppetite: v.string(),
      reasoning: v.string(),
      completed: v.boolean(),
    })),

    // AI Summary
    aiSummary: v.optional(v.string()),

    // Status
    status: v.string(), // draft, complete, finance_submitted, finance_approved
    currentStep: v.number(), // 1=PD, 2=GDV, 3=BuildCost, 4=Finance

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
});
