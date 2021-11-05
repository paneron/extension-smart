import React from 'react';
import { mgdButtonGroup } from '../../css/MGDButtonGroup';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: (JSX.Element | null)[];
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDButtonGroup(props: OwnProps) {
  const { children } = props;
  const base = `mgd-button-group__item`;
  const items = children
    .filter(x => x !== null)
    .map((child: JSX.Element | null, index: number) => (
      <div key={`${base}--${index}`}>{child}</div>
    ));
  return <fieldset style={mgdButtonGroup}>{items}</fieldset>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDButtonGroup;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
