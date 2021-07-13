/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { jsx } from '@emotion/react';

import { SignalCatchEvent } from "../../model/model/event/signalcatchevent";
import { TimerEvent } from "../../model/model/event/timerevent";
import { Edge } from "../../model/model/flow/edge";
import { SubprocessComponent } from "../../model/model/flow/subprocess";
import { EGate } from "../../model/model/gate/egate";
import { Approval } from "../../model/model/process/approval";
import { Process } from "../../model/model/process/process";
import { functionCollection } from "./function";

export class Simulator {
  
  static startSimulation() {
    let sm = functionCollection.getStateMan()
    sm.state.simulation = sm.state.modelWrapper.page.start
    sm.state.clvisible = false
    sm.state.cvisible = false
    sm.state.fpvisible = false
    sm.state.nvisible = false
    sm.state.svisible = false
    sm.state.edgeDeleteVisible = false
    sm.state.importvisible = false
    sm.state.aivisible = false
    sm.state.measureVisible = false
    sm.setState(sm.state)
  }
  
  static getElms():Array<JSX.Element> {
    let sm = functionCollection.getStateMan()
    let s = sm.state.simulation
    let elms:Array<JSX.Element> = []
    if (s != null) {
      if (s.element != null) {
        let x = s.element
        console.debug(x)
        if (x instanceof Process) {
          elms.push(<h3 key={x.id+"#ProcessID"}> {x.id} </h3>)
          elms.push(<p key={x.id+"#ProcessName"}> Name: {x.name} </p>)          
          if (x.provision.length > 0) {
            let pros:Array<JSX.Element> = []
            x.provision.forEach((p) => {
              pros.push(<li key={x.id+"#provision#"+p.id}>                
                <p key={x.id+"#provision#"+p.id+"statement"}> Statement: {p.condition} </p>
                {p.modality != ""?<p key={x.id+"#provision#"+p.id+"modality"}> Modality: {p.modality} </p>:""}
              </li>)
            })
            elms.push(<ul key={x.id+"#provisionlist"}>{pros}</ul>)
          }
          if (x.input.length > 0) {
            let datas:Array<JSX.Element> = []
            x.input.forEach((p) => {
              datas.push(<li key={x.id+"#input#"+p.id}>                
                {p.title}
                <button key={"simulator#button#inputdatarepo#"+x.id} onClick={()=>functionCollection.viewDataRepository(p)}> Data repository </button>
              </li>)
            })
            elms.push(<div key={x.id+"#inputlistdiv"}> Input data registry <ul key={x.id+"#inputlist"}>{datas}</ul></div>)
          }
          if (x.output.length > 0) {
            let datas:Array<JSX.Element> = []
            x.output.forEach((p) => {
              datas.push(<li key={x.id+"#input#"+p.id}>                
                {p.title}
                <button key={"simulator#button#outputdatarepo#"+x.id} onClick={()=>functionCollection.viewDataRepository(p)}> Data repository </button>
              </li>)
            })
            elms.push(<div key={x.id+"#outputlistdiv"}> Output data registry <ul key={x.id+"#outputlist"}>{datas}</ul></div>)
          }
        } else if (x instanceof Approval) {
          elms.push(<h3 key={x.id+"#ApprovalID"}> {x.id} </h3>)
          elms.push(<p key={x.id+"#ApprovalName"}> Name: {x.name} </p>) 
          if (x.approver != null) {
            elms.push(<p key={x.id+"#ApproverName"}> Approved by: {x.approver.name} </p>)
          }
          if (x.records.length > 0) {
            let datas:Array<JSX.Element> = []
            x.records.forEach((p) => {
              datas.push(<li key={x.id+"#approverecord#"+p.id}>                
                {p.title}
                <button key={"simulator#button#approvaldatarepo#"+x.id} onClick={()=>functionCollection.viewDataRepository(p)}> Data repository </button>
              </li>)
            })
            elms.push(<div key={x.id+"#recordlistdiv"}> Approval records <ul key={x.id+"#recordlist"}>{datas}</ul></div>)
          }
        } else if (x instanceof EGate) {
          elms.push(<h3 key={x.id+"#EGateID"}> {x.id} </h3>)
          elms.push(<p key={x.id+"#Gatewaylabel"}> Gateway label: {x.label} </p>)        
        } else if (x instanceof TimerEvent) {
          elms.push(<h3 key={x.id+"#TimerID"}> {x.id} </h3>)
          elms.push(<p key={x.id+"#Timertype"}> Timer type: {x.type} </p>)        
          elms.push(<p key={x.id+"#Timerpara"}> Timer parameters: {x.para} </p>)        
        } else if (x instanceof SignalCatchEvent) {
          elms.push(<h3 key={x.id+"#SCEventID"}> {x.id} </h3>)
          elms.push(<p key={x.id+"#Signal"}> Catch signal: {x.signal} </p>)                  
        }
        if (s.child.length == 0) {
          elms.push(<p key={x.id+"#TheEndText"}> This is the end. </p>)
          elms.push(<button key={x.id+"#closeButton"} onClick={() => Simulator.close()}>Quit simulation</button>)
        } else if (s.child.length == 1 && s.child[0].to != null) {
          let target = s.child[0].to
          elms.push(<button key={x.id+"#nextButton"} onClick={() => goToNext(target)}>Next step</button>)            
        } else if (s.child.length > 1) {
          elms.push(<p key={x.id+"#MultipathText"}> Multiple paths are availiable. </p>)
          sm.state.modelWrapper.page.edges.forEach((e) => {
            if (e.from != null && e.from.element == x) {
              elms.push(getNextButton(x.id, e))
            }
          })
        }        
      }
    }
    return elms
  }

  static close() {
    let sm = functionCollection.getStateMan()
    sm.state.simulation = null    
    sm.setState(sm.state)
  }

}

function goToNext(x:SubprocessComponent) {
  let sm = functionCollection.getStateMan()
  sm.state.simulation = x
  sm.setState(sm.state)
}

function getNextButton(parentid:string, e:Edge):JSX.Element {  
  if (e.to != null) {
    let target = e.to
    if (e.description == "default") {
      return <button key={parentid+"#nextButton"+e.to.element?.id} onClick={() => goToNext(target)}>Default option</button>      
    } else if (e.description == "") {
      return <div key={parentid+"#nextButtonLabel"+e.to.element?.id}> 
        Select next step: {e.to.element?.id}
        <button key={parentid+"#nextButton"+e.to.element?.id} onClick={() => goToNext(target)}>Go</button>
      </div>
    } else {
      return <div key={parentid+"#nextButtonLabel"+e.to.element?.id}> 
        Condition: {e.description}
        <button key={parentid+"#nextButton"+e.to.element?.id} onClick={() => goToNext(target)}>Condition Met</button>
      </div>
    }
  }
  return <></>
}
