
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, Loader2, Inbox, ArrowUpDown, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import PaymentMethodFormModal from './PaymentMethodFormModal.jsx';
import DeletePaymentMethodDialog from './DeletePaymentMethodDialog.jsx';
import QRISImagePreviewModal from './QRISImagePreviewModal.jsx';
import { getPaymentMethodIcon, getPaymentMethodColor, formatTipeMetode } from '@/lib/paymentMethodUtils.js';

const PaymentMethodsTab = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';
  
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tipeFilter, setTipeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'created', direction: 'desc' });
  const perPage = 10;

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  // Preview state
  const [previewImage, setPreviewImage] = useState(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      let filter = [];
      if (searchQuery) {
        filter.push(`(nama ~ "${searchQuery}" || deskripsi ~ "${searchQuery}")`);
      }
      if (statusFilter !== 'all') {
        filter.push(`status = "${statusFilter}"`);
      }
      if (tipeFilter !== 'all') {
        filter.push(`tipe_metode = "${tipeFilter}"`);
      }

      const sortString = sortConfig.direction === 'desc' ? `-${sortConfig.key}` : sortConfig.key;

      const records = await pb.collection('metode_pembayaran').getList(page, perPage, {
        filter: filter.length > 0 ? filter.join(' && ') : '',
        sort: sortString,
        $autoCancel: false
      });

      setItems(records.items);
      setTotalItems(records.totalItems);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, tipeFilter, page, sortConfig]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchItems]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const toggleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openPreview = (item) => {
    if (item.qris_image) {
      setPreviewImage({
        url: pb.files.getUrl(item, item.qris_image),
        title: item.nama
      });
    }
  };

  const SortableHeader = ({ label, sortKey, className = "" }) => (
    <div 
      className={`flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors select-none ${className}`}
      onClick={() => toggleSort(sortKey)}
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortConfig.key === sortKey ? 'text-primary' : 'text-muted-foreground/50'}`} />
    </div>
  );

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="p-4 md:p-6 border-b bg-card rounded-t-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Metode Pembayaran</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Kelola opsi pembayaran yang tersedia di kasir.</p>
          </div>
          {isAdmin && (
            <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Metode
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau deskripsi..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={tipeFilter} onValueChange={(val) => { setTipeFilter(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
              <SelectValue placeholder="Filter Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="tunai">Tunai</SelectItem>
              <SelectItem value="transfer_bank">Transfer Bank</SelectItem>
              <SelectItem value="kartu_kredit">Kartu Kredit</SelectItem>
              <SelectItem value="e_wallet">E-Wallet</SelectItem>
              <SelectItem value="qris">QRIS</SelectItem>
              <SelectItem value="cek">Cek</SelectItem>
              <SelectItem value="lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead><SortableHeader label="Nama Metode" sortKey="nama" /></TableHead>
                <TableHead><SortableHeader label="Tipe Metode" sortKey="tipe_metode" /></TableHead>
                <TableHead className="hidden md:table-cell">Gambar QRIS</TableHead>
                <TableHead>Nomor Rekening</TableHead>
                <TableHead><SortableHeader label="Status" sortKey="status" /></TableHead>
                {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary/50" />
                      <p>Memuat data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Inbox className="w-12 h-12 mb-3 text-muted-foreground/30" />
                      <p className="text-base font-medium text-foreground">Tidak ada data ditemukan</p>
                      <p className="text-sm">Coba sesuaikan filter atau pencarian Anda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const Icon = getPaymentMethodIcon(item.tipe_metode);
                  const colorClass = getPaymentMethodColor(item.tipe_metode);
                  
                  return (
                    <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell>{(page - 1) * perPage + index + 1}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {formatTipeMetode(item.tipe_metode)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.tipe_metode === 'qris' ? (
                          item.qris_image ? (
                            <div 
                              className="w-10 h-10 rounded border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all bg-white flex items-center justify-center"
                              onClick={() => openPreview(item)}
                              title="Klik untuk memperbesar"
                            >
                              <img 
                                src={pb.files.getUrl(item, item.qris_image, { thumb: '50x50' })} 
                                alt="QRIS" 
                                className="w-full h-full object-contain p-0.5"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic bg-muted/50 px-2 py-1 rounded">Tidak ada</span>
                          )
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {item.nomor_rekening || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'aktif' ? 'default' : 'secondary'} className={item.status === 'aktif' ? 'bg-success hover:bg-success/90' : ''}>
                          {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 bg-background">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => setDeleteItem(item)} className="h-8 w-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalItems > perPage && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, totalItems)} dari {totalItems} data
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * perPage >= totalItems || isLoading}>
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {isAdmin && (
        <>
          <PaymentMethodFormModal
            open={showForm}
            onClose={() => setShowForm(false)}
            item={editingItem}
            onSuccess={fetchItems}
          />

          <DeletePaymentMethodDialog
            open={!!deleteItem}
            onClose={() => setDeleteItem(null)}
            item={deleteItem}
            onSuccess={fetchItems}
          />
        </>
      )}

      {previewImage && (
        <QRISImagePreviewModal
          open={!!previewImage}
          onClose={() => setPreviewImage(null)}
          imageUrl={previewImage.url}
          title={previewImage.title}
        />
      )}
    </Card>
  );
};

export default PaymentMethodsTab;
