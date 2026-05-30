
import React from 'react';
import SystemSettingForm from './SystemSettingForm.jsx';

const MerekForm = (props) => {
  return <SystemSettingForm {...props} title="Merek" minLength={2} />;
};

export default MerekForm;
