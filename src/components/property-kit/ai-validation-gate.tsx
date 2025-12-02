"use client";

import { useState } from 'react';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface AIValidationGateProps {
  onValidate: () => Promise<void>;
  isLoading?: boolean;
  calculatorType?: string;
  postcode?: string;
}

export function AIValidationGate({
  onValidate,
  isLoading = false,
  calculatorType = 'valuation',
  postcode,
}: AIValidationGateProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [hasValidated, setHasValidated] = useState(false);

  const handleValidate = async () => {
    await onValidate();
    setHasValidated(true);
  };

  // Still loading auth state
  if (!isLoaded) {
    return (
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-2/3"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-10 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User is signed in - show validate button
  if (isSignedIn) {
    return (
      <Card className="border-[var(--pc-blue)]/30 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--pc-blue)]/10 shrink-0">
              <Sparkles className="size-6 text-[var(--pc-blue)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-slate-900">AI Market Validation</h3>
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                  <CheckCircle2 className="size-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Get AI-powered analysis with real Land Registry sold prices, market comparables,
                and validation of your {calculatorType} assumptions{postcode ? ` for ${postcode}` : ''}.
              </p>

              <div className="flex flex-wrap gap-3 mb-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" /> Real sold prices
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="size-3" /> Market trends
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Price validation
                </span>
              </div>

              <Button
                onClick={handleValidate}
                disabled={isLoading}
                className="gap-2 bg-[var(--pc-blue)] hover:bg-[var(--pc-blue)]/90"
              >
                {isLoading ? (
                  <>
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analysing...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Validate with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // User not signed in - show registration prompt
  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 shrink-0">
            <Lock className="size-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900">Unlock AI Validation</h3>
              <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                Free
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Sign up to validate your {calculatorType} with AI-powered market analysis.
              Get real comparable sales, pricing validation, and expert insights.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Land Registry data</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Real comparables</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Price validation</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <SignUpButton mode="modal">
                <Button className="gap-2 bg-[var(--pc-blue)] hover:bg-[var(--pc-blue)]/90">
                  <Sparkles className="size-4" />
                  Sign up free
                  <ArrowRight className="size-4" />
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" className="gap-2">
                  Already have an account? Sign in
                </Button>
              </SignInButton>
            </div>

            <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
              <Shield className="size-3" />
              Your data is secure. We never share your information.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
