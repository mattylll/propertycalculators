'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calculator,
  FolderOpen,
  PieChart,
  Bell,
  Settings,
  Search,
  Plus,
  ChevronDown,
  Building2,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-[var(--pc-grey-light)]">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <DashboardHeader />

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function DashboardSidebar() {
  const [collapsed, setCollapsed] = React.useState(false);

  const navItems = [
    { icon: PieChart, label: 'Dashboard', href: '/dashboard', active: true },
    { icon: Calculator, label: 'Calculators', href: '/calculators' },
    { icon: FolderOpen, label: 'DealProfiles', href: '/dashboard/deals', badge: '12' },
    { icon: Building2, label: 'Portfolio', href: '/dashboard/portfolio' },
    { icon: TrendingUp, label: 'Analytics', href: '/dashboard/analytics' },
  ];

  return (
    <div
      className={cn(
        'flex flex-col bg-[var(--pc-navy)] text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--pc-navy-light)]">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--pc-blue)] flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-sm">PropertyCalc</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/60 hover:text-white hover:bg-[var(--pc-navy-light)]"
        >
          <ChevronDown className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-90')} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              item.active
                ? 'bg-[var(--pc-blue)] text-white'
                : 'text-white/60 hover:text-white hover:bg-[var(--pc-navy-light)]'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-sm">{item.label}</span>
                {item.badge && (
                  <Badge className="bg-white/20 text-white text-xs">{item.badge}</Badge>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-2 border-t border-[var(--pc-navy-light)]">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-[var(--pc-navy-light)] transition-colors"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </Link>
      </div>
    </div>
  );
}

function DashboardHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-[var(--pc-grey-border)]">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search calculators, deals, or properties..."
            className="pl-10 bg-[var(--pc-grey-light)] border-0"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          New Deal
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-[var(--pc-navy)] text-white flex items-center justify-center text-sm font-medium">
          M
        </div>
      </div>
    </header>
  );
}

// Dashboard Overview Component
interface DashboardOverviewProps {
  stats: {
    totalDeals: number;
    activeDeals: number;
    totalValue: number;
    monthlyCalculations: number;
  };
  recentDeals: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    value: number;
    updatedAt: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'info' | 'success';
    message: string;
  }>;
}

export function DashboardOverview({ stats, recentDeals, alerts }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground">Here's what's happening with your portfolio.</p>
        </div>
        <Button variant="accent">
          <Plus className="w-4 h-4 mr-1" />
          New Analysis
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total DealProfiles"
          value={stats.totalDeals.toString()}
          icon={<FolderOpen className="w-5 h-5" />}
          trend="+3 this week"
        />
        <StatCard
          label="Active Deals"
          value={stats.activeDeals.toString()}
          icon={<Building2 className="w-5 h-5" />}
          variant="primary"
        />
        <StatCard
          label="Portfolio Value"
          value={`£${(stats.totalValue / 1000000).toFixed(1)}M`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+12% YoY"
        />
        <StatCard
          label="Calculations"
          value={stats.monthlyCalculations.toString()}
          icon={<Calculator className="w-5 h-5" />}
          sublabel="This month"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Deals */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent DealProfiles</CardTitle>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--pc-blue-light)] flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[var(--pc-blue)]" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{deal.name}</p>
                      <p className="text-sm text-muted-foreground">{deal.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground tabular-nums">
                      £{deal.value.toLocaleString()}
                    </p>
                    <Badge variant="neutral" className="text-xs">
                      {deal.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--pc-blue)]" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border-l-[3px]',
                  alert.type === 'warning' && 'bg-[var(--pc-warning-light)] border-l-[var(--pc-warning)]',
                  alert.type === 'success' && 'bg-[var(--pc-success-light)] border-l-[var(--pc-success)]',
                  alert.type === 'info' && 'bg-[var(--pc-info-light)] border-l-[var(--pc-info)]'
                )}
              >
                <div className="flex items-start gap-2">
                  {alert.type === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-[var(--pc-warning)] flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm text-foreground">{alert.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-4 gap-4">
            <QuickActionCard
              icon={<Calculator className="w-6 h-6" />}
              title="Run Calculator"
              description="Start a new analysis"
              href="/calculators"
            />
            <QuickActionCard
              icon={<FolderOpen className="w-6 h-6" />}
              title="New DealProfile"
              description="Create deal record"
              href="/dashboard/deals/new"
            />
            <QuickActionCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Portfolio Analysis"
              description="Review your assets"
              href="/dashboard/portfolio"
            />
            <QuickActionCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Advisor"
              description="Get recommendations"
              href="/dashboard/advisor"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  icon,
  trend,
  sublabel,
  variant = 'default',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  sublabel?: string;
  variant?: 'default' | 'primary';
}) {
  return (
    <Card className={cn(variant === 'primary' && 'border-l-[3px] border-l-[var(--pc-blue)]')}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
            {trend && <p className="text-xs text-[var(--pc-success)] mt-1">{trend}</p>}
            {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
          </div>
          <div className="p-2 rounded-lg bg-muted text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="block group">
      <Card interactive className="p-4 text-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-xl bg-[var(--pc-blue-light)] text-[var(--pc-blue)] group-hover:bg-[var(--pc-blue)] group-hover:text-white transition-colors">
            {icon}
          </div>
          <h3 className="font-medium text-foreground group-hover:text-[var(--pc-blue)] transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </Card>
    </Link>
  );
}
