import { CategoryLanding } from '@/components/property-kit/category-landing';
import { getCategoryById } from '@/lib/calculators/config';

export const metadata = {
  title: 'Bridging Loan Calculators | PropertyCalculators.ai',
  description: 'Bridging loan, refurbishment bridge, auction finance, and bridge-to-let calculators for UK property.',
};

export default function BridgingCategoryPage() {
  const category = getCategoryById('bridging');
  if (!category) return null;
  return <CategoryLanding category={category} />;
}
