import MGDSidebar from '@/smart/MGDComponents/MGDSidebar';
import type { EditorModel, EditorNode } from '@/smart/model/editormodel';
import type { ViewFunctionInterface } from '@/smart/model/ViewFunctionModel';
import type { FlowElement } from 'react-flow-renderer';
import { isNode, useStoreState } from 'react-flow-renderer';
import { Button, Text } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import React from 'react';
import SimulationDetails from '@/smart/ui/sidebar/SimulationDetails';
import { getSimulationView } from '@/smart/utils/simulation/viewFunctions';
import type { PageHistory } from '@/smart/model/history';

const SimulationPane: React.FC<{
  model: EditorModel;
  setView: (view: ViewFunctionInterface | undefined) => void;
  page: string;
  history: PageHistory;
  drillUp: () => void;
  goToPage: (pageid: string, id: string) => void;
}> = function ({ model, setView, page, history, drillUp, goToPage }) {
  const [location, setLocation] = useState<string | undefined>(undefined);

  const selected = useStoreState(store => store.selectedElements);

  const elm =
    selected !== null && selected.length > 0
      ? getSelected(selected[0], model)
      : undefined;

  function onMove(id: string, pageid: string = page) {
    setLocation(id);
    setView(getSimulationView({ spageid : pageid, sid : id }));
  }

  function clean() {
    setLocation(undefined);
    setView(undefined);
  }

  useEffect(() => clean, [model]);

  return (
    <MGDSidebar>
      {location !== undefined ? (
        <>
          <SimulationDetails
            location={location}
            model={model}
            page={model.pages[page]}
            onMove={onMove}
            history={history}
            drillUp={drillUp}
            goToPage={goToPage}
          />
          <Button
            style={{ paddingTop : '10px' }}
            onClick={clean}
            fill
            intent="primary"
          >
            Stop
          </Button>
        </>
      ) : elm !== undefined ? (
        <Button onClick={() => onMove(elm.id)} fill intent="primary">
          Start simulation
        </Button>
      ) : (
        <Text> Select a node to start simulation </Text>
      )}
    </MGDSidebar>
  );
};

function getSelected(
  selected: FlowElement,
  model: EditorModel
): EditorNode | undefined {
  const elm = model.elements[selected.id];
  if (isNode(selected) && elm !== undefined) {
    return elm;
  }
  return undefined;
}

export default SimulationPane;
