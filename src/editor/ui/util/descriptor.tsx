/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React, { ChangeEvent, CSSProperties } from 'react';
import { toSummary } from '../../runtime/functions';
import { MMELFactory } from '../../runtime/modelComponentCreator';
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
  MMELProvision,
  MMELReference,
} from '../../serialize/interface/supportinterface';
import { Cleaner } from './cleaner';
import { functionCollection } from './function';
import { ProgressManager } from './progressmanager';
import { Simulator } from './simulator';

//const NODE_DETAIL_VIEWS: Record<DataType, React.FC<{ node: MMELNode, isCheckListMode: boolean }>> = {
//  // TODO: Provide a
//  [DataType.DATACLASS]: ({ node, isCheckListMode }) => <DescribeDC dc={node as MMELDataClass} isCheckListMode={isCheckListMode} />,
//};

export const Describe: React.FC<{ node: MMELNode; isCheckListMode: boolean }> =
  function ({ node, isCheckListMode }) {
    //const View = NODE_DETAIL_VIEWS[node.datatype];
    //return <View node={node} isCheckListMode={isCheckListMode} />;

    if (node.datatype === DataType.DATACLASS) {
      return (
        <DescribeDC
          dc={node as MMELDataClass}
          isCheckListMode={isCheckListMode}
        />
      );
    } else if (node.datatype === DataType.REGISTRY) {
      return (
        <DescribeRegistry
          reg={node as MMELRegistry}
          isCheckListMode={isCheckListMode}
        />
      );
    } else if (node.datatype === DataType.STARTEVENT) {
      return (
        <DescribeStart
          start={node as MMELStartEvent}
          isCheckListMode={isCheckListMode}
        />
      );
    } else if (node.datatype === DataType.ENDEVENT) {
      return (
        <DescribeEnd
          end={node as MMELEndEvent}
          isCheckListMode={isCheckListMode}
        />
      );
    } else if (node.datatype === DataType.TIMEREVENT) {
      return (
        <DescribeTimer
          timer={node as MMELTimerEvent}
          isCheckListMode={isCheckListMode}
        />
      );
    } else if (node.datatype === DataType.SIGNALCATCHEVENT) {
      return (
        <DescribeSignalCatch
          scEvent={node as MMELSignalCatchEvent}
          isCheckListMode={isCheckListMode}
        />
      );
    } else if (node.datatype === DataType.EGATE) {
      return (
        <DescribeEGate
          egate={node as MMELEGate}
          isCheckListMode={isCheckListMode}
        />
      );
    } else if (node.datatype === DataType.APPROVAL) {
      return (
        <DescribeApproval
          app={node as MMELApproval}
          isCheckListMode={isCheckListMode}
        />
      );
    } else if (node.datatype === DataType.PROCESS) {
      return (
        <DescribeProcess
          process={node as MMELProcess}
          isCheckListMode={isCheckListMode}
        />
      );
    }
    return <> {node.id} </>;
  };

const DescribeStart: React.FC<{
  start: MMELStartEvent;
  isCheckListMode: boolean;
}> = function ({ start: x, isCheckListMode }) {
  const elms: Array<JSX.Element> = [];
  elms.push(<span key="ui#startlabel"> Start event </span>);
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#startSimulation' + x.id}
        onClick={() => Simulator.startSimulation()}
      >
        {' '}
        Simulation{' '}
      </button>
    );
  }
  return <>{elms}</>;
};

const DescribeEnd: React.FC<{ end: MMELEndEvent; isCheckListMode: boolean }> =
  function ({ end, isCheckListMode }): JSX.Element {
    const elms: Array<JSX.Element> = [];
    if (!isCheckListMode) {
      elms.push(
        <button
          key={'ui#button#removeEnd#' + end.id}
          onClick={() => Cleaner.removeEvent(end)}
        >
          {' '}
          Remove{' '}
        </button>
      );
    }
    return (
      <>
        {elms}
        <p key={'ui#endlabel#' + end.id}> End event </p>
      </>
    );
  };

const DescribeProcess: React.FC<{
  process: MMELProcess;
  isCheckListMode: boolean;
}> = function ({ process, isCheckListMode }) {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#viewprocess#' + process.id}
        onClick={() => functionCollection.viewEditProcess(process)}
      >
        {' '}
        Edit{' '}
      </button>
    );
    elms.push(
      <button
        key={'ui#button#removeprocess#' + process.id}
        onClick={() => Cleaner.removeProcess(process)}
      >
        {' '}
        Remove{' '}
      </button>
    );
    if (process.page === null) {
      elms.push(
        <MyFloatButton onClick={() => addSubprocess(process)}>+</MyFloatButton>
      );
    }
  }
  elms.push(<p key={process.id + '#ProcessID'}> Process: {process.id} </p>);
  elms.push(<p key={process.id + '#ProcessName'}> Name: {process.name} </p>);
  if (process.actor !== null) {
    elms.push(
      <p key={process.id + '#ProcessActor'}> Actor: {process.actor.name} </p>
    );
  }
  if (process.modality !== '') {
    elms.push(
      <p key={process.id + '#Modality'}> Modality: {process.modality} </p>
    );
  }
  if (process.provision.length > 0) {
    const ps: Array<JSX.Element> = [];
    process.provision.map((provision: MMELProvision) =>
      ps.push(
        <li key={process.id + '#Pro#' + provision.id}>
          {' '}
          <DescribeProvision
            provision={provision}
            isCheckListMode={isCheckListMode}
          />{' '}
        </li>
      )
    );
    elms.push(<p key={process.id + '#Provisions'}>Provisions</p>);
    elms.push(<ul key={process.id + '#ProvisionList'}>{ps}</ul>);
  }
  if (process.measure.length > 0) {
    const ms: Array<JSX.Element> = [];
    process.measure.map((m: string, index: number) =>
      ms.push(<li key={process.id + '#Measure#' + index}> {m} </li>)
    );
    elms.push(<p key={process.id + '#MeasureText'}>Measurements</p>);
    elms.push(<ul key={process.id + '#MeasureList'}>{ms}</ul>);
  }
  return <>{elms} </>;
};

const DescribeApproval: React.FC<{
  app: MMELApproval;
  isCheckListMode: boolean;
}> = function ({ app, isCheckListMode }) {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#viewapproval#' + app.id}
        onClick={() => functionCollection.viewEditApproval(app)}
      >
        {' '}
        Edit{' '}
      </button>
    );
    elms.push(
      <button
        key={'ui#button#removeapproval#' + app.id}
        onClick={() => Cleaner.removeApproval(app)}
      >
        {' '}
        Remove{' '}
      </button>
    );
  }
  elms.push(<p key={app.id + '#approvalLabel'}> Approval: {app.id} </p>);
  elms.push(<p key={app.id + '#nameLabel'}> Name: {app.name} </p>);
  if (app.actor !== null) {
    elms.push(<p key={app.id + '#actorLabel'}> Actor: {app.actor.name} </p>);
  }
  if (app.approver !== null) {
    elms.push(
      <p key={app.id + '#approverLabel'}> Approver: {app.approver.name} </p>
    );
  }
  if (app.modality !== '') {
    elms.push(
      <p key={app.id + '#modalityLabel'}> Modality: {app.modality} </p>
    );
  }
  if (app.records.length > 0) {
    const ps: Array<JSX.Element> = [];
    app.records.map((a: MMELRegistry) =>
      ps.push(<li key={app.id + '#approvalRecord#' + a.id}> {a.title} </li>)
    );
    elms.push(
      <p key={app.id + '#approvalRecordLabel'}>Appproval record(s):</p>
    );
    elms.push(<ul key={app.id + '#approvalList'}>{ps}</ul>);
  }
  if (app.ref.length > 0) {
    const ps: Array<JSX.Element> = [];
    app.ref.map((a: MMELReference) =>
      ps.push(<li key={a.id}> {toSummary(a)} </li>)
    );
    elms.push(<p key={app.id + '#referenceLabel'}>Reference:</p>);
    elms.push(<ul key={app.id + '#referenceList'}>{ps}</ul>);
  }
  return <>{elms}</>;
};

const DescribeEGate: React.FC<{ egate: MMELEGate; isCheckListMode: boolean }> =
  function ({ egate, isCheckListMode }) {
    const elms: Array<JSX.Element> = [];
    if (!isCheckListMode) {
      elms.push(
        <button
          key={'ui#button#viewEGate#' + egate.id}
          onClick={() => functionCollection.viewEGate(egate)}
        >
          {' '}
          Edit{' '}
        </button>
      );
      elms.push(
        <button
          key={'ui#button#removeEGate#' + egate.id}
          onClick={() => Cleaner.removeGate(egate)}
        >
          {' '}
          Remove{' '}
        </button>
      );
    }
    return (
      <>
        {elms}
        <p key={egate.id + '#egate'}> Exclusive Gateway: {egate.id} </p>
        <p key={egate.id + '#egateLabel'}> Contents: {egate.label} </p>
      </>
    );
  };

const DescribeSignalCatch: React.FC<{
  scEvent: MMELSignalCatchEvent;
  isCheckListMode: boolean;
}> = function ({ scEvent, isCheckListMode }) {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#viewSignalCatch#' + scEvent.id}
        onClick={() => functionCollection.viewSignalCatch(scEvent)}
      >
        {' '}
        Edit{' '}
      </button>
    );
    elms.push(
      <button
        key={'ui#button#removeSignalCatch#' + scEvent.id}
        onClick={() => Cleaner.removeEvent(scEvent)}
      >
        {' '}
        Remove{' '}
      </button>
    );
  }
  return (
    <>
      {elms}
      <p key={scEvent.id + '#signalCatchLabel'}>
        {' '}
        Signal Catch Event: {scEvent.id}{' '}
      </p>
      <p key={scEvent.id + '#signalLabel'}> Signal: {scEvent.signal} </p>
    </>
  );
};

const DescribeTimer: React.FC<{
  timer: MMELTimerEvent;
  isCheckListMode: boolean;
}> = function ({ timer, isCheckListMode }) {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#viewTimer#' + timer.id}
        onClick={() => functionCollection.viewTimer(timer)}
      >
        {' '}
        Edit{' '}
      </button>
    );
    elms.push(
      <button
        key={'ui#button#removeTimer#' + timer.id}
        onClick={() => Cleaner.removeEvent(timer)}
      >
        {' '}
        Remove{' '}
      </button>
    );
  }
  elms.push(<p key={timer.id + '#timerLabel'}> Timer Event: {timer.id} </p>);
  if (timer.type !== '') {
    elms.push(<p key={timer.id + '#timerTypeLabel'}>Type: {timer.type} </p>);
  }
  if (timer.para !== '') {
    elms.push(
      <p key={timer.id + '#timerParaLabel'}>Parameter: {timer.para} </p>
    );
  }
  return <>{elms}</>;
};

const DescribeRegistry: React.FC<{
  reg: MMELRegistry;
  isCheckListMode: boolean;
}> = function ({ reg, isCheckListMode }) {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#datarepo#' + reg.id}
        onClick={() => functionCollection.viewDataRepository(reg)}
      >
        {' '}
        Data repository{' '}
      </button>
    );
  }
  return (
    <>
      {elms}
      <p key={reg.id + '#registryLabel'}>Title: {reg.title} </p>
      {reg.data === null ? (
        ''
      ) : (
        <DescribeDC dc={reg.data} isCheckListMode={isCheckListMode} />
      )}
    </>
  );
};

const DescribeDC: React.FC<{ dc: MMELDataClass; isCheckListMode: boolean }> =
  function ({ dc, isCheckListMode }) {
    return (
      <>
        <p key={dc.id + '#dataclassLabel'}> Data class: {dc.id} </p>
        <p key={dc.id + '#attributesLabel'}> Arrtibutes: </p>
        <ul key={dc.id + '#attributeList'}>
          {dc.attributes.map((a: MMELDataAttribute) => (
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
    );
  };

const DescribeAttribute: React.FC<{
  att: MMELDataAttribute;
  isCheckListMode: boolean;
}> = function ({ att, isCheckListMode }) {
  const elms: Array<JSX.Element> = [];
  const css: CSSProperties = {};
  const mw = functionCollection.getStateMan().state.modelWrapper;
  if (att.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  if (isCheckListMode) {
    const addon = mw.clman.items.get(att);
    if (addon !== undefined) {
      elms.push(
        <p key={att.id + '#attributeIDLabel'}>
          {' '}
          <input
            type="checkbox"
            key={addon.mother[0].id + '#' + att.id + '#CheckBox'}
            checked={addon.isChecked}
            onChange={() => {
              ProgressManager.setAttributeChecked(att);
              functionCollection.checkUpdated();
            }}
          />{' '}
          <span style={css}>Attribute ID: {att.id} </span>
        </p>
      );
    }
  } else {
    elms.push(
      <p key={att.id + '#attributeIDLabel'}>
        {' '}
        <span style={css}>Attribute ID: {att.id} </span>
      </p>
    );
  }
  if (att.type !== '') {
    elms.push(
      <p key={att.id + '#attributeTypeLabel'} style={css}>
        {' '}
        Type: {att.type}{' '}
      </p>
    );
  }
  if (att.cardinality !== '') {
    elms.push(
      <p key={att.id + '#attributeCardinalityLabel'} style={css}>
        {' '}
        Cardinality: {att.cardinality}{' '}
      </p>
    );
  }
  if (att.modality !== '') {
    elms.push(
      <p key={att.id + '#attributeModalityLabel'} style={css}>
        {' '}
        Modality: {att.modality}{' '}
      </p>
    );
  }
  if (att.definition !== '') {
    elms.push(
      <p key={att.id + '#attributeDefinitionLabel'} style={css}>
        {' '}
        Definition: {att.definition}{' '}
      </p>
    );
  }
  if (att.satisfy.length > 0) {
    const ps: Array<JSX.Element> = [];
    att.satisfy.map((a: string) => ps.push(<li key={a}> {a} </li>));
    elms.push(<p key={att.id + '#attributeSatisfyLabel'}>Satisfy:</p>);
    elms.push(<ul key={att.id + '#satisfyList'}>{ps}</ul>);
  }
  if (att.ref.length > 0) {
    const ps: Array<JSX.Element> = [];
    att.ref.map((a: MMELReference) =>
      ps.push(<li key={a.id}> {toSummary(a)} </li>)
    );
    elms.push(<p key={att.id + '#attributeReferenceLabel'}>Reference:</p>);
    elms.push(<ul key={att.id + '#referenceList'}>{ps}</ul>);
  }
  return <>{elms}</>;
};

const DescribeProvision: React.FC<{
  provision: MMELProvision;
  isCheckListMode: boolean;
}> = function ({ provision, isCheckListMode }) {
  const elms: Array<JSX.Element> = [];
  const css: CSSProperties = {};
  if (provision.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  if (isCheckListMode) {
    const mw = functionCollection.getStateMan().state.modelWrapper;
    const addon = mw.clman.items.get(provision);
    if (addon !== undefined) {
      elms.push(
        <p key={'ui#provisionStatementLabel#' + provision.id}>
          <input
            type="checkbox"
            id={provision.id + '#CheckBox'}
            checked={addon.isChecked}
            onChange={() => {
              ProgressManager.setProvisionChecked(provision);
              functionCollection.checkUpdated();
            }}
          />
          Statement: <span style={css}> {provision.condition}</span>
        </p>
      );
    }
  } else {
    elms.push(
      <p key={'ui#provisionStatementLabel#' + provision.id}>
        {' '}
        Statement: <span style={css}> {provision.condition}</span>
      </p>
    );
  }
  if (provision.modality !== '') {
    elms.push(
      <p key={'ui#provisionModalityLabel#' + provision.id}>
        Modality: {provision.modality}
      </p>
    );
  }
  if (provision.ref.length > 0) {
    const ps: Array<JSX.Element> = [];
    provision.ref.map((a: MMELReference) =>
      ps.push(<li key={a.id + '#ref#' + provision.id}>{toSummary(a)} </li>)
    );
    elms.push(<p key={'ui#reflabel#' + provision.id}>Reference:</p>);
    elms.push(<ul key={provision.id + '#referenceList'}>{ps}</ul>);
  }
  if (isCheckListMode) {
    elms.push(
      <p key={provision.id + '#ProgressLabel'}>
        Progress:{' '}
        <input
          type="number"
          min="0"
          max="100"
          value={
            functionCollection
              .getStateMan()
              .state.modelWrapper.clman.items.get(provision)?.progress
          }
          onChange={e => progressUpdate(e, provision)}
        ></input>
        %{' '}
      </p>
    );
  }
  return <>{elms}</>;
};

function progressUpdate(e: ChangeEvent<HTMLInputElement>, x: MMELProvision) {
  const subject = e.target.value;
  let parsed = parseInt(subject);
  if (isNaN(parsed)) {
    e.target.value = '0';
    parsed = 0;
  }
  if (parsed > 100) {
    parsed = 100;
    e.target.value = '100';
  }
  if (parsed < 0) {
    parsed = 0;
    e.target.value = '0';
  }
  ProgressManager.setProvisionProgress(x, parsed);
  functionCollection.checkUpdated();
}

function addSubprocess(x: MMELProcess) {
  const sm = functionCollection.getStateMan();
  const mw = sm.state.modelWrapper;
  const model = mw.model;
  const idreg = mw.idman;
  const pg = MMELFactory.createSubprocess(idreg.findUniquePageID('Page'));
  const st = MMELFactory.createStartEvent(idreg.findUniqueID('Start'));
  const nc = MMELFactory.createSubprocessComponent(st);
  idreg.nodes.set(st.id, st);
  pg.childs.push(nc);
  const pgaddon = mw.subman.get(pg);
  pgaddon.map.set(st.id, nc);
  pgaddon.start = nc;
  model.events.push(st);
  x.page = pg;
  model.pages.push(pg);
  idreg.pages.set(pg.id, pg);
  sm.setState({ ...sm.state });
}

const MyFloatButton = styled.button`
  position: absolute;
  right: 5%;
  top: 2%;
  font-size: 30px;
  box-shadow: inset 0px 1px 0px 0px #fff6af;
  background: linear-gradient(to bottom, #ffec64 5%, #ffab23 100%);
  background-color: #ffec64;
  border-radius: 6px;
  border: 1px solid #ffaa22;
  display: inline-block;
  cursor: pointer;
  color: #333333;
  font-family: Arial;
  font-weight: bold;
  padding: 6px 24px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #ffee66;
`;
