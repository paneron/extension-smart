import styled from '@emotion/styled';
import React from 'react';
import { SignalCatchEvent } from '../../model/model/event/signalcatchevent';
import { TimerEvent } from '../../model/model/event/timerevent';
import { GraphNode } from '../../model/model/graphnode';
import { TimerType } from '../../model/util/IDRegistry';
import { ISignalCatchEvent, ITimer } from '../interface/datainterface';
import { StateMan } from '../interface/state';
import { functionCollection } from '../util/function';
import { MyCloseButtons } from './unit/closebutton';
import NormalComboBox from './unit/combobox';
import { ReferenceSelector } from './unit/referenceselect';
import NormalTextField from './unit/textfield';

export const EditTimerPage: React.FC<StateMan> = (sm:StateMan) => {  

  const close = () => {
    sm.state.viewTimer = null
    sm.setState(sm.state)
  }

  let timer = sm.state.viewTimer  

  const setTID = (x:string) => {
    if (timer != null) {
      timer.id = x.replaceAll(/\s+/g,"")
      sm.setState({ ...sm.state })
    }
  }

  const setType = (x:string) => {
    if (timer != null) {
      timer.type = x
      sm.setState({ ...sm.state })
    }
  }  

  const setTPara = (x:string) => {
    if (timer != null) {
      timer.para = x
      sm.setState({ ...sm.state })
    }
  }

  let elms:Array<JSX.Element> = []
  if (timer != null) {
    elms.push(<NormalTextField key="field#timerID" text="Timer ID" value={timer.id} update={setTID} />)
    elms.push(<NormalComboBox  key="field#timerType" text="Timer Type" value={timer.type} options = {TimerType} update={setType} />)
    elms.push(<NormalTextField key="field#timerPara" text="Timer parameter" value={timer.para} update={setTPara} />)
    return (
      <DisplayPane style={{display: sm.state.viewTimer!=null?"inline":"none"}}>
        <MyCloseButtons onClick={() => close()}>X</MyCloseButtons> 
        {elms}        
        <div>
          <button key="processedit#saveButton" onClick={() => saveTimer(sm, sm.state.timer, timer)}> Save </button>
          <button key="processedit#cancelButton" onClick={() => close()}> Cancel </button>    
        </div>
      </DisplayPane>
      )
  }              
  return <></>  
}

export const EditSCEventPage: React.FC<StateMan> = (sm:StateMan) => {  

  const close = () => {
    sm.state.viewSignalEvent = null
    sm.setState(sm.state)
  }

  let scEvent = sm.state.viewSignalEvent  

  let opts:Array<string> = [""]
  sm.state.modelWrapper.model.regs.forEach((r) => {
    opts.push(r.id+"CREATED")
    opts.push(r.id+"UPDATED")
    opts.push(r.id+"DELETED")
  })

  const setEID = (x:string) => {
    if (scEvent != null) {
      scEvent.id = x
      sm.setState({ ...sm.state })
    }
  }

  const setSignal = (x:number) => {
    if (scEvent != null) {
      scEvent.signal = opts[x]
      sm.setState({ ...sm.state })
    }
  }
  
  const setCustomSignal = (x:string) => {
    if (scEvent != null) {
      scEvent.signal = x
      sm.setState({ ...sm.state })
    }
  }

  let elms:Array<JSX.Element> = []
  if (scEvent != null) {
    elms.push(<NormalTextField key="field#scEventID" text="Signal Catch Event ID" value={scEvent.id} update={setEID} />)
    elms.push(<ReferenceSelector key="field#scEventSignal" text="Signal" filterName="Signal filter" value={scEvent.signal} options = {opts} update={setSignal} editable={true} onChange={setCustomSignal}/>)    
    return (
      <DisplayPane style={{display: sm.state.viewSignalEvent!=null?"inline":"none"}}>
        <MyCloseButtons onClick={() => close()}>X</MyCloseButtons> 
        {elms}
        <div>
          <button key="processedit#saveButton" onClick={() => saveSCEvent(sm, sm.state.scEvent, scEvent)}> Save </button>
          <button key="processedit#cancelButton" onClick={() => close()}> Cancel </button>    
        </div>
      </DisplayPane>
      )
  }              
  return <></>  
}

function saveTimer(sm:StateMan, oldValue:TimerEvent|null, newValue:ITimer|null) {
  if (oldValue != null && newValue != null) {
    if (commonUpdate(sm, oldValue, newValue.id)) {
      oldValue.type = newValue.type    
      oldValue.para = newValue.para
      sm.state.viewTimer = null
      sm.state.timer = null      
      sm.setState(sm.state)
    }
  }  
}

function saveSCEvent(sm:StateMan, oldValue:SignalCatchEvent|null, newValue:ISignalCatchEvent|null) {
  if (oldValue != null && newValue != null) {
    if (commonUpdate(sm, oldValue, newValue.id)) {
      oldValue.signal = newValue.signal      
      sm.state.viewSignalEvent = null
      sm.state.scEvent = null      
      sm.setState(sm.state)
    }
  }  
}

function commonUpdate(sm:StateMan, oldValue:GraphNode, newID:string):boolean {
  let idreg = sm.state.modelWrapper.model.idreg
  if (oldValue.id != newID) {
    if (newID == "") {
      alert("ID is empty")
      return false
    }    
    if (idreg.ids.has(newID)) {
      alert("New ID already exists")
      return false
    }
    idreg.ids.delete(oldValue.id)
    idreg.addID(newID, oldValue)
    functionCollection.renameLayoutItem(oldValue.id, newID)
    oldValue.id = newID
  }
  return true
}

const DisplayPane = styled.div`
  position: absolute;
  width:100%;
  height: 100%;
  bottom: 0;
  left: 0;
  background: white;
  font-size: 12px;
  overflow-y: auto;
  border-style: solid;
  z-index:110;
`