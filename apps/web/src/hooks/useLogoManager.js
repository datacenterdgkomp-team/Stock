
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export const useLogoManager = () => {
  const [isUploading, setIsUploading] = useState(false);

  const validateLogoFile = async (file) => {
    if (!file) return { valid: false, error: 'Tidak ada file yang dipilih.' };

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Format file tidak valid. Gunakan PNG, JPG, atau JPEG.' };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Ukuran file terlalu besar. Maksimal 5MB.' };
    }

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.width < 100 || img.height < 100) {
          resolve({ valid: false, error: 'Dimensi gambar terlalu kecil. Minimal 100x100px.' });
        } else if (img.width > 2000 || img.height > 2000) {
          resolve({ valid: false, error: 'Dimensi gambar terlalu besar. Maksimal 2000x2000px.' });
        } else {
          resolve({ valid: true, img, error: null });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, error: 'File gambar rusak atau tidak dapat dibaca.' });
      };
      
      img.src = objectUrl;
    });
  };

  const resizeAndConvertToBase64 = (img, fileType) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Max dimensions for storage to prevent huge base64 strings
      const MAX_DIMENSION = 500;
      
      if (width > height && width > MAX_DIMENSION) {
        height *= MAX_DIMENSION / width;
        width = MAX_DIMENSION;
      } else if (height > MAX_DIMENSION) {
        width *= MAX_DIMENSION / height;
        height = MAX_DIMENSION;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress slightly to save space in text field
      const dataUrl = canvas.toDataURL(fileType, 0.8);
      resolve(dataUrl);
    });
  };

  const fetchCurrentLogo = useCallback(async () => {
    try {
      const records = await pb.collection('pengaturan_toko').getFullList({ $autoCancel: false });
      if (records.length > 0) {
        return records[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching logo:', error);
      return null;
    }
  }, []);

  const uploadLogo = async (file, settingsId, userId) => {
    setIsUploading(true);
    try {
      const validation = await validateLogoFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        setIsUploading(false);
        return false;
      }

      // Convert to base64 since schema uses text field for path
      const base64Data = await resizeAndConvertToBase64(validation.img, file.type);

      const data = {
        logo_filename: file.name,
        logo_path: base64Data, // Storing base64 in path field as per schema constraints
        logo_size: file.size,
        logo_uploaded_at: new Date().toISOString(),
        logo_uploaded_by: userId
      };

      if (settingsId) {
        await pb.collection('pengaturan_toko').update(settingsId, data, { $autoCancel: false });
      } else {
        // If no settings exist, create one with default name
        await pb.collection('pengaturan_toko').create({
          nama_toko: 'DG Komputer',
          ...data
        }, { $autoCancel: false });
      }

      toast.success('Logo berhasil diunggah');
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Gagal mengunggah logo');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteLogo = async (settingsId) => {
    if (!settingsId) return false;
    
    try {
      await pb.collection('pengaturan_toko').update(settingsId, {
        logo_filename: '',
        logo_path: '',
        logo_size: 0,
        logo_uploaded_at: null,
        logo_uploaded_by: null
      }, { $autoCancel: false });
      
      toast.success('Logo berhasil dihapus');
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Gagal menghapus logo');
      return false;
    }
  };

  return {
    fetchCurrentLogo,
    uploadLogo,
    deleteLogo,
    validateLogoFile,
    isUploading
  };
};
