"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { PropertyButton } from "./property-button";
import { useDeal } from "@/lib/deal-context";
import { Save, LogIn } from "lucide-react";

export function SaveDealButton() {
  const { currentDeal } = useDeal();
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    if (!currentDeal) return;

    setIsSaving(true);
    try {
      // For now, just show success - Convex integration will come later
      // when authentication is properly configured
      toast.success("Deal saved to local storage!");

      // Save to localStorage as fallback
      const deals = JSON.parse(localStorage.getItem('savedDeals') || '[]');
      deals.push({
        ...currentDeal,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem('savedDeals', JSON.stringify(deals));
    } catch (error) {
      console.error("Error saving deal:", error);
      toast.error("Failed to save deal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) {
    return null;
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
