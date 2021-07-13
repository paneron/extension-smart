/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { ChangeEvent, CSSProperties } from 'react';
import { DataAttribute } from '../../model/model/data/dataattribute';
import { Dataclass } from '../../model/model/data/dataclass';
import { Registry } from '../../model/model/data/registry';
import { EndEvent } from '../../model/model/event/endevent';
import { SignalCatchEvent } from '../../model/model/event/signalcatchevent';
import { StartEvent } from '../../model/model/event/startevent';
import { TimerEvent } from '../../model/model/event/timerevent';
import { EGate } from '../../model/model/gate/egate';
import { GraphNode } from '../../model/model/graphnode';
import { Approval } from '../../model/model/process/approval';
import { Process } from '../../model/model/process/process';
import { Provision } from '../../model/model/support/provision';
import { Reference } from '../../model/model/support/reference';
import { Cleaner } from './cleaner';
import { functionCollection } from './function';
import {
  setAttributeChecked,
  setProvisionChecked,
  setProvisionProgress,
} from './progressmanager';
import { Simulator } from './simulator';

export function describe(x: GraphNode, isCheckListMode: boolean) {
  if (x instanceof Dataclass) {
    return describeDC(x, isCheckListMode);
  } else if (x instanceof Registry) {
    return describeRegistry(x, isCheckListMode);
  } else if (x instanceof StartEvent) {
    return descStart(x, isCheckListMode);
  } else if (x instanceof EndEvent) {
    return descEnd(x, isCheckListMode);
  } else if (x instanceof TimerEvent) {
    return descTimer(x, isCheckListMode);
  } else if (x instanceof SignalCatchEvent) {
    return descSignalCatch(x, isCheckListMode);
  } else if (x instanceof EGate) {
    return descEGate(x, isCheckListMode);
  } else if (x instanceof Approval) {
    return descApproval(x, isCheckListMode);
  } else if (x instanceof Process) {
    return descProcess(x, isCheckListMode);
  }
  return <> {x.id} </>;
}

function descStart(x: StartEvent, isCheckListMode: boolean): JSX.Element {
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

function descEnd(x: EndEvent, isCheckListMode: boolean): JSX.Element {
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

function descProcess(x: Process, isCheckListMode: boolean): JSX.Element {
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
  }
  elms.push(<p key={x.id + '#ProcessID'}> Process: {x.id} </p>);
  elms.push(<p key={x.id + '#ProcessName'}> Name: {x.name} </p>);
  if (x.actor != null) {
    elms.push(<p key={x.id + '#ProcessActor'}> Actor: {x.actor.name} </p>);
  }
  if (x.modality != '') {
    elms.push(<p key={x.id + '#Modality'}> Modality: {x.modality} </p>);
  }
  if (x.provision.length > 0) {
    const ps: Array<JSX.Element> = [];
    x.provision.map((a: Provision) =>
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

function descApproval(x: Approval, isCheckListMode: boolean): JSX.Element {
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
  if (x.actor != null) {
    elms.push(<p key={x.id + '#actorLabel'}> Actor: {x.actor.name} </p>);
  }
  if (x.approver != null) {
    elms.push(
      <p key={x.id + '#approverLabel'}> Approver: {x.approver.name} </p>
    );
  }
  if (x.modality != '') {
    elms.push(<p key={x.id + '#modalityLabel'}> Modality: {x.modality} </p>);
  }
  if (x.records.length > 0) {
    const ps: Array<JSX.Element> = [];
    x.records.map((a: Registry) =>
      ps.push(<li key={x.id + '#approvalRecord#' + a.id}> {a.title} </li>)
    );
    elms.push(<p key={x.id + '#approvalRecordLabel'}>Appproval record(s):</p>);
    elms.push(<ul key={x.id + '#approvalList'}>{ps}</ul>);
  }
  if (x.ref.length > 0) {
    const ps: Array<JSX.Element> = [];
    x.ref.map((a: Reference) => ps.push(<li key={a.id}> {a.toSummary()} </li>));
    elms.push(<p key={x.id + '#referenceLabel'}>Reference:</p>);
    elms.push(<ul key={x.id + '#referenceList'}>{ps}</ul>);
  }
  return <>{elms}</>;
}

function descEGate(x: EGate, isCheckListMode: boolean): JSX.Element {
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
  x: SignalCatchEvent,
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

function descTimer(x: TimerEvent, isCheckListMode: boolean): JSX.Element {
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
  if (x.type != '') {
    elms.push(<p key={x.id + '#timerTypeLabel'}>Type: {x.type} </p>);
  }
  if (x.para != '') {
    elms.push(<p key={x.id + '#timerParaLabel'}>Parameter: {x.para} </p>);
  }
  return <>{elms}</>;
}

function describeRegistry(x: Registry, isCheckListMode: boolean): JSX.Element {
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
      {x.data == null ? '' : describeDC(x.data, isCheckListMode)}
    </>
  );
}

function describeDC(x: Dataclass, isCheckListMode: boolean): JSX.Element {
  return (
    <>
      <p key={x.id + '#dataclassLabel'}> Data class: {x.id} </p>
      <p key={x.id + '#attributesLabel'}> Arrtibutes: </p>
      <ul key={x.id + '#attributeList'}>
        {x.attributes.map((a: DataAttribute) => (
          <li key={a.id}> {describeAttribute(a, isCheckListMode)} </li>
        ))}
      </ul>
    </>
  );
}

function describeAttribute(
  x: DataAttribute,
  isCheckListMode: boolean
): JSX.Element {
  const elms: Array<JSX.Element> = [];
  const css: CSSProperties = {};
  if (x.modality == 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  if (isCheckListMode) {
    elms.push(
      <p key={x.id + '#attributeIDLabel'}>
        {' '}
        <input
          type="checkbox"
          key={x.mother[0].id + '#' + x.id + '#CheckBox'}
          checked={x.isChecked}
          onChange={() => {
            setAttributeChecked(x);
            functionCollection.checkUpdated();
          }}
        />{' '}
        <span style={css}>Attribute ID: {x.id} </span>
      </p>
    );
  } else {
    elms.push(
      <p key={x.id + '#attributeIDLabel'}>
        {' '}
        <span style={css}>Attribute ID: {x.id} </span>
      </p>
    );
  }
  if (x.type != null && x.type != '') {
    elms.push(
      <p key={x.id + '#attributeTypeLabel'} style={css}>
        {' '}
        Type: {x.type}{' '}
      </p>
    );
  }
  if (x.cardinality != null && x.cardinality != '') {
    elms.push(
      <p key={x.id + '#attributeCardinalityLabel'} style={css}>
        {' '}
        Cardinality: {x.cardinality}{' '}
      </p>
    );
  }
  if (x.modality != '') {
    elms.push(
      <p key={x.id + '#attributeModalityLabel'} style={css}>
        {' '}
        Modality: {x.modality}{' '}
      </p>
    );
  }
  if (x.definition != '') {
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
    x.ref.map((a: Reference) => ps.push(<li key={a.id}> {a.toSummary()} </li>));
    elms.push(<p key={x.id + '#attributeReferenceLabel'}>Reference:</p>);
    elms.push(<ul key={x.id + '#referenceList'}>{ps}</ul>);
  }
  return <>{elms}</>;
}

function describeProvision(
  x: Provision,
  isCheckListMode: boolean
): JSX.Element {
  const elms: Array<JSX.Element> = [];
  const css: CSSProperties = {};
  if (x.modality == 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  if (isCheckListMode) {
    elms.push(
      <p key={'ui#provisionStatementLabel#' + x.id}>
        <input
          type="checkbox"
          id={x.id + '#CheckBox'}
          checked={x.isChecked}
          onChange={e => {
            setProvisionChecked(x);
            functionCollection.checkUpdated();
          }}
        />
        Statement: <span style={css}> {x.condition}</span>
      </p>
    );
  } else {
    elms.push(
      <p key={'ui#provisionStatementLabel#' + x.id}>
        {' '}
        Statement: <span style={css}> {x.condition}</span>
      </p>
    );
  }
  if (x.modality != '') {
    elms.push(
      <p key={'ui#provisionModalityLabel#' + x.id}>Modality: {x.modality}</p>
    );
  }
  if (x.ref.length > 0) {
    const ps: Array<JSX.Element> = [];
    x.ref.map((a: Reference) =>
      ps.push(<li key={a.id + '#ref#' + x.id}>{a.toSummary()} </li>)
    );
    elms.push(<p key={'ui#reflabel#' + x.id}>Reference:</p>);
    elms.push(<ul key={x.id + '#referenceList'}>{ps}</ul>);
  }
  if (isCheckListMode) {
    elms.push(
      <p key={'x.id#ProgressLabel'}>
        Progress:{' '}
        <input
          type="number"
          min="0"
          max="100"
          value={x.progress}
          onChange={e => progressUpdate(e, x)}
        ></input>
        %{' '}
      </p>
    );
  }
  return <>{elms}</>;
}

function progressUpdate(e: ChangeEvent<HTMLInputElement>, x: Provision) {
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
  setProvisionProgress(x, parsed);
  functionCollection.checkUpdated();
}
