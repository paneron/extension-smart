import styled from '@emotion/styled';
import React, { ChangeEvent, CSSProperties, RefObject } from 'react';
import { Model } from '../../model/model/model';
import * as parser from '../../model/util/parser'
import { StateMan } from '../interface/state';
import { ModelWrapper } from '../model/modelwrapper';
import { functionCollection } from '../util/function';
import { MyCloseButtons } from './unit/closebutton';

const modelfile:RefObject<HTMLInputElement> = React.createRef()
const modelfilename:RefObject<HTMLInputElement> = React.createRef()

const ControlPane: React.FC<StateMan> = (sm:StateMan) => {
  let state = sm.state

  const css:CSSProperties = {
    display: state.cvisible?"inline":"none"
  }

  const readModelFromFile = (result:string) => {
    console.debug("Read model from file")
    state.history.clear()
    state.modelWrapper = new ModelWrapper(parser.parse(result))
    sm.setState(state)
  }

  const newModel = () => {
    state.history.clear()
    state.modelWrapper = new ModelWrapper(new Model())
    sm.setState(state)
  }

  const exportModel = (fn: string | undefined): void => {
    functionCollection.saveLayout()
    var blob = new Blob([state.modelWrapper.model.toModel()], {type: "text/plain"});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = fn==undefined?"default.mmel":fn;
    a.click();
  }
  
  const close = () => {
    state.cvisible = false
    sm.setState(state)
  }

  return <ControlBar style={css}>
    <MyCloseButtons onClick={() => close()}>X</MyCloseButtons>        

    <button onClick={() => modelfile.current?.click()} >Load Model</button>
    <button onClick={() => exportModel(modelfilename.current?.value)} >Download Model</button>    
    <p> Download model name: <input type='text' ref={modelfilename} name="modelfn" defaultValue="default.mmel" /> </p>
    <input type='file' accept=".mmel" onChange={(e) => modelFileSelected(e, readModelFromFile)} ref={modelfile} style={{display: "none"}} />    
    <button onClick={() => newModel()} >New Model</button>    
    
    </ControlBar>
}

const ControlBar = styled.aside`
  position: absolute;
  width: 25%;
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
  let name = e.target.value.split("\\")    
  if (modelfilename.current != undefined) {
    modelfilename.current.value = name[name.length-1]
  }  
  e.target.value = ""
}

export default ControlPane