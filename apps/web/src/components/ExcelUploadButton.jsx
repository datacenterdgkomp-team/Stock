
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import UploadPreviewModal from './UploadPreviewModal.jsx';

const ExcelUploadButton = ({ onSuccess }) => {
  const fileInputRef = useRef(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 10MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.error('File Excel kosong atau tidak sesuai format.');
          return;
        }

        validateData(data);
      } catch (err) {
        console.error('Error parsing Excel:', err);
        toast.error('Gagal membaca file Excel. Pastikan format sesuai.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const validateData = (data) => {
    const valid = [];
    const errors = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // Assuming header is row 1
      const rowErrors = [];

      const kode = row['Kode Barang']?.toString()?.trim();
      const nama = row['Nama Barang']?.toString()?.trim();
      const hBeli = Number(row['Harga Beli']);
      const hJual = Number(row['Harga Jual']);
      const stok = Number(row['Stok']);

      if (!kode) rowErrors.push('Kode Barang kosong');
      else if (kode.length > 50) rowErrors.push('Kode Barang terlalu panjang (max 50)');

      if (!nama) rowErrors.push('Nama Barang kosong');
      else if (nama.length > 100) rowErrors.push('Nama Barang terlalu panjang (max 100)');

      if (isNaN(hBeli) || hBeli < 0) rowErrors.push('Harga Beli tidak valid');
      if (isNaN(hJual) || hJual < 0) rowErrors.push('Harga Jual tidak valid');
      if (isNaN(stok) || stok < 0) rowErrors.push('Stok tidak valid');

      const satuan = row['Satuan']?.toString()?.trim() || 'Pcs';
      if (satuan.length > 20) rowErrors.push('Satuan maksimal 20 karakter');

      const deskripsi = row['Deskripsi']?.toString()?.trim() || '';
      if (deskripsi.length > 500) rowErrors.push('Deskripsi maksimal 500 karakter');

      if (rowErrors.length > 0) {
        errors.push({ row: rowNum, data: row, messages: rowErrors });
      } else {
        valid.push({ row: rowNum, data: row });
      }
    });

    setPreviewData({ valid, errors, all: data });
    setShowPreview(true);
  };

  const getOrCreateRelation = async (collectionName, nameValue, mapCache) => {
    if (!nameValue) return null;
    const name = nameValue.toString().trim();
    if (!name) return null;
    
    const key = name.toLowerCase();
    
    if (mapCache.has(key)) {
      return mapCache.get(key);
    }

    try {
      // First try to find it (in case cache is stale)
      const existing = await pb.collection(collectionName).getFirstListItem(`nama ~ "${name}"`, { $autoCancel: false }).catch(() => null);
      if (existing) {
        mapCache.set(key, existing.id);
        return existing.id;
      }

      // If not exists, create new
      const newRecord = await pb.collection(collectionName).create({
        nama: name,
        status: 'aktif'
      }, { $autoCancel: false });
      
      mapCache.set(key, newRecord.id);
      return newRecord.id;
    } catch (err) {
      console.error(`Failed to create/find ${collectionName}:`, err);
      return null; // Graceful fallback
    }
  };

  const handleImport = async (skipErrors) => {
    setIsImporting(true);
    
    // Sort combined data if we aren't skipping errors, otherwise just valid
    const dataToImport = skipErrors ? previewData.valid : [...previewData.valid, ...previewData.errors].sort((a,b) => a.row - b.row);
    
    let successCount = 0;
    
    try {
      // Fetch existing records for mapping
      const [kategoriList, jenisList, merekList, barangList] = await Promise.all([
        pb.collection('kategori').getFullList({ fields: 'id,nama', $autoCancel: false }).catch(() => []),
        pb.collection('jenis').getFullList({ fields: 'id,nama', $autoCancel: false }).catch(() => []),
        pb.collection('merek').getFullList({ fields: 'id,nama', $autoCancel: false }).catch(() => []),
        pb.collection('barang').getFullList({ fields: 'id,kode_barang', $autoCancel: false }).catch(() => [])
      ]);

      const katMap = new Map(kategoriList.map(k => [k.nama.toLowerCase(), k.id]));
      const jenMap = new Map(jenisList.map(j => [j.nama.toLowerCase(), j.id]));
      const merMap = new Map(merekList.map(m => [m.nama.toLowerCase(), m.id]));
      const barMap = new Map(barangList.map(b => [b.kode_barang.toLowerCase(), b.id]));

      for (const item of dataToImport) {
        const row = item.data;
        try {
          const katId = await getOrCreateRelation('kategori', row['Kategori'], katMap);
          const jenId = await getOrCreateRelation('jenis', row['Jenis'], jenMap);
          const merId = await getOrCreateRelation('merek', row['Merek'], merMap);

          const payload = {
            kode_barang: row['Kode Barang'].toString().trim(),
            nama: row['Nama Barang'].toString().trim(),
            harga_beli: Number(row['Harga Beli']),
            harga_jual: Number(row['Harga Jual']),
            stok: Number(row['Stok']),
            satuan: row['Satuan']?.toString()?.trim() || 'Pcs',
            deskripsi: row['Deskripsi']?.toString()?.trim() || '',
            status: row['Status']?.toString()?.toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif'
          };

          if (katId) payload.kategori = katId;
          if (jenId) payload.jenis = jenId;
          if (merId) payload.merek = merId;

          const kbKey = payload.kode_barang.toLowerCase();
          
          if (barMap.has(kbKey)) {
            // Update existing
            await pb.collection('barang').update(barMap.get(kbKey), payload, { $autoCancel: false });
          } else {
            // Create new
            const newBarang = await pb.collection('barang').create(payload, { $autoCancel: false });
            barMap.set(kbKey, newBarang.id);
          }
          successCount++;
        } catch (rowErr) {
          console.error(`Error importing row ${item.row}:`, rowErr);
        }
      }

      toast.success(`Berhasil mengimpor ${successCount} data barang`);
      setShowPreview(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Import process failed:', err);
      toast.error('Terjadi kesalahan sistem saat proses import');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Button 
        variant="secondary" 
        onClick={() => fileInputRef.current?.click()}
        className="shadow-sm bg-secondary text-secondary-foreground"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Excel
      </Button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".xlsx, .xls" 
        className="hidden" 
      />

      <UploadPreviewModal 
        open={showPreview}
        onClose={() => setShowPreview(false)}
        previewData={previewData}
        onConfirm={handleImport}
        isImporting={isImporting}
      />
    </>
  );
};

export default ExcelUploadButton;
