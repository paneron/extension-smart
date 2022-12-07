import React from 'react';
import {
  EditorEGate,
  EditorSignalEvent,
  EditorTimerEvent,
} from '../../../model/editormodel';
import {
  MMELNote,
  MMELProvision,
  MMELReference,
} from '../../../serialize/interface/supportinterface';
import { EdgeList, ReferenceList } from './ComponentList';
import { DescriptionItem, NonEmptyFieldDescription } from './fields';
import { MMELEdge } from '../../../serialize/interface/flowcontrolinterface';
import MGDLabel from '../../../MGDComponents/MGDLabel';

export const DescribeStart: React.FC = function () {
  return <span> Start event </span>;
};

export const DescribeEnd: React.FC = function (): JSX.Element {
  return <p>End event</p>;
};

export const DescribeEGate: React.FC<{
  egate: EditorEGate;
  getOutgoingEdgesById?: (id: string) => MMELEdge[];
}> = function ({ egate, getOutgoingEdgesById }) {
  const edges =
    getOutgoingEdgesById !== undefined ? getOutgoingEdgesById(egate.id) : [];
  return (
    <>
      <DescriptionItem label="Exclusive Gateway" value={egate.id} />
      <DescriptionItem label="Description" value={egate.label} />
      <EdgeList edges={edges} />
    </>
  );
};

export const DescribeSignalCatch: React.FC<{
  scEvent: EditorSignalEvent;
}> = function ({ scEvent }) {
  return (
    <>
      <DescriptionItem label="Signal Catch Event" value={scEvent.id} />
      <DescriptionItem label="Signal" value={scEvent.signal} />
    </>
  );
};

export const DescribeTimer: React.FC<{
  timer: EditorTimerEvent;
}> = function ({ timer }) {
  return (
    <>
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

export const DescribeNote: React.FC<{
  note: MMELNote;
  getRefById?: (id: string) => MMELReference | null;
}> = function ({ note, getRefById }) {
  const minimal = getRefById === undefined;
  return (
    <>
      {!minimal && <DescriptionItem label="Type" value={note.type} />}
      <DescriptionItem
        label={minimal ? undefined : 'Message'}
        value={minimal ? `${note.type} ${note.message}` : note.message}
      />
      {getRefById !== undefined && (
        <ReferenceList refs={note.ref} getRefById={getRefById} />
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
