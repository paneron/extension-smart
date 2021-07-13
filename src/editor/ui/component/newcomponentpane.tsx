import styled from '@emotion/styled';
import React, { RefObject } from 'react';
import { StateMan } from '../interface/state';
import * as shape from '../util/shapes';
import { MyCloseButtons } from './unit/closebutton';

const ref:RefObject<HTMLSelectElement> = React.createRef()

const NewComponentPane: React.FC<StateMan> = (sm:StateMan) => {  

  const state = sm.state

  let elms:Array<JSX.Element> = [<option key="option-1" value={""}>{""}</option>]
  let page = state.modelWrapper.page
  state.modelWrapper.model.hps.map((p, index) => {
    if (!page.map.has(p.id)) {
      elms.push(<option key={"option"+index} value={p.id}>{p.id}</option>)
    }
  })

  const close = () => {
    state.nvisible = false
    sm.setState(state)
  }

  const onChange = () => {
    if (ref.current != null) {                      
      state.addingexisting = ref.current.value
      sm.setState(state)
    }
  }

  return <ComponentBar>
    <Container>
      <MyCloseButtons onClick={() => close()}>X</MyCloseButtons>
      <Unit onDragStart={(event) => onDragStart(event, "process")} draggable> {<shape.ProcessBox> Process </shape.ProcessBox> } </Unit>
      <Unit onDragStart={(event) => onDragStart(event, "approval")} draggable> {<shape.ProcessBox> Approval </shape.ProcessBox>} </Unit>
      <Unit onDragStart={(event) => onDragStart(event, "end")} draggable> {shape.endShape("none")} </Unit>
      <Unit onDragStart={(event) => onDragStart(event, "timer")} draggable> {shape.timerShape("none")} </Unit>
      <Unit onDragStart={(event) => onDragStart(event, "signalcatch")} draggable> {shape.signalCatchShape("none")} </Unit>
      <Unit onDragStart={(event) => onDragStart(event, "egate")} draggable> {shape.egateShape("none")} </Unit>      
    </Container>
    <Container>
        Existing process
        <select key="ui#selectExsitingProcess" ref={ref} value={state.addingexisting} onChange={() => onChange()}> {elms} </select>
        {state.addingexisting!=""?<Unit onDragStart={(event) => onDragStart(event, "custom")} draggable={true}> {<shape.ProcessBox> {state.addingexisting} </shape.ProcessBox> } </Unit>:""}
    </Container>
    </ComponentBar>
}

const onDragStart = (event:React.DragEvent<HTMLDivElement>, msg:string) => {
  if (event.dataTransfer != null) {
    event.dataTransfer.setData('application/modeleditor', msg)
    event.dataTransfer.effectAllowed = 'move'
  }
}

const ComponentBar = styled.footer`  
  position: absolute;
  width: 80%;
  height: 15%;
  bottom: 0;
  right: 0%;
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

export default NewComponentPane