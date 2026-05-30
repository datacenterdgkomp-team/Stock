
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Database } from 'lucide-react';
import BackupRestorePage from '@/components/BackupRestorePage.jsx';
import BackupListPage from '@/components/BackupListPage.jsx';
import AutomaticBackupSettings from '@/components/AutomaticBackupSettings.jsx';
import BackupLogHistory from '@/components/BackupLogHistory.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BackupRestoreContainer = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBackupComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <Helmet>
        <title>Backup & Restore - DG Komputer</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Database className="w-8 h-8 text-primary" />
          Backup & Restore
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Kelola pencadangan data sistem, pemulihan, dan pengaturan otomatis.
        </p>
      </div>

      <Tabs defaultValue="manual" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl h-auto overflow-x-auto overflow-y-hidden shrink-0 min-w-max">
          <TabsTrigger value="manual" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Manual Backup
          </TabsTrigger>
          <TabsTrigger value="list" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Daftar File
          </TabsTrigger>
          <TabsTrigger value="auto" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Otomatisasi
          </TabsTrigger>
          <TabsTrigger value="logs" className="py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Riwayat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="focus-visible:outline-none m-0">
          <BackupRestorePage onBackupComplete={handleBackupComplete} />
        </TabsContent>

        <TabsContent value="list" className="focus-visible:outline-none m-0">
          <BackupListPage refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="auto" className="focus-visible:outline-none m-0">
          <AutomaticBackupSettings />
        </TabsContent>

        <TabsContent value="logs" className="focus-visible:outline-none m-0">
          <BackupLogHistory refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackupRestoreContainer;
