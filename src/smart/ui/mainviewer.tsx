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

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

export enum FunctionPage {
  Simulation = 'simulation',
  Parameterized = 'para',
  Measurement = 'measurement',
  Checklist = 'checklist',
}

export const FuntionNames: Record<FunctionPage, string> = {
  [FunctionPage.Simulation]: 'Simulation',
  [FunctionPage.Measurement]: 'Measurement validation',
  [FunctionPage.Parameterized]: 'Parameterized view',
  [FunctionPage.Checklist]: 'Self-assessment checklist',
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
  const [funPage, setFunPage] = useState<FunctionPage>(
    FunctionPage.Parameterized
  );
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
    const mw = state.modelWrapper;
    mw.page = pageid;
    logger?.log('Go to page', pageid);
    addToHistory(state.history, mw.page, processid);
    setState({ ...state });
  }

  function drillUp(): void {
    if (state.history.items.length > 0) {
      state.modelWrapper.page = popPage(state.history);
      setState({ ...state });
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

  const mw = state.modelWrapper;
  const model = mw.model;
  const namespace = model.meta.namespace;

  const FunPages: Record<FunctionPage, SidebarBlockConfig> = {
    [FunctionPage.Simulation]: {
      key: 'simulation',
      title: FuntionNames[FunctionPage.Simulation],
      collapsedByDefault: false,
      content: <>Simulation</>,
    },
    [FunctionPage.Measurement]: {
      key: 'measurement',
      title: FuntionNames[FunctionPage.Measurement],
      collapsedByDefault: false,
      content: (
        <MeasureCheckPane model={model} setView={setView} showMsg={showMsg} />
      ),
    },
    [FunctionPage.Parameterized]: {
      key: 'filter',
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
      key: 'checklist',
      title: FuntionNames[FunctionPage.Checklist],
      collapsedByDefault: false,
      content: <>Checklist</>,
    },
  };

  const ViewStyleComponentDesc: React.FC<{ id: string }> | undefined =
    view !== undefined && view.ComponentToolTip !== undefined
      ? function ({ id }) {
          const SD = view.ComponentToolTip!;
          return <SD id={id} pageid={mw.page} data={view!.data} />;
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
            {view !== undefined && (
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
