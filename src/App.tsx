import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { GlobalSearchModal } from './components/common/GlobalSearchModal.tsx';

// Pages
import { HomePage } from './pages/HomePage.tsx';
import { DestinationsPage } from './pages/DestinationsPage.tsx';
import { DestinationDetailPage } from './pages/DestinationDetailPage.tsx';
import { AttractionsPage } from './pages/AttractionsPage.tsx';
import { AttractionDetailPage } from './pages/AttractionDetailPage.tsx';
import { HotelsPage } from './pages/HotelsPage.tsx';
import { HotelDetailPage } from './pages/HotelDetailPage.tsx';
import { GuidesPage } from './pages/GuidesPage.tsx';
import { GuideDetailPage } from './pages/GuideDetailPage.tsx';
import { ExploreMapPage } from './pages/ExploreMapPage.tsx';
import { TravelPreferencesPage } from './pages/TravelPreferencesPage.tsx';
import { FavoritesPage } from './pages/FavoritesPage.tsx';
import { TripPlannerPage } from './pages/TripPlannerPage.tsx';
import { TripDetailPage } from './pages/TripDetailPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#323232] selection:bg-[#DDD0C8] selection:text-[#323232]">
      <ScrollToTop />
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
          <Route path="/attractions" element={<AttractionsPage />} />
          <Route path="/attractions/:slug" element={<AttractionDetailPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/hotels/:slug" element={<HotelDetailPage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/guides/:id" element={<GuideDetailPage />} />
          <Route path="/map" element={<ExploreMapPage />} />
          <Route path="/preferences" element={<TravelPreferencesPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/trips" element={<TripPlannerPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
