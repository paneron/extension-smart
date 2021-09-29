/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import MGDButtonGroup from '../../../MGDComponents/MGDButtonGroup';
import {
  EditorEGate,
  EditorEndEvent,
  EditorSignalEvent,
  EditorTimerEvent,
} from '../../../model/editormodel';
import { DataType } from '../../../serialize/interface/baseinterface';
import {
  MMELProvision,
  MMELReference,
} from '../../../serialize/interface/supportinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../../utils/constants';
import { EditButton, RemoveButton } from '../buttons';
import { EdgeList, ReferenceList } from './ComponentList';
import { DescriptionItem, NonEmptyFieldDescription } from './fields';
import { MMELEdge } from '../../../serialize/interface/flowcontrolinterface';
import MGDLabel from '../../../MGDComponents/MGDLabel';

export const DescribeStart: React.FC = function () {
  return <span> Start event </span>;
};

export const DescribeEnd: React.FC<{
  end: EditorEndEvent;
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
}> = function ({ end, setDialog }): JSX.Element {
  return (
    <>
      {setDialog !== undefined && (
        <RemoveButton
          onClick={() =>
            setDialog(DataType.ENDEVENT, EditAction.DELETE, end.id)
          }
        />
      )}
      <p>End event</p>
    </>
  );
};

export const DescribeEGate: React.FC<{
  egate: EditorEGate;
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
  getOutgoingEdgesById?: (id: string) => MMELEdge[];
}> = function ({ egate, setDialog, getOutgoingEdgesById }) {
  const edges =
    getOutgoingEdgesById !== undefined ? getOutgoingEdgesById(egate.id) : [];
  return (
    <>
      {setDialog !== undefined && (
        <MGDButtonGroup>
          <EditButton
            onClick={() => setDialog(DataType.EGATE, EditAction.EDIT, egate.id)}
          />
          <RemoveButton
            onClick={() =>
              setDialog(DataType.EGATE, EditAction.DELETE, egate.id)
            }
          />
        </MGDButtonGroup>
      )}
      <DescriptionItem label="Exclusive Gateway" value={egate.id} />
      <DescriptionItem label="Description" value={egate.label} />
      <EdgeList edges={edges} />
    </>
  );
};

export const DescribeSignalCatch: React.FC<{
  scEvent: EditorSignalEvent;
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
}> = function ({ scEvent, setDialog }) {
  return (
    <>
      {setDialog !== undefined && (
        <MGDButtonGroup>
          <EditButton
            onClick={() =>
              setDialog(DataType.SIGNALCATCHEVENT, EditAction.EDIT, scEvent.id)
            }
          />
          <RemoveButton
            onClick={() =>
              setDialog(
                DataType.SIGNALCATCHEVENT,
                EditAction.DELETE,
                scEvent.id
              )
            }
          />
        </MGDButtonGroup>
      )}
      <DescriptionItem label="Signal Catch Event" value={scEvent.id} />
      <DescriptionItem label="Signal" value={scEvent.signal} />
    </>
  );
};

export const DescribeTimer: React.FC<{
  timer: EditorTimerEvent;
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
}> = function ({ timer, setDialog }) {
  return (
    <>
      {setDialog !== undefined && (
        <MGDButtonGroup>
          <EditButton
            onClick={() =>
              setDialog(DataType.TIMEREVENT, EditAction.EDIT, timer.id)
            }
          />
          <RemoveButton
            onClick={() =>
              setDialog(DataType.TIMEREVENT, EditAction.DELETE, timer.id)
            }
          />
        </MGDButtonGroup>
      )}
      <DescriptionItem label="Timer Event" value={timer.id} />
      <NonEmptyFieldDescription label="Type" value={timer.type} />
      <NonEmptyFieldDescription label="Parameter" value={timer.para} />
    </>
  );
};

export const DescribeProvision: React.FC<{
  provision: MMELProvision;
  getRefById?: (id: string) => MMELReference | null;
}> = function ({ provision, getRefById }) {
  const minimal = getRefById === undefined;
  return (
    <>
      <DescriptionItem
        label={minimal ? undefined : 'Statement'}
        value={provision.condition}
      />
      {!minimal && (
        <NonEmptyFieldDescription label="Modality" value={provision.modality} />
      )}
      {getRefById !== undefined && (
        <ReferenceList refs={provision.ref} getRefById={getRefById} />
      )}
    </>
  );
};

export const DescribeEdge: React.FC<{
  edge: MMELEdge;
}> = function ({ edge }) {
  return (
    <>
      <MGDLabel>To {edge.to}</MGDLabel>
      {edge.description !== '' && (
        <DescriptionItem label="Condition" value={edge.description} />
      )}
    </>
  );
};
