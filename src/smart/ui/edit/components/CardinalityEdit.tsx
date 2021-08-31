/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { FormGroup } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import MGDLabel from '../../../MGDComponents/MGDLabel';
import { NormalComboBox } from '../../common/fields';

export const CardinalityField: React.FC<{
  value: string;
  onChange: (x: string) => void;
}> = function ({ value, onChange }) {
  const index = value.indexOf('..');
  const low = index === -1 ? '' : value.substring(0, index);
  const high = index === -1 ? '' : value.substr(index + 2);

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
  return `${low}..${high}`;
}
