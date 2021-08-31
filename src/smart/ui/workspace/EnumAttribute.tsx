/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { MMELEnum } from '../../serialize/interface/datainterface';
import { NormalComboBox } from '../common/fields';

const EnumAttribute: React.FC<{
  value: string;
  title: string;
  onChange: (x: string) => void;
  mmelenum: MMELEnum;
}> = function ({ value, title, onChange, mmelenum }) {
  const opts = ['', ...Object.values(mmelenum.values).map(v => v.value)];
  return (
    <NormalComboBox
      text={title}
      value={value}
      options={opts}
      onChange={onChange}
    />
  );
};

export default EnumAttribute;
