import styled from '@emotion/styled';
import React, { ChangeEvent, RefObject } from 'react';
import { AIAgent } from '../../ai/aiagent';
import { StateMan } from '../interface/state';
import { ModelWrapper } from '../model/modelwrapper';
import { MyCloseButtons } from './unit/closebutton';

const modelfile:RefObject<HTMLInputElement> = React.createRef()

const AIPane: React.FC<StateMan> = (sm:StateMan) => {        
  let state = sm.state  

  const readModelFromFile = (result:string) => {
    console.debug("Transforming XML to model")
    state.history.clear()
    state.modelWrapper = new ModelWrapper(AIAgent.xmlToModel(result))
    sm.setState(state)
  }
  
  const close = () => {
    state.aivisible = false
    sm.setState(state)
  }

  return <ControlBar>
    <MyCloseButtons onClick={() => close()}>X</MyCloseButtons>        

    <button onClick={() => modelfile.current?.click()} >Transform XML to Model</button>    
    <input type='file' accept=".xml" onChange={(e) => modelFileSelected(e, readModelFromFile)} ref={modelfile} style={{display: "none"}} />
    
    </ControlBar>
}

const ControlBar = styled.aside`
  position: absolute;
  width: 20%;
  height: 30%;
  bottom: 0;
  right: 0%;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  z-index:100;  
`

function modelFileSelected(e:ChangeEvent<HTMLInputElement>, readModel:(x:string) => void):void {    
  let flist = e.target.files
  if (flist != undefined && flist.length > 0) {
    flist[0].text().then(result => {
      readModel(result)      
    })
  }    
  e.target.value = ""
}

export default AIPane