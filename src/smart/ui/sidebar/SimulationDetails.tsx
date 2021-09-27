/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import { EditorModel, EditorSubprocess} from '../../model/editormodel';
import React from 'react';

const SimulationDetails: React.FC<{
  location: string;
  model: EditorModel;
  page: EditorSubprocess;
}> = function ({ location, model, page }) {
  const elm = model.elements[location];
  const edges = Object.values(page.edges).filter(e => e.from === location);

  return (
    <fieldset>
      <legend>{ elm.id }</legend>
      { edges.map(() => '')}
    </fieldset>
  );
};

export default SimulationDetails;