import { CategoryLanding } from '@/components/property-kit/category-landing';
import { getCategoryById } from '@/lib/calculators/config';

export const metadata = {
  title: 'Buy-to-Let & Portfolio Calculators | PropertyCalculators.ai',
  description: 'BTL DSCR, ICR, BRRR, portfolio LTV, Section 24 tax, and refinance calculators for UK landlords.',
};

export default function LandlordCategoryPage() {
  const category = getCategoryById('landlord');
  if (!category) return null;
  return <CategoryLanding category={category} />;
}
