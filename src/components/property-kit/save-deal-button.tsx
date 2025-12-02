"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { PropertyButton } from "./property-button";
import { useDeal } from "@/lib/deal-context";
import { api } from "../../../convex/_generated/api";
import { Save, LogIn } from "lucide-react";

export function SaveDealButton() {
  const { currentDeal } = useDeal();
  const { isSignedIn, user } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  const createDeal = useMutation(api.deals.create);
  const updatePdData = useMutation(api.deals.updatePdData);
  const updateGdvData = useMutation(api.deals.updateGdvData);
  const updateBuildCostData = useMutation(api.deals.updateBuildCostData);
  const updateFinanceData = useMutation(api.deals.updateFinanceData);
  const storeUser = useMutation(api.users.store);

  const handleSave = async () => {
    if (!currentDeal) return;

    setIsSaving(true);
    try {
      // Ensure user is stored in Convex
      await storeUser();

      // Create deal if it doesn't exist
      let dealId = currentDeal.id;
      if (!dealId) {
        dealId = await createDeal({
          name: `Deal: ${currentDeal.address}`,
          address: currentDeal.address,
          localAuthority: currentDeal.localAuthority,
        });
      }

      // Save each completed step
      if (currentDeal.pd && dealId) {
        await updatePdData({
          dealId,
          pdData: {
            ...currentDeal.pd,
            completed: true,
          },
        });
      }

      if (currentDeal.gdv && dealId) {
        await updateGdvData({
          dealId,
          gdvData: {
            ...currentDeal.gdv,
            completed: true,
          },
        });
      }

      if (currentDeal.buildCost && dealId) {
        await updateBuildCostData({
          dealId,
          buildCostData: {
            ...currentDeal.buildCost,
            completed: true,
          },
        });
      }

      if (currentDeal.finance && dealId) {
        await updateFinanceData({
          dealId,
          financeData: {
            ...currentDeal.finance,
            completed: true,
          },
        });
      }

      toast.success("Deal saved successfully!");
    } catch (error) {
      console.error("Error saving deal:", error);
      toast.error("Failed to save deal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <PropertyButton variant="primary" icon={<LogIn className="size-4" />}>
          Sign in to save
        </PropertyButton>
      </SignInButton>
    );
  }

  if (!currentDeal) {
    return null;
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
