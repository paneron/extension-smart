/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@emotion/react';
import React, { useState } from 'react';

import ReactFlow, {
  Controls,
  OnLoadParams,
  ControlButton,
  ReactFlowProvider,
} from 'react-flow-renderer';
import { ModelWrapper } from '../model/modelwrapper';
import { PageHistory } from '../model/history';
import {
  IMapModelState,
  ModelType,
  ModelViewStateMan,
} from './model/mapperstate';
import { MapperFunctions } from './util/helperfunctions';
import { edgeTypes, nodeTypes } from '../interface/state';
import MapperPathPane from './component/Pathpane';
import MapperControlPane from './component/controlpane';
import MapperInfoPane from './component/MapperInfoPane';
import { MappingProfile } from './model/MappingProfile';
import { MMELFactory } from '../../runtime/modelComponentCreator';

const model = MMELFactory.createNewModel();
const modelWrapper = new ModelWrapper(model);

const ModelView: React.FC<{
  type: ModelType;
  maps: Map<string, MappingProfile>;
  isMap: boolean;
  setIsMap: (x: boolean) => void;
  forceupdate: () => void;
}> = ({ type, maps, isMap, setIsMap, forceupdate }) => {
  const [state, setState] = useState<IMapModelState>({
    cpvisible: false,
    datavisible: true,
    infovisible: false,
    history: new PageHistory(type),
    modelWrapper: modelWrapper,
    instance: null,
    type: type,
    maps: maps,
  });

  const updateMap = (): void => {
    if (isMap) {
      forceupdate();
    }
  };

  const updateState = (s: IMapModelState): void => {
    setState(() => ({ ...s }));
  };

  const sm: ModelViewStateMan = { state: state, setState: updateState };

  const onLoad = (params: OnLoadParams) => {
    console.log('flow loaded:', params);
    params.fitView();
    sm.state.instance = params;
    updateState(sm.state);
  };

  console.debug('Debug message: mapper', state);

  const onDragOver = (event: React.DragEvent<any>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const getStateMan = () => {
    return sm;
  };

  /* components */
  const csson: React.CSSProperties = {
    background: '#3d3',
  };

  const cssoff: React.CSSProperties = {};

  const infoButton = (
    <ControlButton
      style={state.infovisible ? csson : cssoff}
      onClick={() => {
        state.infovisible = !state.infovisible;
        updateState(state);
      }}
    >
      I
    </ControlButton>
  );

  const controlPaneButton = (
    <ControlButton
      style={state.cpvisible ? csson : cssoff}
      onClick={() => {
        state.cpvisible = !state.cpvisible;
        updateState(state);
      }}
    >
      Ctl
    </ControlButton>
  );

  const dataVisibleButton = (
    <ControlButton
      style={state.datavisible ? csson : cssoff}
      onClick={() => {
        state.datavisible = !state.datavisible;
        if (!state.datavisible) {
          MapperFunctions.saveLayout(sm);
        }
        updateState(state);
      }}
    >
      Dat
    </ControlButton>
  );

  const mapVisibleButton = (
    <ControlButton
      style={isMap ? csson : cssoff}
      onClick={() => {
        setIsMap(!isMap);
        updateState(state);
      }}
    >
      Map
    </ControlButton>
  );

  /* rendering */
  if (type === ModelType.ImplementationModel) {
    MapperFunctions.getImpStateMan = getStateMan;
    MapperFunctions.updateMap = updateMap;
  } else {
    MapperFunctions.getRefStateMan = getStateMan;
  }

  const elms = state.modelWrapper.getReactFlowElementsFrom(
    state.datavisible,
    false,
    state.type
  );

  return (
    <ReactFlowProvider>
      <ReactFlow
        key="MMELModel"
        elements={elms}
        onLoad={onLoad}
        onMove={forceupdate}
        onDragOver={onDragOver}
        snapToGrid={true}
        snapGrid={[15, 15]}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesConnectable={false}
        nodesDraggable={!isMap}
      >
        <Controls>
          {dataVisibleButton}
          {controlPaneButton}
          {infoButton}
          {state.type === ModelType.ImplementationModel ? mapVisibleButton : ''}
        </Controls>
      </ReactFlow>
      <MapperPathPane {...sm} />
      <MapperInfoPane {...sm} />
      <MapperControlPane
        key={'ControlPane#' + sm.state.type}
        sm={sm}
        elms={maps}
      />
    </ReactFlowProvider>
  );
};

export default ModelView;
