import { Button, ControlGroup } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import React, { useContext } from 'react';
import ReactFlow, {
  Controls,
  OnLoadParams,
  ReactFlowProvider,
} from 'react-flow-renderer';
import { reactFlowContainerLayout } from '../../../css/layout';
import { MGDButtonType } from '../../../css/MGDButton';
import MGDButton from '../../MGDComponents/MGDButton';
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
  isModelWrapper,
  MapperSelectedInterface,
  MapperState,
  MapperViewOption,
  NodeTypes,
} from '../../model/States';
import ComponentSummary from '../popover/ComponentSummary';
import {
  buildHistoryMap,
  indexModel,
  MapperModelLabel,
  MapperModelType,
  MapSet,
} from '../../model/mapmodel';
import {
  isParentMapFullCovered,
  MappingResultStyles,
  MappingSourceStyles,
  MapResultType,
} from '../../utils/map/MappingCalculator';
import LegendPane from '../common/description/LegendPane';
import MappingPartyList from './mappartylist';
import { handleModelOpen } from '../../utils/IOFunctions';
import { MMELDocument } from '../../model/document';
import SMARTDocumentView from './document/DocumentView';
import { Popover2 } from '@blueprintjs/popover2';
import MapperDocumentMenu from '../menu/MapperDocumentMenu';
import RepoMapRefMenus from './repo/RepoMapRefMenu';
import { MMELRepo, RepoIndex } from '../../model/repo';
import { MapDiffStyles } from './MappingsCanvus';
import {
  MappingDiffResultStyles,
  MappingDiffSourceStyles,
} from '../../utils/map/MappingDiff';

const ModelDiagram: React.FC<{
  className?: string;
  viewOption: MapperViewOption;
  mapSet: MapSet;
  diffMapSet: MapSet | undefined;
  onMapSetChanged: (mp: MapSet) => void;
  modelProps: MapperState;
  setProps: (mp: MapperState) => void;
  mapResult?: MapResultType;
  diffMapResult?: MapResultType;
  onModelChanged?: (model: EditorModel) => void;
  setSelected: (s: MapperSelectedInterface) => void;
  onMappingEdit: (from: string, to: string) => void;
  issueNavigationRequest?: (id: string) => void;
  getPartnerModelElementById: (id: string) => string;
  onClose: () => void;
  isRepoMode?: boolean;
  setRefRepo?: (x: MMELRepo) => void;
  index: RepoIndex;
}> = ({
  className,
  viewOption,
  mapSet,
  diffMapSet,
  onMapSetChanged,
  modelProps,
  setProps,
  mapResult = {},
  diffMapResult,
  onModelChanged,
  setSelected,
  onMappingEdit,
  issueNavigationRequest,
  getPartnerModelElementById,
  onClose,
  isRepoMode = false,
  setRefRepo,
  index,
}) => {
  const { logger, requestFileFromFilesystem } = useContext(DatasetContext);

  const modelType = modelProps.modelType;
  const mw = modelProps.modelWrapper;
  const isImp = modelType === ModelType.IMP;

  function setSelectedId(id: string) {
    setSelected({
      modelType: modelProps.modelType,
      selected: id,
    });
  }

  function onLoad(params: OnLoadParams) {
    params.fitView();
  }

  function setModelWrapper(mw: ModelWrapper) {
    setProps({
      ...modelProps,
      history: createPageHistory(mw),
      modelWrapper: mw,
      historyMap: buildHistoryMap(mw),
    });
    if (onModelChanged !== undefined) {
      onModelChanged(mw.model);
    }
    setSelectedId('');
  }

  function onDocumentLoaded(doc: MMELDocument) {
    setProps({
      history: { items: [] },
      historyMap: {},
      modelWrapper: doc,
      modelType,
    });
    setSelectedId('');
  }

  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function onPageChange(updated: PageHistory, newPage: string) {
    if (isModelWrapper(mw)) {
      modelProps.history = updated;
      mw.page = newPage;
      setProps({ ...modelProps });
    }
  }

  function onProcessClick(pageid: string, processid: string): void {
    if (isModelWrapper(mw)) {
      mw.page = pageid;
      addToHistory(modelProps.history, mw.page, processid);
      setProps({ ...modelProps });
      setSelectedId('');
    }
  }

  function drillUp(): void {
    if (isModelWrapper(mw)) {
      if (modelProps.history.items.length > 0) {
        mw.page = popPage(modelProps.history);
        setProps({ ...modelProps });
        setSelectedId('');
      }
    }
  }

  function setMapping(fromid: string, toid: string) {
    logger?.log(`Update mapping from ${fromid} to ${toid}`);
    if (mapSet.mappings[fromid] === undefined) {
      mapSet.mappings[fromid] = {};
    }
    mapSet.mappings = { ...mapSet.mappings };
    if (mapSet.mappings[fromid][toid] === undefined) {
      mapSet.mappings[fromid][toid] = {
        description: '',
        justification: '',
      };
      onMapSetChanged({ ...mapSet });
    }
  }

  const toolbar = (
    <ControlGroup>
      {!isRepoMode && (
        <>
          <Button
            onClick={() => {
              handleModelOpen({
                setModelWrapper,
                requestFileFromFilesystem,
                logger,
                indexModel,
              });
            }}
          >
            {'Open ' +
              MapperModelLabel[modelProps.modelType as MapperModelType]}
          </Button>
          {!isImp && (
            <Popover2
              minimal
              placement="bottom-start"
              content={<MapperDocumentMenu setDocument={onDocumentLoaded} />}
            >
              <Button>Open Document</Button>
            </Popover2>
          )}
        </>
      )}
      {isRepoMode && setRefRepo && (
        <RepoMapRefMenus
          setModelWrapper={setModelWrapper}
          setDocument={onDocumentLoaded}
          setRefRepo={setRefRepo}
          index={index}
        />
      )}
      {!isRepoMode && <MGDButton onClick={onClose}> Close </MGDButton>}
      {isModelWrapper(mw) && (
        <MGDButton
          type={MGDButtonType.Secondary}
          disabled={modelProps.history.items.length <= 1}
          onClick={drillUp}
        >
          Drill up
        </MGDButton>
      )}
    </ControlGroup>
  );

  const ComponentShortDescription: React.FC<{ id: string }> = function ({
    id,
  }) {
    return isModelWrapper(mw) ? (
      <ComponentSummary id={id} model={mw.model} />
    ) : (
      <></>
    );
  };

  const MappingList: React.FC<{ id: string }> = function ({ id }) {
    return (
      <MappingPartyList
        id={id}
        type={modelProps.modelType}
        mapping={mapSet.mappings}
        onMappingEdit={onMappingEdit}
        issueNavigationRequest={issueNavigationRequest}
        getNodeInfoById={getPartnerModelElementById}
      />
    );
  };

  const breadcrumbs = isModelWrapper(mw)
    ? getBreadcrumbs(modelProps.history, onPageChange)
    : [{ label: <>{mw.id}</> }];

  return (
    <ReactFlowProvider>
      <Workspace
        className={className}
        toolbar={toolbar}
        navbarProps={{ breadcrumbs }}
      >
        <div style={reactFlowContainerLayout}>
          {isModelWrapper(mw) ? (
            <ReactFlow
              key="MMELModel"
              elements={getMapperReactFlowElementsFrom(
                mw,
                index,
                modelProps.modelType,
                viewOption.dataVisible,
                onProcessClick,
                setMapping,
                mapSet,
                diffMapSet,
                mapResult,
                diffMapResult,
                setSelectedId,
                isParentMapFullCovered(modelProps.history, mapResult),
                diffMapResult
                  ? isParentMapFullCovered(modelProps.history, diffMapResult)
                  : undefined,
                ComponentShortDescription,
                MappingList,
                viewOption.idVisible,
                setRefRepo
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
              <Controls showInteractive={false} />
            </ReactFlow>
          ) : (
            <SMARTDocumentView
              mmelDoc={mw}
              onDragOver={onDragOver}
              setMapping={setMapping}
              mapSet={mapSet}
              diffMapSet={diffMapSet}
              MappingList={MappingList}
              setSelected={setSelectedId}
            />
          )}
          {viewOption.legVisible &&
            (isImp ? (
              <>
                <LegendPane
                  list={
                    diffMapSet ? MappingDiffSourceStyles : MappingSourceStyles
                  }
                  onLeft
                />
                {diffMapSet && (
                  <LegendPane list={MapDiffStyles} onLeft={false} arrow />
                )}
              </>
            ) : (
              isModelWrapper(mw) && (
                <LegendPane
                  list={
                    diffMapSet ? MappingDiffResultStyles : MappingResultStyles
                  }
                  onLeft={false}
                />
              )
            ))}
        </div>
      </Workspace>
    </ReactFlowProvider>
  );
};

export default ModelDiagram;
