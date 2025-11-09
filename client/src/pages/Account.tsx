import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, UsersFour, DownloadSimple, Equalizer, ChartBar } from '@phosphor-icons/react';
import Friends from './Friends';
import Downloads from './Downloads';
import AudioSettings from './AudioSettings';
import Stats from './Stats';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Account() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <User size={32} weight="bold" className="text-primary" />
        <h1 className="text-3xl font-bold" data-testid="heading-account">Mein Konto</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-14 p-1">
          <TabsTrigger value="profile" data-testid="tab-profile" className="flex items-center justify-center gap-2 h-full text-base font-semibold">
            <User size={20} weight="bold" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="friends" data-testid="tab-friends" className="flex items-center justify-center gap-2 h-full text-base font-semibold">
            <UsersFour size={20} weight="bold" />
            <span className="hidden sm:inline">Freunde</span>
          </TabsTrigger>
          <TabsTrigger value="downloads" data-testid="tab-downloads" className="flex items-center justify-center gap-2 h-full text-base font-semibold">
            <DownloadSimple size={20} weight="bold" />
            <span className="hidden sm:inline">Downloads</span>
          </TabsTrigger>
          <TabsTrigger value="audio" data-testid="tab-audio" className="flex items-center justify-center gap-2 h-full text-base font-semibold">
            <Equalizer size={20} weight="bold" />
            <span className="hidden sm:inline">Audio</span>
          </TabsTrigger>
          <TabsTrigger value="stats" data-testid="tab-stats" className="flex items-center justify-center gap-2 h-full text-base font-semibold">
            <ChartBar size={20} weight="bold" />
            <span className="hidden sm:inline">Statistiken</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Profil bearbeiten</h2>
            
            <div className="flex items-center gap-6 mb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl font-bold">DU</AvatarFallback>
              </Avatar>
              <Button variant="outline" data-testid="button-change-avatar">
                Profilbild ändern
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  id="username"
                  defaultValue="demo-user"
                  data-testid="input-username"
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="demo@soundvista.de"
                  data-testid="input-email"
                />
              </div>

              <div>
                <Label htmlFor="display-name">Anzeigename</Label>
                <Input
                  id="display-name"
                  defaultValue="Demo User"
                  data-testid="input-display-name"
                />
              </div>

              <Button className="mt-4" data-testid="button-save-profile">
                Änderungen speichern
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="friends">
          <Friends />
        </TabsContent>

        <TabsContent value="downloads">
          <Downloads />
        </TabsContent>

        <TabsContent value="audio">
          <AudioSettings />
        </TabsContent>

        <TabsContent value="stats">
          <Stats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
