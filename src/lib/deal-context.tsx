"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Id } from "../../convex/_generated/dataModel";

// Local state for in-progress deal (before saving to Convex)
export type DealDraft = {
  id?: Id<"deals">;
  address: string;
  localAuthority: string;

  // PD Data
  pd?: {
    existingUse: string;
    proposedUse: string;
    gia: number;
    storeys: number;
    targetUnits: number;
    articleFour: boolean;
    heritage: boolean;
    pdRoute: string;
    reasoning: string;
  };

  // GDV Data
  gdv?: {
    postcode: string;
    propertyType: string;
    bedrooms: number;
    totalUnits: number;
    avgSqft: number;
    newBuildPremium: number;
    totalGdv: number;
    gdvPerUnit: number;
    gdvPerSqft: number;
    reasoning: string;
  };

  // Build Cost Data
  buildCost?: {
    totalGia: number;
    buildType: string;
    specLevel: string;
    region: string;
    storeys: number;
    contingency: number;
    professionalFees: number;
    totalCost: number;
    costPerSqm: number;
    reasoning: string;
  };

  // Finance Data
  finance?: {
    purchasePrice: number;
    buildCost: number;
    gdv: number;
    termMonths: number;
    targetLtc: number;
    requireMezzanine: boolean;
    seniorDebtAmount: number;
    equityRequired: number;
    totalLtc: number;
    profitOnCost: number;
    lenderAppetite: string;
    reasoning: string;
  };

  currentStep: number;
};

type DealContextType = {
  currentDeal: DealDraft | null;
  setCurrentDeal: (deal: DealDraft | null) => void;
  updatePdData: (data: DealDraft["pd"]) => void;
  updateGdvData: (data: DealDraft["gdv"]) => void;
  updateBuildCostData: (data: DealDraft["buildCost"]) => void;
  updateFinanceData: (data: DealDraft["finance"]) => void;
  clearDeal: () => void;
  startNewDeal: (address: string, localAuthority: string) => void;
};

const DealContext = createContext<DealContextType | undefined>(undefined);

export function DealProvider({ children }: { children: ReactNode }) {
  const [currentDeal, setCurrentDeal] = useState<DealDraft | null>(null);

  const startNewDeal = (address: string, localAuthority: string) => {
    setCurrentDeal({
      address,
      localAuthority,
      currentStep: 1,
    });
  };

  const updatePdData = (data: DealDraft["pd"]) => {
    if (!currentDeal) return;
    setCurrentDeal({
      ...currentDeal,
      pd: data,
      currentStep: Math.max(currentDeal.currentStep, 2),
    });
  };

  const updateGdvData = (data: DealDraft["gdv"]) => {
    if (!currentDeal) return;
    setCurrentDeal({
      ...currentDeal,
      gdv: data,
      currentStep: Math.max(currentDeal.currentStep, 3),
    });
  };

  const updateBuildCostData = (data: DealDraft["buildCost"]) => {
    if (!currentDeal) return;
    setCurrentDeal({
      ...currentDeal,
      buildCost: data,
      currentStep: Math.max(currentDeal.currentStep, 4),
    });
  };

  const updateFinanceData = (data: DealDraft["finance"]) => {
    if (!currentDeal) return;
    setCurrentDeal({
      ...currentDeal,
      finance: data,
      currentStep: Math.max(currentDeal.currentStep, 5),
    });
  };

  const clearDeal = () => {
    setCurrentDeal(null);
  };

  return (
    <DealContext.Provider
      value={{
        currentDeal,
        setCurrentDeal,
        updatePdData,
        updateGdvData,
        updateBuildCostData,
        updateFinanceData,
        clearDeal,
        startNewDeal,
      }}
    >
      {children}
    </DealContext.Provider>
  );
}

export function useDeal() {
  const context = useContext(DealContext);
  if (context === undefined) {
    throw new Error("useDeal must be used within a DealProvider");
  }
  return context;
}
