export type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // relative to USD as base 1.0 (e.g. USD=1, NGN=1485, EUR=0.92, GBP=0.79)
}

export type NavTab = 'home' | 'about' | 'products' | 'services' | 'industries' | 'rfq' | 'contact' | 'admin' | 'subpage' | 'portal' | 'login';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  model: string;
  brand: string;
  image: string;
  galleryImages: string[];
  basePriceUSD: number;
  accuracy: string;
  measurementRange: string;
  compliance: string;
  description: string;
  keySpecs: { label: string; value: string }[];
  inStock: boolean;
  leadTime: string;
  targetIndustries: string[];
  relatedAccessories?: {
    id: string;
    name: string;
    model: string;
    priceUSD: number;
    description: string;
  }[];
}

export interface RfqCartItem {
  product: ProductItem;
  quantity: number;
  customRequirements?: string;
  calibrationCertRequired?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  scope: string[];
  standards: string;
  turnaroundTime: string;
  iconName: string;
  description: string;
  pricingType?: 'fixed' | 'survey';
  guidePriceUSD?: number;
}

export interface IndustrySolution {
  id: string;
  name: string;
  tagline: string;
  description: string;
  applications: string[];
  recommendedEquipment: string[];
  complianceHighlight: string;
  caseStudy?: {
    client: string;
    location: string;
    facilityType: string;
    challenge: string;
    samstrustSolution: string;
    results: string[];
    instrumentationDeployed: string[];
    auditMetric: string;
  };
}

export interface BreadcrumbItem {
  label: string;
  tab?: NavTab;
  active?: boolean;
}
