import { Card } from '@/components/ui/card';
import { ResponsiveSectionHeader } from '@/components/ResponsivePageHeader';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Music, DollarSign, TrendingUp } from 'lucide-react';

// Mock data for demonstration
const monthlyUsers = [
  { month: 'Jan', dau: 12400, mau: 45000 },
  { month: 'Feb', dau: 15800, mau: 52000 },
  { month: 'Mär', dau: 18200, mau: 61000 },
  { month: 'Apr', dau: 22100, mau: 73000 },
  { month: 'Mai', dau: 26500, mau: 89000 },
  { month: 'Jun', dau: 31200, mau: 105000 },
];

const topSongs = [
  { title: 'Blinding Lights', artist: 'The Weeknd', streams: 2450000 },
  { title: 'Shape of You', artist: 'Ed Sheeran', streams: 2180000 },
  { title: 'Someone You Loved', artist: 'Lewis Capaldi', streams: 1920000 },
  { title: 'Levitating', artist: 'Dua Lipa', streams: 1750000 },
  { title: 'Watermelon Sugar', artist: 'Harry Styles', streams: 1620000 },
];

const revenueByTier = [
  { name: 'Free', value: 0, users: 45000 },
  { name: 'Plus', value: 224550, users: 8500 },
  { name: 'Premium', value: 849150, users: 12750 },
  { name: 'Family', value: 674550, users: 6750 },
];

const COLORS = ['#94A3B8', '#3B82F6', '#10B981', '#F59E0B'];

export default function AnalyticsDashboard() {
  const totalRevenue = revenueByTier.reduce((sum, tier) => sum + tier.value, 0);
  const totalUsers = revenueByTier.reduce((sum, tier) => sum + tier.users, 0);
  const totalStreams = topSongs.reduce((sum, song) => sum + song.streams, 0);
  const currentDAU = monthlyUsers[monthlyUsers.length - 1].dau;

  return (
    <div className="min-h-screen pb-32">
      <ResponsiveSectionHeader title="Analytics Dashboard" />
      
      <p className="text-muted-foreground mb-8">
        Übersicht über Nutzer, Streams und Umsatz
      </p>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gesamt-Nutzer</p>
              <p className="text-2xl font-bold">{totalUsers.toLocaleString('de-DE')}</p>
              <p className="text-xs text-green-500 mt-1">+12.5% vs. letzter Monat</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">DAU (Daily)</p>
              <p className="text-2xl font-bold">{currentDAU.toLocaleString('de-DE')}</p>
              <p className="text-xs text-green-500 mt-1">+17.8% vs. letzter Monat</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gesamt-Streams</p>
              <p className="text-2xl font-bold">{(totalStreams / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-green-500 mt-1">+23.4% vs. letzter Monat</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Music className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Monatsumsatz</p>
              <p className="text-2xl font-bold">€{(totalRevenue / 1000).toFixed(0)}K</p>
              <p className="text-xs text-green-500 mt-1">+19.2% vs. letzter Monat</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Nutzer-Wachstum (6 Monate)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="dau" stroke="#3B82F6" strokeWidth={2} name="DAU" />
              <Line type="monotone" dataKey="mau" stroke="#10B981" strokeWidth={2} name="MAU" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue by Tier */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Umsatz nach Abo-Tier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByTier}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByTier.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => `€${value.toLocaleString('de-DE')}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Songs */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Top 5 Songs (Letzte 30 Tage)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topSongs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="title" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: number) => `${(value / 1000000).toFixed(2)}M Streams`}
            />
            <Bar dataKey="streams" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
