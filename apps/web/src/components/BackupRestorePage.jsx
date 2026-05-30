
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Download, UploadCloud, Database, HardDrive, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useBackupOperations } from '@/hooks/useBackup.js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const BackupRestorePage = ({ onBackupComplete }) => {
  const { currentUser } = useAuth();
  const { performBackup, performRestore, isBackingUp, isRestoring } = useBackupOperations();
  const [restoreFile, setRestoreFile] = useState(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const handleBackup = async () => {
    const success = await performBackup(currentUser);
    if (success && onBackupComplete) {
      onBackupComplete();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRestoreFile(e.target.files[0]);
    }
  };

  const handleRestoreClick = () => {
    if (!restoreFile) return;
    setShowRestoreConfirm(true);
  };

  const confirmRestore = async () => {
    setShowRestoreConfirm(false);
    const success = await performRestore(restoreFile, currentUser);
    if (success) {
      setRestoreFile(null);
      // Optionally reload page or data here
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="backup" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="backup" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Backup Database
          </TabsTrigger>
          <TabsTrigger value="restore" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <UploadCloud className="w-4 h-4 mr-2" />
            Restore Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="focus-visible:outline-none">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-primary/5 border-b pb-6">
              <CardTitle className="flex items-center text-primary">
                <Database className="w-5 h-5 mr-2" />
                Backup Manual
              </CardTitle>
              <CardDescription>
                Buat salinan cadangan seluruh data sistem saat ini. File akan diunduh ke perangkat Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border flex flex-col items-center justify-center text-center">
                  <HardDrive className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Estimasi Ukuran</p>
                  <p className="text-xl font-bold">~15 MB</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border flex flex-col items-center justify-center text-center">
                  <Database className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Format File</p>
                  <p className="text-xl font-bold">JSON / ZIP</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border flex flex-col items-center justify-center text-center">
                  <Download className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Waktu Proses</p>
                  <p className="text-xl font-bold">&lt; 1 Menit</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  size="lg" 
                  onClick={handleBackup} 
                  disabled={isBackingUp}
                  className="w-full md:w-auto shadow-sm"
                >
                  {isBackingUp ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Memproses Backup...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Backup Database Sekarang
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="focus-visible:outline-none">
          <Card className="border-none shadow-md border-destructive/20">
            <CardHeader className="bg-destructive/5 border-b pb-6">
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Restore Database
              </CardTitle>
              <CardDescription className="text-destructive/80">
                Peringatan: Melakukan restore akan menimpa data saat ini dengan data dari file backup.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-xl p-8 text-center bg-muted/10 hover:bg-muted/30 transition-colors">
                  <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <Label htmlFor="backup-file" className="cursor-pointer">
                    <div className="text-lg font-medium mb-1">Klik untuk memilih file backup</div>
                    <p className="text-sm text-muted-foreground mb-4">Mendukung format .json atau .zip (Maks 500MB)</p>
                    <Input 
                      id="backup-file" 
                      type="file" 
                      accept=".json,.zip,application/json,application/zip" 
                      className="hidden" 
                      onChange={handleFileChange}
                      disabled={isRestoring}
                    />
                    <Button type="button" variant="outline" className="pointer-events-none">
                      Pilih File
                    </Button>
                  </Label>
                  {restoreFile && (
                    <div className="mt-4 p-3 bg-background border rounded-lg inline-block text-sm font-medium text-primary">
                      File terpilih: {restoreFile.name} ({(restoreFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  size="lg" 
                  variant="destructive"
                  onClick={handleRestoreClick} 
                  disabled={!restoreFile || isRestoring}
                  className="w-full md:w-auto shadow-sm"
                >
                  {isRestoring ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Memproses Restore...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5 mr-2" />
                      Restore Database
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Konfirmasi Restore Database
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Apakah Anda yakin ingin melakukan restore database dari file <strong>{restoreFile?.name}</strong>?
              <br /><br />
              <span className="font-semibold text-foreground">Tindakan ini akan menimpa data saat ini dan tidak dapat dibatalkan.</span> Disarankan untuk melakukan backup terlebih dahulu sebelum melanjutkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ya, Lanjutkan Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BackupRestorePage;
