/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, ControlGroup } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import React, { useContext, useMemo } from 'react';
import ReactFlow, {
  Controls,
  OnLoadParams,
  ReactFlowProvider,
} from 'react-flow-renderer';
import { EditorModel, ModelType } from '../../model/editormodel';
import {
  addToHistory,
  createPageHistory,
  getBreadcrumbs,
  PageHistory,
  popPage,
} from '../../model/history';
import {
  getMapperReactFlowElementsFrom,
  ModelWrapper,
} from '../../model/modelwrapper';
import { EdgeTypes, MapperState, NodeTypes } from '../../model/state';
import { IconControlButton } from '../control/buttons';
import { handleModelOpen } from '../menu/file';
import { SelectedNodeDescription } from '../sidebar/selected';
import {
  createNewMapSet,
  indexModel,
  MapperModelLabel,
  MapperModelType,
  MapProfile,
} from './mapmodel';
import { MapResultType } from './MappingCalculator';
import MappingLegendPane from './mappinglegend';

const ModelDiagram: React.FC<{
  className?: string;
  mapProfile: MapProfile;
  onMapProfileChanged: (mp: MapProfile) => void;
  modelProps: MapperState;
  setProps: (mp: MapperState) => void;
  mapResult?: MapResultType;
  onModelChanged: (model:EditorModel) => void;
}> = ({ className, mapProfile, onMapProfileChanged, modelProps, setProps, mapResult = {}, onModelChanged }) => {
  const { 
    logger, 
    useDecodedBlob, 
    requestFileFromFilesystem 
  } = useContext(DatasetContext);  

  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  function onLoad(params: OnLoadParams) {
    params.fitView();
  }

  function toggleDataVisibility() {
    setProps({ ...modelProps, dvisible: !modelProps.dvisible });
  }

  function setNewModelWrapper(mw: ModelWrapper) {
    setProps({
      ...modelProps,
      history: createPageHistory(mw),
      modelWrapper: mw,
    });
    onModelChanged(mw.model);
  }

  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function onPageChange(updated: PageHistory, newPage: string) {
    modelProps.history = updated;
    modelProps.modelWrapper.page = newPage;
    setProps({ ...modelProps });
  }

  function onProcessClick(pageid: string, processid: string): void {
    const mw = modelProps.modelWrapper;
    mw.page = pageid;
    logger?.log('Go to page', pageid);
    addToHistory(modelProps.history, mw.page, processid);
    setProps({ ...modelProps });
  }

  function drillUp(): void {
    if (modelProps.history.items.length > 0) {
      modelProps.modelWrapper.page = popPage(modelProps.history);
      setProps({ ...modelProps });
    }
  }

  function setMapping(fromid: string, tons: string, toid: string) {    
    logger?.log(`Update mapping from ${fromid} to ${toid}`);
    if (mapProfile.mapSet[tons] === undefined) {
      mapProfile.mapSet[tons] = createNewMapSet(tons);
    }
    const ms = mapProfile.mapSet[tons];
    if (ms.mappings[fromid] === undefined) {
      ms.mappings[fromid] = {};
    }
    ms.mappings[fromid][toid] = { description: '' };
    onMapProfileChanged!({ ...mapProfile });
  }

  const toolbar = (
    <ControlGroup>
      <Button
        text={
          'Open ' + MapperModelLabel[modelProps.modelType as MapperModelType]
        }
        onClick={() => {
          handleModelOpen({
            setNewModelWrapper,
            useDecodedBlob,
            requestFileFromFilesystem,
            logger,
            indexModel
          });          
        }}
      />
      <Button
        disabled={modelProps.history.items.length <= 1}
        onClick={drillUp}
        text="Drill up"
      />
    </ControlGroup>
  );

  const breadcrumbs = getBreadcrumbs(modelProps.history, onPageChange);

  const sidebar = (
    <Sidebar
      stateKey="opened-register-item"
      css={css`
        width: 280px;
        z-index: 1;
      `}
      title="Item metadata"
      blocks={[
        {
          key: 'selected-node',
          title: 'Selected node',
          content: <SelectedNodeDescription />,
        },
      ]}
    />
  );

  return (
    <ReactFlowProvider>
      <Workspace
        className={className}
        toolbar={toolbar}
        sidebar={sidebar}
        navbarProps={{ breadcrumbs }}
      >
        <div
          css={css`
            flex: 1;
            position: relative;
          `}
        >
          <ReactFlow
            key="MMELModel"
            elements={getMapperReactFlowElementsFrom(
              modelProps.modelWrapper,
              modelProps.modelType,
              modelProps.dvisible,
              onProcessClick,
              setMapping,
              mapResult              
            )}            
            onLoad={onLoad}
            onDragOver={onDragOver}
            nodesConnectable={false}
            snapToGrid={true}
            snapGrid={[10, 10]}
            nodeTypes={NodeTypes}
            edgeTypes={EdgeTypes}
            nodesDraggable={false}
          >
            <Controls>
              <IconControlButton
                isOn={modelProps.dvisible}
                onClick={toggleDataVisibility}
                icon="cube"
              />
            </Controls>
          </ReactFlow>
          {modelProps.modelType === ModelType.REF && <MappingLegendPane />}
        </div>
      </Workspace>
    </ReactFlowProvider>
  );
};

export default ModelDiagram;
