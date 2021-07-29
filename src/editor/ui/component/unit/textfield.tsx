/** @jsx jsx */

import { jsx, css } from '@emotion/react';
import { FormGroup, TextArea } from '@blueprintjs/core'
import { IField } from '../../interface/fieldinterface';

const NormalTextField: React.FC<IField> = (f: IField) => {
  return (
    <FormGroup
        label={f.text}
        helperText={f.extend}>
      <TextArea
        onChange={e => f.update(e.target.value)} value={f.value}
        css={css`padding: 5px !important`}
        fill
      />
    </FormGroup>
  );
};

export default NormalTextField;
