import { FormGroup } from '@blueprintjs/core';
import React from 'react';
import MGDLabel from '@/smart/MGDComponents/MGDLabel';
import {
  cardinalityToString,
  parseCardinality,
} from '../../../utils/ModelFunctions';
import { NormalComboBox } from '@/smart/ui/common/fields';

export const CardinalityField: React.FC<{
  value: string;
  onChange: (x: string) => void;
}> = function ({ value, onChange }) {
  const [low, high] = parseCardinality(value);

  const LOW_OPTIONS = ['', '0', '1'];
  const HIGH_OPTIONS = ['', '1', '*'];

  return (
    <FormGroup label="Attribute Cardinality">
      <NormalComboBox
        options={LOW_OPTIONS}
        value={low}
        onChange={x => onChange(setValue(x, high))}
        noContainer={true}
      />
      <MGDLabel>..</MGDLabel>
      <NormalComboBox
        options={HIGH_OPTIONS}
        value={high}
        onChange={x => onChange(setValue(low, x))}
        noContainer={true}
      />
    </FormGroup>
  );
};

function setValue(low: string, high: string) {
  return cardinalityToString(low, high);
}
