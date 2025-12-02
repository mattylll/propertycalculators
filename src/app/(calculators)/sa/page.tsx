import { CategoryLanding } from '@/components/property-kit/category-landing';
import { getCategoryById } from '@/lib/calculators/config';

export const metadata = {
  title: 'Serviced Accommodation & Holiday Let Calculators | PropertyCalculators.ai',
  description: 'SA profit, finance, holiday let tax, and occupancy calculators for short-term rental investors.',
};

export default function SaCategoryPage() {
  const category = getCategoryById('sa');
  if (!category) return null;
  return <CategoryLanding category={category} />;
}
