// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { mgd_button_group } from '../../css/MGDButtonGroup';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

interface OwnProps {
  children: JSX.Element[];
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function MGDButtonGroup(props: OwnProps) {
  const { children } = props;
  const base = `mgd-button-group__item`;
  const items = children.map((child: JSX.Element, index: number) => (
    <div key={`${base}--${index}`}>{child}</div>
  ));
  return <fieldset css={mgd_button_group}>{items}</fieldset>;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default MGDButtonGroup;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
