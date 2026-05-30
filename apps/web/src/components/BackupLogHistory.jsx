
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, Loader2, History } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const BackupLogHistory = ({ refreshTrigger }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('backup_logs').getList(1, 50, {
        sort: '-timestamp',
        $autoCancel: false
      });
      setLogs(records.items);
    } catch (error) {
      console.error('Error fetching backup logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredLogs = logs.filter(log => 
    log.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.operation_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center">
          <History className="w-5 h-5 mr-2 text-primary" />
          Riwayat Aktivitas
        </CardTitle>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari user atau operasi..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Operasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Ukuran</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Tidak ada riwayat aktivitas.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{log.operation_type}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'Success' ? 'default' : 'destructive'} className={log.status === 'Success' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>{formatBytes(log.file_size)}</TableCell>
                    <TableCell>{log.duration ? `${(log.duration / 1000).toFixed(1)}s` : '-'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={log.error_message}>
                      {log.error_message || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackupLogHistory;
