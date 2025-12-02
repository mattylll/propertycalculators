import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    localAuthority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const dealId = await ctx.db.insert("deals", {
      userId: user._id,
      name: args.name,
      address: args.address,
      localAuthority: args.localAuthority,
      status: "draft",
      currentStep: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return dealId;
  },
});

export const updatePdData = mutation({
  args: {
    dealId: v.id("deals"),
    pdData: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.dealId, {
      pdData: args.pdData,
      currentStep: args.pdData.completed ? 2 : 1,
      updatedAt: Date.now(),
    });
  },
});

export const updateGdvData = mutation({
  args: {
    dealId: v.id("deals"),
    gdvData: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.dealId, {
      gdvData: args.gdvData,
      currentStep: args.gdvData.completed ? 3 : 2,
      updatedAt: Date.now(),
    });
  },
});

export const updateBuildCostData = mutation({
  args: {
    dealId: v.id("deals"),
    buildCostData: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.dealId, {
      buildCostData: args.buildCostData,
      currentStep: args.buildCostData.completed ? 4 : 3,
      updatedAt: Date.now(),
    });
  },
});

export const updateFinanceData = mutation({
  args: {
    dealId: v.id("deals"),
    financeData: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.dealId, {
      financeData: args.financeData,
      status: args.financeData.completed ? "complete" : "draft",
      updatedAt: Date.now(),
    });
  },
});

export const get = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.dealId);
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("deals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const deleteDeal = mutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.delete(args.dealId);
  },
});
