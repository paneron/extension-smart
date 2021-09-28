/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext, useMemo, useState } from 'react';

import ReactFlow, {
  Controls,
  OnLoadParams,
  ReactFlowProvider,
} from 'react-flow-renderer';

import {
  ControlGroup,
  IToaster,
  IToastProps,
  Toaster,
} from '@blueprintjs/core';
import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';

import {
  createEditorModelWrapper,
  getViewerReactFlowElementsFrom,
  ModelWrapper,
} from '../model/modelwrapper';
import {
  addToHistory,
  createPageHistory,
  getBreadcrumbs,
  PageHistory,
  popPage,
} from '../model/history';
import { createNewEditorModel } from '../utils/EditorFactory';
import { EdgeTypes, NodeTypes, ViewerState } from '../model/States';
import { SelectedNodeDescription } from './sidebar/selected';
import MGDButton from '../MGDComponents/MGDButton';
import { MGDButtonType } from '../../css/MGDButton';
import { react_flow_container_layout, sidebar_layout } from '../../css/layout';
import { DataVisibilityButton } from './control/buttons';
import SearchComponentPane from './sidebar/search';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
} from '../utils/SearchFunctions';
import { handleModelOpen } from '../utils/IOFunctions';
import { SidebarBlockConfig } from '@riboseinc/paneron-extension-kit/widgets/Sidebar/Block';
import { Popover2 } from '@blueprintjs/popover2';
import ViewToolMenu from './menu/ViewToolMenu';
import MeasureCheckPane from './measurement/MeasurementValidationPane';
import { ViewFunctionInterface } from '../model/ViewFunctionModel';
import LegendPane from './common/description/LegendPane';
import { loadPlugin } from './application/plugin';
import { buildModelLinks, getNamespace } from '../utils/ModelFunctions';
import ChecklistConfigPane from './checklist/CheckListConfigPane';
import {
  MMELProvision,
  MMELReference,
} from '../serialize/interface/supportinterface';
import { MMELDataAttribute } from '../serialize/interface/datainterface';
import SimulationPane from './sidebar/SimulationPane';
import RegistrySummary from './summary/RegistrySummary';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

export enum FunctionPage {
  Simulation = 'simulation',
  Parameterized = 'para',
  Measurement = 'measurement',
  Checklist = 'checklist',
  DataSummary = 'datasummary'
}

export const FuntionNames: Record<FunctionPage, string> = {
  [FunctionPage.Simulation]: 'Simulation',
  [FunctionPage.Measurement]: 'Measurement validation',
  [FunctionPage.Parameterized]: 'Parameterized view',
  [FunctionPage.Checklist]: 'Self-assessment checklist',
  [FunctionPage.DataSummary]: 'Registry summary',
};

const ModelViewer: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  const { logger, useDecodedBlob, requestFileFromFilesystem } =
    useContext(DatasetContext);

  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [state, setState] = useState<ViewerState>({
    dvisible: true,
    modelWrapper: initModelWrapper,
    history: createPageHistory(initModelWrapper),
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Set<string>>(
    new Set<string>()
  );
  const [funPage, setFunPage] = useState<FunctionPage>(FunctionPage.Simulation);
  const [view, setView] = useState<ViewFunctionInterface | undefined>(
    undefined
  );
  const [toaster] = useState<IToaster>(Toaster.create());

  function showMsg(msg: IToastProps) {
    toaster.show(msg);
  }

  function onLoad(params: OnLoadParams) {
    logger?.log('flow loaded');
    params.fitView();
  }

  function toggleDataVisibility() {
    setState({ ...state, dvisible: !state.dvisible });
  }

  function setModelWrapper(mw: ModelWrapper) {
    setView(undefined);
    setState({ ...state, history: createPageHistory(mw), modelWrapper: mw });
  }

  function onPageChange(updated: PageHistory, newPage: string) {
    state.history = updated;
    state.modelWrapper.page = newPage;
    setState({ ...state });
  }

  function onProcessClick(pageid: string, processid: string): void {
    if (
      view !== undefined &&
      view.navigationEnabled !== undefined &&
      !view.navigationEnabled
    ) {
      toaster.show({
        message: view.navigationErrorMsg ?? 'Error',
        intent: 'danger',
      });
    } else {
      onNavigationDown(pageid, processid);
    }
  }

  function onNavigationDown(pageid: string, processid: string): void {
    const mw = state.modelWrapper;
    mw.page = pageid;
    logger?.log('Go to page', pageid);
    addToHistory(state.history, mw.page, processid);
    setState({ ...state });
  }

  function onNavigationUp(): void {
    if (state.history.items.length > 0) {
      state.modelWrapper.page = popPage(state.history);
      setState({ ...state });
    }
  }

  function drillUp(): void {
    if (
      view !== undefined &&
      view.navigationEnabled !== undefined &&
      !view.navigationEnabled
    ) {
      toaster.show({
        message: view.navigationErrorMsg ?? 'Error',
        intent: 'danger',
      });
    } else {
      onNavigationUp();
    }
  }

  function onPageAndHistroyChange(
    selected: string,
    pageid: string,
    history: PageHistory
  ) {
    setSelected(selected);
    setState({
      ...state,
      history,
      modelWrapper: { ...state.modelWrapper, page: pageid },
    });
  }

  function getStyleById(id: string) {
    return view !== undefined
      ? view.getStyleById(id, mw.page, view.data)
      : getHighlightedStyleById(id, selected, searchResult);
  }

  function getSVGColorById(id: string) {
    return view !== undefined
      ? view.getSVGColorById(id, mw.page, view.data)
      : getHighlightedSVGColorById(id, selected, searchResult);
  }

  function resetSearchElements(set: Set<string>) {
    setSelected(null);
    setSearchResult(set);
  }

  function getEdgeColor(id: string): string {
    if (view !== undefined && view.getEdgeColor !== undefined) {
      return view.getEdgeColor(id, state.modelWrapper.page, view.data);
    }
    return '';
  }

  function isEdgeAnimated(id: string): boolean {
    if (view !== undefined && view.isEdgeAnimated !== undefined) {
      return view.isEdgeAnimated(id, state.modelWrapper.page, view.data);
    }
    return false;
  }

  const mw = state.modelWrapper;
  const model = mw.model;
  const namespace = getNamespace(model);

  const FunPages: Record<FunctionPage, SidebarBlockConfig> = {
    [FunctionPage.Simulation]: {
      key: FunctionPage.Simulation,
      title: FuntionNames[FunctionPage.Simulation],
      collapsedByDefault: false,
      content: (
        <SimulationPane
          model={model}
          setView={setView}
          page={state.modelWrapper.page}
          history={state.history}
          drillUp={onNavigationUp}
          goToPage={onNavigationDown}
        />
      ),
    },
    [FunctionPage.Measurement]: {
      key: FunctionPage.Measurement,
      title: FuntionNames[FunctionPage.Measurement],
      collapsedByDefault: false,
      content: (
        <MeasureCheckPane model={model} setView={setView} showMsg={showMsg} />
      ),
    },
    [FunctionPage.Parameterized]: {
      key: FunctionPage.Parameterized,
      title: FuntionNames[FunctionPage.Parameterized],
      collapsedByDefault: false,
      content: (
        <MeasureCheckPane
          model={model}
          setView={setView}
          showMsg={showMsg}
          branchOnly
        />
      ),
    },
    [FunctionPage.Checklist]: {
      key: FunctionPage.Checklist,
      title: FuntionNames[FunctionPage.Checklist],
      collapsedByDefault: false,
      content: <ChecklistConfigPane setView={setView} model={model} />,
    },
    [FunctionPage.DataSummary]: {
      key: FunctionPage.DataSummary,
      title: FuntionNames[FunctionPage.DataSummary],
      collapsedByDefault: false,
      content: <RegistrySummary model={model} onChange={onPageAndHistroyChange} resetSearchElements={resetSearchElements}/>,
    },
  };

  const ViewStyleComponentDesc: React.FC<{ id: string }> | undefined =
    view !== undefined && view.ComponentToolTip !== undefined
      ? function ({ id }) {
          const SD = view.ComponentToolTip!;
          return <SD id={id} pageid={mw.page} data={view.data} />;
        }
      : undefined;

  const NodeAddon: React.FC<{ id: string }> | undefined =
    view !== undefined && view.NodeAddon !== undefined
      ? function ({ id }) {
          const Addon = view.NodeAddon!;
          return (
            <Addon
              element={model.elements[id]}
              pageid={mw.page}
              data={view.data}
            />
          );
        }
      : undefined;

  const CustomAttribute:
    | React.FC<{
        att: MMELDataAttribute;
        getRefById?: (id: string) => MMELReference | null;
        dcid: string;
      }>
    | undefined =
    view !== undefined && view.CustomAttribute !== undefined
      ? function (props) {
          const Custom = view.CustomAttribute!;
          return <Custom {...props} data={view.data} />;
        }
      : undefined;

  const CustomProvision:
    | React.FC<{
        provision: MMELProvision;
        getRefById?: (id: string) => MMELReference | null;
      }>
    | undefined =
    view !== undefined && view.CustomProvision !== undefined
      ? function (props) {
          const Custom = view.CustomProvision!;
          return <Custom {...props} data={view.data} />;
        }
      : undefined;

  const toolbar = (
    <ControlGroup>
      <MGDButton
        onClick={() =>
          handleModelOpen({
            setModelWrapper,
            useDecodedBlob,
            requestFileFromFilesystem,
            logger,
            indexModel: buildModelLinks,
          })
        }
      >
        Open Model
      </MGDButton>
      <Popover2
        minimal
        placement="bottom-start"
        content={<ViewToolMenu funPage={funPage} setFunPage={setFunPage} />}
      >
        <MGDButton>Tools</MGDButton>
      </Popover2>
      <MGDButton
        type={MGDButtonType.Primary}
        disabled={state.history.items.length <= 1}
        onClick={drillUp}
      >
        Drill up
      </MGDButton>
    </ControlGroup>
  );

  const breadcrumbs = getBreadcrumbs(state.history, onPageChange);

  const selectedSideBlockConfig: SidebarBlockConfig = {
    key: 'selected-node',
    title: 'Selected node',
    content: (
      <SelectedNodeDescription
        model={state.modelWrapper.model}
        pageid={state.modelWrapper.page}
        CustomAttribute={CustomAttribute}
        CustomProvision={CustomProvision}
      />
    ),
  };

  const searchSideBlockConfig: SidebarBlockConfig = {
    key: 'search-node',
    title: 'Search components',
    content: (
      <SearchComponentPane
        model={state.modelWrapper.model}
        onChange={onPageAndHistroyChange}
        resetSearchElements={resetSearchElements}
      />
    ),
  };

  const normalblocks = [
    selectedSideBlockConfig,
    FunPages[funPage],
    searchSideBlockConfig,
  ];

  const psetting = loadPlugin(namespace);
  const plugin =
    psetting !== undefined
      ? {
          key: psetting.key,
          title: psetting.title,
          content: (
            <psetting.Content
              model={state.modelWrapper.model}
              showMsg={showMsg}
              setView={setView}
            />
          ),
        }
      : undefined;
  const addonblocks =
    plugin !== undefined ? [plugin, ...normalblocks] : normalblocks;

  const sidebar = (
    <Sidebar
      stateKey="opened-register-item"
      css={sidebar_layout}
      title="Item metadata"
      blocks={addonblocks}
    />
  );

  if (isVisible) {
    return (
      <ReactFlowProvider>
        <Workspace
          className={className}
          toolbar={toolbar}
          sidebar={sidebar}
          navbarProps={{ breadcrumbs }}
        >
          <div css={react_flow_container_layout}>
            <ReactFlow
              elements={getViewerReactFlowElementsFrom(
                state.modelWrapper,
                state.dvisible,
                onProcessClick,
                getStyleById,
                getSVGColorById,
                view !== undefined && view.ComponentToolTip !== undefined
                  ? ViewStyleComponentDesc
                  : undefined,
                NodeAddon,
                view !== undefined && view.getEdgeColor !== undefined
                  ? getEdgeColor
                  : undefined,
                view !== undefined && view.isEdgeAnimated !== undefined
                  ? isEdgeAnimated
                  : undefined
              )}
              onLoad={onLoad}
              nodesConnectable={false}
              snapToGrid={true}
              snapGrid={[10, 10]}
              nodeTypes={NodeTypes}
              edgeTypes={EdgeTypes}
              nodesDraggable={false}
            >
              <Controls>
                <DataVisibilityButton
                  isOn={state.dvisible}
                  onClick={toggleDataVisibility}
                />
              </Controls>
            </ReactFlow>
            {view !== undefined && view.legendList !== undefined && (
              <LegendPane list={view.legendList} onLeft={false} />
            )}
          </div>
        </Workspace>
      </ReactFlowProvider>
    );
  }
  return <div></div>;
};

export default ModelViewer;
