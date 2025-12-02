import { CategoryLanding } from '@/components/property-kit/category-landing';
import { getCategoryById } from '@/lib/calculators/config';

export const metadata = {
  title: 'Refurbishment & Build Cost Calculators | PropertyCalculators.ai',
  description: 'Refurb cost, loft conversion, EPC upgrade, and retrofit payback calculators for UK property.',
};

export default function RefurbCategoryPage() {
  const category = getCategoryById('refurb');
  if (!category) return null;
  return <CategoryLanding category={category} />;
}
