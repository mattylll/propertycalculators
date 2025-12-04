import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Seed blog posts for PropertyCalculators.ai
export const seedPhase1Posts = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const posts = [];

    // Post #41: Property Investment Calculators: A Complete Beginner's Guide
    const post1Id = await ctx.db.insert("posts", {
      title: "Property Investment Calculators: A Complete Beginner's Guide",
      slug: "property-investment-calculators-beginners-guide",
      excerpt: "Master UK property investment analysis with our comprehensive guide to property calculators. Learn which tools you need for BTL, development, bridging, and HMO investments.",
      category: "Beginner Guides",
      author: "Matt Lenzie",
      tags: ["property investment", "calculators", "beginners", "BTL", "development", "UK property"],
      metaDescription: "Complete guide to UK property investment calculators. Learn how to analyse BTL, development, bridging and HMO deals like a professional investor.",
      metaKeywords: ["property investment calculator UK", "BTL calculator", "property analysis tools", "rental yield calculator"],
      status: "published",
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
      content: `Property investment analysis can feel overwhelming. Between rental yields, development appraisals, bridging costs, and tax implications, there's a lot to get your head around. The good news? You don't need a finance degree to analyse deals properly. You need the right calculators.

After advising on over £400m of property transactions, I've seen countless investors make costly mistakes because they didn't run the numbers properly. This guide walks you through every calculator you'll need, when to use them, and how they connect to give you a complete picture of any deal.

## Why Property Calculators Matter

Professional investors don't rely on gut feeling. They model every scenario, stress-test their assumptions, and understand exactly where their returns come from. The difference between a good deal and a disaster often comes down to a few percentage points—points you'll only spot with proper analysis.

Consider this: a 1% error in your rental yield calculation on a £200,000 property affects your annual income by £2,000. Over a 10-year hold period, that's £20,000. Small errors compound into major problems.

## Calculator Categories Explained

Our calculators fall into ten categories, each serving a specific investment strategy:

### 1. Landlord Calculators

These are your bread-and-butter tools for buy-to-let investing. Start here if you're buying your first rental property.

**[Buy to Let Calculator](/landlord/buy-to-let-calculator)** — Your primary tool for analysing standard rental properties. Calculates gross yield, net yield, cash-on-cash return, and monthly cashflow after all costs.

**[BTL DSCR Calculator](/landlord/btl-dscr-calculator)** — Debt Service Coverage Ratio is how lenders assess affordability. Most require 125-145% coverage at a stress rate. This calculator tells you if your deal will pass.

**[BTL ICR Calculator](/landlord/btl-icr-calculator)** — Interest Coverage Ratio calculations for portfolio landlords. Essential if you're scaling beyond four properties.

**[BRRR Calculator](/landlord/brrr-calculator)** — The Buy, Refurbish, Refinance, Rent strategy that lets you recycle your deposit. Models the entire lifecycle from purchase through refinance.

**[Stamp Duty Calculator](/landlord/stamp-duty-calculator)** — SDLT calculations including the 3% surcharge on additional properties. A cost many new investors underestimate.

**[Section 24 Tax Impact Calculator](/landlord/section-24-tax-impact-calculator)** — Since 2020, mortgage interest is no longer fully deductible for personal landlords. This calculator shows the true impact on your profits.

### 2. Development Calculators

For anyone adding value through construction or conversion—from single unit refurbs to multi-unit developments.

**[GDV Calculator](/development/gdv-calculator)** — Gross Development Value is where every appraisal starts. What will the finished project sell for?

**[Build Cost Calculator](/development/build-cost-calculator)** — Estimates construction costs using BCIS data and local market rates. Covers new builds, conversions, and refurbishments.

**[Development Finance Calculator](/development/development-finance-calculator)** — Models senior debt facilities with drawdowns against build milestones. Calculates interest roll-up and total facility costs.

**[Profit on Cost Calculator](/development/profit-on-cost-calculator)** — The industry standard for measuring development profitability. Lenders typically want 20%+ on speculative schemes.

**[Residual Land Value Calculator](/development/residual-land-value-calculator)** — Works backwards from GDV to determine the maximum you should pay for land.

### 3. Bridging Calculators

Short-term finance for acquisitions, refurbishments, and auction purchases.

**[Bridging Loan Calculator](/bridging/bridging-loan-calculator)** — Calculate total costs including arrangement fees, exit fees, and interest.

**[Retained vs Rolled Calculator](/bridging/retained-vs-rolled-calculator)** — Compare interest retention against monthly servicing. The cheapest option depends on your term length.

**[Auction Bridge Calculator](/bridging/auction-bridge-calculator)** — Purpose-built for the 28-day auction completion deadline. Includes expedited legal fee estimates.

**[Bridge to Let Calculator](/bridging/bridge-to-let-calculator)** — Model your exit from bridging into a BTL mortgage. Essential for BRRR strategies.

### 4. HMO Calculators

Houses in Multiple Occupation offer higher yields but greater complexity.

**[HMO Viability Calculator](/hmo/hmo-viability-calculator)** — Room-by-room analysis including void periods, bills, and management costs. Shows true net yield.

**[HMO Finance Calculator](/hmo/hmo-finance-calculator)** — Specialist HMO mortgage calculations. Rates and criteria differ from standard BTL.

**[HMO Fire Safety Cost Calculator](/hmo/hmo-fire-safety-cost-calculator)** — Compliance isn't optional. Budget for fire doors, alarms, and emergency lighting.

**[HMO Licence Fee Calculator](/hmo/hmo-licence-fee-calculator)** — Licensing costs vary significantly by council. Factor these into your appraisal.

### 5. Leasehold Calculators

Essential for anyone buying flats or dealing with lease extensions.

**[Lease Extension Calculator](/leasehold/lease-extension-calculator)** — Premium calculations based on remaining term, ground rent, and property value.

**[Ground Rent Calculator](/leasehold/ground-rent-calculator)** — Capitalises future ground rent liability into present value.

**[Service Charge Analyser](/leasehold/service-charge-analyser)** — Review historical charges and forecast future costs.

### 6. Serviced Accommodation Calculators

Short-term lets through Airbnb and similar platforms.

**[SA Profit Calculator](/sa/sa-profit-calculator)** — Revenue modelling with seasonal adjustments, cleaning costs, and platform fees.

**[SA Occupancy Calculator](/sa/sa-occupancy-calculator)** — Estimate realistic occupancy rates by location and property type.

**[Holiday Let Tax Calculator](/sa/holiday-let-tax-calculator)** — Furnished Holiday Let tax treatment differs from standard BTL.

### 7. Commercial Calculators

For commercial-to-residential conversions and mixed-use investments.

**[Commercial Yield Calculator](/commercial/commercial-yield-calculator)** — Net Initial Yield, True Equivalent Yield, and Cap Rate calculations.

### 8. Refurbishment Calculators

Cost estimation for upgrades and renovations.

**[Refurb Cost Calculator](/refurb/refurb-cost-calculator)** — Room-by-room cost estimates for standard refurbishment works.

**[EPC Upgrade Calculator](/refurb/epc-upgrade-calculator)** — MEES compliance costs. All rentals must meet minimum EPC E (soon to be C).

**[Loft Conversion Calculator](/refurb/loft-conversion-calculator)** — ROI analysis for adding accommodation in the roof space.

## Which Calculators Do You Actually Need?

Your investment strategy determines your toolkit. Here's what to use based on your approach:

### First-Time BTL Investor
1. [Buy to Let Calculator](/landlord/buy-to-let-calculator)
2. [Stamp Duty Calculator](/landlord/stamp-duty-calculator)
3. [BTL DSCR Calculator](/landlord/btl-dscr-calculator)
4. [Section 24 Calculator](/landlord/section-24-tax-impact-calculator)

### BRRR Investor
1. [BRRR Calculator](/landlord/brrr-calculator)
2. [Bridging Loan Calculator](/bridging/bridging-loan-calculator)
3. [Bridge to Let Calculator](/bridging/bridge-to-let-calculator)
4. [BTL DSCR Calculator](/landlord/btl-dscr-calculator)
5. [Refurb Cost Calculator](/refurb/refurb-cost-calculator)

### Property Developer
1. [GDV Calculator](/development/gdv-calculator)
2. [Build Cost Calculator](/development/build-cost-calculator)
3. [Development Finance Calculator](/development/development-finance-calculator)
4. [Profit on Cost Calculator](/development/profit-on-cost-calculator)
5. [Residual Land Value Calculator](/development/residual-land-value-calculator)

### HMO Investor
1. [HMO Viability Calculator](/hmo/hmo-viability-calculator)
2. [HMO Finance Calculator](/hmo/hmo-finance-calculator)
3. [HMO Fire Safety Cost Calculator](/hmo/hmo-fire-safety-cost-calculator)
4. [HMO Licence Fee Calculator](/hmo/hmo-licence-fee-calculator)

## Pro Tips for Better Analysis

**Always model the downside.** What happens if rates rise 2%? What if voids double? The best investors stress-test every deal.

**Use current market data.** Achievable rents matter more than asking rents. Check actual let prices on Rightmove or Zoopla.

**Factor in all costs.** Management fees, maintenance reserves, insurance, ground rent, service charges—they all eat into your return.

**Compare like with like.** Net yield versus net yield. Cash-on-cash versus cash-on-cash. Mixing metrics creates confusion.

**Document your assumptions.** When you review deals later, you'll want to know what you were thinking.

## Getting Started

The best way to learn is by doing. Pick a property you're considering—or find one on Rightmove that interests you—and run it through the relevant calculators.

Start with the [Buy to Let Calculator](/landlord/buy-to-let-calculator) for any standard rental. Add the [Stamp Duty Calculator](/landlord/stamp-duty-calculator) to understand your true purchase costs. Then stress-test the financing with the [BTL DSCR Calculator](/landlord/btl-dscr-calculator).

Within an hour, you'll have a professional-grade analysis of whether that deal actually works.

---

*Matt Lenzie is a property finance specialist with experience investing and raising over £400m in equity and debt across UK real estate. He advises SME property developers on senior debt, mezzanine finance and equity solutions.*`
    });
    posts.push(post1Id);

    // Post #16: The Complete Development Appraisal
    const post2Id = await ctx.db.insert("posts", {
      title: "The Complete Development Appraisal: GDV → Build Cost → Finance in 3 Steps",
      slug: "complete-development-appraisal-guide",
      excerpt: "Learn the professional approach to property development appraisals. This workflow guide shows you how to calculate GDV, estimate build costs, and model development finance.",
      category: "Development",
      author: "Matt Lenzie",
      tags: ["development appraisal", "GDV", "build costs", "development finance", "property development"],
      metaDescription: "Professional guide to property development appraisals. Calculate GDV, build costs and development finance step-by-step with real examples.",
      metaKeywords: ["property development appraisal", "GDV calculator UK", "build cost calculator", "development finance calculator"],
      status: "published",
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
      content: `Every successful property development starts with a rigorous appraisal. Get it right, and you've identified a profitable opportunity. Get it wrong, and you could lose years of work and hundreds of thousands of pounds.

After working on developments ranging from single conversions to multi-million pound schemes, I've refined a three-step workflow that professional developers use to appraise every deal. This guide walks you through that process using our suite of development calculators.

## The Three-Step Development Workflow

Development appraisal follows a logical sequence:

1. **GDV** — What will the finished scheme sell (or rent) for?
2. **Build Cost** — What will it cost to create that end product?
3. **Finance** — How will you fund the project, and what will that cost?

Each step informs the next. You can't calculate profit until you know all three numbers. Let's work through a real example.

## Step 1: Calculate Gross Development Value (GDV)

GDV is the total value of your completed development. For a sales scheme, it's the combined sale prices of all units. For a build-to-rent scheme, it's the capitalised value of the rental income.

### Example: 4-Unit Residential Conversion

You're converting an office building into four flats:
- 2 x 1-bed flats (650 sq ft each)
- 2 x 2-bed flats (850 sq ft each)

Research comparable sales in the area:
- 1-bed flats selling at £300/sq ft = £195,000 each
- 2-bed flats selling at £280/sq ft = £238,000 each

**Total GDV: (2 × £195,000) + (2 × £238,000) = £866,000**

Use the [GDV Calculator](/development/gdv-calculator) to model different scenarios. What if the market softens 5%? What if you achieve 10% above comparables?

### Key GDV Considerations

**Be conservative with your comparables.** Use actual sold prices, not asking prices. The Land Registry provides historical data; Rightmove and Zoopla show current listings.

**Account for market timing.** If your build takes 18 months, you're selling into a future market. Factor in realistic growth (or decline) assumptions.

**Consider your buyer profile.** First-time buyers, investors, and downsizers all have different price sensitivities.

## Step 2: Estimate Build Costs

With GDV established, you need to understand what it costs to achieve that end value. Build costs encompass everything from construction to professional fees.

### Cost Categories

**Hard Costs (Construction)**
- Demolition and enabling works
- Substructure (foundations)
- Superstructure (walls, floors, roof)
- Internal fit-out
- External works

**Soft Costs (Professional Fees)**
- Architect (typically 7-12% of build cost)
- Structural engineer
- Planning consultant
- Project manager
- Legal fees

**Contingency**
- 5-10% for straightforward schemes
- 10-15% for complex refurbishments
- 15-20% for heritage or constrained sites

### Example: Our 4-Unit Conversion

Using the [Build Cost Calculator](/development/build-cost-calculator):

| Item | Cost |
|------|------|
| Acquisition (office building) | £400,000 |
| Stamp Duty (commercial rate) | £14,500 |
| Legal fees (purchase) | £3,500 |
| Construction (£85/sq ft × 3,000 sq ft) | £255,000 |
| Professional fees (10%) | £25,500 |
| Contingency (10%) | £28,050 |
| Legal fees (sales) | £4,000 |
| Agent fees (1.5% of GDV) | £12,990 |
| **Total Development Cost** | **£743,540** |

### Build Cost Benchmarks

BCIS (Building Cost Information Service) provides industry-standard rates. For 2025:

- New build residential: £150-200/sq ft
- Residential conversion: £80-130/sq ft
- Light refurbishment: £40-60/sq ft
- Heavy refurbishment: £60-90/sq ft

These vary significantly by region and specification. London typically commands 15-25% premium over national averages.

## Step 3: Model Development Finance

Most developers use external finance. Understanding your funding structure is critical to calculating true profitability.

### Typical Finance Structure

**Senior Debt (60-70% Loan to Cost)**
- Funds the majority of development costs
- Drawn down against build milestones
- Interest typically 8-12% per annum
- Rolled up (added to the loan) rather than serviced monthly

**Mezzanine (10-20% LTC)**
- Bridges the gap between senior debt and equity
- Higher cost (12-18% pa) reflecting higher risk
- Often includes profit share arrangements

**Developer Equity (15-30%)**
- Your cash contribution
- First loss position
- Highest return when successful

### Example: Finance Stack

Using the [Development Finance Calculator](/development/development-finance-calculator):

| Source | Amount | % of Costs | Rate | Term | Cost |
|--------|--------|------------|------|------|------|
| Senior Debt | £520,000 | 70% | 10% | 15 months | £65,000 |
| Equity | £223,540 | 30% | — | — | — |
| **Total Funding** | **£743,540** | **100%** | — | — | **£65,000** |

Note: Interest is calculated on average drawn balance, not full facility, as funds are released against build progress.

## Putting It All Together: Profit Analysis

Now we can calculate profitability:

| Metric | Value |
|--------|-------|
| GDV | £866,000 |
| Total Development Cost | £743,540 |
| Finance Costs | £65,000 |
| **Total Costs** | **£808,540** |
| **Gross Profit** | **£57,460** |
| **Profit on Cost** | **7.1%** |
| **Profit on GDV** | **6.6%** |

Use the [Profit on Cost Calculator](/development/profit-on-cost-calculator) to model these metrics.

### Is This Deal Viable?

At 7.1% profit on cost, this scheme is marginal. Most lenders require 15-20% profit on cost for speculative residential schemes. Here's why:

**Development risk is real.** Costs can overrun. Sales can take longer than expected. The market can shift.

**The margin needs to cover contingencies.** If your 10% contingency gets used and sales take an extra 3 months, your profit evaporates.

**Lender profit requirements exist for good reason.** They're protecting their capital—and indirectly, yours.

### Improving the Deal

Several levers can improve scheme viability:

1. **Negotiate the purchase price** — Work backwards from your target profit to find your maximum land value using the [Residual Land Value Calculator](/development/residual-land-value-calculator)

2. **Value engineer the build** — Can you reduce specification without affecting saleability?

3. **Optimise the unit mix** — Would three larger units achieve higher GDV than four smaller ones?

4. **Phase the development** — Can you sell early phases to fund later ones?

5. **Consider build-to-rent** — Different exit, different economics

## Common Appraisal Mistakes

**Overestimating GDV.** This is the number one killer. Be conservative. Use genuine comparables.

**Underestimating build costs.** Get proper quotes. Don't rely on back-of-envelope calculations.

**Ignoring finance costs.** Interest compounds. A three-month delay on a £500,000 loan at 10% costs £12,500.

**Forgetting soft costs.** Professional fees, CIL, S106, and sales costs add up quickly.

**Insufficient contingency.** Something always goes wrong. Budget for it.

## Next Steps

Ready to appraise your own development? Work through the calculators in order:

1. Start with [GDV Calculator](/development/gdv-calculator) to establish end values
2. Use [Build Cost Calculator](/development/build-cost-calculator) to estimate total costs
3. Model your funding with [Development Finance Calculator](/development/development-finance-calculator)
4. Calculate returns using [Profit on Cost Calculator](/development/profit-on-cost-calculator)
5. If needed, work backwards with [Residual Land Value Calculator](/development/residual-land-value-calculator)

The numbers don't lie. Run them before you commit.

---

*Matt Lenzie is a property finance specialist advising SME developers on senior debt, mezzanine finance and equity solutions. He has been involved in over £400m of property transactions.*`
    });
    posts.push(post2Id);

    // Post #18: The BRRR Strategy Masterclass
    const post3Id = await ctx.db.insert("posts", {
      title: "The BRRR Strategy Masterclass: Buy, Refurbish, Refinance, Rent",
      slug: "brrr-strategy-masterclass",
      excerpt: "Master the BRRR strategy with this comprehensive UK guide. Learn how to buy below market value, add value through refurbishment, and recycle your deposit into the next deal.",
      category: "Investment Strategies",
      author: "Matt Lenzie",
      tags: ["BRRR", "buy refurbish refinance rent", "property investment", "bridging finance", "BTL mortgage"],
      metaDescription: "Complete UK guide to the BRRR strategy. Learn how to buy, refurbish, refinance and rent properties to build a portfolio with recycled capital.",
      metaKeywords: ["BRRR strategy UK", "buy refurbish refinance rent", "BRRR calculator", "property investment strategy"],
      status: "published",
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
      content: `BRRR—Buy, Refurbish, Refinance, Rent—is the strategy that's built more UK property portfolios than any other. Done correctly, it lets you recycle your deposit from one deal to the next, scaling your portfolio without saving fresh capital for each purchase.

Done incorrectly, it traps your money in deals that don't refinance properly. This guide shows you how to model BRRR deals before committing, so you pull out your deposit—not just hope you will.

## What is BRRR?

The BRRR strategy has four stages:

1. **Buy** — Purchase a property below market value, typically one needing work
2. **Refurbish** — Add value through renovation
3. **Refinance** — Get a new BTL mortgage based on the improved value
4. **Rent** — Let the property to tenants, generating cashflow

The magic happens at stage 3. If you've added enough value, your new mortgage pays off the bridging finance AND returns your initial cash investment. That cash goes into the next deal.

## The Numbers That Make BRRR Work

Let's work through a real example using our [BRRR Calculator](/landlord/brrr-calculator).

### The Deal

- Purchase price: £120,000 (BMV property needing work)
- Refurb cost: £25,000
- Current market value: £150,000
- Post-refurb value: £185,000
- Monthly rent: £850

### Stage 1: Buy

You need short-term finance for the purchase. Standard mortgages don't work—the property is likely uninhabitable.

Using the [Bridging Loan Calculator](/bridging/bridging-loan-calculator):

| Item | Amount |
|------|--------|
| Purchase price | £120,000 |
| Bridging loan (75% LTV) | £90,000 |
| Your deposit | £30,000 |
| Stamp Duty (3% surcharge) | £4,100 |
| Legal fees | £1,500 |
| Bridging arrangement fee (2%) | £1,800 |
| **Total cash in** | **£37,400** |

### Stage 2: Refurbish

Your £25,000 refurb includes:
- New kitchen: £6,000
- New bathroom: £4,000
- Redecoration throughout: £5,000
- New flooring: £4,000
- Central heating upgrade: £3,500
- Minor electrical work: £2,500

Use the [Refurb Cost Calculator](/refurb/refurb-cost-calculator) to build a detailed budget.

**Running total cash invested: £62,400** (deposit + costs + refurb)

### Stage 3: Refinance

Six months later, the work is complete. The property is now worth £185,000. You approach a BTL lender.

Using the [Bridge to Let Calculator](/bridging/bridge-to-let-calculator):

| Item | Amount |
|------|--------|
| Post-refurb valuation | £185,000 |
| BTL mortgage (75% LTV) | £138,750 |
| Bridging loan to repay | £90,000 |
| 6 months bridging interest (rolled) | £5,400 |
| **Total to repay** | **£95,400** |
| **Cash released** | **£43,350** |

After repaying the bridge, you receive £43,350 back.

### Stage 4: Rent

The property lets for £850/month. Let's check it stacks with the [BTL DSCR Calculator](/landlord/btl-dscr-calculator):

| Metric | Value |
|--------|-------|
| Monthly rent | £850 |
| Mortgage payment (5.5%, 25 years) | £848 |
| DSCR at actual rate | 100% |
| DSCR at 5.5% stress rate | 100% |

This is tight—most lenders want 125%+ DSCR. You'd need higher rent (£1,060+ for 125%) or accept a lower LTV mortgage.

### The BRRR Summary

| Stage | Cash Flow |
|-------|-----------|
| Initial investment | -£62,400 |
| Cash released on refinance | +£43,350 |
| **Net cash left in deal** | **£19,050** |
| **Cash recycled** | **£43,350 (69%)** |

You've retained £43,350 to put into your next deal. That's the power of BRRR.

## Critical Success Factors

### 1. Buy Below Market Value

BRRR only works if you create equity through the purchase AND the refurb. In a competitive market, BMV deals require:

- Direct-to-vendor marketing
- Auction purchases (use our [Auction Bridge Calculator](/bridging/auction-bridge-calculator))
- Probate and repossession opportunities
- Motivated seller situations

A property worth £150,000 in current condition needs to be purchased for £120,000 or less for BRRR to work.

### 2. Add Genuine Value

Your refurb needs to create more value than it costs. The formula:

**Value added = Post-refurb value - (Purchase price + Refurb cost)**

In our example: £185,000 - (£120,000 + £25,000) = £40,000 value created

Not all works add value equally. Focus on:
- Kitchens and bathrooms (highest ROI)
- Additional bedrooms
- En-suites in larger properties
- Modern, neutral finishes that photograph well

### 3. Get the Refinance Valuation

Your BRRR success depends on achieving your target valuation. Factors that help:

- Use comparable evidence (recent sales of similar improved properties)
- Present the property well for the valuation
- Provide before/after photos showing work completed
- Use valuers who understand the local market

Surveyors can be conservative. Build a 5-10% buffer into your projections.

### 4. Manage the Timeline

Bridging finance charges monthly. Every month of delay costs money.

| Bridge Amount | Monthly Rate | Cost Per Month |
|--------------|--------------|----------------|
| £90,000 | 1.0% | £900 |
| £90,000 | 1.2% | £1,080 |
| £150,000 | 1.0% | £1,500 |

A 3-month overrun on a £90,000 bridge at 1% costs £2,700. Plan your refurb timeline carefully.

### 5. Stress Test the Numbers

Before committing, model the downside scenarios:

**What if the valuation comes in low?**
- At £175,000 value: 75% LTV = £131,250 mortgage
- Cash released: £131,250 - £95,400 = £35,850
- Less cash back, but still viable

**What if interest rates rise?**
- Use the [Section 24 Calculator](/landlord/section-24-tax-impact-calculator) to model higher rate scenarios
- Consider fixing your BTL mortgage

**What if the refurb costs more?**
- Add 15-20% contingency to your budget
- Have reserves available

## BRRR Variations

### Light BRRR

For properties needing cosmetic work only. Lower risk, lower returns, faster turnaround.

- Purchase: Minor BMV discount (5-10%)
- Refurb: £5,000-15,000
- Timeline: 2-3 months
- Cash recycled: 50-70%

### Heavy BRRR

Significant structural work or change of use. Higher returns, higher complexity.

- Purchase: Major BMV discount (25-35%)
- Refurb: £50,000+
- Timeline: 6-12 months
- Cash recycled: 80-100%

### HMO BRRR

Converting standard houses to HMOs. Use the [HMO Viability Calculator](/hmo/hmo-viability-calculator) alongside the BRRR Calculator.

- Higher rental yield supports larger mortgage
- More complex refurb (fire safety, licensing)
- Planning considerations in Article 4 areas

## Common BRRR Mistakes

**Over-optimistic valuations.** Hope isn't a strategy. Use conservative estimates.

**Underestimating refurb costs.** Get proper quotes. Include contingency.

**Ignoring bridging costs.** Interest roll-up compounds. Factor it into your cash requirements.

**Forgetting the refinance criteria.** Check your exit mortgage criteria BEFORE you buy. Will the property pass DSCR tests?

**Insufficient reserves.** You need cash for deposits, refurbs, voids, and unexpected costs. Don't stretch too thin.

## Getting Started with BRRR

Ready to model your first BRRR deal? Use this calculator workflow:

1. [BRRR Calculator](/landlord/brrr-calculator) — Model the complete cycle
2. [Bridging Loan Calculator](/bridging/bridging-loan-calculator) — Calculate short-term finance costs
3. [Refurb Cost Calculator](/refurb/refurb-cost-calculator) — Build your renovation budget
4. [Bridge to Let Calculator](/bridging/bridge-to-let-calculator) — Model the refinance
5. [BTL DSCR Calculator](/landlord/btl-dscr-calculator) — Confirm the exit mortgage works

Run the numbers before you commit. BRRR works—but only when the maths add up.

---

*Matt Lenzie is a property finance specialist with experience in over £400m of equity and debt transactions. He advises developers and investors on bridging finance, development funding and portfolio structuring.*`
    });
    posts.push(post3Id);

    // Post #4: Rental Yield vs Cash-on-Cash
    const post4Id = await ctx.db.insert("posts", {
      title: "Rental Yield vs Cash-on-Cash: Which Metric Actually Matters?",
      slug: "rental-yield-vs-cash-on-cash-return",
      excerpt: "Stop confusing rental yield with actual returns. Learn the difference between gross yield, net yield, and cash-on-cash return—and which metric you should really focus on.",
      category: "Landlord Education",
      author: "Matt Lenzie",
      tags: ["rental yield", "cash-on-cash return", "BTL metrics", "property investment", "ROI"],
      metaDescription: "Understand the difference between rental yield and cash-on-cash return. Learn which investment metrics matter for UK buy-to-let property.",
      metaKeywords: ["rental yield calculator", "cash-on-cash return", "buy to let yield", "property investment metrics UK"],
      status: "published",
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
      content: `"This property has an 8% yield!"

If you've ever heard that from an estate agent or sourcer, you've encountered the UK property market's favourite misleading statistic. Rental yield sounds impressive. But it often has little to do with your actual investment return.

Understanding the difference between yield metrics can save you from buying deals that look good on paper but perform poorly in practice. This guide breaks down what each metric measures and which one you should focus on.

## The Three Yield Metrics

### Gross Yield

The simplest calculation. Annual rent divided by property price.

**Gross Yield = (Annual Rent ÷ Property Value) × 100**

Example:
- Property value: £200,000
- Monthly rent: £850
- Annual rent: £10,200
- **Gross yield: 5.1%**

This is what agents typically quote. It's also the least useful metric for investors because it ignores all costs.

### Net Yield

Annual rent minus operating costs, divided by property value.

**Net Yield = ((Annual Rent - Operating Costs) ÷ Property Value) × 100**

Operating costs include:
- Management fees (10-15%)
- Maintenance (5-10% of rent)
- Insurance (£200-400/year)
- Void periods (4-8% of rent)
- Ground rent and service charges (flats)
- Landlord gas safety and EPC certificates

Example:
- Annual rent: £10,200
- Management (12%): £1,224
- Maintenance (8%): £816
- Insurance: £300
- Void allowance (5%): £510
- Safety certificates: £150
- **Net operating income: £7,200**
- **Net yield: 3.6%**

That 5.1% gross yield is now 3.6% net. A very different picture.

### Cash-on-Cash Return

This is what actually matters. Your annual profit divided by your actual cash invested.

**Cash-on-Cash = (Annual Cashflow ÷ Cash Invested) × 100**

Cash invested includes:
- Deposit
- Stamp Duty
- Legal fees
- Refurbishment costs
- Any other capital expenditure

Annual cashflow is net operating income minus mortgage payments.

Example using our £200,000 property:

| Item | Amount |
|------|--------|
| Purchase price | £200,000 |
| Deposit (25%) | £50,000 |
| Stamp Duty | £7,500 |
| Legal fees | £1,500 |
| **Total cash invested** | **£59,000** |

| Item | Annual |
|------|--------|
| Net operating income | £7,200 |
| Mortgage payments (5.5%, £150k loan) | £9,960 |
| **Annual cashflow** | **-£2,760** |
| **Cash-on-Cash return** | **-4.7%** |

That 5.1% "yield" property actually loses money every month. The cash-on-cash return is negative.

This is why yield figures are dangerous. Use the [Buy to Let Calculator](/landlord/buy-to-let-calculator) to see the full picture.

## Why Cash-on-Cash Matters More

Yield metrics treat property investment as though you paid cash. Most investors use mortgages. The mortgage fundamentally changes your returns—for better or worse.

### Positive Leverage

When the net yield exceeds your mortgage interest rate, leverage amplifies your returns.

| Scenario | Net Yield | Mortgage Rate | Cash-on-Cash |
|----------|-----------|---------------|--------------|
| A | 6% | 4% | 14% |
| B | 6% | 5% | 10% |
| C | 6% | 6% | 6% |

The same property delivers wildly different returns depending on your financing.

### Negative Leverage

When mortgage rates exceed net yield, leverage works against you.

| Scenario | Net Yield | Mortgage Rate | Cash-on-Cash |
|----------|-----------|---------------|--------------|
| D | 4% | 5.5% | -3% |
| E | 3.5% | 5.5% | -8% |

This is the situation many landlords face in 2025. Low yields in expensive areas combined with higher interest rates create negative cashflow positions.

## Regional Yield Variations

UK property yields vary dramatically by location:

| Region | Typical Gross Yield |
|--------|---------------------|
| Liverpool | 7-9% |
| Manchester | 5-7% |
| Birmingham | 5-6% |
| Leeds | 5-7% |
| Bristol | 4-5% |
| London (Zone 1-2) | 3-4% |
| London (Outer) | 4-5% |
| South East | 4-5% |

Higher yields often come with:
- Lower capital growth potential
- Higher void risk
- More management intensity
- Different tenant demographics

Lower yield areas typically offer:
- Stronger capital appreciation
- More stable tenant demand
- Lower management requirements
- Higher quality tenants

Neither approach is "right"—they suit different investment strategies.

## Which Metric Should You Use?

**Gross yield** — Only useful for quick property screening. If gross yield is below 5%, the deal is unlikely to cashflow.

**Net yield** — Better for comparing properties, as it accounts for running costs. But still ignores financing.

**Cash-on-cash return** — The metric that matters for actual investment decisions. This tells you what return you're getting on your invested capital.

Always calculate cash-on-cash. Our [Buy to Let Calculator](/landlord/buy-to-let-calculator) computes all three metrics automatically.

## Beyond Cashflow: Total Return

Cash-on-cash measures income return only. Total return includes capital appreciation:

**Total Return = (Cash-on-Cash Return) + (Annual Capital Growth %)**

Example:
- Cash-on-Cash: -2%
- Capital growth: 5%
- **Total return: 3%**

Some investors accept negative cashflow in exchange for capital growth. This is a valid strategy if:
- You can fund the shortfall indefinitely
- Capital growth assumptions are realistic
- You have a clear exit strategy

But capital growth is uncertain. Cashflow is measurable. Most professional investors prioritise cashflow, treating capital growth as a bonus.

## Stress Testing Your Yields

Before committing to any investment, stress test the numbers:

### Interest Rate Stress Test

Most BTL lenders stress at 5.5% or higher. Use the [BTL DSCR Calculator](/landlord/btl-dscr-calculator) to check you pass.

| Rate | Monthly Payment (£150k loan) | Annual Cost |
|------|------------------------------|-------------|
| 4.5% | £833 | £9,996 |
| 5.5% | £920 | £11,040 |
| 6.5% | £1,011 | £12,132 |
| 7.5% | £1,106 | £13,272 |

A 2% rate rise on £150,000 adds £2,232 to your annual costs.

### Void Stress Test

What if your property sits empty for three months?

- Annual rent loss: £2,550
- Council Tax liability: ~£500
- Utilities: ~£200
- **Total void cost: £3,250**

Can your cashflow absorb this? Build void allowances into your projections.

### Rent Reduction Stress Test

What if market rents fall 10%?

- Current rent: £850/month
- Reduced rent: £765/month
- Annual impact: £1,020

In practice, rents are sticky—they rarely fall dramatically. But new regulatory requirements (EPC, licensing) may force upgrades that eat into margins.

## Tax Considerations

Your after-tax return may differ significantly from pre-tax cash-on-cash.

### Section 24

Since April 2020, mortgage interest is no longer a deductible expense for individual landlords. You receive a 20% tax credit instead. Higher-rate taxpayers are hit hardest.

Use the [Section 24 Tax Impact Calculator](/landlord/section-24-tax-impact-calculator) to model your specific situation.

### Company Ownership

Limited companies can still deduct mortgage interest. But they face:
- Corporation Tax on profits (25%)
- Capital Gains when extracting funds
- Higher mortgage rates (typically 0.5-1% premium)
- Additional accounting costs

There's no universal answer. Your optimal structure depends on your income, portfolio size, and investment timeline.

## Practical Application

Let's put this together with a real comparison:

### Property A: Northern Town
- Price: £100,000
- Rent: £600/month
- Gross yield: 7.2%
- Net yield: 5.8%
- Cash invested: £32,000
- Monthly cashflow: +£180
- Cash-on-cash: 6.75%

### Property B: London Suburb
- Price: £350,000
- Rent: £1,500/month
- Gross yield: 5.1%
- Net yield: 4.0%
- Cash invested: £105,000
- Monthly cashflow: -£200
- Cash-on-cash: -2.3%

Property A delivers positive returns. Property B costs you money every month.

But over 10 years, Property B might appreciate by £150,000 while Property A gains £20,000. Which is better? That depends on your investment goals, risk tolerance, and cash reserves.

## Your Next Steps

Before your next purchase:

1. Calculate all three yield metrics using the [Buy to Let Calculator](/landlord/buy-to-let-calculator)
2. Stress test with the [BTL DSCR Calculator](/landlord/btl-dscr-calculator)
3. Model tax impact with the [Section 24 Calculator](/landlord/section-24-tax-impact-calculator)
4. Consider your total return, not just cashflow

The numbers reveal the truth. Run them before you buy.

---

*Matt Lenzie is a property finance specialist with experience investing and raising over £400m in equity and debt across UK real estate.*`
    });
    posts.push(post4Id);

    // Post #9: HMO Viability Analysis
    const post5Id = await ctx.db.insert("posts", {
      title: "HMO Viability Analysis: Room-by-Room Profit Breakdown",
      slug: "hmo-viability-analysis-guide",
      excerpt: "Learn how to analyse HMO profitability properly. This guide covers room-by-room revenue, all-inclusive costs, licensing fees, and the metrics that separate viable deals from money pits.",
      category: "HMO Investment",
      author: "Matt Lenzie",
      tags: ["HMO", "house in multiple occupation", "HMO calculator", "HMO investment", "rental yield"],
      metaDescription: "Complete guide to HMO viability analysis. Calculate room yields, all-inclusive costs, licensing requirements and true profit margins.",
      metaKeywords: ["HMO calculator UK", "HMO viability", "HMO investment analysis", "house in multiple occupation calculator"],
      status: "published",
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
      content: `Houses in Multiple Occupation offer yields that standard BTL can't match. A 6-bed HMO generating £3,600/month sounds impressive next to a family house renting for £1,200. But those headline numbers hide significant complexity.

HMOs have higher costs, more regulation, and greater management intensity than standard rentals. A proper viability analysis accounts for all of this. This guide shows you how to analyse HMO deals like a professional investor.

## The HMO Advantage

Why do investors pursue HMOs despite the complexity?

**Higher gross yields.** Renting rooms individually generates more income than letting to a single household. A 6-bed property might achieve:
- Single let: £1,200/month
- HMO: £3,600/month (6 × £600)

**Better cashflow.** Higher rents support larger mortgages while still generating positive cashflow.

**Reduced void risk.** One tenant leaving doesn't eliminate your entire rental income. Five out of six rooms still generate revenue.

**Demand resilience.** Professional sharers, students, and those priced out of flats need affordable rooms.

But there's a reason not everyone does HMOs. Let's look at the reality.

## HMO Cost Structure

Use the [HMO Viability Calculator](/hmo/hmo-viability-calculator) to model these costs for your specific deal.

### Room-by-Room Revenue

Not all rooms are equal. Revenue varies by:

| Factor | Impact on Rent |
|--------|----------------|
| En-suite bathroom | +£75-150/month |
| Room size | Large rooms command 10-20% premium |
| Ground floor | Often discounted |
| Garden access | Premium in summer |

Example 6-bed HMO in a regional city:
- Room 1 (large, en-suite): £700
- Room 2 (large): £600
- Room 3 (medium): £575
- Room 4 (medium): £575
- Room 5 (small): £525
- Room 6 (small, ground floor): £500
- **Total: £3,475/month**

### All-Inclusive Bills

HMO tenants typically pay a single "all-in" rent. You absorb the utility costs.

| Bill | Monthly Cost (6-bed) |
|------|---------------------|
| Gas | £200-350 |
| Electric | £150-250 |
| Water | £80-120 |
| Broadband | £35-50 |
| TV Licence | £13 |
| Council Tax | £150-250 |
| Contents insurance | £30-50 |
| **Total** | **£658-1,083** |

Budget £100-150 per tenant per month for bills. In our example: 6 × £125 = £750/month.

### Management Costs

HMOs require more management than standard BTL:

| Service | Cost |
|---------|------|
| Letting agent (% of rent) | 12-18% |
| Tenant finding per room | £200-400 |
| Cleaning common areas | £50-100/month |
| Garden maintenance | £50-100/month |
| Maintenance reserve | 10% of rent |

Self-managing saves the agent fee but demands significant time. Professional HMO landlords typically spend 2-4 hours per property per week on management tasks.

### Void Costs

HMO voids are managed differently. Calculate per room:

| Metric | Standard BTL | HMO |
|--------|-------------|-----|
| Average void length | 4-6 weeks | 2-4 weeks |
| Annual void rate | 8% | 12-15% (per room) |
| Void cost impact | Total rent lost | Partial rent lost |

A 6-bed HMO with 15% void rate per room loses 0.9 room-months annually (6 rooms × 15%). That's roughly £600/month × 1 month = £600/year—much better than 6 weeks empty on a single let.

## Licensing and Compliance

HMO licensing adds both upfront costs and ongoing requirements.

### Mandatory vs Additional Licensing

**Mandatory HMO Licensing** applies to properties with:
- 5+ tenants forming 2+ households
- 3+ storeys

**Additional Licensing** (council-specific) may cover:
- 3-4 tenant properties
- 2-storey HMOs
- All privately rented properties in designated areas

Check your local council. Use the [HMO Licence Fee Calculator](/hmo/hmo-licence-fee-calculator) to estimate costs.

### Licence Fee Costs

Fees vary dramatically by council:

| Council | New Licence | Renewal |
|---------|------------|---------|
| Manchester | £1,100 | £1,000 |
| Birmingham | £1,300 | £1,100 |
| Liverpool | £800 | £700 |
| Leeds | £900 | £800 |
| London (avg) | £1,500 | £1,200 |

Licences last 5 years. Annualise the cost in your calculations (£1,200 ÷ 5 = £240/year).

### Fire Safety Requirements

Fire safety compliance is non-negotiable. Use the [HMO Fire Safety Cost Calculator](/hmo/hmo-fire-safety-cost-calculator).

| Item | Typical Cost |
|------|-------------|
| Fire doors (30-min rated) | £250-400 each |
| Mains-linked smoke detection | £500-1,200 |
| Emergency lighting | £300-600 |
| Fire blanket & extinguisher | £50-100 |
| Signage | £50-100 |
| Inspection certificate | £150-300 |

A 6-bed HMO typically needs:
- 6 bedroom fire doors: £1,800
- Fire detection system: £800
- Emergency lighting: £400
- Sundries: £200
- **Total: £3,200**

Factor this into your refurbishment costs or maintenance reserve.

### Other Compliance Requirements

- Room minimum sizes (6.51m² single, 10.22m² double)
- Kitchen facilities ratio
- Bathroom facilities ratio
- Waste storage
- Energy Performance Certificate
- Gas Safety Certificate
- Electrical Installation Condition Report

Non-compliance risks unlimited fines and rent repayment orders.

## Financing HMOs

HMO mortgages differ from standard BTL. Use the [HMO Finance Calculator](/hmo/hmo-finance-calculator).

### Lender Criteria

| Factor | Standard BTL | HMO |
|--------|-------------|-----|
| Typical LTV | 75% | 70-75% |
| Rate premium | Baseline | +0.25-0.75% |
| ICR requirement | 125% | 125-145% |
| Experience required | No | Often yes |
| Property type | All | Licensed HMOs |

Fewer lenders offer HMO products. Your options narrow further for:
- 7+ bed properties
- Properties without licences
- First-time HMO investors

### HMO-Specific Valuation

Lenders may value HMOs based on:
- **Bricks and mortar** — Standard residential comparison
- **Commercial valuation** — Yield-based calculation

Yield-based valuations can work in your favour if rents are strong. They can also work against you if the surveyor applies a high yield expectation.

## Complete Viability Analysis

Let's work through a full example.

### The Property

- 6-bed Victorian terrace
- Purchase price: £280,000
- Post-refurb value: £320,000
- Regional city location

### Revenue Analysis

| Room | Rent | Annual |
|------|------|--------|
| 1 (large, en-suite) | £700 | £8,400 |
| 2 (large) | £600 | £7,200 |
| 3 (medium) | £575 | £6,900 |
| 4 (medium) | £575 | £6,900 |
| 5 (small) | £525 | £6,300 |
| 6 (small) | £500 | £6,000 |
| **Total** | **£3,475** | **£41,700** |

### Cost Analysis

| Item | Monthly | Annual |
|------|---------|--------|
| Bills | £750 | £9,000 |
| Management (15%) | £521 | £6,255 |
| Maintenance (10%) | £348 | £4,170 |
| Void allowance (12%) | £417 | £5,004 |
| Licence fee | £20 | £240 |
| Compliance reserves | £50 | £600 |
| **Total Operating Costs** | **£2,106** | **£25,269** |

**Net Operating Income: £16,431/year (£1,369/month)**

### Financing Analysis

| Item | Amount |
|------|--------|
| Property value | £320,000 |
| Mortgage (70% LTV) | £224,000 |
| Rate | 6.25% |
| Monthly payment | £1,478 |
| Annual cost | £17,736 |

**Monthly Cashflow: £1,369 - £1,478 = -£109**

This HMO is marginally cashflow negative despite strong rents. This is the reality of 2025 interest rates.

### Return Analysis

| Metric | Value |
|--------|-------|
| Gross yield | 13.0% |
| Net yield | 5.1% |
| Cash invested | £120,000 |
| Annual cashflow | -£1,308 |
| Cash-on-Cash | -1.1% |

### Improving the Deal

Several levers could improve viability:

1. **Add en-suites** — Two more en-suites at £75/month premium each = £1,800/year additional income
2. **Negotiate purchase price** — £260,000 purchase reduces cash investment to £105,000
3. **Higher LTV lender** — 75% LTV releases £24,000 additional capital
4. **Self-manage** — Saving 15% fee = £6,255/year (but factor in your time)

## When HMOs Work

HMOs are viable when:

- **Room rents exceed £550/month** (ideally £600+)
- **You can achieve 70%+ LTV financing**
- **Property suits the layout** (multiple receptions, adequate bathrooms)
- **Demand exists** (professionals, students, key workers)
- **You can manage effectively** (or pay for professional management)

HMOs struggle when:

- Rents are too low relative to bills
- Licensing requirements are excessive
- Property needs expensive conversion
- Location lacks HMO demand
- Interest rates outpace rental growth

## Getting Started

Before committing to an HMO, run the full analysis:

1. [HMO Viability Calculator](/hmo/hmo-viability-calculator) — Complete revenue and cost model
2. [HMO Finance Calculator](/hmo/hmo-finance-calculator) — Mortgage analysis
3. [HMO Fire Safety Cost Calculator](/hmo/hmo-fire-safety-cost-calculator) — Compliance budgeting
4. [HMO Licence Fee Calculator](/hmo/hmo-licence-fee-calculator) — Local authority costs

Compare against the standard BTL alternative using the [Buy to Let Calculator](/landlord/buy-to-let-calculator). HMOs offer higher income—but only if the numbers work.

---

*Matt Lenzie is a property finance specialist advising investors on HMO financing, portfolio structuring, and deal analysis. He has been involved in over £400m of property transactions.*`
    });
    posts.push(post5Id);

    return { success: true, postsCreated: posts.length, postIds: posts };
  },
});

// Query to check if posts exist
export const checkPostsExist = mutation({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    return { count: posts.length, posts: posts.map(p => ({ title: p.title, slug: p.slug })) };
  },
});
