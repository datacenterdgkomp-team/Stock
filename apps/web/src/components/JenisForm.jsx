
import React from 'react';
import SystemSettingForm from './SystemSettingForm.jsx';

const JenisForm = (props) => {
  return <SystemSettingForm {...props} title="Jenis" minLength={3} />;
};

export default JenisForm;
