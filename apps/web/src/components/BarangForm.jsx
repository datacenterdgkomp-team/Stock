
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import PhotoUploadField from '@/components/PhotoUploadField.jsx';
import ComboboxField from '@/components/ComboboxField.jsx';
import { useKodeBarangValidation } from '@/hooks/useKodeBarangValidation';
import {
  validateNamaBarang,
  validateHarga,
  validateStok,
  validateJenis,
  validateMerek,
  validateSatuan
} from '@/lib/barangValidation';
import { AlertCircle, Loader2, Check, ChevronsUpDown } from 'lucide-react';

const BarangForm = ({ open, onClose, barang, onSuccess, onPhotosChange }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kode_barang: '',
    nama: '',
    kategori: '',
    jenis: '',
    merek: '',
    satuan: '',
    harga_beli: '',
    harga_jual: '',
    stok: '',
    supplier: '',
    deskripsi: ''
  });
  
  const [errors, setErrors] = useState({});
  const [validRelations, setValidRelations] = useState({
    jenis: [],
    merek: []
  });
  const [relationsLoaded, setRelationsLoaded] = useState(false);
  
  const [suppliers, setSuppliers] = useState([]);
  const [isSuppliersLoading, setIsSuppliersLoading] = useState(true);
  const [supplierFetchError, setSupplierFetchError] = useState('');

  // Kategori Real-time State
  const [kategoriList, setKategoriList] = useState([]);
  const [isKategoriLoading, setIsKategoriLoading] = useState(true);
  const [kategoriError, setKategoriError] = useState('');
  const [openKategori, setOpenKategori] = useState(false);
  
  const [photoData, setPhotoData] = useState({ newFiles: [], deletedExisting: [] });

  const { isValid: isKodeValid, error: kodeError, isLoading: isKodeLoading } = useKodeBarangValidation(formData.kode_barang, barang?.id);

  // Fetch Kategori with Real-time Subscription
  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    const fetchKategori = async () => {
      setIsKategoriLoading(true);
      setKategoriError('');
      try {
        const records = await pb.collection('kategori_barang').getFullList({
          sort: 'nama_kategori',
          $autoCancel: false
        });
        if (isMounted) setKategoriList(records);
      } catch (error) {
        console.error('Error fetching kategori:', error);
        if (isMounted) setKategoriError('Gagal memuat daftar kategori');
      } finally {
        if (isMounted) setIsKategoriLoading(false);
      }
    };

    fetchKategori();

    pb.collection('kategori_barang').subscribe('*', function (e) {
      fetchKategori();
    }).catch(err => {
      console.warn('Could not subscribe to kategori_barang collection:', err);
    });

    return () => {
      isMounted = false;
      pb.collection('kategori_barang').unsubscribe('*').catch(() => {});
    };
  }, [open]);

  // Fetch other relations
  useEffect(() => {
    const fetchRelations = async () => {
      if (!open) return;
      try {
        const [jen, mer] = await Promise.all([
          pb.collection('jenis').getFullList({ fields: 'id', $autoCancel: false }),
          pb.collection('merek').getFullList({ fields: 'id', $autoCancel: false })
        ]);
        setValidRelations({
          jenis: jen.map(j => j.id),
          merek: mer.map(m => m.id)
        });
      } catch (error) {
        console.error('Error fetching valid relations:', error);
      } finally {
        setRelationsLoaded(true);
      }
    };
    
    fetchRelations();
  }, [open]);

  // Fetch Suppliers
  useEffect(() => {
    if (!open) return;

    const fetchSuppliers = async () => {
      setIsSuppliersLoading(true);
      setSupplierFetchError('');
      try {
        const records = await pb.collection('supplier').getFullList({
          sort: 'nama_supplier',
          $autoCancel: false
        });
        setSuppliers(records);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setSupplierFetchError('Gagal memuat daftar supplier');
      } finally {
        setIsSuppliersLoading(false);
      }
    };

    fetchSuppliers();

    pb.collection('supplier').subscribe('*', function (e) {
      fetchSuppliers();
    }).catch(err => {
      console.warn('Could not subscribe to supplier collection:', err);
    });

    return () => {
      pb.collection('supplier').unsubscribe('*').catch(() => {});
    };
  }, [open]);

  useEffect(() => {
    if (barang) {
      setFormData({
        kode_barang: barang.kode_barang || '',
        nama: barang.nama || '',
        kategori: barang.kategori || '',
        jenis: barang.jenis || '',
        merek: barang.merek || '',
        satuan: barang.satuan || '',
        harga_beli: barang.harga_beli?.toString() || '',
        harga_jual: barang.harga_jual?.toString() || '',
        stok: barang.stok?.toString() || '',
        supplier: barang.supplier || '',
        deskripsi: barang.deskripsi || ''
      });
    } else {
      setFormData({
        kode_barang: `BRG-${Date.now().toString().slice(-6)}`,
        nama: '',
        kategori: '',
        jenis: '',
        merek: '',
        satuan: '',
        harga_beli: '',
        harga_jual: '',
        stok: '',
        supplier: '',
        deskripsi: ''
      });
    }
    
    setPhotoData({ newFiles: [], deletedExisting: [] });
    setErrors({});
    
  }, [barang, open]);

  const handlePhotosChange = (data) => {
    setPhotoData(data);
    if (typeof onPhotosChange === 'function') {
      onPhotosChange(data);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!isKodeValid) newErrors.kode_barang = kodeError;
    
    const namaVal = validateNamaBarang(formData.nama);
    if (!namaVal.isValid) newErrors.nama = namaVal.error;
    
    const jenisVal = validateJenis(formData.jenis);
    if (!jenisVal.isValid) newErrors.jenis = jenisVal.error;
    
    const merekVal = validateMerek(formData.merek);
    if (!merekVal.isValid) newErrors.merek = merekVal.error;
    
    const satuanVal = validateSatuan(formData.satuan);
    if (!satuanVal.isValid) newErrors.satuan = satuanVal.error;
    
    const hBeliVal = validateHarga(formData.harga_beli);
    if (!hBeliVal.isValid) newErrors.harga_beli = hBeliVal.error;
    
    const hJualVal = validateHarga(formData.harga_jual);
    if (!hJualVal.isValid) newErrors.harga_jual = hJualVal.error;
    
    const stokVal = validateStok(formData.stok);
    if (!stokVal.isValid) newErrors.stok = stokVal.error;

    // Validate PocketBase ID format (15 chars alphanumeric) for relations
    const pbIdRegex = /^[a-z0-9]{15}$/;

    // Kategori Validation (Required)
    if (!formData.kategori) {
      newErrors.kategori = 'Kategori wajib dipilih.';
    } else if (!pbIdRegex.test(formData.kategori)) {
      newErrors.kategori = 'ID Kategori tidak valid. Silakan pilih ulang dari daftar.';
    } else if (!isKategoriLoading && kategoriList.length > 0 && !kategoriList.find(k => k.id === formData.kategori)) {
      newErrors.kategori = 'Kategori tidak ditemukan di database. Silakan pilih dari daftar.';
    }

    if (formData.jenis && !pbIdRegex.test(formData.jenis)) {
      newErrors.jenis = 'ID Jenis tidak valid. Silakan pilih ulang dari daftar.';
    }
    if (formData.merek && !pbIdRegex.test(formData.merek)) {
      newErrors.merek = 'ID Merek tidak valid. Silakan pilih ulang dari daftar.';
    }

    if (relationsLoaded) {
      if (formData.jenis && validRelations.jenis.length > 0 && !validRelations.jenis.includes(formData.jenis)) {
        newErrors.jenis = 'Jenis tidak ditemukan di database. Silakan pilih dari daftar.';
      }
      if (formData.merek && validRelations.merek.length > 0 && !validRelations.merek.includes(formData.merek)) {
        newErrors.merek = 'Merek tidak ditemukan di database. Silakan pilih dari daftar.';
      }
    }

    if (formData.supplier && !isSuppliersLoading && suppliers.length > 0) {
      const supplierExists = suppliers.find(s => s.id === formData.supplier);
      if (!supplierExists) {
        newErrors.supplier = 'Supplier ini tidak lagi tersedia (telah dihapus). Silakan ganti atau kosongkan.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon periksa kembali form isian Anda');
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = new FormData();
      dataToSubmit.append('kode_barang', formData.kode_barang);
      dataToSubmit.append('nama', formData.nama);
      
      // Only append relation IDs if they are valid and not empty
      if (formData.kategori) dataToSubmit.append('kategori', formData.kategori);
      if (formData.jenis) dataToSubmit.append('jenis', formData.jenis);
      if (formData.merek) dataToSubmit.append('merek', formData.merek);
      if (formData.supplier) dataToSubmit.append('supplier', formData.supplier);
      
      dataToSubmit.append('satuan', formData.satuan);
      dataToSubmit.append('harga_beli', formData.harga_beli);
      dataToSubmit.append('harga_jual', formData.harga_jual);
      dataToSubmit.append('stok', formData.stok);
      dataToSubmit.append('deskripsi', formData.deskripsi);

      if (photoData.newFiles.length > 0) {
        dataToSubmit.append('photo', photoData.newFiles[0]);
      } else if (photoData.deletedExisting.length > 0) {
        dataToSubmit.append('photo', '');
      }

      if (barang) {
        await pb.collection('barang').update(barang.id, dataToSubmit, { $autoCancel: false });
        toast.success('Barang berhasil diperbarui');
      } else {
        await pb.collection('barang').create(dataToSubmit, { $autoCancel: false });
        toast.success('Barang berhasil ditambahkan');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving barang:', error);
      
      if (error.status === 400 && error.data?.data) {
        const errData = error.data.data;
        const mappedErrors = {};
        
        ['kategori', 'jenis', 'merek', 'supplier'].forEach(field => {
          if (errData[field]) {
            mappedErrors[field] = `Data ${field} tidak valid.`;
            toast.error(`Gagal menyimpan: Field ${field} tidak valid.`);
          }
        });
        
        if (Object.keys(mappedErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...mappedErrors }));
          setLoading(false);
          return;
        }
      }
      
      toast.error(barang ? 'Gagal memperbarui barang' : 'Gagal menambahkan barang');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || isKodeLoading || !isKodeValid;

  const isSupplierLegacyDeleted = formData.supplier && !isSuppliersLoading && suppliers.length > 0 && !suppliers.find(s => s.id === formData.supplier);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">{barang ? 'Edit Barang' : 'Tambah Barang Baru'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 space-y-4">
              <div>
                <PhotoUploadField 
                  existingPhotos={barang?.photo ? [barang.photo] : []}
                  record={barang}
                  onPhotosChange={handlePhotosChange}
                  isUploading={loading}
                  maxPhotos={1}
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kode_barang" className="text-xs md:text-sm">Kode Barang</Label>
                  <Input
                    id="kode_barang"
                    value={formData.kode_barang}
                    onChange={(e) => setFormData({ ...formData, kode_barang: e.target.value })}
                    className={`text-foreground h-10 md:h-11 text-sm md:text-base ${errors.kode_barang || kodeError ? 'border-destructive' : ''}`}
                  />
                  {(errors.kode_barang || kodeError) && (
                    <p className="text-xs text-destructive">{errors.kode_barang || kodeError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama" className="text-xs md:text-sm">Nama Barang</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className={`text-foreground h-10 md:h-11 text-sm md:text-base ${errors.nama ? 'border-destructive' : ''}`}
                  />
                  {errors.nama && <p className="text-xs text-destructive">{errors.nama}</p>}
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label className="text-xs md:text-sm mb-1">Kategori <span className="text-destructive">*</span></Label>
                  <Popover open={openKategori} onOpenChange={setOpenKategori}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openKategori}
                        className={`justify-between h-10 md:h-11 text-sm md:text-base font-normal w-full ${!formData.kategori ? 'text-muted-foreground' : ''} ${errors.kategori ? 'border-destructive ring-1 ring-destructive' : ''}`}
                      >
                        {formData.kategori
                          ? kategoriList.find((k) => k.id === formData.kategori)?.nama_kategori || "Pilih Kategori..."
                          : "Pilih Kategori..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] sm:w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Cari kategori..." />
                        <CommandList>
                          {isKategoriLoading ? (
                            <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
                            </div>
                          ) : kategoriError ? (
                            <div className="p-4 text-center text-sm text-destructive">
                              {kategoriError}
                            </div>
                          ) : kategoriList.length === 0 ? (
                            <CommandEmpty>Tidak ada kategori.</CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {kategoriList.map((kategori) => (
                                <CommandItem
                                  key={kategori.id}
                                  value={kategori.nama_kategori}
                                  onSelect={() => {
                                    setFormData({ ...formData, kategori: kategori.id });
                                    setOpenKategori(false);
                                    // Clear error when selected
                                    if (errors.kategori) {
                                      setErrors(prev => ({ ...prev, kategori: undefined }));
                                    }
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      formData.kategori === kategori.id ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {kategori.nama_kategori}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.kategori && <p className="text-xs text-destructive mt-1">{errors.kategori}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Jenis</Label>
                  <ComboboxField
                    collectionName="jenis"
                    label="Jenis"
                    value={formData.jenis}
                    onChange={(val) => setFormData({ ...formData, jenis: val })}
                    error={errors.jenis}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Merek</Label>
                  <ComboboxField
                    collectionName="merek"
                    label="Merek"
                    value={formData.merek}
                    onChange={(val) => setFormData({ ...formData, merek: val })}
                    minLength={2}
                    error={errors.merek}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-xs md:text-sm">Supplier (Opsional)</Label>
                  <Select 
                    value={formData.supplier || 'none'} 
                    onValueChange={(val) => setFormData({ ...formData, supplier: val === 'none' ? '' : val })}
                  >
                    <SelectTrigger className={`text-foreground h-10 md:h-11 text-sm md:text-base ${errors.supplier ? 'border-destructive ring-1 ring-destructive' : ''}`}>
                      <SelectValue placeholder="Pilih Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-muted-foreground italic">
                        -- Tidak Ada Supplier --
                      </SelectItem>
                      {isSuppliersLoading ? (
                        <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
                        </div>
                      ) : supplierFetchError ? (
                        <div className="flex items-center gap-2 p-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" /> Error memuat
                        </div>
                      ) : suppliers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground italic text-center">
                          Belum ada supplier
                        </div>
                      ) : (
                        suppliers.map(sup => (
                          <SelectItem key={sup.id} value={sup.id}>
                            {sup.nama_supplier}
                          </SelectItem>
                        ))
                      )}
                      
                      {isSupplierLegacyDeleted && (
                        <SelectItem value={formData.supplier} className="text-destructive font-medium">
                          Supplier Dihapus (ID: {formData.supplier.slice(0,6)}...)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.supplier && <p className="text-xs text-destructive">{errors.supplier}</p>}
                  {!errors.supplier && isSupplierLegacyDeleted && (
                    <p className="text-[11px] text-warning font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Supplier sebelumnya telah dihapus dari sistem
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="satuan" className="text-xs md:text-sm">Satuan</Label>
                  <Input
                    id="satuan"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    placeholder="Pcs, Unit, Box..."
                    className={`text-foreground h-10 md:h-11 text-sm md:text-base ${errors.satuan ? 'border-destructive' : ''}`}
                  />
                  {errors.satuan && <p className="text-xs text-destructive">{errors.satuan}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stok" className="text-xs md:text-sm">Stok Awal</Label>
                  <Input
                    id="stok"
                    type="number"
                    min="0"
                    value={formData.stok}
                    onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                    className={`text-foreground h-10 md:h-11 text-sm md:text-base ${errors.stok ? 'border-destructive' : ''}`}
                  />
                  {errors.stok && <p className="text-xs text-destructive">{errors.stok}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="harga_beli" className="text-xs md:text-sm">Harga Beli</Label>
                  <Input
                    id="harga_beli"
                    type="number"
                    min="0"
                    value={formData.harga_beli}
                    onChange={(e) => setFormData({ ...formData, harga_beli: e.target.value })}
                    className={`text-foreground h-10 md:h-11 text-sm md:text-base ${errors.harga_beli ? 'border-destructive' : ''}`}
                  />
                  {errors.harga_beli && <p className="text-xs text-destructive">{errors.harga_beli}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="harga_jual" className="text-xs md:text-sm">Harga Jual</Label>
                  <Input
                    id="harga_jual"
                    type="number"
                    min="0"
                    value={formData.harga_jual}
                    onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value })}
                    className={`text-foreground h-10 md:h-11 text-sm md:text-base ${errors.harga_jual ? 'border-destructive' : ''}`}
                  />
                  {errors.harga_jual && <p className="text-xs text-destructive">{errors.harga_jual}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi" className="text-xs md:text-sm">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows={3}
                  className="text-foreground text-sm md:text-base resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto h-10 md:h-11">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitDisabled} className="w-full sm:w-auto h-10 md:h-11">
              {loading ? 'Menyimpan...' : 'Simpan Barang'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BarangForm;
