import React from 'react';
import { useMemo } from 'react';
import { EditorModel } from '../../../model/editormodel';
import { VarInputInterface } from '../../../model/Measurement';
import { MMELVariable } from '../../../serialize/interface/supportinterface';
import { NormalTextField, NormalComboBox } from '../../common/fields';

function calOptions(
  model: EditorModel,
  variable: MMELVariable,
  values: Record<string, string>
): string[] {
  const para = variable.definition.split(',');
  if (para.length < 2) {
    return [];
  }
  const table = model.tables[para[0]];
  const col = parseInt(para[1]);
  if (table === undefined || col < 0 || col >= table.columns) {
    return [];
  }
  let rows = table.data.slice(1);
  for (let i = 2; i + 1 < para.length; i += 2) {
    const index = parseInt(para[i]);
    const value = values[para[i + 1]];
    if (value !== undefined && value !== '') {
      rows = rows.filter(r => r[index] === value);
    }
  }
  return [...new Set([...rows.map(r => r[col]), ''])];
}

const TableComboBox: React.FC<VarInputInterface> = function ({
  model,
  variable,
  value,
  values,
  profile,
  onChange,
}) {
  const options = useMemo(
    () => calOptions(model, variable, values),
    [model, variable, values]
  );

  useMemo(() => {
    if (value !== undefined && !options.includes(value)) {
      onChange('');
    }
  }, [value, options]);

  return profile !== undefined &&
    profile.profile[variable.id] !== undefined &&
    profile.profile[variable.id].isConst ? (
    <NormalTextField text={variable.description} value={value ?? ''} />
  ) : (
    <NormalComboBox
      text={variable.description}
      value={value ?? ''}
      options={options}
      onChange={onChange}
    />
  );
};

export default TableComboBox;
