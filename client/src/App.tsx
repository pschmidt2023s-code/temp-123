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
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { musicKit } from "@/lib/musickit";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/album/:id" component={Album} />
      <Route path="/playlist/:id" component={Playlist} />
      <Route path="/artist/:id" component={Artist} />
      <Route path="/liked" component={Liked} />
      <Route path="/library" component={Library} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/live-rooms" component={LiveRooms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    musicKit.configure();
  }, []);

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
              className="px-4 md:px-8 pb-[154px] md:pb-[90px]"
              style={{ 
                paddingTop: '64px'
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
