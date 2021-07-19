/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { CSSProperties } from 'react';
import { toSummary } from '../../../runtime/functions';
import { DataType, MMELNode } from '../../../serialize/interface/baseinterface';
import {
  MMELDataAttribute,
  MMELDataClass,
  MMELRegistry,
} from '../../../serialize/interface/datainterface';
import {
  MMELEndEvent,
  MMELSignalCatchEvent,
  MMELStartEvent,
  MMELTimerEvent,
} from '../../../serialize/interface/eventinterface';
import { MMELEGate } from '../../../serialize/interface/flowcontrolinterface';
import {
  MMELApproval,
  MMELProcess,
} from '../../../serialize/interface/processinterface';
import {
  MMELProvision,
  MMELReference,
} from '../../../serialize/interface/supportinterface';

export function MappingDescribe(x: MMELNode) {
  if (x.datatype === DataType.DATACLASS) {
    return describeDC(x as MMELDataClass);
  } else if (x.datatype === DataType.REGISTRY) {
    return describeRegistry(x as MMELRegistry);
  } else if (x.datatype === DataType.STARTEVENT) {
    return descStart(x as MMELStartEvent);
  } else if (x.datatype === DataType.ENDEVENT) {
    return descEnd(x as MMELEndEvent);
  } else if (x.datatype === DataType.TIMEREVENT) {
    return descTimer(x as MMELTimerEvent);
  } else if (x.datatype === DataType.SIGNALCATCHEVENT) {
    return descSignalCatch(x as MMELSignalCatchEvent);
  } else if (x.datatype === DataType.EGATE) {
    return descEGate(x as MMELEGate);
  } else if (x.datatype === DataType.APPROVAL) {
    return descApproval(x as MMELApproval);
  } else if (x.datatype === DataType.PROCESS) {
    return descProcess(x as MMELProcess);
  }
  return <> {x.id} </>;
}

function descStart(x: MMELStartEvent): JSX.Element {
  return <span key="ui#startlabel"> Start event </span>;
}

function descEnd(x: MMELEndEvent): JSX.Element {
  return <p key={'ui#endlabel#' + x.id}> End event </p>;
}

function descProcess(x: MMELProcess): JSX.Element {
  const elms: Array<JSX.Element> = [];
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
      ps.push(<li key={x.id + '#Pro#' + a.id}> {describeProvision(a)} </li>)
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

function descApproval(x: MMELApproval): JSX.Element {
  const elms: Array<JSX.Element> = [];
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

function descEGate(x: MMELEGate): JSX.Element {
  const elms: Array<JSX.Element> = [];
  return (
    <>
      {elms}
      <p key={x.id + '#egate'}> Exclusive Gateway: {x.id} </p>
      <p key={x.id + '#egateLabel'}> Contents: {x.label} </p>
    </>
  );
}

function descSignalCatch(x: MMELSignalCatchEvent): JSX.Element {
  const elms: Array<JSX.Element> = [];
  return (
    <>
      {elms}
      <p key={x.id + '#signalCatchLabel'}> Signal Catch Event: {x.id} </p>
      <p key={x.id + '#signalLabel'}> Signal: {x.signal} </p>
    </>
  );
}

function descTimer(x: MMELTimerEvent): JSX.Element {
  const elms: Array<JSX.Element> = [];
  elms.push(<p key={x.id + '#timerLabel'}> Timer Event: {x.id} </p>);
  if (x.type !== '') {
    elms.push(<p key={x.id + '#timerTypeLabel'}>Type: {x.type} </p>);
  }
  if (x.para !== '') {
    elms.push(<p key={x.id + '#timerParaLabel'}>Parameter: {x.para} </p>);
  }
  return <>{elms}</>;
}

function describeRegistry(x: MMELRegistry): JSX.Element {
  return (
    <>
      <p key={x.id + '#registryLabel'}>Title: {x.title} </p>
      {x.data === null ? '' : describeDC(x.data)}
    </>
  );
}

function describeDC(x: MMELDataClass): JSX.Element {
  return (
    <>
      <p key={x.id + '#dataclassLabel'}> Data class: {x.id} </p>
      <p key={x.id + '#attributesLabel'}> Arrtibutes: </p>
      <ul key={x.id + '#attributeList'}>
        {x.attributes.map((a: MMELDataAttribute) => (
          <li key={a.id}> {describeAttribute(a)} </li>
        ))}
      </ul>
    </>
  );
}

function describeAttribute(x: MMELDataAttribute): JSX.Element {
  const elms: Array<JSX.Element> = [];
  const css: CSSProperties = {};
  if (x.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  elms.push(
    <p key={x.id + '#attributeIDLabel'}>
      {' '}
      <span style={css}>Attribute ID: {x.id} </span>
    </p>
  );
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

function describeProvision(x: MMELProvision): JSX.Element {
  const elms: Array<JSX.Element> = [];
  const css: CSSProperties = {};
  if (x.modality === 'SHALL') {
    css.textDecorationLine = 'underline';
  }
  elms.push(
    <p key={'ui#provisionStatementLabel#' + x.id}>
      {' '}
      Statement: <span style={css}> {x.condition}</span>
    </p>
  );
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
  return <>{elms}</>;
}
