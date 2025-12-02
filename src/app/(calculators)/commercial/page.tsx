import { CategoryLanding } from '@/components/property-kit/category-landing';
import { getCategoryById } from '@/lib/calculators/config';

export const metadata = {
  title: 'Commercial Property Calculators | PropertyCalculators.ai',
  description: 'Commercial yield, ERV, FRI lease, and VAT calculators for UK commercial property investors.',
};

export default function CommercialCategoryPage() {
  const category = getCategoryById('commercial');
  if (!category) return null;
  return <CategoryLanding category={category} />;
}
