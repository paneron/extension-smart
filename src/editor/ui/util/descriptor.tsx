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

export function describe(x: MMELNode, isCheckListMode: boolean) {
  if (x.datatype === DataType.DATACLASS) {
    return describeDC(x as MMELDataClass, isCheckListMode);
  } else if (x.datatype === DataType.REGISTRY) {
    return describeRegistry(x as MMELRegistry, isCheckListMode);
  } else if (x.datatype === DataType.STARTEVENT) {
    return descStart(x as MMELStartEvent, isCheckListMode);
  } else if (x.datatype === DataType.ENDEVENT) {
    return descEnd(x as MMELEndEvent, isCheckListMode);
  } else if (x.datatype === DataType.TIMEREVENT) {
    return descTimer(x as MMELTimerEvent, isCheckListMode);
  } else if (x.datatype === DataType.SIGNALCATCHEVENT) {
    return descSignalCatch(x as MMELSignalCatchEvent, isCheckListMode);
  } else if (x.datatype === DataType.EGATE) {
    return descEGate(x as MMELEGate, isCheckListMode);
  } else if (x.datatype === DataType.APPROVAL) {
    return descApproval(x as MMELApproval, isCheckListMode);
  } else if (x.datatype === DataType.PROCESS) {
    return descProcess(x as MMELProcess, isCheckListMode);
  }
  return <> {x.id} </>;
}

function descStart(x: MMELStartEvent, isCheckListMode: boolean): JSX.Element {
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
}

function descEnd(x: MMELEndEvent, isCheckListMode: boolean): JSX.Element {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#removeEnd#' + x.id}
        onClick={() => Cleaner.removeEvent(x)}
      >
        {' '}
        Remove{' '}
      </button>
    );
  }
  return (
    <>
      {elms}
      <p key={'ui#endlabel#' + x.id}> End event </p>
    </>
  );
}

function descProcess(x: MMELProcess, isCheckListMode: boolean): JSX.Element {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#viewprocess#' + x.id}
        onClick={() => functionCollection.viewEditProcess(x)}
      >
        {' '}
        Edit{' '}
      </button>
    );
    elms.push(
      <button
        key={'ui#button#removeprocess#' + x.id}
        onClick={() => Cleaner.removeProcess(x)}
      >
        {' '}
        Remove{' '}
      </button>
    );
    if (x.page === null) {
      elms.push(
        <MyFloatButton onClick={() => addSubprocess(x)}>+</MyFloatButton>
      );
    }
  }
  elms.push(<p key={x.id + '#ProcessID'}> Process: {x.id} </p>);
  elms.push(<p key={x.id + '#ProcessName'}> Name: {x.name} </p>);
  if (x.actor !== null) {
    elms.push(<p key={x.id + '#ProcessActor'}> Actor: {x.actor.name} </p>);
  }
  if (x.modality !== '') {
    elms.push(<p key={x.id + '#Modality'}> Modality: {x.modality} </p>);
  }
  if (x.provision.length > 0) {
    const ps: Array<JSX.Element> = [];
    x.provision.map((a: MMELProvision) =>
      ps.push(
        <li key={x.id + '#Pro#' + a.id}>
          {' '}
          {describeProvision(a, isCheckListMode)}{' '}
        </li>
      )
    );
    elms.push(<p key={x.id + '#Provisions'}>Provisions</p>);
    elms.push(<ul key={x.id + '#ProvisionList'}>{ps}</ul>);
  }
  if (x.measure.length > 0) {
    const ms: Array<JSX.Element> = [];
    x.measure.map((m: string, index: number) =>
      ms.push(<li key={x.id + '#Measure#' + index}> {m} </li>)
    );
    elms.push(<p key={x.id + '#MeasureText'}>Measurements</p>);
    elms.push(<ul key={x.id + '#MeasureList'}>{ms}</ul>);
  }
  return <>{elms} </>;
}

function descApproval(x: MMELApproval, isCheckListMode: boolean): JSX.Element {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#viewapproval#' + x.id}
        onClick={() => functionCollection.viewEditApproval(x)}
      >
        {' '}
        Edit{' '}
      </button>
    );
    elms.push(
      <button
        key={'ui#button#removeapproval#' + x.id}
        onClick={() => Cleaner.removeApproval(x)}
      >
        {' '}
        Remove{' '}
      </button>
    );
  }
  elms.push(<p key={x.id + '#approvalLabel'}> Approval: {x.id} </p>);
  elms.push(<p key={x.id + '#nameLabel'}> Name: {x.name} </p>);
  if (x.actor !== null) {
    elms.push(<p key={x.id + '#actorLabel'}> Actor: {x.actor.name} </p>);
  }
  if (x.approver !== null) {
    elms.push(
      <p key={x.id + '#approverLabel'}> Approver: {x.approver.name} </p>
    );
  }
  if (x.modality !== '') {
    elms.push(<p key={x.id + '#modalityLabel'}> Modality: {x.modality} </p>);
  }
  if (x.records.length > 0) {
    const ps: Array<JSX.Element> = [];
    x.records.map((a: MMELRegistry) =>
      ps.push(<li key={x.id + '#approvalRecord#' + a.id}> {a.title} </li>)
    );
    elms.push(<p key={x.id + '#approvalRecordLabel'}>Appproval record(s):</p>);
    elms.push(<ul key={x.id + '#approvalList'}>{ps}</ul>);
  }
  if (x.ref.length > 0) {
    const ps: Array<JSX.Element> = [];
    x.ref.map((a: MMELReference) =>
      ps.push(<li key={a.id}> {toSummary(a)} </li>)
    );
    elms.push(<p key={x.id + '#referenceLabel'}>Reference:</p>);
    elms.push(<ul key={x.id + '#referenceList'}>{ps}</ul>);
  }
  return <>{elms}</>;
}

function descEGate(x: MMELEGate, isCheckListMode: boolean): JSX.Element {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#viewEGate#' + x.id}
        onClick={() => functionCollection.viewEGate(x)}
      >
        {' '}
        Edit{' '}
      </button>
    );
    elms.push(
      <button
        key={'ui#button#removeEGate#' + x.id}
        onClick={() => Cleaner.removeGate(x)}
      >
        {' '}
        Remove{' '}
      </button>
    );
  }
  return (
    <>
      {elms}
      <p key={x.id + '#egate'}> Exclusive Gateway: {x.id} </p>
      <p key={x.id + '#egateLabel'}> Contents: {x.label} </p>
    </>
  );
}

function descSignalCatch(
  x: MMELSignalCatchEvent,
  isCheckListMode: boolean
): JSX.Element {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#viewSignalCatch#' + x.id}
        onClick={() => functionCollection.viewSignalCatch(x)}
      >
        {' '}
        Edit{' '}
      </button>
    );
    elms.push(
      <button
        key={'ui#button#removeSignalCatch#' + x.id}
        onClick={() => Cleaner.removeEvent(x)}
      >
        {' '}
        Remove{' '}
      </button>
    );
  }
  return (
    <>
      {elms}
      <p key={x.id + '#signalCatchLabel'}> Signal Catch Event: {x.id} </p>
      <p key={x.id + '#signalLabel'}> Signal: {x.signal} </p>
    </>
  );
}

function descTimer(x: MMELTimerEvent, isCheckListMode: boolean): JSX.Element {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#viewTimer#' + x.id}
        onClick={() => functionCollection.viewTimer(x)}
      >
        {' '}
        Edit{' '}
      </button>
    );
    elms.push(
      <button
        key={'ui#button#removeTimer#' + x.id}
        onClick={() => Cleaner.removeEvent(x)}
      >
        {' '}
        Remove{' '}
      </button>
    );
  }
  elms.push(<p key={x.id + '#timerLabel'}> Timer Event: {x.id} </p>);
  if (x.type !== '') {
    elms.push(<p key={x.id + '#timerTypeLabel'}>Type: {x.type} </p>);
  }
  if (x.para !== '') {
    elms.push(<p key={x.id + '#timerParaLabel'}>Parameter: {x.para} </p>);
  }
  return <>{elms}</>;
}

function describeRegistry(
  x: MMELRegistry,
  isCheckListMode: boolean
): JSX.Element {
  const elms: Array<JSX.Element> = [];
  if (!isCheckListMode) {
    elms.push(
      <button
        key={'ui#button#datarepo#' + x.id}
        onClick={() => functionCollection.viewDataRepository(x)}
      >
        {' '}
        Data repository{' '}
      </button>
    );
  }
  return (
    <>
      {elms}
      <p key={x.id + '#registryLabel'}>Title: {x.title} </p>
      {x.data === null ? '' : describeDC(x.data, isCheckListMode)}
    </>
  );
}

function describeDC(x: MMELDataClass, isCheckListMode: boolean): JSX.Element {
  return (
    <>
      <p key={x.id + '#dataclassLabel'}> Data class: {x.id} </p>
      <p key={x.id + '#attributesLabel'}> Arrtibutes: </p>
      <ul key={x.id + '#attributeList'}>
        {x.attributes.map((a: MMELDataAttribute) => (
          <li key={a.id}> {describeAttribute(a, isCheckListMode)} </li>
        ))}
      </ul>
    </>
  );
}

function describeAttribute(
  x: MMELDataAttribute,
  isCheckListMode: boolean
): JSX.Element {
  const elms: Array<JSX.Element> = [];
  const css: CSSProperties = {};
  const mw = functionCollection.getStateMan().state.modelWrapper;
  if (x.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  if (isCheckListMode) {
    const addon = mw.clman.items.get(x);
    if (addon !== undefined) {
      elms.push(
        <p key={x.id + '#attributeIDLabel'}>
          {' '}
          <input
            type="checkbox"
            key={addon.mother[0].id + '#' + x.id + '#CheckBox'}
            checked={addon.isChecked}
            onChange={() => {
              ProgressManager.setAttributeChecked(x);
              functionCollection.checkUpdated();
            }}
          />{' '}
          <span style={css}>Attribute ID: {x.id} </span>
        </p>
      );
    }
  } else {
    elms.push(
      <p key={x.id + '#attributeIDLabel'}>
        {' '}
        <span style={css}>Attribute ID: {x.id} </span>
      </p>
    );
  }
  if (x.type !== '') {
    elms.push(
      <p key={x.id + '#attributeTypeLabel'} style={css}>
        {' '}
        Type: {x.type}{' '}
      </p>
    );
  }
  if (x.cardinality !== '') {
    elms.push(
      <p key={x.id + '#attributeCardinalityLabel'} style={css}>
        {' '}
        Cardinality: {x.cardinality}{' '}
      </p>
    );
  }
  if (x.modality !== '') {
    elms.push(
      <p key={x.id + '#attributeModalityLabel'} style={css}>
        {' '}
        Modality: {x.modality}{' '}
      </p>
    );
  }
  if (x.definition !== '') {
    elms.push(
      <p key={x.id + '#attributeDefinitionLabel'} style={css}>
        {' '}
        Definition: {x.definition}{' '}
      </p>
    );
  }
  if (x.satisfy.length > 0) {
    const ps: Array<JSX.Element> = [];
    x.satisfy.map((a: string) => ps.push(<li key={a}> {a} </li>));
    elms.push(<p key={x.id + '#attributeSatisfyLabel'}>Satisfy:</p>);
    elms.push(<ul key={x.id + '#satisfyList'}>{ps}</ul>);
  }
  if (x.ref.length > 0) {
    const ps: Array<JSX.Element> = [];
    x.ref.map((a: MMELReference) =>
      ps.push(<li key={a.id}> {toSummary(a)} </li>)
    );
    elms.push(<p key={x.id + '#attributeReferenceLabel'}>Reference:</p>);
    elms.push(<ul key={x.id + '#referenceList'}>{ps}</ul>);
  }
  return <>{elms}</>;
}

function describeProvision(
  x: MMELProvision,
  isCheckListMode: boolean
): JSX.Element {
  const elms: Array<JSX.Element> = [];
  const css: CSSProperties = {};
  if (x.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  if (isCheckListMode) {
    const mw = functionCollection.getStateMan().state.modelWrapper;
    const addon = mw.clman.items.get(x);
    if (addon !== undefined) {
      elms.push(
        <p key={'ui#provisionStatementLabel#' + x.id}>
          <input
            type="checkbox"
            id={x.id + '#CheckBox'}
            checked={addon.isChecked}
            onChange={e => {
              ProgressManager.setProvisionChecked(x);
              functionCollection.checkUpdated();
            }}
          />
          Statement: <span style={css}> {x.condition}</span>
        </p>
      );
    }
  } else {
    elms.push(
      <p key={'ui#provisionStatementLabel#' + x.id}>
        {' '}
        Statement: <span style={css}> {x.condition}</span>
      </p>
    );
  }
  if (x.modality !== '') {
    elms.push(
      <p key={'ui#provisionModalityLabel#' + x.id}>Modality: {x.modality}</p>
    );
  }
  if (x.ref.length > 0) {
    const ps: Array<JSX.Element> = [];
    x.ref.map((a: MMELReference) =>
      ps.push(<li key={a.id + '#ref#' + x.id}>{toSummary(a)} </li>)
    );
    elms.push(<p key={'ui#reflabel#' + x.id}>Reference:</p>);
    elms.push(<ul key={x.id + '#referenceList'}>{ps}</ul>);
  }
  if (isCheckListMode) {
    elms.push(
      <p key={x.id + '#ProgressLabel'}>
        Progress:{' '}
        <input
          type="number"
          min="0"
          max="100"
          value={
            functionCollection
              .getStateMan()
              .state.modelWrapper.clman.items.get(x)?.progress
          }
          onChange={e => progressUpdate(e, x)}
        ></input>
        %{' '}
      </p>
    );
  }
  return <>{elms}</>;
}

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
