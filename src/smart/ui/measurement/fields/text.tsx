import React from 'react';
import type { VarInputInterface } from '@/smart/model/Measurement';
import type {
  MMELVariable } from '@paneron/libmmel/interface/supportinterface';
import {
  VarType,
} from '@paneron/libmmel/interface/supportinterface';
import { NormalTextField } from '@/smart/ui/common/fields';

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
