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
  EdgeList,
  ReferenceList,
} from './ComponentList';
import {
  ActorDescription,
  DescriptionItem,
  NonEmptyFieldDescription,
} from './fields';
import { MMELEdge } from '../../../serialize/interface/flowcontrolinterface';
import MGDLabel from '../../../MGDComponents/MGDLabel';

export const DescribeStart: React.FC = function () {
  return <span> Start event </span>;
};

export const DescribeEnd: React.FC<{
  end: EditorEndEvent & NodeCallBack;
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

export const DescribeApproval: React.FC<{
  app: EditorApproval & NodeCallBack;
  getRoleById: (id: string) => MMELRole | null;
  getRefById: (id: string) => MMELReference | null;
  getRegistryById: (id: string) => EditorRegistry | null;
  setDialog?: (
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
      {setDialog !== undefined && (
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
  setDialog?: (
    nodeType: EditableNodeTypes | DeletableNodeTypes,
    action: EditAction,
    id: string
  ) => void;
  getOutgoingEdgesById: (id: string) => MMELEdge[];
}> = function ({ egate, setDialog, getOutgoingEdgesById }) {
  const edges = getOutgoingEdgesById(egate.id);
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
  scEvent: EditorSignalEvent & NodeCallBack;
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
  timer: EditorTimerEvent & NodeCallBack;
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
      <NonEmptyFieldDescription label="Type" value={timer.modelType} />
      <NonEmptyFieldDescription label="Parameter" value={timer.para} />
    </>
  );
};

export const DescribeRegistry: React.FC<{
  reg: EditorRegistry;
  getRefById?: (id: string) => MMELReference | null;
  getDataClassById: (id: string) => EditorDataClass | null;
  CustomAttribute?: React.FC<{
    att: MMELDataAttribute;
    getRefById?: (id: string) => MMELReference | null;
    dcid: string;
  }>;
}> = function ({ reg, getRefById, getDataClassById, CustomAttribute }) {
  const dc = getDataClassById(reg.data);
  return (
    <>
      <DescriptionItem label="ID" value={reg.id} />
      <DescriptionItem label="Title" value={reg.title} />
      {dc !== null && (
        <DescribeDC
          dc={dc}
          getRefById={getRefById}
          CustomAttribute={CustomAttribute}
        />
      )}
    </>
  );
};

export const DescribeDC: React.FC<{
  dc: EditorDataClass;
  getRefById?: (id: string) => MMELReference | null;
  CustomAttribute?: React.FC<{
    att: MMELDataAttribute;
    getRefById?: (id: string) => MMELReference | null;
    dcid: string;
  }>;
}> = function ({ dc, getRefById, CustomAttribute }) {
  return (
    <>
      <AttributeList
        attributes={dc.attributes}
        getRefById={getRefById}
        CustomAttribute={CustomAttribute}
        dcid={dc.id}
      />
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
