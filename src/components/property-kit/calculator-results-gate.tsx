"use client";

import { useEffect, useState } from 'react';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  CheckCircle2,
  Calculator,
  Shield,
  ArrowRight,
  Sparkles,
  Eye,
  BarChart3,
  PiggyBank,
} from 'lucide-react';

interface CalculatorResultsGateProps {
  children: React.ReactNode;
  calculatorType: string;
  calculatorSlug: string;
  formData: Record<string, unknown>;
  hasCalculated: boolean;
  onUnlock?: () => void;
}

export function CalculatorResultsGate({
  children,
  calculatorType,
  calculatorSlug,
  formData,
  hasCalculated,
  onUnlock,
}: CalculatorResultsGateProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [hasStoredData, setHasStoredData] = useState(false);
  const storeSubmission = useMutation(api.calculatorSubmissions.store);

  // Store data when user signs in
  useEffect(() => {
    const storeData = async () => {
      if (isSignedIn && hasCalculated && !hasStoredData && Object.keys(formData).length > 0) {
        try {
          await storeSubmission({
            calculatorType,
            calculatorSlug,
            formData: JSON.stringify(formData),
            source: typeof window !== 'undefined' ? window.location.href : '',
          });
          setHasStoredData(true);
          onUnlock?.();
        } catch (error) {
          console.error('Failed to store calculator submission:', error);
        }
      }
    };

    storeData();
  }, [isSignedIn, hasCalculated, hasStoredData, formData, calculatorType, calculatorSlug, storeSubmission, onUnlock]);

  // Still loading auth state
  if (!isLoaded) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
          <div className="animate-pulse flex items-center gap-3">
            <div className="size-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <span className="text-slate-600 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // User is signed in - show results
  if (isSignedIn) {
    return <>{children}</>;
  }

  // User has not calculated yet - show placeholder
  if (!hasCalculated) {
    return (
      <Card className="border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100">
              <Calculator className="size-8 text-slate-400" />
            </div>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Enter your details</h3>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Fill in the form and click calculate to see your {calculatorType.toLowerCase()} results.
          </p>
        </CardContent>
      </Card>
    );
  }

  // User not signed in but has calculated - show blurred results with registration prompt
  return (
    <div className="relative">
      {/* Blurred results preview */}
      <div className="blur-md pointer-events-none select-none opacity-70">
        {children}
      </div>

      {/* Registration overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-slate-200 bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--pc-blue)] to-blue-600 shadow-lg shadow-blue-500/30">
                    <Eye className="size-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-amber-400 shadow-md">
                    <Lock className="size-3 text-amber-900" />
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 font-[family-name:var(--font-space-grotesk)]">
                Your results are ready
              </h3>
              <p className="text-slate-600 text-sm">
                Create a free account to unlock your {calculatorType.toLowerCase()} analysis and save your calculations.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
                  <BarChart3 className="size-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Full calculation results</p>
                  <p className="text-xs text-slate-500">See all metrics and analysis</p>
                </div>
                <CheckCircle2 className="size-5 text-emerald-500" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100">
                  <PiggyBank className="size-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Save your calculations</p>
                  <p className="text-xs text-slate-500">Access them anytime</p>
                </div>
                <CheckCircle2 className="size-5 text-blue-500" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100">
                  <Sparkles className="size-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">AI-powered insights</p>
                  <p className="text-xs text-slate-500">Get expert market analysis</p>
                </div>
                <CheckCircle2 className="size-5 text-purple-500" />
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <SignUpButton mode="modal">
                <Button className="w-full gap-2 h-12 bg-gradient-to-r from-[var(--pc-blue)] to-blue-600 hover:from-[var(--pc-blue)]/90 hover:to-blue-600/90 shadow-lg shadow-blue-500/20">
                  <Sparkles className="size-4" />
                  Create free account
                  <ArrowRight className="size-4" />
                </Button>
              </SignUpButton>

              <SignInButton mode="modal">
                <Button variant="outline" className="w-full gap-2 h-11 border-2 hover:border-slate-300">
                  Already have an account? Sign in
                </Button>
              </SignInButton>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
              <Shield className="size-3" />
              Your data is secure. We never share your information.
            </p>

            <div className="mt-4 text-center">
              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                100% Free - No credit card required
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
