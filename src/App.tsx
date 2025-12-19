import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ServiceIntervals from "./pages/ServiceIntervals";
import CustomerJourney from "./pages/CustomerJourney";
import CustomerJourneyTouchPointDetailPage from "./pages/CustomerJourneyTouchPointDetailPage";
import OilTypeSales from "./pages/OilTypeSales";
import DataCaptureLtv from "./pages/DataCaptureLtv";
import CustomerDataPage from "./pages/CustomerDataPage";
import ValidAddressPage from "./pages/ValidAddressPage";
import ProductSalesPage from "./pages/ProductSalesPage";
import PosDataLapsePage from "./pages/PosDataLapsePage";
import SuggestedServicesPage from "./pages/SuggestedServicesPage";
import RoasPage from "./pages/RoasPage";
import CouponDiscountPage from "./pages/CouponDiscountPage";
import ValidEmailCapturePage from "./pages/ValidEmailCapturePage";
import BillingCampaignTrackingPage from "./pages/BillingCampaignTrackingPage";
import ActiveLocationsPage from "./pages/ActiveLocationsPage";
import CostProjectionsPage from "./pages/CostProjectionsPage";
import ComprehensiveAccountAuditPage from "./pages/ComprehensiveAccountAuditPage";
import CallBackReportPage from "./pages/CallBackReportPage";
import OneOffCampaignTrackerPage from "./pages/OneOffCampaignTrackerPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/reports/service-intervals" element={<ServiceIntervals />} />
          <Route path="/reports/customer-journey" element={<CustomerJourney />} />
          <Route path="/reports/customer-journey/touch-point/:touchPointId" element={<CustomerJourneyTouchPointDetailPage />} />
          <Route path="/reports/oil-type-sales" element={<OilTypeSales />} />
          <Route path="/reports/data-capture-ltv" element={<DataCaptureLtv />} />
          <Route path="/reports/customer-data" element={<CustomerDataPage />} />
          <Route path="/reports/valid-address" element={<ValidAddressPage />} />
          <Route path="/reports/product-sales" element={<ProductSalesPage />} />
          <Route path="/reports/pos-data-lapse" element={<PosDataLapsePage />} />
          <Route path="/reports/suggested-services" element={<SuggestedServicesPage />} />
          <Route path="/reports/roas" element={<RoasPage />} />
          <Route path="/reports/coupon-discount-analysis" element={<CouponDiscountPage />} />
          <Route path="/reports/valid-email-capture" element={<ValidEmailCapturePage />} />
          <Route path="/reports/billing-campaign-tracking" element={<BillingCampaignTrackingPage />} />
          <Route path="/reports/active-locations" element={<ActiveLocationsPage />} />
          <Route path="/reports/cost-projections" element={<CostProjectionsPage />} />
          <Route path="/reports/comprehensive-account-audit" element={<ComprehensiveAccountAuditPage />} />
          <Route path="/reports/call-back-report" element={<CallBackReportPage />} />
          <Route path="/reports/one-off-campaign-tracker" element={<OneOffCampaignTrackerPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
