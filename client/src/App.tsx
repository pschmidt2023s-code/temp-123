import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Player } from "@/components/Player";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Album from "@/pages/Album";
import Playlist from "@/pages/Playlist";
import Artist from "@/pages/Artist";
import Liked from "@/pages/Liked";
import Library from "@/pages/Library";
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
          <Sidebar />
          
          <div style={{ marginLeft: '241px' }}>
            <TopBar />
            
            <main style={{ paddingTop: '64px', paddingBottom: '90px' }} className="px-8">
              <Router />
            </main>
          </div>

          <Player />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
