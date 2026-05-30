
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Loader2, Clock } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const AutomaticBackupSettings = () => {
  const [settings, setSettings] = useState({
    auto_backup_enabled: false,
    schedule_type: 'Daily',
    backup_time: '02:00',
    backup_day: 0, // 0 = Sunday
    backup_date: 1,
    retention_days: 30
  });
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const records = await pb.collection('backup_settings').getFullList({ $autoCancel: false });
      if (records.length > 0) {
        setSettings(records[0]);
        setSettingsId(records[0].id);
      }
    } catch (error) {
      console.error('Error fetching backup settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...settings,
        backup_day: parseInt(settings.backup_day),
        backup_date: parseInt(settings.backup_date),
        retention_days: parseInt(settings.retention_days)
      };

      if (settingsId) {
        await pb.collection('backup_settings').update(settingsId, dataToSave, { $autoCancel: false });
      } else {
        const record = await pb.collection('backup_settings').create(dataToSave, { $autoCancel: false });
        setSettingsId(record.id);
      }
      toast.success('Pengaturan backup otomatis berhasil disimpan');
    } catch (error) {
      console.error('Error saving backup settings:', error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-none shadow-md">
        <CardContent className="p-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Backup Otomatis
            </CardTitle>
            <CardDescription className="mt-1">
              Konfigurasi jadwal pencadangan database secara otomatis.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-backup" className="font-medium cursor-pointer">
              {settings.auto_backup_enabled ? 'Aktif' : 'Nonaktif'}
            </Label>
            <Switch
              id="auto-backup"
              checked={settings.auto_backup_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_backup_enabled: checked })}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${!settings.auto_backup_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          
          <div className="space-y-3">
            <Label>Frekuensi Backup</Label>
            <Select 
              value={settings.schedule_type} 
              onValueChange={(val) => setSettings({ ...settings, schedule_type: val })}
              disabled={!settings.auto_backup_enabled}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Pilih frekuensi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Harian (Setiap Hari)</SelectItem>
                <SelectItem value="Weekly">Mingguan</SelectItem>
                <SelectItem value="Monthly">Bulanan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Waktu Eksekusi</Label>
            <Input 
              type="time" 
              value={settings.backup_time}
              onChange={(e) => setSettings({ ...settings, backup_time: e.target.value })}
              className="bg-background"
              disabled={!settings.auto_backup_enabled}
            />
          </div>

          {settings.schedule_type === 'Weekly' && (
            <div className="space-y-3">
              <Label>Hari Eksekusi</Label>
              <Select 
                value={settings.backup_day.toString()} 
                onValueChange={(val) => setSettings({ ...settings, backup_day: parseInt(val) })}
                disabled={!settings.auto_backup_enabled}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Pilih hari" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Minggu</SelectItem>
                  <SelectItem value="1">Senin</SelectItem>
                  <SelectItem value="2">Selasa</SelectItem>
                  <SelectItem value="3">Rabu</SelectItem>
                  <SelectItem value="4">Kamis</SelectItem>
                  <SelectItem value="5">Jumat</SelectItem>
                  <SelectItem value="6">Sabtu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {settings.schedule_type === 'Monthly' && (
            <div className="space-y-3">
              <Label>Tanggal Eksekusi</Label>
              <Input 
                type="number" 
                min="1" 
                max="31"
                value={settings.backup_date}
                onChange={(e) => setSettings({ ...settings, backup_date: e.target.value })}
                className="bg-background"
                disabled={!settings.auto_backup_enabled}
              />
            </div>
          )}

          <div className="space-y-3">
            <Label>Masa Retensi (Hari)</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                min="1"
                value={settings.retention_days}
                onChange={(e) => setSettings({ ...settings, retention_days: e.target.value })}
                className="bg-background w-24"
                disabled={!settings.auto_backup_enabled}
              />
              <span className="text-sm text-muted-foreground">hari sebelum dihapus otomatis</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving} className="shadow-sm min-w-[120px]">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Pengaturan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomaticBackupSettings;
