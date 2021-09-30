/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { MMELEdge } from '../../../serialize/interface/flowcontrolinterface';
import { NormalTextField } from '../../common/fields';

const EdgeQuickEdit: React.FC<{
  edge: MMELEdge;
  index: number;
  setEdge: (x: number, edge: MMELEdge) => void;
}> = function ({ edge, index, setEdge }) {
  return (
    <fieldset>
      <legend>Edge to {edge.to}</legend>
      <NormalTextField
        text="Description"
        value={edge.description}
        onChange={x => setEdge(index, { ...edge, description: x })}
      />
    </fieldset>
  );
};

export default EdgeQuickEdit;
