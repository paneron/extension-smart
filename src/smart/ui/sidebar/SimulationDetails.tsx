import {
  EditorModel,
  EditorNode,
  EditorSubprocess,
  isEditorApproval,
  isEditorEgate,
  isEditorProcess,
  isEditorSignalEvent,
  isEditorTimerEvent,
} from '../../model/editormodel';
import React from 'react';
import { MMELEdge } from '../../serialize/interface/flowcontrolinterface';
import { Button, Text } from '@blueprintjs/core';
import { MainFlowNodeTypes } from '../../utils/constants';
import { DataType } from '../../serialize/interface/baseinterface';
import {
  MMELNote,
  MMELProvision,
  MMELRole,
} from '../../serialize/interface/supportinterface';
import {
  DescribeEGate,
  DescribeEnd,
  DescribeSignalCatch,
  DescribeStart,
  DescribeTimer,
} from '../common/description/ComponentDescription';
import { DescribeProcess } from '../common/description/process';
import { PageHistory } from '../../model/history';
import { DescribeApproval } from '../common/description/approval';

const SimulationDetails: React.FC<{
  location: string;
  model: EditorModel;
  page: EditorSubprocess;
  history: PageHistory;
  onMove: (id: string, pageid?: string) => void;
  drillUp: () => void;
  goToPage: (pageid: string, id: string) => void;
}> = function ({ location, model, page, history, onMove, drillUp, goToPage }) {
  const elm = model.elements[location];
  const edges = Object.values(page.edges).filter(e => e.from === location);
  const Summary =
    elm !== undefined
      ? NODE_SIMULATION_SUMMARY[elm.datatype as MainFlowNodeTypes]
      : undefined;

  function getProvisionById(id: string): MMELProvision | null {
    return model.provisions[id] ?? null;
  }

  function getNoteById(id: string): MMELNote | null {
    return model.notes[id] ?? null;
  }

  function getRoleById(id: string): MMELRole | null {
    return model.roles[id] ?? null;
  }

  function goSubProcess(pageid: string) {
    const page = model.pages[pageid];
    goToPage(pageid, elm.id);
    onMove(page.start, pageid);
  }

  function goUp() {
    const hitems = history.items;
    const last = hitems[hitems.length - 1];
    const secondlast = hitems[hitems.length - 2];
    drillUp();
    onMove(last.pathtext, secondlast.page);
  }

  const goDownButton =
    isEditorProcess(elm) && elm.page !== '' ? (
      <Button onClick={() => goSubProcess(elm.page)} fill>
        Go into subprocess
      </Button>
    ) : undefined;

  return (
    <>
      {Summary !== undefined && (
        <Summary
          node={elm}
          getProvisionById={getProvisionById}
          getRoleById={getRoleById}
          getNoteById={getNoteById}
        />
      )}
      <fieldset>
        <legend>Next step</legend>
        {goDownButton}
        {edges.length > 1 ? (
          <ul style={{ paddingLeft : 10 }}>
            {edges.map(edge => (
              <PathOption
                key={edge.id}
                edge={edge}
                model={model}
                onMove={onMove}
              />
            ))}
          </ul>
        ) : edges.length === 1 ? (
          <Button fill onClick={() => onMove(edges[0].to)}>
            Next
          </Button>
        ) : history.items.length > 1 ? (
          <>
            <Text>End of subprocess</Text>
            <Button onClick={() => goUp()} fill>
              Drill up one level
            </Button>
          </>
        ) : (
          <Text>The end</Text>
        )}
      </fieldset>
    </>
  );
};

const PathOption: React.FC<{
  edge: MMELEdge;
  model: EditorModel;
  onMove: (id: string) => void;
}> = function ({ edge, model, onMove }) {
  const { to, description } = edge;
  const elm = model.elements[to];
  const condition = description !== '' ? <p> Condition: {description} </p> : '';
  return elm !== undefined ? (
    <li>
      <p>{getName(elm)}</p>
      {condition}{' '}
      <Button fill onClick={() => onMove(to)}>
        Select this path
      </Button>
    </li>
  ) : (
    <></>
  );
};

function getName(node: EditorNode): string {
  if (isEditorProcess(node) || isEditorApproval(node)) {
    return node.name;
  }
  return node.id;
}

interface SimulationProps {
    node: EditorNode;
    getProvisionById: (id: string) => MMELProvision | null;
    getRoleById: (id: string) => MMELRole | null;
    getNoteById: (id: string) => MMELNote | null;
}

const NODE_SIMULATION_SUMMARY: Record<
  MainFlowNodeTypes,
  React.FC<SimulationProps>
> = {
  [DataType.STARTEVENT] : () => <DescribeStart />,
  [DataType.ENDEVENT]   : () => <DescribeEnd />,
  [DataType.TIMEREVENT] : ({ node }: SimulationProps) =>
    isEditorTimerEvent(node) ? <DescribeTimer timer={node} /> : <></>,
  [DataType.SIGNALCATCHEVENT] : ({ node }: SimulationProps) =>
    isEditorSignalEvent(node) ? <DescribeSignalCatch scEvent={node} /> : <></>,
  [DataType.EGATE] : ({ node }: SimulationProps) =>
    isEditorEgate(node) ? <DescribeEGate egate={node} /> : <></>,
  [DataType.APPROVAL] : ({ node, getRoleById }: SimulationProps) =>
    isEditorApproval(node) ? (
      <DescribeApproval app={node} getRoleById={getRoleById} />
    ) : (
      <></>
    ),
  [DataType.PROCESS] : ({ node, getProvisionById, getRoleById, getNoteById }: SimulationProps) =>
    isEditorProcess(node) ? (
      <DescribeProcess
        process={node}
        getProvisionById={getProvisionById}
        getRoleById={getRoleById}
        getNoteById={getNoteById}
      />
    ) : (
      <></>
    ),
};

export default SimulationDetails;
