import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { TopBar } from "@/components/TopBar";
import { Player } from "@/components/Player";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Album from "@/pages/Album";
import Playlist from "@/pages/Playlist";
import Artist from "@/pages/Artist";
import Liked from "@/pages/Liked";
import Library from "@/pages/Library";
import Pricing from "@/pages/Pricing";
import LiveRooms from "@/pages/LiveRooms";
import AdminLogin from "@/pages/AdminLogin";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Settings from "@/pages/Settings";
import Dashboard from "@/pages/Dashboard";
import ArtistRegister from "@/pages/ArtistRegister";
import { lazy, Suspense } from 'react';

// Code-split heavy components
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const ArtistPortal = lazy(() => import("@/pages/ArtistPortal"));
import AudioSettings from "@/pages/AudioSettings";
import Alarms from "@/pages/Alarms";
import Stats from "@/pages/Stats";
import Rewards from "@/pages/Rewards";
import Friends from "@/pages/Friends";
import AIPlaylists from "@/pages/AIPlaylists";
import Karaoke from "@/pages/Karaoke";
import MusicQuizzes from "@/pages/MusicQuizzes";
import NotFound from "@/pages/not-found";
import Leaderboards from '@/pages/Leaderboards';
import Downloads from '@/pages/Downloads';
import RadioStations from '@/pages/RadioStations';
import CarMode from '@/pages/CarMode';
import VoiceCommands from '@/pages/VoiceCommands';
import SpotifyImport from '@/pages/SpotifyImport';
import YouTubeMusic from '@/pages/YouTubeMusic';
import Impressum from '@/pages/Impressum';
import AGB from '@/pages/AGB';
import Datenschutz from '@/pages/Datenschutz';
import ThemeSettings from '@/pages/ThemeSettings';
import SoundMatch from '@/pages/SoundMatch';
import VirtualConcertHall from '@/pages/VirtualConcertHall';
import NotificationSettings from '@/pages/NotificationSettings';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';
import Account from '@/pages/Account';
import { useEffect } from "react";
import { musicKit } from "@/lib/musickit";

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Lädt...</p>
    </div>
  );
}
import { useLocation } from "wouter";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CookieBanner } from "@/components/CookieBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  const isAuthRoute = location === '/login' || location === '/register';
  const isLegalRoute = location === '/impressum' || location === '/agb' || location === '/datenschutz';

  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        </ErrorBoundary>
      </Route>
      <Route path="/admin/analytics" component={AnalyticsDashboard} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/impressum" component={Impressum} />
      <Route path="/agb" component={AGB} />
      <Route path="/datenschutz" component={Datenschutz} />
      <Route path="/artist-register/:code" component={ArtistRegister} />
      <Route path="/artist-portal">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <ArtistPortal />
          </Suspense>
        </ErrorBoundary>
      </Route>
      <Route path="/settings" component={Settings} />
      <Route path="/dashboard" component={Dashboard} />
      {!isAdminRoute && !isAuthRoute && <Route path="/" component={Home} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/search" component={Search} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/album/:id" component={Album} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/playlist/:id" component={Playlist} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/artist/:id" component={Artist} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/liked" component={Liked} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/library" component={Library} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/pricing" component={Pricing} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/live-rooms" component={LiveRooms} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/rewards" component={Rewards} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/account" component={Account} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/ai-playlists" component={AIPlaylists} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/quizzes" component={MusicQuizzes} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/leaderboards" component={Leaderboards} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/radio" component={RadioStations} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/car-mode" component={CarMode} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/themes" component={ThemeSettings} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/sound-match" component={SoundMatch} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/concert-hall" component={VirtualConcertHall} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/notifications" component={NotificationSettings} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/spotify" component={SpotifyImport} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/youtube" component={YouTubeMusic} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  const isAuthRoute = location === '/login' || location === '/register';
  const isLegalRoute = location === '/impressum' || location === '/agb' || location === '/datenschutz';

  useEffect(() => {
    musicKit.configure();
    
    // Load persisted theme on app start
    const savedTheme = localStorage.getItem('soundvista-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        import('@/lib/themes').then(({ applyTheme }) => applyTheme(theme));
      } catch (error) {
        console.error('Failed to load saved theme:', error);
      }
    }
  }, []);

  if (isAdminRoute || isAuthRoute || isLegalRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          
          {/* Main Content - responsive margin */}
          <div className="flex flex-col flex-1 md:ml-[241px]">
            <TopBar />
            
            <main 
              className="flex-1 px-4 md:px-8"
              style={{ 
                paddingTop: 'calc(154px)',
                paddingBottom: 'calc(90px + 64px + env(safe-area-inset-bottom, 0px))'
              }}
            >
              <Router />
            </main>
            
            {/* Footer outside main - always above fixed player */}
            <Footer />
          </div>

          {/* Mobile Bottom Navigation - hidden on desktop */}
          <MobileNav />
          
          <Player />
          
          {/* Scroll to Top Button */}
          <ScrollToTop />
          
          {/* Cookie Banner */}
          <CookieBanner />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
