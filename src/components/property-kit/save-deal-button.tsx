"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { useUser, SignInButton } from "@clerk/nextjs";

import { api } from "../../../convex/_generated/api";
import { PropertyButton } from "./property-button";
import { useDeal } from "@/lib/deal-context";
import { Save, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SaveDealButton() {
  const { currentDeal, setCurrentDeal } = useDeal();
  const { isSignedIn, isLoaded } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Convex mutations
  const createDeal = useMutation(api.deals.create);
  const updatePdData = useMutation(api.deals.updatePdData);
  const updateGdvData = useMutation(api.deals.updateGdvData);
  const updateBuildCostData = useMutation(api.deals.updateBuildCostData);
  const updateFinanceData = useMutation(api.deals.updateFinanceData);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    if (!currentDeal) return;

    setIsSaving(true);
    try {
      if (isSignedIn) {
        // Save to Convex database
        let dealId = currentDeal.id;

        // Create deal if it doesn't exist yet
        if (!dealId) {
          dealId = await createDeal({
            name: currentDeal.address || "Untitled Deal",
            address: currentDeal.address || "",
            localAuthority: currentDeal.localAuthority || undefined,
          });

          // Store the deal ID in context
          setCurrentDeal({
            ...currentDeal,
            id: dealId,
          });
        }

        // Update PD data if available
        if (currentDeal.pd) {
          await updatePdData({
            dealId,
            pdData: {
              existingUse: currentDeal.pd.existingUse || "",
              proposedUse: currentDeal.pd.proposedUse || "",
              gia: currentDeal.pd.gia || 0,
              storeys: currentDeal.pd.storeys || 0,
              targetUnits: currentDeal.pd.targetUnits || 0,
              articleFour: currentDeal.pd.articleFour || false,
              heritage: currentDeal.pd.heritage || false,
              pdRoute: currentDeal.pd.pdRoute || "",
              reasoning: currentDeal.pd.reasoning || "",
              completed: true,
            },
          });
        }

        // Update GDV data if available
        if (currentDeal.gdv) {
          await updateGdvData({
            dealId,
            gdvData: {
              postcode: currentDeal.gdv.postcode || "",
              propertyType: currentDeal.gdv.propertyType || "",
              bedrooms: currentDeal.gdv.bedrooms || 0,
              totalUnits: currentDeal.gdv.totalUnits || 0,
              avgSqft: currentDeal.gdv.avgSqft || 0,
              newBuildPremium: currentDeal.gdv.newBuildPremium || 0,
              totalGdv: currentDeal.gdv.totalGdv || 0,
              gdvPerUnit: currentDeal.gdv.gdvPerUnit || 0,
              gdvPerSqft: currentDeal.gdv.gdvPerSqft || 0,
              reasoning: currentDeal.gdv.reasoning || "",
              completed: true,
            },
          });
        }

        // Update Build Cost data if available
        if (currentDeal.buildCost) {
          await updateBuildCostData({
            dealId,
            buildCostData: {
              totalGia: currentDeal.buildCost.totalGia || 0,
              buildType: currentDeal.buildCost.buildType || "",
              specLevel: currentDeal.buildCost.specLevel || "",
              region: currentDeal.buildCost.region || "",
              storeys: currentDeal.buildCost.storeys || 0,
              contingency: currentDeal.buildCost.contingency || 0,
              professionalFees: currentDeal.buildCost.professionalFees || 0,
              totalCost: currentDeal.buildCost.totalCost || 0,
              costPerSqm: currentDeal.buildCost.costPerSqm || 0,
              reasoning: currentDeal.buildCost.reasoning || "",
              completed: true,
            },
          });
        }

        // Update Finance data if available
        if (currentDeal.finance) {
          await updateFinanceData({
            dealId,
            financeData: {
              purchasePrice: currentDeal.finance.purchasePrice || 0,
              buildCost: currentDeal.finance.buildCost || 0,
              gdv: currentDeal.finance.gdv || 0,
              termMonths: currentDeal.finance.termMonths || 0,
              targetLtc: currentDeal.finance.targetLtc || 0,
              requireMezzanine: currentDeal.finance.requireMezzanine || false,
              seniorDebtAmount: currentDeal.finance.seniorDebtAmount || 0,
              equityRequired: currentDeal.finance.equityRequired || 0,
              totalLtc: currentDeal.finance.totalLtc || 0,
              profitOnCost: currentDeal.finance.profitOnCost || 0,
              lenderAppetite: currentDeal.finance.lenderAppetite || "",
              reasoning: currentDeal.finance.reasoning || "",
              completed: true,
            },
          });
        }

        toast.success("Deal saved to your account!");
      } else {
        // Fallback to localStorage for non-authenticated users
        const deals = JSON.parse(localStorage.getItem('savedDeals') || '[]');
        deals.push({
          ...currentDeal,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem('savedDeals', JSON.stringify(deals));
        toast.success("Deal saved locally. Sign in to save to your account.");
      }
    } catch (error) {
      console.error("Error saving deal:", error);
      toast.error("Failed to save deal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !isLoaded) {
    return null;
  }

  if (!currentDeal) {
    return null;
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <SignInButton mode="modal">
          <Button variant="outline" size="sm" className="gap-2">
            <LogIn className="size-4" />
            Sign in to save
          </Button>
        </SignInButton>
        <PropertyButton
          variant="secondary"
          icon={<Save className="size-4" />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save locally"}
        </PropertyButton>
      </div>
    );
  }

  return (
    <PropertyButton
      variant="primary"
      icon={<Save className="size-4" />}
      onClick={handleSave}
      disabled={isSaving}
    >
      {isSaving ? "Saving..." : "Save deal"}
    </PropertyButton>
  );
}
