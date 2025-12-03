"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from "convex/react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";

import { api } from "../../../convex/_generated/api";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Plus,
  Sparkles,
  Calculator,
  TrendingUp,
  FileText,
  LayoutDashboard,
  Target,
  ChevronRight,
  Building2,
  Briefcase,
  PieChart,
  Trash2,
  MapPin,
  LogIn,
  Zap,
  Star,
  Clock,
} from 'lucide-react';
import { Id } from '../../../convex/_generated/dataModel';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const DashboardPage = () => {
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  // Fetch deals from Convex
  const deals = useQuery(api.deals.listByUser);
  const deleteDeal = useMutation(api.deals.deleteDeal);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate stats from deals
  const stats = useMemo(() => {
    if (!deals || deals.length === 0) {
      return {
        totalDeals: 0,
        totalGdv: 0,
        avgProfitOnCost: 0,
        financeReady: 0,
      };
    }

    const totalGdv = deals.reduce((sum, deal) => sum + (deal.gdvData?.totalGdv || 0), 0);
    const dealsWithProfit = deals.filter(d => d.financeData?.profitOnCost);
    const avgProfitOnCost = dealsWithProfit.length > 0
      ? dealsWithProfit.reduce((sum, d) => sum + (d.financeData?.profitOnCost || 0), 0) / dealsWithProfit.length
      : 0;
    const financeReady = deals.filter(d => d.status === "complete").length;

    return {
      totalDeals: deals.length,
      totalGdv,
      avgProfitOnCost,
      financeReady,
    };
  }, [deals]);

  const handleDeleteDeal = async (dealId: Id<"deals">) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      try {
        await deleteDeal({ dealId });
        toast.success("Deal deleted successfully");
      } catch (error) {
        console.error("Error deleting deal:", error);
        toast.error("Failed to delete deal. Please try again.");
      }
    }
  };

  // Loading skeleton
  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
        <div className="relative overflow-hidden border-b border-slate-200/60">
          <div className="hero-gradient-mesh absolute inset-0 opacity-30" />
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-200 rounded-full w-24 mb-6"></div>
              <div className="h-12 bg-slate-200 rounded-xl w-1/3 mb-4"></div>
              <div className="h-5 bg-slate-200 rounded-lg w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
        <div className="relative overflow-hidden border-b border-slate-200/60">
          {/* Animated Background */}
          <div className="hero-gradient-mesh absolute inset-0 opacity-40" />
          <div className="hero-orb-1 absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-blue-500 to-cyan-500" />
          <div className="hero-orb-2 absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-purple-500 to-pink-500" />

          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <nav className="hero-fade-up mb-8">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors">
                    Home
                  </Link>
                </li>
                <ChevronRight className="size-4 text-slate-400" />
                <li className="font-medium text-slate-900">Dashboard</li>
              </ol>
            </nav>

            <div className="text-center py-16">
              <div className="hero-fade-up mx-auto flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-xl shadow-blue-500/30 mb-8">
                <LogIn className="size-12 text-white" />
              </div>
              <h1 className="hero-fade-up-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl font-[family-name:var(--font-space-grotesk)] mb-6">
                Sign in to view your{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="hero-fade-up-3 text-lg sm:text-xl text-slate-600 max-w-xl mx-auto mb-10">
                Track your property deals, save calculations, and access AI-powered insights.
              </p>
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="hero-fade-up-4 gap-2 h-14 px-8 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                >
                  <LogIn className="size-5" />
                  Sign In to Continue
                </Button>
              </SignInButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = deals === undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-200/60">
        {/* Animated Background */}
        <div className="hero-gradient-mesh absolute inset-0 opacity-40" />
        <div className="hero-orb-1 absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-blue-500 to-cyan-500" />
        <div className="hero-orb-2 absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-purple-500 to-pink-500" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
          {/* Breadcrumb */}
          <nav className="hero-fade-up mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <ChevronRight className="size-4 text-slate-400" />
              <li className="font-medium text-slate-900">Dashboard</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="hero-fade-up flex items-center gap-3 mb-6">
                <span className="section-badge">
                  <LayoutDashboard className="mr-1.5 size-3.5" />
                  Your Deals
                </span>
              </div>
              <h1 className="hero-fade-up-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl font-[family-name:var(--font-space-grotesk)]">
                Deal{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="hero-fade-up-3 mt-4 text-lg text-slate-600">
                Track your property deals, AI summaries, and finance application status.
              </p>

              {/* Quick Stats Inline */}
              <div className="hero-fade-up-4 mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
                  <Briefcase className="size-4 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">{isLoading ? '...' : stats.totalDeals} deals</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
                  <TrendingUp className="size-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-700">{isLoading ? '...' : formatCurrency(stats.totalGdv)} GDV</span>
                </div>
              </div>
            </div>
            <Link href="/development" className="hero-fade-up-4">
              <Button
                size="lg"
                className="gap-2 h-14 px-6 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
              >
                <Plus className="size-5" />
                New Deal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-slate-200 p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 group-hover:from-blue-100 group-hover:to-blue-50 transition-colors">
                  <Briefcase className="size-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">Deals</Badge>
              </div>
              {isLoading ? (
                <div className="h-10 w-16 bg-slate-200 rounded-lg animate-pulse"></div>
              ) : (
                <p className="text-4xl font-bold text-slate-900">{stats.totalDeals}</p>
              )}
              <p className="text-sm text-slate-500 mt-2 font-medium">Active deals</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-slate-200 p-6 transition-all duration-300 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50">
                  <TrendingUp className="size-6 text-emerald-600" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs font-semibold">GDV</Badge>
              </div>
              {isLoading ? (
                <div className="h-10 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
              ) : (
                <p className="text-4xl font-bold text-slate-900">{formatCurrency(stats.totalGdv)}</p>
              )}
              <p className="text-sm text-slate-500 mt-2 font-medium">Total GDV</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-slate-200 p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                  <PieChart className="size-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0 text-xs font-semibold">Margin</Badge>
              </div>
              {isLoading ? (
                <div className="h-10 w-16 bg-slate-200 rounded-lg animate-pulse"></div>
              ) : (
                <p className="text-4xl font-bold text-slate-900">{stats.avgProfitOnCost.toFixed(1)}%</p>
              )}
              <p className="text-sm text-slate-500 mt-2 font-medium">Avg profit on cost</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white border-2 border-slate-200 p-6 transition-all duration-300 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-50">
                  <FileText className="size-6 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-0 text-xs font-semibold">Ready</Badge>
              </div>
              {isLoading ? (
                <div className="h-10 w-12 bg-slate-200 rounded-lg animate-pulse"></div>
              ) : (
                <p className="text-4xl font-bold text-slate-900">{stats.financeReady}</p>
              )}
              <p className="text-sm text-slate-500 mt-2 font-medium">Finance ready</p>
            </div>
          </div>
        </div>

        {/* Your Deals Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="section-badge mb-3">
                Your Portfolio
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
                Your Deals
              </h2>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border-2 border-slate-200 bg-white p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-slate-200 rounded-lg w-3/4 mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-slate-200 rounded-xl"></div>
                      <div className="h-16 bg-slate-200 rounded-xl"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : deals && deals.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => (
                <div
                  key={deal._id}
                  className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Hover gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 pr-3">
                        <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {deal.name || deal.address || "Untitled Deal"}
                        </h3>
                        {deal.address && (
                          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
                            <MapPin className="size-3.5" />
                            <span className="truncate">{deal.address}</span>
                          </p>
                        )}
                      </div>
                      <Badge
                        className={cn(
                          "text-xs font-semibold border-0 px-2.5 py-1",
                          deal.status === "complete"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {deal.status === "complete" ? "Complete" : "Draft"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium mb-1">GDV</p>
                        <p className="font-bold text-slate-900">
                          {deal.gdvData?.totalGdv ? formatCurrency(deal.gdvData.totalGdv) : "—"}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium mb-1">Profit on Cost</p>
                        <p className="font-bold text-slate-900">
                          {deal.financeData?.profitOnCost ? `${deal.financeData.profitOnCost.toFixed(1)}%` : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Step Progress */}
                    <div className="flex items-center gap-1.5 mb-5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={cn(
                            "h-2 flex-1 rounded-full transition-colors",
                            (deal.currentStep || 1) >= step
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                              : "bg-slate-200"
                          )}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        onClick={() => handleDeleteDeal(deal._id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      <Link href="/development">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 font-semibold border-2 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                        >
                          Continue
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-12 text-center">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-full blur-3xl" />

              <div className="relative">
                <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-xl shadow-blue-500/30 mb-8">
                  <Building2 className="size-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 font-[family-name:var(--font-space-grotesk)]">No deals yet</h3>
                <p className="text-slate-600 max-w-md mx-auto mb-8 text-lg">
                  Start by creating a new deal with a development appraisal. We'll guide you through
                  GDV, build costs, and finance structuring.
                </p>
                <Link href="/development">
                  <Button
                    size="lg"
                    className="gap-2 h-14 px-8 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                  >
                    <Plus className="size-5" />
                    Create Your First Deal
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mb-16">
          <div className="mb-8">
            <span className="section-badge mb-3">
              <Zap className="mr-1.5 size-3.5" />
              Quick Actions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[family-name:var(--font-space-grotesk)]">
              What would you like to do?
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/development" className="group no-underline">
              <div className="relative h-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 mb-5">
                    <Target className="size-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Start New Deal
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Begin with development type selection and flow through all calculators.
                  </p>
                  <div className="mt-5 flex items-center text-sm font-semibold text-blue-600">
                    Get started
                    <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/calculators" className="group no-underline">
              <div className="relative h-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all duration-300 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 mb-5">
                    <Calculator className="size-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Browse Calculators
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Access our full library of property calculators for any analysis you need.
                  </p>
                  <div className="mt-5 flex items-center text-sm font-semibold text-emerald-600">
                    Browse all
                    <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>

            <div className="relative h-full overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                    <Sparkles className="size-7 text-white" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-0 text-xs font-semibold px-2.5 py-1">Coming Soon</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  AI Insights
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Get AI-powered recommendations and analysis for your deals.
                </p>
                <div className="mt-5 flex items-center text-sm font-semibold text-purple-600">
                  <Clock className="mr-1.5 size-4" />
                  Coming soon
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Calculators */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 lg:p-10">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold backdrop-blur-sm mb-3">
                  <Star className="size-3.5" />
                  Most Popular
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                  Popular Calculators
                </h2>
              </div>
              <Link
                href="/calculators"
                className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View all calculators
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'BRRR Calculator', href: '/landlord/brrr-calculator', color: '#10B981' },
                { name: 'BTL DSCR', href: '/landlord/btl-dscr-calculator', color: '#3B82F6' },
                { name: 'GDV Calculator', href: '/development/gdv-calculator', color: '#8B5CF6' },
                { name: 'Build Cost', href: '/development/build-cost-calculator', color: '#F59E0B' },
              ].map((calc) => (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="group flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300"
                >
                  <div
                    className="flex size-12 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                    style={{ backgroundColor: `${calc.color}20` }}
                  >
                    <Calculator className="size-6" style={{ color: calc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {calc.name}
                    </p>
                    <p className="text-xs text-slate-400">Calculator</p>
                  </div>
                  <ArrowRight className="size-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
