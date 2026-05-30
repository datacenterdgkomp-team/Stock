
import React from 'react';
import SystemSettingForm from './SystemSettingForm.jsx';

const KategoriForm = (props) => {
  return <SystemSettingForm {...props} title="Kategori" minLength={3} />;
};

export default KategoriForm;
