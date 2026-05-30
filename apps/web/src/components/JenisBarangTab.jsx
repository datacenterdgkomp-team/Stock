
import React from 'react';
import SystemSettingTab from './SystemSettingTab.jsx';

const JenisBarangTab = () => {
  return (
    <SystemSettingTab 
      collectionName="jenis" 
      title="Jenis Barang" 
      description="Tentukan jenis barang untuk klasifikasi lebih detail." 
      minLength={3} 
    />
  );
};

export default JenisBarangTab;
