/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import MGDSidebar from '../../MGDComponents/MGDSidebar';
import { EditorModel, EditorNode } from '../../model/editormodel';
import { ViewFunctionInterface } from '../../model/ViewFunctionModel';
import { FlowElement, isNode, useStoreState } from 'react-flow-renderer';
import { Button, Text } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import React from 'react';
import SimulationDetails from './SimulationDetails';

const SimulationPane: React.FC<{
  model: EditorModel;
  setView: (view: ViewFunctionInterface | undefined) => void;
  page: string;
}> = function ({ model, setView, page }) {
  const [location, setLocation] = useState<string|undefined>(undefined);

  const selected = useStoreState(store => store.selectedElements);

  const elm = selected !== null && selected.length > 0 ? getSelected(selected[0], model) : undefined;          
  
  function start(id: string) {
    setLocation(id);
    // setView();
  }  

  function clean() {
    setLocation(undefined);
    setView(undefined);
  }

  useEffect(() => clean, [model]);

  return (
    <MGDSidebar>
      {location !== undefined
        ? (
          <>
            <SimulationDetails location={location} model={model} page={model.pages[page]}/>
            <Button onClick={clean} fill intent='primary'> Stop </Button>
          </>
        )
        : elm !== undefined
          ? <Button onClick={()=>start(elm.id)} fill intent='primary'> Stop </Button>
          : <Text> Select a node to start simulation </Text>
      }    
    </MGDSidebar>
  );
};

function getSelected(selected: FlowElement, model: EditorModel): EditorNode | undefined {
  const elm = model.elements[selected.id];
  if (isNode(selected) && elm !== undefined) {
    return elm;
  }
  return undefined;
}

export default SimulationPane;