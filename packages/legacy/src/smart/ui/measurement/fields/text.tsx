import React from 'react';
import { VarInputInterface } from '../../../model/Measurement';
import {
  MMELVariable,
  VarType,
} from '@paneron/libmmel/interface/supportinterface';
import { NormalTextField } from '../../common/fields';

function getDesc(v: MMELVariable) {
  return (
    v.description +
    (v.type === VarType.LISTDATA ? ' (Seperate the values by ,)' : '')
  );
}

const TextMeasureEdit: React.FC<VarInputInterface> = function ({
  variable,
  value,
  profile,
  onChange,
}) {
  return (
    <NormalTextField
      text={getDesc(variable)}
      value={value ?? ''}
      onChange={
        profile !== undefined &&
        profile.profile[variable.id] !== undefined &&
        profile.profile[variable.id].isConst
          ? undefined
          : onChange
      }
    />
  );
};

export default TextMeasureEdit;
