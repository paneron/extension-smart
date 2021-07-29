/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { CSSProperties } from 'react';
import { toSummary } from '../../runtime/functions';
import { DataType, MMELNode } from '../../serialize/interface/baseinterface';
import {
  MMELDataAttribute,
  MMELDataClass,
  MMELRegistry,
} from '../../serialize/interface/datainterface';
import {
  MMELEndEvent,
  MMELSignalCatchEvent,
  MMELStartEvent,
  MMELTimerEvent,
} from '../../serialize/interface/eventinterface';
import { MMELEGate } from '../../serialize/interface/flowcontrolinterface';
import {
  MMELApproval,
  MMELProcess,
} from '../../serialize/interface/processinterface';
import {
  MMELReference,
  MMELRole,
} from '../../serialize/interface/supportinterface';
import { ProcessQuickEdit } from '../component/edit/processquickedit';
import { Cleaner } from './cleaner';
import { functionCollection } from './function';
import { ProgressManager } from './progressmanager';
import { Simulator } from './simulator';

const NODE_DETAIL_VIEWS: Record<
  DataType,
  React.FC<{
    node: MMELNode;
    isCheckListMode: boolean;
    setOldValue: (x: MMELNode | null) => void;
  }>
> = {
  [DataType.DATACLASS]: ({ node, isCheckListMode }) => (
    <DescribeDC dc={node as MMELDataClass} isCheckListMode={isCheckListMode} />
  ),
  [DataType.REGISTRY]: ({ node, isCheckListMode }) => (
    <DescribeRegistry
      reg={node as MMELRegistry}
      isCheckListMode={isCheckListMode}
    />
  ),
  [DataType.STARTEVENT]: ({ node, isCheckListMode }) => (
    <DescribeStart
      start={node as MMELStartEvent}
      isCheckListMode={isCheckListMode}
    />
  ),
  [DataType.ENDEVENT]: ({ node, isCheckListMode }) => (
    <DescribeEnd end={node as MMELEndEvent} isCheckListMode={isCheckListMode} />
  ),
  [DataType.TIMEREVENT]: ({ node, isCheckListMode }) => (
    <DescribeTimer
      timer={node as MMELTimerEvent}
      isCheckListMode={isCheckListMode}
    />
  ),
  [DataType.SIGNALCATCHEVENT]: ({ node, isCheckListMode }) => (
    <DescribeSignalCatch
      scEvent={node as MMELSignalCatchEvent}
      isCheckListMode={isCheckListMode}
    />
  ),
  [DataType.EGATE]: ({ node, isCheckListMode }) => (
    <DescribeEGate
      egate={node as MMELEGate}
      isCheckListMode={isCheckListMode}
    />
  ),
  [DataType.APPROVAL]: ({ node, isCheckListMode }) => (
    <DescribeApproval
      app={node as MMELApproval}
      isCheckListMode={isCheckListMode}
    />
  ),
  [DataType.PROCESS]: ({ node, isCheckListMode, setOldValue }) => (
    <ProcessQuickEdit
      process={node as MMELProcess}
      isCLMode={isCheckListMode}
      setOldValue={setOldValue}
    />
  ),
  [DataType.DATAATTRIBUTE]: () => <></>,
  [DataType.EDGE]: () => <></>,
  [DataType.ENUM]: () => <></>,
  [DataType.ENUMVALUE]: () => <></>,
  [DataType.SUBPROCESS]: () => <></>,
  [DataType.SUBPROCESSCOMPONENT]: () => <></>,
  [DataType.ROLE]: () => <></>,
  [DataType.REFERENCE]: () => <></>,
  [DataType.PROVISION]: () => <></>,
  [DataType.VARIABLE]: () => <></>,
  [DataType.METADATA]: () => <></>,
};

export const Describe: React.FC<{
  node: MMELNode;
  isCheckListMode: boolean;
  setOldValue: (x: MMELNode | null) => void;
}> = function ({ node, isCheckListMode, setOldValue }) {
  const View = NODE_DETAIL_VIEWS[node.datatype];
  return (
    <View
      node={node}
      isCheckListMode={isCheckListMode}
      setOldValue={setOldValue}
    />
  );
};

const DescriptorButton: React.FC<{
  id: string;
  label: string;
  callback: () => void;
}> = function ({ id, label, callback }) {
  return (
    <button key={id} onClick={() => callback()}>
      {' '}
      {label}{' '}
    </button>
  );
};

const SimulationButton: React.FC<{
  cid: String;
}> = function ({ cid }) {
  return (
    <DescriptorButton
      id={'ui#button#startSimulation' + cid}
      callback={() => Simulator.startSimulation()}
      label="Simulation"
    />
  );
};

const RemoveButton: React.FC<{
  cid: string;
  callback: () => void;
}> = function ({ cid, callback }) {
  return (
    <DescriptorButton
      id={'ui#button#removeButton#' + cid}
      callback={callback}
      label="Remove"
    />
  );
};

const EditButton: React.FC<{
  cid: string;
  callback: () => void;
}> = function ({ cid, callback }) {
  return (
    <DescriptorButton
      id={'ui#button#editComponent#' + cid}
      callback={callback}
      label="Edit"
    />
  );
};

const DataRepoButton: React.FC<{
  cid: string;
  callback: () => void;
}> = function ({ cid, callback }) {
  return (
    <DescriptorButton
      id={'ui#button#datarepo#' + cid}
      callback={callback}
      label="Data repository"
    />
  );
};

const ApprovalRecordList: React.FC<{
  regs: MMELRegistry[];
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

const SatisfyList: React.FC<{
  sats: string[];
  aid: string;
}> = function ({ sats, aid }) {
  return (
    <>
      {sats.length > 0 ? (
        <>
          <p key={aid + '#satisfyListLabel'}>Satisfy:</p>
          <ul key={aid + '#satisfyList'}>
            {sats.map(a => (
              <li key={a}> {a} </li>
            ))}
          </ul>
        </>
      ) : (
        ''
      )}
    </>
  );
};

const ReferenceList: React.FC<{
  refs: MMELReference[];
  pid: string;
}> = function ({ refs, pid }) {
  return (
    <>
      {refs.length > 0 ? (
        <>
          <p key={pid + '#referenceLabel'}>Reference:</p>
          <ul key={pid + '#referenceList'}>
            {refs.map(ref => (
              <li key={ref.id}> {toSummary(ref)} </li>
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
  attributes: MMELDataAttribute[];
  dcid: string;
  isCheckListMode: boolean;
}> = function ({ attributes, dcid, isCheckListMode }) {
  return (
    <>
      {attributes.length > 0 ? (
        <>
          <p key={dcid + '#attributesLabel'}> Attributes: </p>
          <ul key={dcid + '#attributeList'}>
            {attributes.map(a => (
              <li key={a.id}>
                {' '}
                <DescribeAttribute
                  att={a}
                  isCheckListMode={isCheckListMode}
                />{' '}
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

const DescriptionItem: React.FC<{
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

const ActorDescription: React.FC<{
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

const NonEmptyFieldDescription: React.FC<{
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

const CheckBoxProgressField: React.FC<{
  fieldkey: string;
  checkboxkey: string;
  value: boolean;
  css: CSSProperties;
  label: string;
  statement: string;
  callback: () => void;
}> = function ({
  fieldkey,
  checkboxkey,
  value,
  css,
  label,
  statement,
  callback,
}): JSX.Element {
  return (
    <p key={fieldkey}>
      {' '}
      <input
        type="checkbox"
        key={checkboxkey}
        checked={value}
        onChange={callback}
      />
      {label}: <span style={css}> {statement}</span>
    </p>
  );
};

const DescribeStart: React.FC<{
  start: MMELStartEvent;
  isCheckListMode: boolean;
}> = function ({ start, isCheckListMode }) {
  return (
    <>
      <span key="ui#startlabel"> Start event </span>
      {!isCheckListMode && <SimulationButton cid={start.id} />}
    </>
  );
};

const DescribeEnd: React.FC<{ end: MMELEndEvent; isCheckListMode: boolean }> =
  function ({ end, isCheckListMode }): JSX.Element {
    return (
      <>
        {!isCheckListMode && (
          <RemoveButton
            cid={end.id}
            callback={() => Cleaner.removeEvent(end)}
          />
        )}
        <p key={'ui#endlabel#' + end.id}> End event </p>
      </>
    );
  };

const DescribeApproval: React.FC<{
  app: MMELApproval;
  isCheckListMode: boolean;
}> = function ({ app, isCheckListMode }) {
  return (
    <>
      {!isCheckListMode && (
        <>
          <EditButton
            cid={app.id}
            callback={() => functionCollection.viewEditApproval(app)}
          />
          <RemoveButton
            cid={app.id}
            callback={() => Cleaner.removeApproval(app)}
          />
        </>
      )}
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
        role={app.actor}
        id={app.id + '#actorLabel'}
        label="Actor"
      />
      <ActorDescription
        role={app.approver}
        id={app.id + '#approverLabel'}
        label="Approver"
      />
      <NonEmptyFieldDescription
        id={app.id + '#modalityLabel'}
        label="Modality"
        value={app.modality}
      />
      <ApprovalRecordList regs={app.records} pid={app.id} />
      <ReferenceList refs={app.ref} pid={app.id} />
    </>
  );
};

const DescribeEGate: React.FC<{ egate: MMELEGate; isCheckListMode: boolean }> =
  function ({ egate, isCheckListMode }) {
    return (
      <>
        {!isCheckListMode && (
          <>
            <EditButton
              cid={egate.id}
              callback={() => functionCollection.viewEGate(egate)}
            />
            <RemoveButton
              cid={egate.id}
              callback={() => Cleaner.removeGate(egate)}
            />
          </>
        )}
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
  scEvent: MMELSignalCatchEvent;
  isCheckListMode: boolean;
}> = function ({ scEvent, isCheckListMode }) {
  return (
    <>
      {!isCheckListMode && (
        <>
          <EditButton
            cid={scEvent.id}
            callback={() => functionCollection.viewSignalCatch(scEvent)}
          />
          <RemoveButton
            cid={scEvent.id}
            callback={() => Cleaner.removeEvent(scEvent)}
          />
        </>
      )}
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
  timer: MMELTimerEvent;
  isCheckListMode: boolean;
}> = function ({ timer, isCheckListMode }) {
  return (
    <>
      {!isCheckListMode && (
        <>
          <EditButton
            cid={timer.id}
            callback={() => functionCollection.viewTimer(timer)}
          />
          <RemoveButton
            cid={timer.id}
            callback={() => Cleaner.removeEvent(timer)}
          />
        </>
      )}
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
  reg: MMELRegistry;
  isCheckListMode: boolean;
}> = function ({ reg, isCheckListMode }) {
  return (
    <>
      {!isCheckListMode && (
        <>
          <DataRepoButton
            cid={reg.id}
            callback={() => functionCollection.viewDataRepository(reg)}
          />
        </>
      )}
      {reg.data !== null && (
        <DescribeDC dc={reg.data} isCheckListMode={isCheckListMode} />
      )}
      <DescriptionItem
        id={reg.id + '#registryLabel'}
        label="Title"
        value={reg.title}
      />
    </>
  );
};

const DescribeDC: React.FC<{ dc: MMELDataClass; isCheckListMode: boolean }> =
  function ({ dc, isCheckListMode }) {
    return (
      <>
        <DescriptionItem
          id={dc.id + '#dataclassLabel'}
          label="Data class"
          value={dc.id}
        />
        <AttributeList
          attributes={dc.attributes}
          dcid={dc.id}
          isCheckListMode={isCheckListMode}
        />
      </>
    );
  };

const DescribeAttribute: React.FC<{
  att: MMELDataAttribute;
  isCheckListMode: boolean;
}> = function ({ att, isCheckListMode }) {
  const mw = functionCollection.getStateMan().state.modelWrapper;
  const addon = mw.clman.getItemAddOn(att);
  const css: CSSProperties = {};
  if (att.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  return (
    <>
      {isCheckListMode ? (
        <CheckBoxProgressField
          fieldkey={att.id + '#attributeIDLabel'}
          checkboxkey={addon.mother[0].id + '#' + att.id + '#CheckBox'}
          value={addon.isChecked}
          css={css}
          label="Attribute ID"
          statement={att.id}
          callback={() => {
            ProgressManager.setAttributeChecked(att);
            functionCollection.checkUpdated();
          }}
        />
      ) : (
        <DescriptionItem
          css={css}
          id={att.id + '#attributeIDLabel'}
          label="Attribute ID"
          value={att.id}
        />
      )}
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
      <SatisfyList sats={att.satisfy} aid={att.id} />
      <ReferenceList refs={att.ref} pid={att.id} />
    </>
  );
};
