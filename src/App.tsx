import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { NavTab, CurrencyCode, ProductItem, RfqCartItem } from './types';
import { CmsProvider, useCms } from './context/CmsContext';
import { PortalProvider, usePortal } from './context/PortalContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { WhatsAppWidget } from './components/WhatsAppWidget';

// Lazy-loaded secondary views & modals for fast initial page load across all browsers & devices
const AboutView = lazy(() =>
  import('./views/AboutView').then((m) => ({ default: m.AboutView }))
);
const ProductsView = lazy(() =>
  import('./views/ProductsView').then((m) => ({ default: m.ProductsView }))
);
const ServicesView = lazy(() =>
  import('./views/ServicesView').then((m) => ({ default: m.ServicesView }))
);
const IndustriesView = lazy(() =>
  import('./views/IndustriesView').then((m) => ({ default: m.IndustriesView }))
);
const RfqView = lazy(() =>
  import('./views/RfqView').then((m) => ({ default: m.RfqView }))
);
const ContactView = lazy(() =>
  import('./views/ContactView').then((m) => ({ default: m.ContactView }))
);
const AdminLayout = lazy(() =>
  import('./views/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const EnterprisePortalView = lazy(() =>
  import('./views/portal/EnterprisePortalView').then((m) => ({
    default: m.EnterprisePortalView,
  }))
);
const LoginView = lazy(() =>
  import('./views/LoginView').then((m) => ({ default: m.LoginView }))
);
const CustomSubpageView = lazy(() =>
  import('./views/CustomSubpageView').then((m) => ({ default: m.CustomSubpageView }))
);
const ProductDetailModal = lazy(() =>
  import('./components/ProductDetailModal').then((m) => ({
    default: m.ProductDetailModal,
  }))
);
const RFQModal = lazy(() =>
  import('./components/RFQModal').then((m) => ({ default: m.RFQModal }))
);
const LegalModal = lazy(() =>
  import('./views/LegalModal').then((m) => ({ default: m.LegalModal }))
);
const TutorialGuideModal = lazy(() =>
  import('./components/TutorialGuideModal').then((m) => ({
    default: m.TutorialGuideModal,
  }))
);

const ViewLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-8 text-center">
    <div className="w-10 h-10 rounded-full border-3 border-[#E2ECE7] border-t-[#164E3D] animate-spin mb-3" />
    <span className="text-xs font-mono uppercase tracking-widest text-[#164E3D] font-bold">
      Loading Module...
    </span>
  </div>
);

function MainApp() {
  const { currentUser: cmsUser } = useCms();
  const { sessionState, activeRole } = usePortal();

  const isPortalAuthenticated = Boolean(
    sessionState?.isAuthenticated && sessionState.expiresAtMs > Date.now()
  );
  const isCmsAuthenticated = Boolean(cmsUser);

  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/login')) return 'login';
    if (path.startsWith('/portal') || path.startsWith('/app')) return 'portal';
    if (path.startsWith('/admin') || path.startsWith('/cms')) return 'admin';
    return 'home';
  });
  const [activeSubpageSlug, setActiveSubpageSlug] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');
  const [rfqItems, setRfqItems] = useState<RfqCartItem[]>([]);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<ProductItem | null>(null);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState<boolean>(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'compliance' | null>(null);
  const [catalogInitialProductId, setCatalogInitialProductId] = useState<string | null>(null);
  const [rfqInitialStep, setRfqInitialStep] = useState<number | null>(null);

  // Set of product IDs currently in RFQ for fast lookup
  const rfqProductIds = useMemo(() => {
    return new Set(rfqItems.map((item) => item.product.id));
  }, [rfqItems]);

  // Dynamic SEO Page Title & Meta synchronization
  useEffect(() => {
    const titles: Record<NavTab, string> = {
      home: 'Samstrust Technologies Limited | Precision, Quality, Reliability (RC 9898142)',
      about: 'About Us & Corporate Quality Framework | Samstrust Technologies Limited',
      products: 'Industrial Equipment & Laboratory Catalog | Samstrust Technologies Limited',
      services: 'ISO/IEC 17025 Calibration & Maintenance Services | Samstrust Technologies',
      industries: 'Industries We Serve & Audited Case Studies | Samstrust Technologies',
      rfq: 'Request for Quotation & Specification Engine | Samstrust Technologies',
      contact: 'Contact Us, Technical Support & Locations | Samstrust Technologies',
      admin: 'Administrative CMS & Operational Pipeline | Samstrust Technologies Limited',
      portal: 'Client & Staff Enterprise Operations Portal | Samstrust Technologies Limited',
      subpage: 'Technical White Paper & Metrology Specification | Samstrust Technologies Limited',
      login: 'Secure Staff & Enterprise Client Sign-In | Samstrust Technologies Limited',
    };
    document.title = titles[activeTab] || titles.home;
  }, [activeTab]);

  // Scroll to top whenever tab changes
  const handleNavigate = (tab: NavTab, subpageSlug?: string) => {
    setActiveTab(tab);
    if (subpageSlug) {
      setActiveSubpageSlug(subpageSlug);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRfqAtStep = (step: number) => {
    setRfqInitialStep(step);
    setActiveTab('rfq');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // RFQ Cart management
  const handleAddToRfq = (product: ProductItem) => {
    setRfqItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, calibrationCertRequired: true }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setRfqItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setRfqItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearRfq = () => {
    setRfqItems([]);
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProductForDetail(null);
        setIsRfqModalOpen(false);
        setIsTutorialModalOpen(false);
        setLegalModalType(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dedicated Secure Login Screen
  if (activeTab === 'login') {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <LoginView onNavigate={handleNavigate} targetRedirect="portal" />
      </Suspense>
    );
  }

  // Dedicated full-screen Client & Staff Enterprise Operations Portal (/portal or /app)
  if (activeTab === 'portal') {
    if (!isPortalAuthenticated && !isCmsAuthenticated) {
      return (
        <Suspense fallback={<ViewLoadingFallback />}>
          <LoginView onNavigate={handleNavigate} targetRedirect="portal" />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <EnterprisePortalView onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  // Dedicated full-screen Administrative CMS view
  if (activeTab === 'admin') {
    if (!isCmsAuthenticated && (!isPortalAuthenticated || activeRole !== 'portal-admin')) {
      return (
        <Suspense fallback={<ViewLoadingFallback />}>
          <LoginView onNavigate={handleNavigate} targetRedirect="admin" />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <AdminLayout
          onNavigate={handleNavigate}
          onOpenTutorialModal={() => setIsTutorialModalOpen(true)}
        />
        {isTutorialModalOpen && (
          <TutorialGuideModal
            isOpen={isTutorialModalOpen}
            onClose={() => setIsTutorialModalOpen(false)}
            onNavigateToTab={handleNavigate}
          />
        )}
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8F6] text-[#1A2E26] font-sans antialiased selection:bg-[#164E3D] selection:text-[#D4AF37]">
      {/* 1. Global Header Shell */}
      <Header
        activeTab={activeTab}
        onNavigate={handleNavigate}
        currency={currency}
        onCurrencyChange={setCurrency}
        rfqItems={rfqItems}
        onOpenRfqModal={() => setIsRfqModalOpen(true)}
        onOpenTutorialModal={() => setIsTutorialModalOpen(true)}
      />

      {/* 2. Main Content Stage */}
      <main className="flex-1 w-full">
        <Suspense fallback={<ViewLoadingFallback />}>
          {activeTab === 'home' && (
            <HomeView
              onNavigate={handleNavigate}
              currency={currency}
              onAddToRfq={handleAddToRfq}
              onViewProductDetails={(product) => setSelectedProductForDetail(product)}
              rfqProductIds={rfqProductIds}
              onOpenRfqAtStep={handleOpenRfqAtStep}
            />
          )}

          {activeTab === 'about' && <AboutView onNavigate={handleNavigate} />}

          {activeTab === 'products' && (
            <ProductsView
              currency={currency}
              onAddToRfq={handleAddToRfq}
              onViewProductDetails={(product) => setSelectedProductForDetail(product)}
              rfqProductIds={rfqProductIds}
              rfqItems={rfqItems}
              onNavigate={handleNavigate}
              onOpenRfqAtStep={handleOpenRfqAtStep}
              onOpenQuickRfqModal={() => setIsRfqModalOpen(true)}
              initialProductId={catalogInitialProductId}
            />
          )}

          {activeTab === 'services' && <ServicesView onNavigate={handleNavigate} />}

          {activeTab === 'industries' && <IndustriesView onNavigate={handleNavigate} />}

          {activeTab === 'rfq' && (
            <RfqView
              rfqItems={rfqItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearRfq={handleClearRfq}
              onAddToRfq={handleAddToRfq}
              currency={currency}
              onNavigate={handleNavigate}
              initialStep={rfqInitialStep}
              onClearInitialStep={() => setRfqInitialStep(null)}
            />
          )}

          {activeTab === 'contact' && <ContactView onNavigate={handleNavigate} />}

          {activeTab === 'subpage' && (
            <CustomSubpageView slug={activeSubpageSlug} onNavigate={handleNavigate} />
          )}
        </Suspense>
      </main>

      {/* 3. Global Footer Shell */}
      <Footer
        onNavigate={handleNavigate}
        onOpenLegalModal={(type) => setLegalModalType(type)}
        onOpenTutorialModal={() => setIsTutorialModalOpen(true)}
      />

      {/* 4. Global WhatsApp & Live Web Chat Floating Widget (Admin Controlled) */}
      <WhatsAppWidget />

      {/* 5. Lazy-Loaded Interactive Modals */}
      <Suspense fallback={null}>
        {selectedProductForDetail && (
          <ProductDetailModal
            product={selectedProductForDetail}
            currency={currency}
            onClose={() => setSelectedProductForDetail(null)}
            onAddToRfq={handleAddToRfq}
            isInRfq={rfqProductIds.has(selectedProductForDetail.id)}
            onNavigateToRfq={() => {
              setSelectedProductForDetail(null);
              handleOpenRfqAtStep(2);
            }}
          />
        )}

        {isRfqModalOpen && (
          <RFQModal
            isOpen={isRfqModalOpen}
            onClose={() => setIsRfqModalOpen(false)}
            rfqItems={rfqItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearRfq={handleClearRfq}
            currency={currency}
            onNavigateToRfqStep={handleOpenRfqAtStep}
            onNavigate={handleNavigate}
          />
        )}

        {legalModalType && (
          <LegalModal
            type={legalModalType}
            onClose={() => setLegalModalType(null)}
          />
        )}

        {isTutorialModalOpen && (
          <TutorialGuideModal
            isOpen={isTutorialModalOpen}
            onClose={() => setIsTutorialModalOpen(false)}
            onNavigateToTab={handleNavigate}
          />
        )}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <CmsProvider>
      <PortalProvider>
        <MainApp />
      </PortalProvider>
    </CmsProvider>
  );
}
