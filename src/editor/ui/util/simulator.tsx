/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { jsx } from '@emotion/react';

import { DataType } from '../../serialize/interface/baseinterface';
import {
  MMELSignalCatchEvent,
  MMELTimerEvent,
} from '../../serialize/interface/eventinterface';
import {
  MMELEdge,
  MMELEGate,
  MMELSubprocessComponent,
} from '../../serialize/interface/flowcontrolinterface';
import {
  MMELApproval,
  MMELProcess,
} from '../../serialize/interface/processinterface';
import { functionCollection } from './function';

export class Simulator {
  static startSimulation() {
    const sm = functionCollection.getStateMan();
    const mw = sm.state.modelWrapper;
    sm.state.simulation = mw.subman.get(mw.page).start;
    sm.state.clvisible = false;
    sm.state.cvisible = false;
    sm.state.fpvisible = false;
    sm.state.nvisible = false;
    sm.state.svisible = false;
    sm.state.edgeDeleteVisible = false;
    sm.state.importvisible = false;
    sm.state.aivisible = false;
    sm.state.measureVisible = false;
    sm.setState(sm.state);
  }

  static getElms(): Array<JSX.Element> {
    const sm = functionCollection.getStateMan();
    const mw = sm.state.modelWrapper;
    const s = sm.state.simulation;
    const elms: Array<JSX.Element> = [];
    if (s !== null) {
      if (s.element !== null) {
        const x = s.element;
        console.debug(x);
        if (x.datatype === DataType.PROCESS) {
          const process = x as MMELProcess;
          elms.push(<h3 key={x.id + '#ProcessID'}> {process.id} </h3>);
          elms.push(<p key={x.id + '#ProcessName'}> Name: {process.name} </p>);
          if (process.provision.length > 0) {
            const pros: Array<JSX.Element> = [];
            process.provision.forEach(p => {
              pros.push(
                <li key={x.id + '#provision#' + p.id}>
                  <p key={x.id + '#provision#' + p.id + 'statement'}>
                    {' '}
                    Statement: {p.condition}{' '}
                  </p>
                  {p.modality !== '' ? (
                    <p key={x.id + '#provision#' + p.id + 'modality'}>
                      {' '}
                      Modality: {p.modality}{' '}
                    </p>
                  ) : (
                    ''
                  )}
                </li>
              );
            });
            elms.push(<ul key={x.id + '#provisionlist'}>{pros}</ul>);
          }
          if (process.input.length > 0) {
            const datas: Array<JSX.Element> = [];
            process.input.forEach(p => {
              datas.push(
                <li key={x.id + '#input#' + p.id}>
                  {p.title}
                  <button
                    key={'simulator#button#inputdatarepo#' + x.id}
                    onClick={() => functionCollection.viewDataRepository(p)}
                  >
                    {' '}
                    Data repository{' '}
                  </button>
                </li>
              );
            });
            elms.push(
              <div key={x.id + '#inputlistdiv'}>
                {' '}
                Input data registry <ul key={x.id + '#inputlist'}>{datas}</ul>
              </div>
            );
          }
          if (process.output.length > 0) {
            const datas: Array<JSX.Element> = [];
            process.output.forEach(p => {
              datas.push(
                <li key={x.id + '#input#' + p.id}>
                  {p.title}
                  <button
                    key={'simulator#button#outputdatarepo#' + x.id}
                    onClick={() => functionCollection.viewDataRepository(p)}
                  >
                    {' '}
                    Data repository{' '}
                  </button>
                </li>
              );
            });
            elms.push(
              <div key={x.id + '#outputlistdiv'}>
                {' '}
                Output data registry <ul key={x.id + '#outputlist'}>{datas}</ul>
              </div>
            );
          }
        } else if (x.datatype === DataType.APPROVAL) {
          const app = x as MMELApproval;
          elms.push(<h3 key={x.id + '#ApprovalID'}> {app.id} </h3>);
          elms.push(<p key={x.id + '#ApprovalName'}> Name: {app.name} </p>);
          if (app.approver !== null) {
            elms.push(
              <p key={x.id + '#ApproverName'}>
                {' '}
                Approved by: {app.approver.name}{' '}
              </p>
            );
          }
          if (app.records.length > 0) {
            const datas: Array<JSX.Element> = [];
            app.records.forEach(p => {
              datas.push(
                <li key={x.id + '#approverecord#' + p.id}>
                  {p.title}
                  <button
                    key={'simulator#button#approvaldatarepo#' + x.id}
                    onClick={() => functionCollection.viewDataRepository(p)}
                  >
                    {' '}
                    Data repository{' '}
                  </button>
                </li>
              );
            });
            elms.push(
              <div key={x.id + '#recordlistdiv'}>
                {' '}
                Approval records <ul key={x.id + '#recordlist'}>{datas}</ul>
              </div>
            );
          }
        } else if (x.datatype === DataType.EGATE) {
          elms.push(<h3 key={x.id + '#EGateID'}> {x.id} </h3>);
          elms.push(
            <p key={x.id + '#Gatewaylabel'}>
              {' '}
              Gateway label: {(x as MMELEGate).label}{' '}
            </p>
          );
        } else if (x.datatype === DataType.TIMEREVENT) {
          const timer = x as MMELTimerEvent;
          elms.push(<h3 key={x.id + '#TimerID'}> {timer.id} </h3>);
          elms.push(
            <p key={x.id + '#Timertype'}> Timer type: {timer.type} </p>
          );
          elms.push(
            <p key={x.id + '#Timerpara'}> Timer parameters: {timer.para} </p>
          );
        } else if (x.datatype === DataType.SIGNALCATCHEVENT) {
          elms.push(<h3 key={x.id + '#SCEventID'}> {x.id} </h3>);
          elms.push(
            <p key={x.id + '#Signal'}>
              {' '}
              Catch signal: {(x as MMELSignalCatchEvent).signal}{' '}
            </p>
          );
        }
        const addon = mw.comman.get(s);
        if (addon.child.length === 0) {
          elms.push(<p key={x.id + '#TheEndText'}> This is the end. </p>);
          elms.push(
            <button
              key={x.id + '#closeButton'}
              onClick={() => Simulator.close()}
            >
              Quit simulation
            </button>
          );
        } else if (addon.child.length === 1 && addon.child[0].to !== null) {
          const target = addon.child[0].to;
          elms.push(
            <button key={x.id + '#nextButton'} onClick={() => goToNext(target)}>
              Next step
            </button>
          );
        } else if (addon.child.length > 1) {
          elms.push(
            <p key={x.id + '#MultipathText'}>
              {' '}
              Multiple paths are availiable.{' '}
            </p>
          );
          sm.state.modelWrapper.page.edges.forEach(e => {
            if (e.from !== null && e.from.element === x) {
              elms.push(getNextButton(x.id, e));
            }
          });
        }
      }
    }
    return elms;
  }

  static close() {
    const sm = functionCollection.getStateMan();
    sm.state.simulation = null;
    sm.setState(sm.state);
  }
}

function goToNext(x: MMELSubprocessComponent) {
  const sm = functionCollection.getStateMan();
  sm.state.simulation = x;
  sm.setState(sm.state);
}

function getNextButton(parentid: string, e: MMELEdge): JSX.Element {
  if (e.to !== null) {
    const target = e.to;
    if (e.description === 'default') {
      return (
        <button
          key={parentid + '#nextButton' + e.to.element?.id}
          onClick={() => goToNext(target)}
        >
          Default option
        </button>
      );
    } else if (e.description === '') {
      return (
        <div key={parentid + '#nextButtonLabel' + e.to.element?.id}>
          Select next step: {e.to.element?.id}
          <button
            key={parentid + '#nextButton' + e.to.element?.id}
            onClick={() => goToNext(target)}
          >
            Go
          </button>
        </div>
      );
    } else {
      return (
        <div key={parentid + '#nextButtonLabel' + e.to.element?.id}>
          Condition: {e.description}
          <button
            key={parentid + '#nextButton' + e.to.element?.id}
            onClick={() => goToNext(target)}
          >
            Condition Met
          </button>
        </div>
      );
    }
  }
  return <></>;
}
