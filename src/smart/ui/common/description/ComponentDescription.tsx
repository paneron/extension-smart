/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import MGDButtonGroup from '../../../MGDComponents/MGDButtonGroup';
import {
  EditorApproval,
  EditorDataClass,
  EditorEGate,
  EditorEndEvent,
  EditorRegistry,
  EditorSignalEvent,
  EditorTimerEvent,
  ModelType,
} from '../../../model/editormodel';
import { DataType } from '../../../serialize/interface/baseinterface';
import { MMELDataAttribute } from '../../../serialize/interface/datainterface';
import {
  MMELProvision,
  MMELReference,
  MMELRole,
} from '../../../serialize/interface/supportinterface';
import {
  DeletableNodeTypes,
  EditableNodeTypes,
  EditAction,
} from '../../../utils/constants';
import { NodeCallBack } from '../../../model/FlowContainer';
import { EditButton, RemoveButton } from '../buttons';
import {
  ApprovalRecordList,
  AttributeList,
  ReferenceList,
} from './ComponentList';
import {
  ActorDescription,
  DescriptionItem,
  NonEmptyFieldDescription,
} from './fields';

export const DescribeStart: React.FC = function () {
  return <span> Start event </span>;
};

export const DescribeEnd: React.FC<{
  end: EditorEndEvent & NodeCallBack;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
}> = function ({ end, setDialog }): JSX.Element {
  return (
    <>
      {end.modelType === ModelType.EDIT && (
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

export const DescribeApproval: React.FC<{
  app: EditorApproval & NodeCallBack;
  getRoleById: (id: string) => MMELRole | null;
  getRefById: (id: string) => MMELReference | null;
  getRegistryById: (id: string) => EditorRegistry | null;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
}> = function ({ app, getRoleById, getRefById, getRegistryById, setDialog }) {
  const regs: EditorRegistry[] = [];
  app.records.forEach(r => {
    const ret = getRegistryById(r);
    if (ret !== null) {
      regs.push(ret);
    }
  });
  return (
    <>
      {app.modelType === ModelType.EDIT && (
        <MGDButtonGroup>
          <EditButton
            onClick={() =>
              setDialog(DataType.APPROVAL, EditAction.EDIT, app.id)
            }
          />
          <RemoveButton
            onClick={() =>
              setDialog(DataType.APPROVAL, EditAction.DELETE, app.id)
            }
          />
        </MGDButtonGroup>
      )}
      <DescriptionItem label="Approval" value={app.id} />
      <DescriptionItem label="Name" value={app.name} />
      <ActorDescription role={getRoleById(app.actor)} label="Actor" />
      <ActorDescription role={getRoleById(app.approver)} label="Approver" />
      <NonEmptyFieldDescription label="Modality" value={app.modality} />
      <ApprovalRecordList regs={regs} />
      <ReferenceList refs={app.ref} getRefById={getRefById} />
    </>
  );
};

export const DescribeEGate: React.FC<{
  egate: EditorEGate & NodeCallBack;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
}> = function ({ egate, setDialog }) {
  return (
    <>
      {egate.modelType === ModelType.EDIT && (
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
      <DescriptionItem label="Contents" value={egate.label} />
    </>
  );
};

export const DescribeSignalCatch: React.FC<{
  scEvent: EditorSignalEvent & NodeCallBack;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
}> = function ({ scEvent, setDialog }) {
  return (
    <>
      {scEvent.modelType === ModelType.EDIT && (
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
  timer: EditorTimerEvent & NodeCallBack;
  setDialog: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
}> = function ({ timer, setDialog }) {
  return (
    <>
      {timer.modelType === ModelType.EDIT && (
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
      <NonEmptyFieldDescription label="Type" value={timer.modelType} />
      <NonEmptyFieldDescription label="Parameter" value={timer.para} />
    </>
  );
};

export const DescribeRegistry: React.FC<{
  reg: EditorRegistry;
  getRefById?: (id: string) => MMELReference | null;
  getDataClassById: (id: string) => EditorDataClass | null;
}> = function ({ reg, getRefById, getDataClassById }) {
  const dc = getDataClassById(reg.data);
  return (
    <>
      <DescriptionItem label="Title" value={reg.title} />
      {dc !== null && <DescribeDC dc={dc} getRefById={getRefById} />}
    </>
  );
};

export const DescribeDC: React.FC<{
  dc: EditorDataClass;
  getRefById?: (id: string) => MMELReference | null;
}> = function ({ dc, getRefById }) {
  return (
    <>
      <AttributeList attributes={dc.attributes} getRefById={getRefById} />
    </>
  );
};

export const DescribeAttribute: React.FC<{
  att: MMELDataAttribute;
  getRefById?: (id: string) => MMELReference | null;
}> = function ({ att, getRefById }) {
  const minimal = getRefById === undefined;
  return (
    <>
      <DescriptionItem
        label={minimal ? undefined : 'Attribute ID'}
        value={att.id}
      />
      {!minimal && <NonEmptyFieldDescription label="Type" value={att.type} />}
      {!minimal && (
        <NonEmptyFieldDescription label="Cardinality" value={att.cardinality} />
      )}
      {!minimal && (
        <NonEmptyFieldDescription label="Modality" value={att.modality} />
      )}
      {!minimal && (
        <NonEmptyFieldDescription label="Definition" value={att.definition} />
      )}
      {getRefById !== undefined && (
        <ReferenceList refs={att.ref} getRefById={getRefById} />
      )}
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
