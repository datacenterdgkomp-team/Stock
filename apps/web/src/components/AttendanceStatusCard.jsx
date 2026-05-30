
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar as CalendarIcon, UserCheck, AlertCircle } from 'lucide-react';

const AttendanceStatusCard = ({ currentUser, todayRecord }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasCheckedIn = !!todayRecord;
  const isCompleted = todayRecord && todayRecord.jam_keluar;

  return (
    <Card className="shadow-lg border-none bg-card overflow-hidden">
      <div className="bg-primary/5 p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {currentUser?.nama_lengkap || currentUser?.name || currentUser?.email}
          </h2>
          <p className="text-primary font-medium">{currentUser?.role || 'Pegawai'}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold font-mono tracking-wider">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Status Hari Ini</h3>
          {isCompleted ? (
            <Badge className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))] text-white px-3 py-1 text-sm">
              Selesai Absen
            </Badge>
          ) : hasCheckedIn ? (
            <Badge className="bg-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))] text-white px-3 py-1 text-sm">
              Sudah Absen Masuk
            </Badge>
          ) : (
            <Badge variant="destructive" className="px-3 py-1 text-sm">
              Belum Absen
            </Badge>
          )}
        </div>

        {hasCheckedIn ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/40 rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <UserCheck className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Absen Masuk</span>
              </div>
              <p className="text-xl font-bold mb-1">{todayRecord.jam_masuk}</p>
              <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="truncate" title={todayRecord.alamat_lokasi || 'Lokasi tercatat'}>
                  {todayRecord.alamat_lokasi || 'Lokasi tercatat'}
                </span>
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${isCompleted ? 'bg-muted/40 border-border' : 'bg-primary/5 border-primary/20 border-dashed'}`}>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                {isCompleted ? <UserCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4 text-primary" />}
                <span className="text-sm font-medium uppercase tracking-wider">Absen Keluar</span>
              </div>
              {isCompleted ? (
                <>
                  <p className="text-xl font-bold mb-1">{todayRecord.jam_keluar}</p>
                  <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="truncate" title={todayRecord.alamat_lokasi || 'Lokasi tercatat'}>
                      {todayRecord.alamat_lokasi || 'Lokasi tercatat'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-12">
                  <p className="text-sm text-muted-foreground font-medium">Menunggu absen keluar...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-xl p-8 text-center border border-border border-dashed">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">Anda belum melakukan absensi masuk hari ini.</p>
            <p className="text-sm text-muted-foreground mt-1">Silakan klik tombol Absen Masuk di atas untuk merekam kehadiran.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceStatusCard;
