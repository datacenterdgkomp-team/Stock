
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Download, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
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

const BackupListPage = ({ refreshTrigger }) => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('backups').getList(1, 50, {
        sort: '-created',
        expand: 'created_by',
        $autoCancel: false
      });
      setBackups(records.items);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Gagal memuat daftar backup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await pb.collection('backups').delete(deleteId, { $autoCancel: false });
      toast.success('Data backup berhasil dihapus');
      fetchBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error('Gagal menghapus data backup');
    } finally {
      setDeleteId(null);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredBackups = backups.filter(b => 
    b.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle>Daftar File Backup</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama file..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchBackups} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead>Nama File</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Ukuran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredBackups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Tidak ada data backup ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBackups.map((backup, index) => (
                  <TableRow key={backup.id} className="hover:bg-muted/30">
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="font-mono text-sm">{backup.filename}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{new Date(backup.backup_date).toLocaleDateString('id-ID')}</span>
                        <span className="text-xs text-muted-foreground">{backup.backup_time}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatBytes(backup.file_size)}</TableCell>
                    <TableCell>
                      <Badge variant={backup.status === 'Success' ? 'default' : 'destructive'} className={backup.status === 'Success' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                        {backup.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                          title="Hapus"
                          onClick={() => setDeleteId(backup.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus catatan backup ini? File fisik mungkin tidak terhapus jika disimpan di luar sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default BackupListPage;
