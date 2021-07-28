/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { CSSProperties } from 'react';
import { IField } from '../../interface/fieldinterface';

const NormalTextField: React.FC<IField> = (f: IField) => {
  const inputcss: CSSProperties = {
    resize: 'both',
    height: '18px',
    verticalAlign: 'middle',
  };

  return (
    <p>
      {' '}
      {f.text}
      <textarea
        style={inputcss}
        value={f.value}
        onChange={e => f.update(e.target.value)}
      />
      {f.extend === undefined ? '' : f.extend}
    </p>
  );
};

export default NormalTextField;
