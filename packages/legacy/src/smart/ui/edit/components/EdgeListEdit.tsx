import React from 'react';
import { MMELEdge } from '@paneron/libmmel/interface/flowcontrolinterface';
import { NormalTextField } from '@/smart/ui/common/fields';

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
        onChange={x => setEdge(index, { ...edge, description : x })}
      />
    </fieldset>
  );
};

export default EdgeQuickEdit;
