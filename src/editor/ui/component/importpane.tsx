import styled from '@emotion/styled';
import React, { ChangeEvent, RefObject } from 'react';
import { StateMan } from '../interface/state';
import * as shape from '../util/shapes';
import { MyCloseButtons } from './unit/closebutton';
import * as parser from '../../model/util/parser'

const importfile:RefObject<HTMLInputElement> = React.createRef()
const ref:RefObject<HTMLSelectElement> = React.createRef()

const ImportPane: React.FC<StateMan> = (sm:StateMan) => {  

  const state = sm.state

  const importModelFromFile = (result:string) => {        
    state.imodel = parser.parse(result)
    state.namespace = state.imodel.meta.namespace    
    sm.setState(state)
  }  

  const updateNamespace = (e:ChangeEvent<HTMLInputElement>) => {
    state.namespace = e.target.value
    sm.setState(state)
  }

  let elms:Array<JSX.Element> = [<option key="option-1" value={""}>{""}</option>]
  if (state.imodel.hps.length > 0) {
    elms.push(<option key="option-2" value={"*"}>{"*"}</option>)
  }
  state.imodel.hps.map((p, index) => {    
    elms.push(<option key={"option"+index} value={p.id}>{p.id}</option>)    
  })

  const close = () => {
    state.importvisible = false
    sm.setState(state)
  }

  const onChange = () => {
    if (ref.current != null) {
      state.importing = ref.current.value
      sm.setState(state)
    }
  }

  return <ComponentBar>    
    <Container>
      Measurement import is not yet implemented
      <MyCloseButtons onClick={() => close()}>X</MyCloseButtons>
      <button onClick={() => importfile.current?.click()}>Open Model</button>      
      <input type='file' accept=".mmel" onChange={(e) => importFileSelected(e, importModelFromFile)} ref={importfile} style={{display: "none"}} />
      Namespace
      <input type='text' value={state.namespace} onChange={(e) => updateNamespace(e)} />
    </Container>
    <Container>      
      Import process
      <select key="ui#selectImportProcess" ref={ref} value={state.importing} onChange={() => onChange()}> {elms} </select>
      {state.importing!=""?<Unit onDragStart={(event) => onDragStart(event, "import")} draggable> {<shape.ProcessBox> {state.importing=="*"?"Entire model":state.importing} </shape.ProcessBox> } </Unit>:""}
    </Container>
    </ComponentBar>
}

const onDragStart = (event:React.DragEvent<HTMLDivElement>, msg:string) => {
  if (event.dataTransfer != null) {
    event.dataTransfer.setData('application/modeleditor', msg)
    event.dataTransfer.effectAllowed = 'move'
  }
}

function importFileSelected(e:ChangeEvent<HTMLInputElement>, readModel:(x:string) => void):void {    
  let flist = e.target.files
  if (flist != undefined && flist.length > 0) {
    flist[0].text().then(result => {
      readModel(result)      
    })
  }  
  e.target.value = ""
}

const ComponentBar = styled.footer`  
  position: absolute;
  width: 90%;
  height: 15%;
  bottom: 0;
  right: 0;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  text-align: center;
  z-index:101;
`

const Unit = styled.div`  
  padding: 10px
`

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50%
`

export default ImportPane