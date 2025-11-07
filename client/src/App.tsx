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
import AdminDashboard from "@/pages/AdminDashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Settings from "@/pages/Settings";
import Dashboard from "@/pages/Dashboard";
import ArtistRegister from "@/pages/ArtistRegister";
import ArtistPortal from "@/pages/ArtistPortal";
import AudioSettings from "@/pages/AudioSettings";
import Alarms from "@/pages/Alarms";
import Stats from "@/pages/Stats";
import Rewards from "@/pages/Rewards";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { musicKit } from "@/lib/musickit";
import { useLocation } from "wouter";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  const isAuthRoute = location === '/login' || location === '/register';

  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/artist-register/:code" component={ArtistRegister} />
      <Route path="/artist-portal" component={ArtistPortal} />
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
      {!isAdminRoute && !isAuthRoute && <Route path="/audio-settings" component={AudioSettings} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/alarms" component={Alarms} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/stats" component={Stats} />}
      {!isAdminRoute && !isAuthRoute && <Route path="/rewards" component={Rewards} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  const isAuthRoute = location === '/login' || location === '/register';

  useEffect(() => {
    musicKit.configure();
  }, []);

  if (isAdminRoute || isAuthRoute) {
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
        <div className="min-h-screen bg-background text-foreground">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          
          {/* Main Content - responsive margin */}
          <div className="md:ml-[241px]">
            <TopBar />
            
            <main 
              className="px-4 md:px-8"
              style={{ 
                paddingTop: 'calc(154px)',
                paddingBottom: 'calc(90px + 64px + env(safe-area-inset-bottom, 0px))'
              }}
            >
              <Router />
            </main>
          </div>

          {/* Mobile Bottom Navigation - hidden on desktop */}
          <MobileNav />
          
          <Player />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
