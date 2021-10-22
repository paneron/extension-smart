/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { Switch } from '@blueprintjs/core';
import { VarInputInterface } from '../../../model/Measurement';

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
