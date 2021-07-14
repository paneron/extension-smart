import styled from '@emotion/styled';
import React, { ChangeEvent, CSSProperties, RefObject } from 'react';
import { ModelViewStateMan } from '../model/mapperstate';
import { ModelWrapper } from '../../model/modelwrapper';
import { MyTopRightButtons } from '../../component/unit/closebutton';
import { MapperFunctions } from '../util/helperfunctions';
import { MappingProfile } from '../model/MappingProfile';
import { MMELToText, textToMMEL } from '../../../serialize/MMEL';
import { MMELFactory } from '../../../runtime/modelComponentCreator';

const MapperControlPane: React.FC<{
  sm: ModelViewStateMan;
  elms: Map<string, MappingProfile>;
}> = ({ sm, elms }) => {
  const modelfile: RefObject<HTMLInputElement> = React.createRef();
  const modelfilename: RefObject<HTMLInputElement> = React.createRef();

  const state = sm.state;

  const css: CSSProperties = {
    display: state.cpvisible ? 'inline' : 'none',
  };

  const readModelFromFile = (result: string) => {
    console.debug('Read model from file');
    state.history.clear();
    const model = textToMMEL(result);
    state.modelWrapper = new ModelWrapper(model);
    MapperFunctions.setIsMap(false);
    MapperFunctions.updateMapRef(sm);
    sm.setState(state);
  };

  const newModel = () => {
    state.history.clear();
    state.modelWrapper = new ModelWrapper(MMELFactory.createNewModel());
    MapperFunctions.updateMapRef(sm);
    sm.setState(state);
  };

  const exportModel = (fn: string | undefined): void => {
    MapperFunctions.saveLayout(sm);
    const blob = new Blob([MMELToText(state.modelWrapper.model)], {
      type: 'text/plain',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fn == undefined ? 'default.mmel' : fn;
    a.click();
  };

  const close = () => {
    state.cpvisible = false;
    sm.setState(state);
  };

  const modelFileSelected = (
    e: ChangeEvent<HTMLInputElement>,
    readModel: (x: string) => void
  ) => {
    const flist = e.target.files;
    if (flist != undefined && flist.length > 0) {
      flist[0].text().then(result => {
        readModel(result);
      });
    }
    const name = e.target.value.split('\\');
    if (modelfilename.current != undefined) {
      modelfilename.current.value = name[name.length - 1];
    }
    e.target.value = '';
  };

  return (
    <ControlBar style={css}>
      <MyTopRightButtons onClick={() => close()}>X</MyTopRightButtons>

      <button onClick={() => modelfile.current?.click()}>Load Model</button>
      {/* <button onClick={() => exportModel(modelfilename.current?.value)} >Download Model</button>
    <p> Download model name: <input type='text' ref={modelfilename} name="modelfn" defaultValue="default.mmel" /> </p>
    <input type='file' accept=".mmel" onChange={(e) => modelFileSelected(e, readModelFromFile)} ref={modelfile} style={{display: "none"}} />
    <button onClick={() => newModel()} >New Model</button>     */}
    </ControlBar>
  );
};

const ControlBar = styled.aside`
  position: absolute;
  width: 25%;
  height: 10%;
  bottom: 0;
  right: 0%;
  background-color: white;
  border-style: solid;
  font-size: 12px;
  overflow-y: auto;
  z-index: 100;
`;

export default MapperControlPane;
