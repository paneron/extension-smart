import { Switch } from '@blueprintjs/core';
import React from 'react';
import type { VarInputInterface } from '@/smart/model/Measurement';

const BooleanMeasureEdit: React.FC<VarInputInterface> = function ({
  variable,
  value,
  profile,
  onChange,
}) {
  return (
    <Switch
      checked={value !== undefined ? value === 'true' : true}
      label={variable.description}
      onChange={
        profile !== undefined &&
        profile.profile[variable.id] !== undefined &&
        profile.profile[variable.id].isConst
          ? undefined
          : x => onChange(x.currentTarget.checked ? 'true' : 'false')
      }
    />
  );
};

export default BooleanMeasureEdit;
