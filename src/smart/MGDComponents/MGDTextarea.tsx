/**
 * This is the components made by Ed, a former designer for the app (web version)
 */

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import { TextArea } from '@blueprintjs/core';
import type { ChangeEvent } from 'react';
import React from 'react';
import { mgdTextarea } from '@/css/form';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  value: string | number | undefined;
  id?: string;
  readOnly?: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  fill?: boolean;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDTextarea(props: OwnProps) {
  const { value, onChange, readOnly = false, id, rows = 2, fill } = props;
  return (
    <TextArea
      id={id}
      style={mgdTextarea}
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
