import { CategoryLanding } from '@/components/property-kit/category-landing';
import { getCategoryById } from '@/lib/calculators/config';

export const metadata = {
  title: 'HMO Calculators | PropertyCalculators.ai',
  description: 'HMO viability, finance, licensing, fire safety, and conversion cost calculators for UK property investors.',
};

export default function HmoCategoryPage() {
  const category = getCategoryById('hmo');
  if (!category) return null;
  return <CategoryLanding category={category} />;
}
