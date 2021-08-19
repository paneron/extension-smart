/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, ControlGroup } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import React, { CSSProperties, useContext, useMemo } from 'react';
import ReactFlow, {
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
import {
  EdgeTypes,
  MapperSelectedInterface,
  MapperState,
  MapperViewOption,
  NodeTypes,
} from '../../model/state';
import { handleModelOpen } from '../menu/file';
import { SelectedNodeDescription } from '../sidebar/selected';
import {
  indexModel,
  MapperModelLabel,
  MapperModelType,
  MapSet,
} from './mapmodel';
import {
  isParentMapFullCovered,
  MappingResultStyles,
  MappingSourceStyles,
  MapResultType,
} from './MappingCalculator';
import MappingLegendPane from './mappinglegend';

const ModelDiagram: React.FC<{
  className?: string;
  viewOption: MapperViewOption;
  mapSet: MapSet;
  onMapSetChanged: (mp: MapSet) => void;
  modelProps: MapperState;
  setProps: (mp: MapperState) => void;
  mapResult?: MapResultType;
  onModelChanged: (model: EditorModel) => void;
  setSelected: (s: MapperSelectedInterface) => void;
  onMove: () => void;
}> = ({
  className,
  viewOption,
  mapSet,
  onMapSetChanged,
  modelProps,
  setProps,
  mapResult = {},
  onModelChanged,
  setSelected,
  onMove,
}) => {
  const { logger, useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);

  const modelType = modelProps.modelType;

  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  function setSelectedId(id: string) {
    setSelected({
      modelType: modelProps.modelType,
      selected: id,
    });
  }

  function onLoad(params: OnLoadParams) {
    params.fitView();
  }

  function setNewModelWrapper(mw: ModelWrapper) {
    setProps({
      ...modelProps,
      history: createPageHistory(mw),
      modelWrapper: mw,
    });
    onModelChanged(mw.model);
    setSelectedId('');
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
    setSelectedId('');
  }

  function drillUp(): void {
    if (modelProps.history.items.length > 0) {
      modelProps.modelWrapper.page = popPage(modelProps.history);
      setProps({ ...modelProps });
      setSelectedId('');
    }
  }

  function setMapping(fromid: string, toid: string) {
    logger?.log(`Update mapping from ${fromid} to ${toid}`);
    if (mapSet.mappings[fromid] === undefined) {
      mapSet.mappings[fromid] = {};
    }
    mapSet.mappings[fromid][toid] = { description: '' };
    onMapSetChanged({ ...mapSet });
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
            indexModel,
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
  const legendcss: CSSProperties = {
    position: 'absolute',
    top: '20px',
    fontSize: '12px',
    overflowY: 'auto',
    zIndex: 90,
  };
  if (modelType === ModelType.REF) {
    legendcss.right = '1%';
  } else {
    legendcss.left = '1%';
  }

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
          content: (
            <SelectedNodeDescription
              model={modelProps.modelWrapper.model}
              pageid={modelProps.modelWrapper.page}
            />
          ),
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
              viewOption.dataVisible,
              onProcessClick,
              setMapping,
              mapSet,
              mapResult,
              setSelectedId,
              isParentMapFullCovered(modelProps.history, mapResult)
            )}
            onLoad={onLoad}
            onDragOver={onDragOver}
            onMove={onMove}
            nodesConnectable={false}
            snapToGrid={true}
            snapGrid={[10, 10]}
            nodeTypes={NodeTypes}
            edgeTypes={EdgeTypes}
            nodesDraggable={false}
          ></ReactFlow>
          {viewOption.legVisible && (
            <MappingLegendPane
              list={
                modelType === ModelType.REF
                  ? MappingResultStyles
                  : MappingSourceStyles
              }
              style={legendcss}
            />
          )}
        </div>
      </Workspace>
    </ReactFlowProvider>
  );
};

export default ModelDiagram;
