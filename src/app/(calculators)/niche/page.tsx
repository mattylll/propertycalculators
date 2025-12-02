import { CategoryLanding } from '@/components/property-kit/category-landing';
import { getCategoryById } from '@/lib/calculators/config';

export const metadata = {
  title: 'Ultra-Niche Property Calculators | PropertyCalculators.ai',
  description: 'Specialist calculators for knotweed, cladding remediation, EWS1, party walls, and more.',
};

export default function NicheCategoryPage() {
  const category = getCategoryById('niche');
  if (!category) return null;
  return <CategoryLanding category={category} />;
}
