
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, UploadCloud, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useLogoManager } from '@/hooks/useLogoManager.js';
import { useLogo } from '@/contexts/LogoContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
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

const LogoUploadSection = ({ settingsId }) => {
  const { currentUser } = useAuth();
  const { uploadLogo, deleteLogo, isUploading } = useLogoManager();
  const { storeSettings, logoUrl, refreshLogo } = useLogo();
  
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  const handleDragOver = (e) => {
    e.preventDefault();
    if (canEdit) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!canEdit) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file) => {
    const success = await uploadLogo(file, settingsId, currentUser.id);
    if (success) {
      refreshLogo();
    }
  };

  const handleDelete = async () => {
    const success = await deleteLogo(settingsId);
    if (success) {
      refreshLogo();
      setShowDeleteConfirm(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Preview Area */}
        <div className="flex-shrink-0 flex flex-col items-center space-y-4">
          <Label className="text-muted-foreground font-medium">Preview Logo</Label>
          <div className="logo-preview-container w-[150px] h-[150px] md:w-[175px] md:h-[175px] lg:w-[200px] lg:h-[200px] rounded-2xl border-2 border-border bg-muted/30 flex items-center justify-center overflow-hidden shadow-sm relative group">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo Toko" 
                className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground opacity-50">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span className="text-sm font-medium">Belum ada logo</span>
              </div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          {storeSettings?.logo_filename && (
            <div className="text-center space-y-1 w-full max-w-[200px]">
              <p className="text-sm font-medium truncate" title={storeSettings.logo_filename}>
                {storeSettings.logo_filename}
              </p>
              <div className="flex justify-center gap-2 text-xs text-muted-foreground">
                <span>{formatBytes(storeSettings.logo_size)}</span>
                <span>•</span>
                <span>{formatDate(storeSettings.logo_uploaded_at)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1 flex flex-col justify-center">
          {canEdit ? (
            <div className="space-y-4">
              <div 
                className={`logo-upload-area border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-all duration-200 ${
                  isDragging 
                    ? 'border-primary bg-primary/5 scale-[1.02]' 
                    : 'border-border bg-muted/10 hover:bg-muted/30 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadCloud className={`w-10 h-10 mx-auto mb-4 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                <h3 className="text-base md:text-lg font-medium mb-1">Tarik & Lepas file di sini</h3>
                <p className="text-sm text-muted-foreground mb-6">atau klik tombol di bawah untuk memilih file</p>
                
                <Input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full sm:w-auto shadow-sm"
                  >
                    Pilih File Gambar
                  </Button>
                  
                  {storeSettings?.logo_path && (
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isUploading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus Logo
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <p className="font-medium">Persyaratan File:</p>
                  <ul className="list-disc list-inside pl-1 space-y-0.5 opacity-90">
                    <li>Format: PNG, JPG, atau JPEG</li>
                    <li>Ukuran maksimal: 5 MB</li>
                    <li>Dimensi: 100x100px hingga 2000x2000px</li>
                    <li>Rekomendasi: Gunakan rasio 1:1 (persegi) dengan background transparan</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 border rounded-2xl bg-muted/10">
              <p className="text-muted-foreground text-center">
                Anda tidak memiliki akses untuk mengubah logo toko. Hubungi Admin atau Manager.
              </p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Hapus Logo Toko
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus logo toko? Logo akan kembali ke tampilan default (inisial nama toko). Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ya, Hapus Logo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LogoUploadSection;
