import { Handle, Position } from 'react-flow-renderer';
import styled from '@emotion/styled';
import React from 'react';
import { NodeContainer } from '../nodecontainer';
import { Process } from '../../model/model/process/process';
import { Approval } from '../../model/model/process/approval';
import * as shapes from './shapes'
import { Dataclass } from '../../model/model/data/dataclass';
import { Registry } from '../../model/model/data/registry';
import { MyDataCheckBox, MyProcessCheckBox, PercentageLabel, ProgressLabel } from './progressmanager';
import { functionCollection } from './function';
import { getFilterColor, getMeasureResultColor } from './legendpane';
import { MapperFunctions } from '../mapper/util/helperfunctions';
import { ModelType } from '../mapper/model/mapperstate';
import { getMapResultColor } from '../mapper/component/mappinglegend';

function onDragStart(event: React.DragEvent<HTMLDivElement>, fromid:string): void {      
  event.dataTransfer.setData("text", fromid)
  console.debug("Drag start", fromid)
}

function onDrop(event: React.DragEvent<HTMLDivElement>, toid:string):void {
  let fromid = event.dataTransfer.getData("text")
  MapperFunctions.addMap(fromid, toid)
  MapperFunctions.updateMap()
  console.debug("Drag end", fromid, toid)
}

export const datacube = (data:NodeContainer) => {
  let color = "none"
  let datanode = data.data
  let elms:Array<JSX.Element> = []
  if (data.data.modelType == undefined) {
    let x = functionCollection.getObjectByID(datanode.represent)
    let y:Dataclass|null = null    
    let isCheckListMode = functionCollection.getStateMan().state.clvisible  
    if (x instanceof Dataclass) {
      y = x
    } else if (x instanceof Registry) {
      y = x.data
    }
    if (y != null) {
      if (isCheckListMode) {
        elms.push(<MyDataCheckBox key={data.id+"#MyDataCheckBox"} data={y} checkUpdated={functionCollection.checkUpdated}/>)
        color = getFilterColor(y.filterMatch)
      }
    }
  }
  return (
    <>
      <Handle type="source" position={Position.Bottom} style={{ borderRadius: 0 }} /> 
      <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
      {shapes.datacubeShape(color)}
      <LongLabel>{datanode.label }</LongLabel>
      {elms}
    </>
  )
}

export const processComponent = (data:NodeContainer) => {    
  let elms:Array<JSX.Element> = []
  let datanode = data.data
  let css:React.CSSProperties = {}
  let pbox:JSX.Element = <></>
  if (data.data.modelType == undefined) {    
    let process = functionCollection.getObjectByID(datanode.represent)

    let state = functionCollection.getStateMan().state
    let isCheckListMode = state.clvisible
    let sm = functionCollection.getStateMan()
    let mtest = sm.state.mtestResult

    if (process instanceof Process) {
      if (process.actor != null) {
        elms.push(<FirstLabel key={process.id+"#ActorLabel"}>{actorIcon}{process.actor.name}</FirstLabel>)
      }
      if (mtest != null) {
        let result = mtest.get(sm.state.modelWrapper.page.id + " " + process.id)
        if (result != undefined) {
          css.background = getMeasureResultColor(result)
        }
      } else if (isCheckListMode) {
        elms.push(<ProgressLabel key={process.id+"#ProgressLabel"}> {process.progress} / {process.job?.length} </ProgressLabel>)
        elms.push(<PercentageLabel key={process.id+"#PercentageLabel"}> {process.percentage}% </PercentageLabel>)    
        elms.push(<MyProcessCheckBox key={process.id+"#ProgressCheckBox"} data={process} checkUpdated={functionCollection.checkUpdated}/>)
        css.background = getFilterColor(process.filterMatch)      
      } else {
        // non-checklist mode
        if (state.simulation != null && state.simulation.element == process) {
          css.background = "lightyellow"
        }
      }
      if (process.page != null) {
        const ret = process.page
        const name = process.id        
        elms.push(<MyButton key={process.id + "#subprocessbutton"} onClick={() => functionCollection.addPageToHistory(ret, name) }>+</MyButton>)
      }
    }  
    pbox = <shapes.ProcessBox className="tooltip" style={css}> <div> {datanode.label} </div> </shapes.ProcessBox>
  } else {
    let sm = MapperFunctions.getStateMan(data.data.modelType)
    let process = MapperFunctions.getObjectByID(sm, datanode.represent)    
    if (process instanceof Process) {
      let pid = process.id
      if (process.actor != null) {
        elms.push(<FirstLabel key={process.id+"#ActorLabel"}>{actorIcon}{process.actor.name}</FirstLabel>)
      }
      if (process.page != null) {
        const ret = process.page
        const name = process.id
        elms.push(<MyButton key={process.id + "#subprocessbutton"} onClick={() => MapperFunctions.addPageToHistory(sm, ret, name) }>+</MyButton>)
      }
      let refs = sm.state.maps
      let ref = refs.get(pid)      
      if (ref != undefined) {
        if (MapperFunctions.isMap && data.data.modelType == ModelType.ReferenceModel) {
          let result = sm.state.modelWrapper.mapped.get(pid)
          if (result != undefined) {
            css.background = getMapResultColor(result)
          }
        }
        if (MapperFunctions.isMap && datanode.modelType == ModelType.ImplementationModel) {
          pbox = <shapes.ProcessBox ref={ref.ref} draggable={true} onDragStart={(event) => onDragStart(event, pid)} style={css}> <div> {datanode.label} </div> </shapes.ProcessBox>
        } else {
          pbox = <shapes.ProcessBox ref={ref.ref} onDrop={(event) => onDrop(event, pid)} style={css}> <div> {datanode.label} </div> </shapes.ProcessBox>
        }        
      }      
    }    
  }

  return (
    <>
    <Handle type="source" position={Position.Bottom} style={{ borderRadius: 0 }} /> 
    {pbox}    
    <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />    
    {elms}
    </>
  )
}

export const approvalComponent = (data:NodeContainer) => {
  let elms:Array<JSX.Element> = []  
  let css:React.CSSProperties = {}
  if (data.data.modelType == undefined) {
    let approval = functionCollection.getObjectByID(data.data.represent)
    let state = functionCollection.getStateMan().state
    let isCheckListMode = state.clvisible    
    if (approval instanceof Approval) {
      if (approval.actor != null) {
        elms.push(<FirstLabel key={approval.id+"#ActorLabel"}>{actorIcon}{approval.actor.name}</FirstLabel>)
        if (approval.approver != null) {
          elms.push(<SecondLabel key={approval.id+"#ApproverLabel"}>{approverIcon}{approval.approver.name}</SecondLabel>)
        }
      } else if (approval.approver != null) {
        elms.push(<FirstLabel key={approval.id+"#ApproverLabel"}>{approverIcon}{approval.approver.name}</FirstLabel>)
      }
      if (isCheckListMode) {
        css.background = getFilterColor(approval.filterMatch)
        elms.push(<MyProcessCheckBox key={approval.id+"#ProgressCheckBox"} data={approval} checkUpdated={functionCollection.checkUpdated}/>)
      } else {
        if (state.simulation != null && state.simulation.element == approval) {
          css.background = "lightyellow"
        }
      }
    }
  } else {
    let sm = MapperFunctions.getStateMan(data.data.modelType)
    let approval = MapperFunctions.getObjectByID(sm, data.data.represent)
    if (approval instanceof Approval) {
      if (approval.actor != null) {
        elms.push(<FirstLabel key={approval.id+"#ActorLabel"}>{actorIcon}{approval.actor.name}</FirstLabel>)
        if (approval.approver != null) {
          elms.push(<SecondLabel key={approval.id+"#ApproverLabel"}>{approverIcon}{approval.approver.name}</SecondLabel>)
        }
      } else if (approval.approver != null) {
        elms.push(<FirstLabel key={approval.id+"#ApproverLabel"}>{approverIcon}{approval.approver.name}</FirstLabel>)
      }      
    }    
  }
  return (
    <>
    <Handle type="source" position={Position.Bottom} style={{ borderRadius: 0 }} /> 
    <shapes.ProcessBox style={css}> {data.data.label} </shapes.ProcessBox>     
    <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />    
    {elms}    
    </>
  )
}

export const startComponent = (data:NodeContainer) => {
  let color = "none"
  if (data.data.modelType == undefined) {
    let state = functionCollection.getStateMan().state
    let isCheckListMode = state.clvisible      
    let x = functionCollection.getObjectByID(data.data.represent)
    if (!isCheckListMode && state.simulation != null && state.simulation.element == x) {
      color = "lightyellow"
    }
  }
  return (
    <>
      <Handle type="source" position={Position.Bottom} style={{ borderRadius: 0 }} />       
      {shapes.startShape(color)}
      <ShortLabel>start</ShortLabel>
    </>
  )
}

export const endComponent = (data:NodeContainer) => {
  let color = "none"
  if (data.data.modelType == undefined) {
    let state = functionCollection.getStateMan().state
    let isCheckListMode = state.clvisible    
    let x = functionCollection.getObjectByID(data.data.represent)
    if (!isCheckListMode && state.simulation != null && state.simulation.element == x) {
      color = "lightyellow"
    }
  }
  return (
    <>            
      <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
      {shapes.endShape(color)}
      <ShortLabel>end</ShortLabel>
    </>
  )
}

export const timerComponent = (data:NodeContainer) => {
  let color = "none"
  if (data.data.modelType == undefined) {
    let state = functionCollection.getStateMan().state
    let isCheckListMode = state.clvisible    
    let x = functionCollection.getObjectByID(data.data.represent)
    if (!isCheckListMode && state.simulation != null && state.simulation.element == x) {
      color = "lightyellow"
    }
  }
  return <>
      <Handle type="source" position={Position.Bottom} style={{ borderRadius: 0 }} /> 
      <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
      {shapes.timerShape(color)}
      <ShortLabel>timer</ShortLabel>
    </>  
}

export const egateComponent = (data:NodeContainer) => {
  let color = "none"
  if (data.data.modelType == undefined) {
    let state = functionCollection.getStateMan().state
    let isCheckListMode = state.clvisible    
    let x = functionCollection.getObjectByID(data.data.represent)
    let sm = functionCollection.getStateMan()
    let mtest = sm.state.mtestResult

    if (x != undefined && mtest != null) {
      let result = mtest.get(sm.state.modelWrapper.page.id + " " + x.id)
      if (result != undefined) {
        color = getMeasureResultColor(result)
      }
    } else if (!isCheckListMode && state.simulation != null && state.simulation.element == x) {
      color = "lightyellow"
    }
  }
  return (
    <>      
      <Handle type="source" position={Position.Bottom} style={{ borderRadius: 0 }} /> 
      <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
      {shapes.egateShape(color)}
      <LongLabel>{data.data.label}</LongLabel>
    </>
  )
}

export const signalcatchComponent = (data:NodeContainer) => {
  let color = "none"
  if (data.data.modelType == undefined) {
    let state = functionCollection.getStateMan().state
    let isCheckListMode = state.clvisible  
    let x = functionCollection.getObjectByID(data.data.represent)
    if (!isCheckListMode && state.simulation != null && state.simulation.element == x) {
      color = "lightyellow"
    }
  }
  return (
    <>      
      <Handle type="source" position={Position.Bottom} style={{ borderRadius: 0 }} /> 
      <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
      {shapes.signalCatchShape(color)}
      <LongLabel>{data.data.label}</LongLabel>
    </>
  )
}

const ShortLabel = styled.div`
  position: absolute;
  left: 0px;
  top: 45px;
  width: 40px;  
  text-align: center;
  font-size: 10px;
`

const LongLabel = styled.div`
  position: absolute;
  left: -50px;
  top: 45px;
  width: 140px;  
  text-align: center;
  font-size: 10px;
`

const FirstLabel = styled.div`
  position: absolute;
  left: 0px;
  top: 45px;
  width: 140px;  
  text-align: center;
  font-size: 10px;
`

const SecondLabel = styled.div`
  position: absolute;
  left: 0px;
  top: 65px;
  width: 140px;  
  text-align: center;
  font-size: 10px;  
`

const ApproverDeco = styled.span`  
  font-size: 14px;
  color: green;
`

const MyButton = styled.button`  
  position: fixed;
  right: -10px;
  top: -10px;
  font-size: 14px;
  color: green;
`

const actorIcon = <svg height="15" width="15">
<circle cx="8" cy="15" r="6" stroke="black" strokeWidth="1" fill="none" />
<circle cx="8" cy="6" r="3" stroke="black" strokeWidth="1" fill="none" />
</svg>

const approverIcon = <ApproverDeco>{"\u2611"}</ApproverDeco>