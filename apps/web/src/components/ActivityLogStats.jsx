
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, LogIn, User } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#64748b', '#14b8a6'];

export const ActivityLogStats = () => {
  const [stats, setStats] = useState({
    totalAktivitas: 0,
    totalLogin: 0,
    topUser: '-',
    modulData: [],
    jamData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = today.toISOString().split('T')[0] + " 00:00:00.000Z";
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endOfDay = tomorrow.toISOString().split('T')[0] + " 00:00:00.000Z";

      const records = await pb.collection('activity_log').getFullList({
        filter: `timestamp >= "${startOfDay}" && timestamp < "${endOfDay}"`,
        $autoCancel: false
      });

      const totalAktivitas = records.length;
      const totalLogin = records.filter(r => r.tipe_aktivitas === 'Login').length;

      // Calculate Top User
      const userCount = {};
      records.forEach(r => {
        userCount[r.username] = (userCount[r.username] || 0) + 1;
      });
      let topUser = '-';
      let maxCount = 0;
      for (const [user, count] of Object.entries(userCount)) {
        if (count > maxCount) {
          maxCount = count;
          topUser = user;
        }
      }

      // Calculate Modul Data
      const modulCount = {};
      records.forEach(r => {
        const mod = r.modul || 'Lainnya';
        modulCount[mod] = (modulCount[mod] || 0) + 1;
      });
      const modulData = Object.entries(modulCount).map(([name, value]) => ({ name, value }));

      // Calculate Jam Data
      const jamCount = Array(24).fill(0);
      records.forEach(r => {
        const hour = new Date(r.timestamp).getHours();
        jamCount[hour]++;
      });
      const jamData = jamCount.map((count, hour) => ({
        jam: `${hour.toString().padStart(2, '0')}:00`,
        aktivitas: count
      }));

      setStats({
        totalAktivitas,
        totalLogin,
        topUser,
        modulData,
        jamData
      });
    } catch (error) {
      console.error('Error loading activity stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-48 flex items-center justify-center">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Aktivitas Hari Ini</p>
              <p className="text-3xl font-bold">{stats.totalAktivitas}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-[hsl(var(--success))] shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Login Hari Ini</p>
              <p className="text-3xl font-bold">{stats.totalLogin}</p>
            </div>
            <div className="p-3 bg-[hsl(var(--success))]/10 rounded-full">
              <LogIn className="w-6 h-6 text-[hsl(var(--success))]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pengguna Teraktif</p>
              <p className="text-xl font-bold truncate max-w-[150px]">{stats.topUser}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <User className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Distribusi Modul</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.modulData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.modulData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.modulData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">Tidak ada aktivitas</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Aktivitas per Jam</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.jamData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="jam" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="aktivitas" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityLogStats;
