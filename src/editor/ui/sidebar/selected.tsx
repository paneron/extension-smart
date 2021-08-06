import React, { CSSProperties, useState } from 'react';
import { useStoreState, Elements, isNode } from 'react-flow-renderer';
import { DataType } from '../../serialize/interface/baseinterface';
import { MMELDataAttribute } from '../../serialize/interface/datainterface';
import {
  MMELReference,
  MMELRole,
} from '../../serialize/interface/supportinterface';
import { EdtiorNodeWithInfoCallback } from '../flowui/container';
import {
  EditorApproval,
  EditorDataClass,
  EditorEGate,
  EditorEndEvent,
  EditorRegistry,
  EditorSignalEvent,
  EditorTimerEvent,
  isEditorAppproval,
  isEditorDataClass,
  isEditorEgate,
  isEditorProcess,
  isEditorRegistry,
  isEditorSignalEvent,
  isEditorTimerEvent,
} from '../../model/editormodel';
import { ProcessQuickEdit } from './processquickedit';
import { toRefSummary } from '../../utils/commonfunctions';
import { SelectableNodeTypes } from '../../utils/constants';
import { Button } from '@blueprintjs/core';

export const SelectedNodeDescription: React.FC = () => {
  const selected = useStoreState(store => store.selectedElements);
  const [oldValue, setOldValue] = useState<EdtiorNodeWithInfoCallback | null>(
    null
  );
  const elm: EdtiorNodeWithInfoCallback | null = getSelectedElement(selected);

  function getSelectedElement(
    selected: Elements<any> | null
  ): EdtiorNodeWithInfoCallback | null {
    if (oldValue !== null) {
      return oldValue;
    }
    if (selected !== null && selected.length > 0) {
      const s = selected[0];
      if (isNode(s)) {
        return s.data as EdtiorNodeWithInfoCallback;
      }
    }
    return null;
  }

  return (
    <>
      {elm !== null ? (
        <Describe node={elm} setOldValue={setOldValue} />
      ) : (
        'Nothing is selected'
      )}
    </>
  );
};

const NODE_DETAIL_VIEWS: Record<
  SelectableNodeTypes,
  React.FC<{
    node: EdtiorNodeWithInfoCallback;
    setOldValue: (x: EdtiorNodeWithInfoCallback | null) => void;
  }>
> = {
  [DataType.DATACLASS]: ({ node }) =>
    isEditorDataClass(node) ? <DescribeDC dc={node as EditorDataClass} {...node} /> : <></>,
  [DataType.REGISTRY]: ({ node }) =>
    isEditorRegistry(node) ? <DescribeRegistry reg={node} {...node} /> : <></>,
  [DataType.STARTEVENT]: () => <DescribeStart />,
  [DataType.ENDEVENT]: ({ node }) => (
    <DescribeEnd end={node as EditorEndEvent} />
  ),
  [DataType.TIMEREVENT]: ({ node }) =>
    isEditorTimerEvent(node) ? <DescribeTimer timer={node} /> : <></>,
  [DataType.SIGNALCATCHEVENT]: ({ node }) =>
    isEditorSignalEvent(node) ? <DescribeSignalCatch scEvent={node} /> : <></>,
  [DataType.EGATE]: ({ node }) =>
    isEditorEgate(node) ? <DescribeEGate egate={node} /> : <></>,
  [DataType.APPROVAL]: ({ node }) =>
    isEditorAppproval(node) ? <DescribeApproval app={node} {...node} /> : <></>,
  [DataType.PROCESS]: ({ node, setOldValue }) =>
    isEditorProcess(node) ? (
      <ProcessQuickEdit process={node} setOldValue={setOldValue} {...node} />
    ) : (
      <></>
    )
};

export const Describe: React.FC<{
  node: EdtiorNodeWithInfoCallback;
  setOldValue: (x: EdtiorNodeWithInfoCallback | null) => void;
}> = function ({ node, setOldValue }) {  
  const View = NODE_DETAIL_VIEWS[node.datatype as SelectableNodeTypes];
  return <View node={node} setOldValue={setOldValue} />;
};

export const RemoveButton: React.FC<{
  cid: string;
  callback: () => void;
}> = function ({ cid, callback }) {
  return (
    <Button    
      key={'ui#button#removeButton#' + cid}
      icon='delete'
      intent='danger'
      text='Remove'
      onClick={() => callback()}
    />
  );
};

export const EditButton: React.FC<{
  cid: string;
  callback: () => void;
}> = function ({ cid, callback }) {
  return (
    <Button
      key={'ui#button#editComponent#' + cid}
      icon='edit'
      text='Edit'
      onClick={() => callback()}
    />
  );
};

const ApprovalRecordList: React.FC<{
  regs: EditorRegistry[];
  pid: string;
}> = function ({ regs, pid }) {
  return (
    <>
      {regs.length > 0 ? (
        <>
          <p key={pid + '#approvalRecordLabel'}>Appproval record(s):</p>
          <ul key={pid + '#approvalList'}>
            {regs.map(reg => (
              <li key={pid + '#approvalRecord#' + reg.id}> {reg.title} </li>
            ))}
          </ul>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export const ReferenceList: React.FC<{
  refs: Set<string>;
  pid: string;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ refs, pid, getRefById }) {
  const ref: MMELReference[] = [];
  refs.forEach(r => {
    const ret = getRefById(r);
    if (ret !== null) {
      ref.push(ret);
    }
  });
  return (
    <>
      {refs.size > 0 ? (
        <>
          <p key={pid + '#referenceLabel'}>Reference:</p>
          <ul key={pid + '#referenceList'}>
            {ref.map(r => (
              <li key={r.id}> {toRefSummary(r)} </li>
            ))}
          </ul>
        </>
      ) : (
        ''
      )}
    </>
  );
};

const AttributeList: React.FC<{
  attributes: Record<string, MMELDataAttribute>;
  dcid: string;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ attributes, dcid, getRefById }) {
  return (
    <>
      {Object.keys(attributes).length > 0 ? (
        <>
          <p key={dcid + '#attributesLabel'}> Attributes: </p>
          <ul key={dcid + '#attributeList'}>
            {Object.entries(attributes).map(([v, att]) => (
              <li key={v}>
                {' '}
                <DescribeAttribute att={att} getRefById={getRefById} />{' '}
              </li>
            ))}
          </ul>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export const DescriptionItem: React.FC<{
  id: string;
  label: string;
  value: string;
  css?: CSSProperties;
}> = function ({ id, label, value, css }): JSX.Element {
  return (
    <p key={id}>
      {' '}
      {label}:{css !== undefined ? <span style={css}> {value}</span> : value}{' '}
    </p>
  );
};

export const ActorDescription: React.FC<{
  role: MMELRole | null;
  id: string;
  label: string;
}> = function ({ role, id, label }): JSX.Element {
  return (
    <>
      {' '}
      {role !== null ? (
        <DescriptionItem id={id} label={label} value={role.name} />
      ) : (
        <></>
      )}{' '}
    </>
  );
};

export const NonEmptyFieldDescription: React.FC<{
  id: string;
  label: string;
  value: string;
  css?: CSSProperties;
}> = function ({ id, label, value, css }): JSX.Element {
  return (
    <>
      {' '}
      {value !== '' ? (
        <DescriptionItem id={id} label={label} value={value} css={css} />
      ) : (
        ''
      )}{' '}
    </>
  );
};

const DescribeStart: React.FC = function () {
  return <span key="ui#startlabel"> Start event </span>;
};

const DescribeEnd: React.FC<{ end: EditorEndEvent }> = function ({
  end,
}): JSX.Element {
  return (
    <>
      <RemoveButton cid={end.id} callback={() => Cleaner.removeEvent(end)} />
      <p key={'ui#endlabel#' + end.id}> End event </p>
    </>
  );
};

const DescribeApproval: React.FC<{
  app: EditorApproval;
  getRoleById: (id: string) => MMELRole | null;
  getRefById: (id: string) => MMELReference | null;
  getRegistryById: (id: string) => EditorRegistry | null;
}> = function ({ app, getRoleById, getRefById, getRegistryById }) {
  const regs: EditorRegistry[] = [];
  app.records.forEach(r => {
    const ret = getRegistryById(r);
    if (ret !== null) {
      regs.push(ret);
    }
  });
  return (
    <>
      <EditButton
        cid={app.id}
        callback={() => functionCollection.viewEditApproval(app)}
      />
      <RemoveButton cid={app.id} callback={() => Cleaner.removeApproval(app)} />
      <DescriptionItem
        id={app.id + '#approvalLabel'}
        label="Approval"
        value={app.id}
      />
      <DescriptionItem
        id={app.id + '#nameLabel'}
        label="Name"
        value={app.name}
      />
      <ActorDescription
        role={getRoleById(app.actor)}
        id={app.id + '#actorLabel'}
        label="Actor"
      />
      <ActorDescription
        role={getRoleById(app.approver)}
        id={app.id + '#approverLabel'}
        label="Approver"
      />
      <NonEmptyFieldDescription
        id={app.id + '#modalityLabel'}
        label="Modality"
        value={app.modality}
      />
      <ApprovalRecordList regs={regs} pid={app.id} />
      <ReferenceList refs={app.ref} pid={app.id} getRefById={getRefById} />
    </>
  );
};

const DescribeEGate: React.FC<{ egate: EditorEGate }> = function ({ egate }) {
  return (
    <>
      <EditButton
        cid={egate.id}
        callback={() => functionCollection.viewEGate(egate)}
      />
      <RemoveButton cid={egate.id} callback={() => Cleaner.removeGate(egate)} />
      <DescriptionItem
        id={egate.id + '#egate'}
        label="Exclusive Gateway"
        value={egate.id}
      />
      <DescriptionItem
        id={egate.id + '#egateLabel'}
        label="Contents"
        value={egate.label}
      />
    </>
  );
};

const DescribeSignalCatch: React.FC<{
  scEvent: EditorSignalEvent;
}> = function ({ scEvent }) {
  return (
    <>
      <EditButton
        cid={scEvent.id}
        callback={() => functionCollection.viewSignalCatch(scEvent)}
      />
      <RemoveButton
        cid={scEvent.id}
        callback={() => Cleaner.removeEvent(scEvent)}
      />
      <DescriptionItem
        id={scEvent.id + '#signalCatchLabel'}
        label="Signal Catch Event"
        value={scEvent.id}
      />
      <DescriptionItem
        id={scEvent.id + '#signalLabel'}
        label="Signal"
        value={scEvent.signal}
      />
    </>
  );
};

const DescribeTimer: React.FC<{
  timer: EditorTimerEvent;
}> = function ({ timer }) {
  return (
    <>
      <EditButton
        cid={timer.id}
        callback={() => functionCollection.viewTimer(timer)}
      />
      <RemoveButton
        cid={timer.id}
        callback={() => Cleaner.removeEvent(timer)}
      />
      <DescriptionItem
        id={timer.id + '#timerLabel'}
        label="Timer Event"
        value={timer.id}
      />
      <NonEmptyFieldDescription
        id={timer.id + '#timerTypeLabel'}
        label="Type"
        value={timer.type}
      />
      <NonEmptyFieldDescription
        id={timer.id + '#timerParaLabel'}
        label="Parameter"
        value={timer.para}
      />
    </>
  );
};

const DescribeRegistry: React.FC<{
  reg: EditorRegistry;
  getRefById: (id: string) => MMELReference | null;
  getDataClassById: (id: string) => EditorDataClass | null;
}> = function ({ reg, getRefById, getDataClassById }) {
  const dc = getDataClassById(reg.data);
  return (
    <>
      <DescriptionItem
        id={reg.id + '#registryLabel'}
        label="Title"
        value={reg.title}
      />
      {dc !== null && <DescribeDC dc={dc} getRefById={getRefById} />}
    </>
  );
};

const DescribeDC: React.FC<{
  dc: EditorDataClass;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ dc, getRefById }) {
  return (
    <>
      <AttributeList
        attributes={dc.attributes}
        dcid={dc.id}
        getRefById={getRefById}
      />
    </>
  );
};

const DescribeAttribute: React.FC<{
  att: MMELDataAttribute;
  getRefById: (id: string) => MMELReference | null;
}> = function ({ att, getRefById }) {
  const css: CSSProperties = {};
  if (att.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  return (
    <>
      <DescriptionItem
        css={css}
        id={att.id + '#attributeIDLabel'}
        label="Attribute ID"
        value={att.id}
      />
      <NonEmptyFieldDescription
        css={css}
        id={att.id + '#attributeTypeLabel'}
        label="Type"
        value={att.type}
      />
      <NonEmptyFieldDescription
        css={css}
        id={att.id + '#attributeCardinalityLabel'}
        label="Cardinality"
        value={att.cardinality}
      />
      <NonEmptyFieldDescription
        css={css}
        id={att.id + '#attributeModalityLabel'}
        label="Modality"
        value={att.modality}
      />
      <NonEmptyFieldDescription
        css={css}
        id={att.id + '#attributeDefinitionLabel'}
        label="Definition"
        value={att.definition}
      />
      <ReferenceList refs={att.ref} pid={att.id} getRefById={getRefById} />
    </>
  );
};

class Cleaner {
  static removeGate = (x: any) => {};
  static removeEvent = (x: any) => {};
  static removeApproval = (x: any) => {};
}

class functionCollection {
  static viewEditApproval = (x: any) => {};
  static viewEGate = (x: any) => {};
  static viewSignalCatch = (x: any) => {};
  static viewTimer = (x: any) => {};
}
