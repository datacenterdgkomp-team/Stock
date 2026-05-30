
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { generateBackup, restoreFromBackup, validateBackupFile } from '@/lib/backupUtils';

export const useBackupOperations = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const performBackup = useCallback(async (user) => {
    setIsBackingUp(true);
    const startTime = Date.now();
    try {
      const { success, blob, filename, size, error } = await generateBackup();
      
      if (!success) throw new Error(error);

      // Create backup record
      const formData = new FormData();
      formData.append('filename', filename);
      formData.append('file_size', size);
      formData.append('backup_date', new Date().toISOString());
      formData.append('backup_time', new Date().toLocaleTimeString());
      formData.append('status', 'Success');
      formData.append('created_by', user.id);
      
      // Note: PocketBase file fields require actual Files/Blobs if we were saving the file.
      // For this simulation, we just record the metadata.
      
      await pb.collection('backups').create(formData, { $autoCancel: false });

      // Log activity
      await pb.collection('backup_logs').create({
        operation_type: 'Backup',
        status: 'Success',
        user_id: user.id,
        username: user.nama_lengkap || user.email,
        file_size: size,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }, { $autoCancel: false });

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Backup berhasil dibuat dan diunduh');
      return true;
    } catch (err) {
      console.error('Backup error:', err);
      
      await pb.collection('backup_logs').create({
        operation_type: 'Backup',
        status: 'Failed',
        user_id: user.id,
        username: user.nama_lengkap || user.email,
        error_message: err.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }, { $autoCancel: false });

      toast.error(`Backup gagal: ${err.message}`);
      return false;
    } finally {
      setIsBackingUp(false);
    }
  }, []);

  const performRestore = useCallback(async (file, user) => {
    const validation = validateBackupFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return false;
    }

    setIsRestoring(true);
    const startTime = Date.now();
    try {
      const { success, error } = await restoreFromBackup(file);
      
      if (!success) throw new Error(error);

      await pb.collection('backup_logs').create({
        operation_type: 'Restore',
        status: 'Success',
        user_id: user.id,
        username: user.nama_lengkap || user.email,
        file_size: file.size,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }, { $autoCancel: false });

      toast.success('Database berhasil direstore');
      return true;
    } catch (err) {
      console.error('Restore error:', err);
      
      await pb.collection('backup_logs').create({
        operation_type: 'Restore',
        status: 'Failed',
        user_id: user.id,
        username: user.nama_lengkap || user.email,
        error_message: err.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }, { $autoCancel: false });

      toast.error(`Restore gagal: ${err.message}`);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  return { performBackup, performRestore, isBackingUp, isRestoring };
};
