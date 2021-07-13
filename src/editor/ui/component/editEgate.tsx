/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React, { CSSProperties } from 'react'
import { Edge } from '../../model/model/flow/edge';
import { EGate } from '../../model/model/gate/egate';
import { IEGate } from '../interface/datainterface';
import { StateMan } from '../interface/state';
import { functionCollection } from '../util/function';
import { MyCloseButtons } from './unit/closebutton';
import { ReferenceSelector } from './unit/referenceselect';
import NormalTextField from './unit/textfield';

const css:CSSProperties = {
  border: "1px solid black",
  width: "90%"
}

export const EditEGatePage: React.FC<StateMan> = (sm:StateMan) => {  

  const close = () => {
    sm.state.viewEGate = null
    sm.setState(sm.state)
  }

  let egate = sm.state.viewEGate

  const setGID = (x:string) => {
    if (egate != null) {
      egate.id = x.replaceAll(/\s+/g,"")
      sm.setState({ ...sm.state })
    }
  }

  const setLabel = (x:string) => {
    if (egate != null) {
      egate.label = x
      sm.setState({ ...sm.state })
    }
  }

  const setDesc = (index:number, x:string) => {
    if (egate != null) {
      egate.edges[index].description = x
      if (x == "default") {
        egate.edges.forEach((e, i) => {
          if (i != index && e.description == "default") {
            e.description = ""
          }
        })
      }
      sm.setState({ ...sm.state })
    }
  }

  const selectMeasure = (index:number, x:number) => {
    if (egate != null && x != -1) {
      egate.edges[index].condition += "["+types[x]+"]"      
      sm.setState({ ...sm.state })
    }    
  }

  const setCond = (index:number, x:string) => {
    if (egate != null) {
      egate.edges[index].condition = x
      if (x == "default") {
        egate.edges.forEach((e, i) => {
          if (i != index && e.condition == "default") {
            e.condition = ""
          }
        })
      }
      sm.setState({ ...sm.state })
    }
  }  

  let types: Array<string> = []    
  sm.state.modelWrapper.model.vars.forEach((v)=>{
    types.push(v.id)
  })
  let elms:Array<JSX.Element> = []
  if (egate != null) {
    elms.push(<NormalTextField key="field#egateID" text="Exclusive Gateway ID" value={egate.id} update={setGID} />)    
    elms.push(<NormalTextField key="field#egateLabel" text="Label" value={egate.label} update={setLabel} />)    
    let innerElms:Array<JSX.Element> = []
    egate.edges.forEach((e, index) => {
      innerElms.push(<div key={"field#edgeConditionLabel#"+index} style={css}>
        Edge to {e.target}
        <NormalTextField key={"field#edgeCondition#"+index} text="Description" value={e.description} update={(x) => setDesc(index, x)} />
        <ReferenceSelector
          key="field#edgeCondition"
          text="Condition"
          filterName="Measurement filter"
          editable={true}
          value={e.condition}
          options = {types}
          update={(x)=>selectMeasure(index, x)}
          onChange = {(x) => setCond(index, x)} />
        <button key={"defaultbutton#edgeCondition#"+index} onClick={() => {
          setDesc(index, "default")
          setCond(index, "default")}
        }> Set default </button>
        <button key={"emptybutton#edgeCondition#"+index} onClick={() => {
          setDesc(index, "")
          setCond(index, "")}
        }> Set empty </button>    
      </div>)
    })
    elms.push(<div key="field#edgesLabel" style={css}> Edge conditions {innerElms} </div>)
    return (
      <DisplayPane style={{display: sm.state.viewEGate!=null?"inline":"none"}}>
        <MyCloseButtons onClick={() => close()}>X</MyCloseButtons> 
        {elms}        
        <div key="div#buttons">
          <button key="processedit#saveButton" onClick={() => saveEGate(sm, sm.state.eGate, egate)}> Save </button>
          <button key="processedit#cancelButton" onClick={() => close()}> Cancel </button>    
        </div>
      </DisplayPane>
      )
  }              
  return <></>  
}

function saveEGate(sm:StateMan, oldValue:EGate|null, newValue:IEGate|null) {
  if (oldValue != null && newValue != null) {
    let idreg = sm.state.modelWrapper.model.idreg
    if (oldValue.id != newValue.id) {
      if (newValue.id == "") {
        alert("ID is empty")
        return false
      }
      if (idreg.ids.has(newValue.id)) {
        alert("New ID already exists")
        return false
      }
      idreg.ids.delete(oldValue.id)
      idreg.addID(newValue.id, oldValue)
      functionCollection.renameLayoutItem(oldValue.id, newValue.id)
      oldValue.id = newValue.id
    }
    oldValue.label = newValue.label    
    newValue.edges.forEach((e) => {
      let edge = idreg.edgeids.get(e.id)
      if (edge == undefined) {
        console.error("Edge not found", e.id)
      } else if (edge instanceof Edge) {
        edge.description = e.description
        edge.condition = e.condition
      } else {
        console.error("Found object is not an Edge", e.id)
      }
    })
    sm.state.viewEGate = null
    sm.state.eGate = null    
    sm.setState(sm.state)
  }
  return;
}

const DisplayPane = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
  left: 0;
  background: white;
  font-size: 12px;
  overflow-y: auto;
  border-style: solid;
  z-index:110;
`
