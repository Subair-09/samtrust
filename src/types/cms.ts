import { ProductItem, ServiceItem } from './index';
import { PortalRole } from './portal';

export type CmsRole = 'super-admin' | 'editor' | 'sales-reviewer' | 'live-desk-agent';

export interface CmsUser {
  id: string;
  name: string;
  email: string;
  role: CmsRole;
  title: string;
  avatarUrl?: string;
}

export type SystemAccessScope = 'Both (CMS & Portal)' | 'CMS Only' | 'Enterprise Portal Only';

export type UserAccountStatus = 'Active' | 'Suspended' | 'Pending Activation';

export interface ManagedUserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  organization: string;
  location: string;
  systemScope: SystemAccessScope;
  cmsRole: CmsRole | 'none';
  portalRole: PortalRole | 'none';
  status: UserAccountStatus;
  passwordPlain: string;
  mustChangePassword: boolean;
  twoFactorRequired: boolean;
  customPermissions: string[];
  createdAt: string;
  lastLoginAt?: string;
  createdBy?: string;
}

export interface LiveSupportConfig {
  whatsappEnabled: boolean;
  liveChatEnabled: boolean;
  defaultActiveChannel: 'whatsapp' | 'livechat';
  whatsappNumber: string;
  deskTitle: string;
  agentName: string;
  agentTitle: string;
  agentStatusText: string;
  welcomeMessage: string;
  autoReplyMessage: string;
  offlineNoticeMessage: string;
  position: 'bottom-right' | 'bottom-left';
  showOnMobile: boolean;
  quickPrompts: string[];
}

export interface LiveChatMessage {
  id: string;
  sender: 'visitor' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface LiveChatSession {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorCompany: string;
  visitorPhone?: string;
  status: 'Active' | 'Resolved';
  unreadByAdmin: number;
  createdAt: string;
  updatedAt: string;
  messages: LiveChatMessage[];
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  format: string; // PNG, JPG, JPEG, TIFF (Web-Rendered), etc.
  size: number;
  formattedSize: string;
  uploadedAt: string;
}

export interface ProductCategoryItem {
  id: string; // e.g. 'flowmeters', 'viscometers'
  label: string; // e.g. 'Flow Measurement'
  description?: string;
  icon?: string;
  active?: boolean;
  order?: number;
}

export interface BrandPartnerItem {
  id: string;
  name: string; // e.g. 'Endress+Hauser Partner'
  country: string; // e.g. 'Germany'
  specialty: string; // e.g. 'Coriolis & Vortex Flow'
  tier: 'Principal OEM' | 'Authorized Distributor' | 'Certified Technical Partner' | 'Master OEM Partner' | 'Certified Metrology Channel' | 'Technology Alliance';
  website?: string;
  description?: string;
  active?: boolean;
}

export interface HeroSlide {
  id: string;
  order: number;
  active: boolean;
  tag: string;
  title: string;
  subtext: string;
  ctaText: string;
  destinationTab: string;
  image: string;
  statLabel: string;
  statValue: string;
  specBadge: string;
  startDate?: string;
  endDate?: string;
}

export interface FaqItem {
  id: string;
  category: 'Calibration' | 'Procurement' | 'Field Dispatch' | 'Compliance & Quality' | 'Billing & Terms';
  question: string;
  answer: string;
  order: number;
  lastUpdated: string;
}

export type LeadRfqStatus = 'New' | 'Assigned' | 'Quoted' | 'Closed';

export interface LeadRfqItem {
  id: string;
  refCode: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  deliveryState: string;
  deliveryAddress: string;
  status: LeadRfqStatus;
  assignedEngineer?: string;
  internalNotes?: string;
  totalUSD: number;
  itemsCount: number;
  lineItems: {
    id: string;
    name: string;
    model: string;
    quantity: number;
    specs?: string;
    unitPriceUSD: number;
    isCustom?: boolean;
  }[];
  services: {
    fatRequired: boolean;
    installationRequired: boolean;
    isoCalibrationRequired: boolean;
    trainingRequired: boolean;
    maintenanceSla: string;
    deliveryTimeline: string;
  };
  documentsAttached: string[];
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// Editable Public Pages Content Schemas
// -------------------------------------------------------------

export interface AboutCoreValue {
  id: string;
  title: string;
  tagline: string;
  desc: string;
}

export interface AboutQualityStandard {
  id: string;
  code: string;
  title: string;
  focus: string;
}

export interface AboutLeader {
  id: string;
  name: string;
  role: string;
  bio: string;
}

export interface AboutPageContent {
  badge: string;
  title: string;
  subtitle: string;
  flaskTitle: string;
  flaskDescription: string;
  gearTitle: string;
  gearDescription: string;
  brandSummary: string;
  missionTitle: string;
  missionStatement: string;
  visionTitle: string;
  visionStatement: string;
  coreValues: AboutCoreValue[];
  qualityStandards: AboutQualityStandard[];
  leadershipTeam: AboutLeader[];
}

export interface CalibrationScopeItem {
  id: string;
  domain: string;
  standards: string;
  range: string;
  apparatus: string;
  uncertainty: string;
  deliverables: string;
}

export interface AmcSlaTierItem {
  id: string;
  name: string;
  tagline: string;
  coverage: string;
  plannedVisits: string;
  responseSLA: string;
  calibrationDiscount: string;
  spareParts: string;
  emergencyCallouts: string;
  reporting: string;
  recommended?: boolean;
}

export interface ServicesPageContent {
  badge: string;
  title: string;
  subtitle: string;
  services: ServiceItem[];
  calibrationScopes: CalibrationScopeItem[];
  amcTiers: AmcSlaTierItem[];
}

export interface IndustriesPageContent {
  badge: string;
  title: string;
  subtitle: string;
  industries: import('./index').IndustrySolution[];
}

export interface ContactCardItem {
  id: string;
  title: string;
  phone: string;
  email: string;
  desc: string;
  badge: string;
}

export interface OfficeLocationItem {
  id: string;
  title: string;
  tag: string;
  address: string;
  phone: string;
  hours: string;
}

export interface ContactPageContent {
  badge: string;
  title: string;
  subtitle: string;
  primaryPhone: string;
  primaryEmail: string;
  rcNumber: string;
  whatsappNumber: string;
  cards: ContactCardItem[];
  locations: OfficeLocationItem[];
}

// -------------------------------------------------------------
// Dynamic Custom Subpages Schemas
// -------------------------------------------------------------

export type SubpageParent = 'about' | 'services' | 'industries' | 'none';

export type SubpageBlockType = 'text' | 'features' | 'specs' | 'callout' | 'cta';

export interface SubpageBlock {
  id: string;
  type: SubpageBlockType;
  title?: string;
  content?: string; // Markdown or paragraph text
  items?: { title: string; desc: string; icon?: string }[];
  specs?: { label: string; value: string }[];
  ctaText?: string;
  ctaDestination?: import('./index').NavTab;
  calloutType?: 'info' | 'warning' | 'audit';
}

export interface CustomSubpage {
  id: string;
  slug: string;
  parentPage: SubpageParent;
  title: string;
  subtitle: string;
  badge: string;
  heroImage?: string;
  published: boolean;
  showInNavigation: boolean;
  order: number;
  sections: SubpageBlock[];
  lastUpdated: string;
  author?: string;
}
