// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { TextArea } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { mgd_textarea } from '../../css/form';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  value: any;
  id: string;
  readOnly?: boolean;
  onChange: (e: any) => void;
  rows?: number;
  fill?: boolean;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDTextarea(props: OwnProps) {
  const { value, onChange, readOnly = false, id, rows = 2, fill } = props;
  return (
    <TextArea
      id={id}
      css={mgd_textarea}
      readOnly={readOnly}
      onChange={onChange}
      value={value}
      rows={rows}
      fill={fill}
    />
  );
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDTextarea;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
