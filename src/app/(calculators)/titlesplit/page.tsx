import { CategoryLanding } from '@/components/property-kit/category-landing';
import { getCategoryById } from '@/lib/calculators/config';

export const metadata = {
  title: 'Title Split & Planning Gain Calculators | PropertyCalculators.ai',
  description: 'Title splitting, planning gain uplift, airspace development, and garden plot subdivision calculators.',
};

export default function TitlesplitCategoryPage() {
  const category = getCategoryById('titlesplit');
  if (!category) return null;
  return <CategoryLanding category={category} />;
}
