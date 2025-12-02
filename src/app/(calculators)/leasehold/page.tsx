import { CategoryLanding } from '@/components/property-kit/category-landing';
import { getCategoryById } from '@/lib/calculators/config';

export const metadata = {
  title: 'Leasehold Calculators | PropertyCalculators.ai',
  description: 'Lease extension, marriage value, ground rent, and freeholder calculators using UK statutory formulas.',
};

export default function LeaseholdCategoryPage() {
  const category = getCategoryById('leasehold');
  if (!category) return null;
  return <CategoryLanding category={category} />;
}
